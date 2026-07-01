import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MarketplaceHomeProduct } from "@/components/public/landing/marketplace-home";
import {
  PRODUCT_REGISTRATION_FIELD_TEMPLATE,
  getStaticMarketplaceProduct,
  getStaticMarketplaceProducts,
  type StaticMarketplaceProduct,
  type StaticProductRegistrationValue,
} from "@/lib/products/static-products";
import type { Database } from "@/types/database";

type Tables = Database["public"]["Tables"];
type ProductRow = Tables["products"]["Row"];
type ProductRegistrationValueRow = Tables["product_registration_values"]["Row"];
type CompanyRow = Tables["companies"]["Row"];
type FileRow = Tables["files"]["Row"];
type IndustryRow = Tables["industries"]["Row"];

type EnrichedMarketplaceHomeProduct = MarketplaceHomeProduct & {
  registrationValues?: StaticProductRegistrationValue[];
};

type ProductLookupMaps = {
  companies: Map<string, Pick<CompanyRow, "id" | "name" | "verification_status">>;
  files: Map<string, Pick<FileRow, "bucket" | "id" | "path" | "visibility">>;
  industries: Map<string, Pick<IndustryRow, "id" | "name">>;
};

const productFallbackImages = [
  "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=900&q=80",
] as const;

function makeFallbackImage(index: number): string {
  return productFallbackImages[index % productFallbackImages.length];
}

function mapById<T extends { id: string }>(rows: T[]): Map<string, T> {
  return new Map(rows.map((row) => [row.id, row]));
}

function uniqueIds(ids: Array<null | string | undefined>): string[] {
  return [...new Set(ids.filter((id): id is string => Boolean(id)))];
}

function uniqueProducts(products: EnrichedMarketplaceHomeProduct[]): StaticMarketplaceProduct[] {
  const productById = new Map<string, EnrichedMarketplaceHomeProduct>();

  for (const product of products) {
    if (!productById.has(product.id)) {
      productById.set(product.id, product);
    }
  }

  const staticProducts = getStaticMarketplaceProducts();

  return [...productById.values()].map((product) => {
    const staticProduct = staticProducts.find((item) => item.id === product.id);

    if (staticProduct) {
      return {
        ...staticProduct,
        ...product,
        registrationValues: product.registrationValues ?? staticProduct.registrationValues,
      };
    }

    const referenceProduct = staticProducts[0];

    return {
      ...product,
      certificates: [
        {
          id: `${product.id}-supplier-verification`,
          scope: "Supplier trust",
          status: product.isVerifiedSupplier ? "Verified" : "Pending review",
          title: "Supplier verification",
        },
        {
          id: `${product.id}-product-approval`,
          scope: "Public exposure",
          status: "Admin approved and published",
          title: "Product approval",
        },
        {
          id: `${product.id}-document-review`,
          scope: "Catalog and proof files",
          status: "Document workflow planned",
          title: "Document review",
        },
      ],
      detailHref: `/products/${product.id}`,
      galleryImages: [
        {
          id: `${product.id}-primary`,
          imageAlt: product.imageAlt,
          imageUrl: product.imageUrl,
          label: "Primary image",
          objectPosition: "center",
        },
        ...referenceProduct.galleryImages.slice(1, 4).map((image, index) => ({
          ...image,
          id: `${product.id}-reference-${index + 1}`,
        })),
      ],
      registrationFields: referenceProduct.registrationFields.map((field) => ({
        ...field,
        id: `${product.id}-${field.id}`,
      })),
      registrationValues: product.registrationValues ?? [],
    };
  });
}

function toReadableFieldLabel(fieldKey: string): string {
  return (
    PRODUCT_REGISTRATION_FIELD_TEMPLATE.find((field) => field.id === fieldKey)?.label ??
    fieldKey
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

function toReadableGroupName(groupKey: string): string {
  return groupKey
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatRegistrationValue(value: ProductRegistrationValueRow["value_json"], textValue: string | null): string | null {
  const text = textValue?.trim();

  if (text) {
    return text;
  }

  if (typeof value === "string") {
    return value.trim() || null;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    const visibleValues = value
      .map((item) => (typeof item === "string" ? item : null))
      .filter((item): item is string => Boolean(item?.trim()));

    return visibleValues.length > 0 ? visibleValues.join(", ") : null;
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    const candidate = record.value ?? record.label ?? record.text;

    if (typeof candidate === "string") {
      return candidate.trim() || null;
    }
  }

  return null;
}

async function getPublishedProductRegistrationValues(
  productIds: string[],
): Promise<Map<string, StaticProductRegistrationValue[]>> {
  if (productIds.length === 0) {
    return new Map();
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("product_registration_values")
    .select("id,product_id,group_key,field_key,value_text,value_json,public_display")
    .eq("approval_status", "approved")
    .in("public_display", ["summary", "visible"])
    .is("deleted_at", null)
    .in("product_id", productIds)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return new Map();
  }

  const valuesByProduct = new Map<string, StaticProductRegistrationValue[]>();

  for (const row of data ?? []) {
    const value = formatRegistrationValue(row.value_json, row.value_text);

    if (!value) {
      continue;
    }

    const values = valuesByProduct.get(row.product_id) ?? [];
    values.push({
      fieldKey: row.field_key,
      group: toReadableGroupName(row.group_key),
      id: row.id,
      label: toReadableFieldLabel(row.field_key),
      publicDisplay: row.public_display as StaticProductRegistrationValue["publicDisplay"],
      value,
    });
    valuesByProduct.set(row.product_id, values);
  }

  return valuesByProduct;
}

async function getPublishedProductLookupMaps(rows: ProductRow[]): Promise<ProductLookupMaps> {
  const supabase = await createSupabaseServerClient();
  const companyIds = uniqueIds(rows.map((row) => row.company_id));
  const fileIds = uniqueIds(rows.map((row) => row.main_file_id));
  const industryIds = uniqueIds(rows.map((row) => row.industry_id));

  const [companiesResult, industriesResult, filesResult] = await Promise.all([
    companyIds.length > 0
      ? supabase
          .from("companies")
          .select("id,name,verification_status")
          .eq("approval_status", "approved")
          .eq("is_active", true)
          .is("deleted_at", null)
          .in("id", companyIds)
      : Promise.resolve({ data: [], error: null }),
    industryIds.length > 0
      ? supabase
          .from("industries")
          .select("id,name")
          .eq("is_active", true)
          .is("deleted_at", null)
          .in("id", industryIds)
      : Promise.resolve({ data: [], error: null }),
    fileIds.length > 0
      ? supabase
          .from("files")
          .select("id,bucket,path,visibility")
          .eq("visibility", "public")
          .is("deleted_at", null)
          .in("id", fileIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (companiesResult.error || industriesResult.error || filesResult.error) {
    return {
      companies: new Map(),
      files: new Map(),
      industries: new Map(),
    };
  }

  return {
    companies: mapById(companiesResult.data ?? []),
    files: mapById(filesResult.data ?? []),
    industries: mapById(industriesResult.data ?? []),
  };
}

function fileToPublicUrl(file: Pick<FileRow, "bucket" | "path" | "visibility"> | null | undefined): string | null {
  if (!file || file.visibility !== "public") {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return null;
  }

  return `${supabaseUrl}/storage/v1/object/public/${file.bucket}/${file.path}`;
}

function dbProductToMarketplaceProduct(
  product: ProductRow,
  index: number,
  lookups: ProductLookupMaps,
  registrationValues: StaticProductRegistrationValue[],
): EnrichedMarketplaceHomeProduct {
  const company = lookups.companies.get(product.company_id);
  const industry = product.industry_id ? lookups.industries.get(product.industry_id) : null;
  const file = product.main_file_id ? lookups.files.get(product.main_file_id) : null;

  return {
    category: industry?.name ?? "Commercial",
    description:
      product.summary ??
      product.description ??
      "Approved supplier product prepared for managed global sourcing.",
    href: "/products",
    id: product.id,
    imageAlt: `${product.title} product image`,
    imageUrl: fileToPublicUrl(file) ?? makeFallbackImage(index),
    isVerifiedSupplier: company?.verification_status === "verified",
    registrationValues,
    supplierName: company?.name ?? "Approved Supplier",
    title: product.title,
  };
}

export async function getMarketplaceProducts(): Promise<StaticMarketplaceProduct[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("approval_status", "approved")
    .eq("publish_status", "published")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(24);

  if (error || !data || data.length === 0) {
    return getStaticMarketplaceProducts();
  }

  const lookups = await getPublishedProductLookupMaps(data);
  const registrationValues = await getPublishedProductRegistrationValues(data.map((product) => product.id));
  const dbProducts = data.map((product, index) =>
    dbProductToMarketplaceProduct(
      product,
      index,
      lookups,
      registrationValues.get(product.id) ?? [],
    ),
  );

  return uniqueProducts([...dbProducts, ...getStaticMarketplaceProducts()]);
}

export async function getMarketplaceProduct(id: string): Promise<StaticMarketplaceProduct | null> {
  const staticProduct = getStaticMarketplaceProduct(id);

  if (staticProduct) {
    return staticProduct;
  }

  const products = await getMarketplaceProducts();

  return products.find((product) => product.id === id) ?? null;
}
