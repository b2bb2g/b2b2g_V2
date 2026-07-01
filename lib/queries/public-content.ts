import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMarketplaceProducts } from "@/lib/products/marketplace-products";
import type { StaticMarketplaceProduct } from "@/lib/products/static-products";
import { getSampleItem, mergeWithSamples } from "@/lib/sample/public-samples";
import type { Database } from "@/types/database";

type Tables = Database["public"]["Tables"];

type BuyRequestRow = Tables["buy_requests"]["Row"];
type BuySellPostRow = Tables["buy_sell_posts"]["Row"];
type CompanyRow = Tables["companies"]["Row"];
type CountryRow = Tables["countries"]["Row"];
type EpcPostRow = Tables["epc_posts"]["Row"];
type IndustrialPostRow = Tables["industrial_posts"]["Row"];
type IndustryRow = Tables["industries"]["Row"];
type ProductRow = Tables["products"]["Row"];
type SupplierRow = Tables["suppliers"]["Row"];

export type PublicContentKind =
  | "buy-requests"
  | "commercial"
  | "epc"
  | "industrial"
  | "sell-products";

export type PublicContentItem = {
  companyName?: string | null;
  companySlug?: string | null;
  createdAt: string;
  href: string;
  id: string;
  imageAlt?: string | null;
  imageUrl?: string | null;
  meta?: string | null;
  summary?: string | null;
  title: string;
  venue?: string | null;
};

export type PublicContentDetail = PublicContentItem & {
  backHref: string;
  body?: string | null;
  detailTitleKey: string;
  facts: { labelKey: string; value?: string | null }[];
  kind: PublicContentKind;
  listTitleKey: string;
};

type CompanyLite = Pick<CompanyRow, "id" | "name" | "slug">;
type CountryLite = Pick<CountryRow, "id" | "name">;
type IndustryLite = Pick<IndustryRow, "id" | "name">;
type SupplierLite = Pick<SupplierRow, "id" | "company_id">;

const publicFilters = {
  approval_status: "approved",
  is_active: true,
} as const;

function throwIfError(error: { message: string } | null): void {
  if (error) {
    throw new Error(error.message);
  }
}

function toMap<T extends { id: string }>(rows: T[]): Map<string, T> {
  return new Map(rows.map((row) => [row.id, row]));
}

function uniqueIds(ids: (string | null | undefined)[]): string[] {
  return [...new Set(ids.filter((id): id is string => Boolean(id)))];
}

function firstText(...values: (string | null | undefined)[]): string | null {
  return values.find((value) => Boolean(value)) ?? null;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function sampleToDetail(
  kind: PublicContentKind,
  id: string,
): PublicContentDetail | null {
  const sample = getSampleItem(kind, id);

  if (!sample) {
    return null;
  }

  const detailConfig: Record<
    PublicContentKind,
    { backHref: string; detailTitleKey: string; listTitleKey: string }
  > = {
    "buy-requests": {
      backHref: "/buy-sell/buy-requests",
      detailTitleKey: "content.buyRequests.detailTitle",
      listTitleKey: "content.buyRequests.title",
    },
    commercial: {
      backHref: "/commercial",
      detailTitleKey: "content.commercial.detailTitle",
      listTitleKey: "content.commercial.title",
    },
    epc: {
      backHref: "/epc",
      detailTitleKey: "content.epc.detailTitle",
      listTitleKey: "content.epc.title",
    },
    industrial: {
      backHref: "/industrial",
      detailTitleKey: "content.industrial.detailTitle",
      listTitleKey: "content.industrial.title",
    },
    "sell-products": {
      backHref: "/buy-sell/sell-products",
      detailTitleKey: "content.sellProducts.detailTitle",
      listTitleKey: "content.sellProducts.title",
    },
  };

  return {
    ...sample,
    ...detailConfig[kind],
    facts: [
      { labelKey: "content.fact.company", value: sample.companyName },
      { labelKey: "content.fact.industry", value: sample.meta },
      { labelKey: "content.fact.status", value: "Sample approved" },
    ],
    kind,
  };
}

async function getCompanies(ids: string[]): Promise<Map<string, CompanyLite>> {
  if (ids.length === 0) return new Map();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("companies")
    .select("id,name,slug")
    .in("id", ids)
    .eq("approval_status", "approved")
    .eq("is_active", true)
    .is("deleted_at", null);

  throwIfError(error);
  return toMap(data ?? []);
}

async function getCountries(ids: string[]): Promise<Map<string, CountryLite>> {
  if (ids.length === 0) return new Map();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("countries")
    .select("id,name")
    .in("id", ids)
    .eq("is_active", true)
    .is("deleted_at", null);

  throwIfError(error);
  return toMap(data ?? []);
}

async function getIndustries(ids: string[]): Promise<Map<string, IndustryLite>> {
  if (ids.length === 0) return new Map();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("industries")
    .select("id,name")
    .in("id", ids)
    .eq("is_active", true)
    .is("deleted_at", null);

  throwIfError(error);
  return toMap(data ?? []);
}

async function getSuppliers(ids: string[]): Promise<Map<string, SupplierLite>> {
  if (ids.length === 0) return new Map();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("suppliers")
    .select("id,company_id")
    .in("id", ids)
    .eq("approval_status", "approved")
    .eq("is_active", true)
    .is("deleted_at", null);

  throwIfError(error);
  return toMap(data ?? []);
}

function makeCompanyFields(
  companyId: string | null | undefined,
  companies: Map<string, CompanyLite>,
) {
  const company = companyId ? companies.get(companyId) : null;

  return {
    companyName: company?.name,
    companySlug: company?.slug,
  };
}

function productToItem(
  product: ProductRow,
  companies: Map<string, CompanyLite>,
  industries: Map<string, IndustryLite>,
): PublicContentItem {
  return {
    ...makeCompanyFields(product.company_id, companies),
    createdAt: product.created_at,
    href: `/commercial/${product.id}`,
    id: product.id,
    meta: product.industry_id ? industries.get(product.industry_id)?.name : null,
    summary: product.summary,
    title: product.title,
  };
}

function marketplaceProductToCommercialItem(
  product: StaticMarketplaceProduct,
): PublicContentItem {
  return {
    companyName: product.supplierName,
    createdAt: "2026-01-01T00:00:00.000Z",
    href: `/commercial/${product.id}`,
    id: product.id,
    imageAlt: product.imageAlt,
    imageUrl: product.imageUrl,
    meta: product.category,
    summary: product.description,
    title: product.title,
  };
}

function industrialToItem(
  post: IndustrialPostRow,
  companies: Map<string, CompanyLite>,
  industries: Map<string, IndustryLite>,
): PublicContentItem {
  return {
    ...makeCompanyFields(post.company_id, companies),
    createdAt: post.created_at,
    href: `/industrial/${post.id}`,
    id: post.id,
    meta: post.industry_id ? industries.get(post.industry_id)?.name : null,
    summary: post.summary,
    title: post.title,
  };
}

function epcToItem(
  post: EpcPostRow,
  companies: Map<string, CompanyLite>,
  countries: Map<string, CountryLite>,
): PublicContentItem {
  return {
    ...makeCompanyFields(post.company_id, companies),
    createdAt: post.created_at,
    href: `/epc/${post.id}`,
    id: post.id,
    meta: firstText(
      post.project_scope,
      post.project_country_id ? countries.get(post.project_country_id)?.name : null,
    ),
    summary: post.summary,
    title: post.title,
  };
}

function sellPostToItem(
  post: BuySellPostRow,
  suppliers: Map<string, SupplierLite>,
  companies: Map<string, CompanyLite>,
  countries: Map<string, CountryLite>,
): PublicContentItem {
  const supplier = suppliers.get(post.supplier_id);

  return {
    ...makeCompanyFields(supplier?.company_id, companies),
    createdAt: post.created_at,
    href: `/buy-sell/sell-products/${post.id}`,
    id: post.id,
    meta: post.target_country_id ? countries.get(post.target_country_id)?.name : null,
    summary: post.description,
    title: post.title,
  };
}

function buyRequestToItem(
  request: BuyRequestRow,
  countries: Map<string, CountryLite>,
  industries: Map<string, IndustryLite>,
): PublicContentItem {
  return {
    createdAt: request.created_at,
    href: `/buy-sell/buy-requests/${request.id}`,
    id: request.id,
    meta: firstText(
      request.destination_country_id
        ? countries.get(request.destination_country_id)?.name
        : null,
      request.industry_id ? industries.get(request.industry_id)?.name : null,
      request.quantity,
      request.target_price,
    ),
    summary: request.details,
    title: request.title,
  };
}

export async function getPublicContentList(
  kind: PublicContentKind,
): Promise<PublicContentItem[]> {
  if (kind === "commercial") {
    const products = await getMarketplaceProducts();

    return products.map(marketplaceProductToCommercialItem);
  }

  const supabase = await createSupabaseServerClient();

  if (kind === "industrial") {
    const { data, error } = await supabase
      .from("industrial_posts")
      .select("*")
      .match(publicFilters)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(24);

    throwIfError(error);
    const rows = data ?? [];
    const [companies, industries] = await Promise.all([
      getCompanies(uniqueIds(rows.map((row) => row.company_id))),
      getIndustries(uniqueIds(rows.map((row) => row.industry_id))),
    ]);

    return mergeWithSamples(
      "industrial",
      rows.map((row) => industrialToItem(row, companies, industries)),
    );
  }

  if (kind === "epc") {
    const { data, error } = await supabase
      .from("epc_posts")
      .select("*")
      .match(publicFilters)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(24);

    throwIfError(error);
    const rows = data ?? [];
    const [companies, countries] = await Promise.all([
      getCompanies(uniqueIds(rows.map((row) => row.company_id))),
      getCountries(uniqueIds(rows.map((row) => row.project_country_id))),
    ]);

    return mergeWithSamples(
      "epc",
      rows.map((row) => epcToItem(row, companies, countries)),
    );
  }

  if (kind === "sell-products") {
    const { data, error } = await supabase
      .from("buy_sell_posts")
      .select("*")
      .eq("post_type", "sell_product")
      .match(publicFilters)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(24);

    throwIfError(error);
    const rows = data ?? [];
    const suppliers = await getSuppliers(uniqueIds(rows.map((row) => row.supplier_id)));
    const [companies, countries] = await Promise.all([
      getCompanies(uniqueIds([...suppliers.values()].map((row) => row.company_id))),
      getCountries(uniqueIds(rows.map((row) => row.target_country_id))),
    ]);

    return mergeWithSamples(
      "sell-products",
      rows.map((row) => sellPostToItem(row, suppliers, companies, countries)),
    );
  }

  const { data, error } = await supabase
    .from("buy_requests")
    .select("*")
    .match(publicFilters)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(24);

  throwIfError(error);
  const rows = data ?? [];
  const [countries, industries] = await Promise.all([
    getCountries(uniqueIds(rows.map((row) => row.destination_country_id))),
    getIndustries(uniqueIds(rows.map((row) => row.industry_id))),
  ]);

  return mergeWithSamples(
    "buy-requests",
    rows.map((row) => buyRequestToItem(row, countries, industries)),
  );
}

export async function getPublicContentDetail(
  kind: PublicContentKind,
  id: string,
): Promise<PublicContentDetail | null> {
  if (!isUuid(id)) {
    return sampleToDetail(kind, id);
  }

  const supabase = await createSupabaseServerClient();

  if (kind === "commercial") {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .match(publicFilters)
      .eq("publish_status", "published")
      .is("deleted_at", null)
      .maybeSingle();

    throwIfError(error);
    if (!data) return sampleToDetail(kind, id);

    const [companies, industries] = await Promise.all([
      getCompanies([data.company_id]),
      getIndustries(uniqueIds([data.industry_id])),
    ]);
    const item = productToItem(data, companies, industries);

    return {
      ...item,
      backHref: "/commercial",
      body: data.description,
      detailTitleKey: "content.commercial.detailTitle",
      facts: [
        { labelKey: "content.fact.company", value: item.companyName },
        { labelKey: "content.fact.industry", value: item.meta },
        { labelKey: "content.fact.status", value: "Approved" },
      ],
      kind,
      listTitleKey: "content.commercial.title",
    };
  }

  if (kind === "industrial") {
    const { data, error } = await supabase
      .from("industrial_posts")
      .select("*")
      .eq("id", id)
      .match(publicFilters)
      .is("deleted_at", null)
      .maybeSingle();

    throwIfError(error);
    if (!data) return sampleToDetail(kind, id);

    const [companies, industries] = await Promise.all([
      getCompanies([data.company_id]),
      getIndustries(uniqueIds([data.industry_id])),
    ]);
    const item = industrialToItem(data, companies, industries);

    return {
      ...item,
      backHref: "/industrial",
      body: data.description,
      detailTitleKey: "content.industrial.detailTitle",
      facts: [
        { labelKey: "content.fact.company", value: item.companyName },
        { labelKey: "content.fact.industry", value: item.meta },
        { labelKey: "content.fact.status", value: "Approved" },
      ],
      kind,
      listTitleKey: "content.industrial.title",
    };
  }

  if (kind === "epc") {
    const { data, error } = await supabase
      .from("epc_posts")
      .select("*")
      .eq("id", id)
      .match(publicFilters)
      .is("deleted_at", null)
      .maybeSingle();

    throwIfError(error);
    if (!data) return sampleToDetail(kind, id);

    const [companies, countries] = await Promise.all([
      getCompanies([data.company_id]),
      getCountries(uniqueIds([data.project_country_id])),
    ]);
    const item = epcToItem(data, companies, countries);

    return {
      ...item,
      backHref: "/epc",
      body: data.description,
      detailTitleKey: "content.epc.detailTitle",
      facts: [
        { labelKey: "content.fact.company", value: item.companyName },
        { labelKey: "content.fact.projectScope", value: data.project_scope },
        {
          labelKey: "content.fact.projectCountry",
          value: data.project_country_id
            ? countries.get(data.project_country_id)?.name
            : null,
        },
      ],
      kind,
      listTitleKey: "content.epc.title",
    };
  }

  if (kind === "sell-products") {
    const { data, error } = await supabase
      .from("buy_sell_posts")
      .select("*")
      .eq("id", id)
      .eq("post_type", "sell_product")
      .match(publicFilters)
      .is("deleted_at", null)
      .maybeSingle();

    throwIfError(error);
    if (!data) return sampleToDetail(kind, id);

    const suppliers = await getSuppliers([data.supplier_id]);
    const [companies, countries] = await Promise.all([
      getCompanies(uniqueIds([...suppliers.values()].map((row) => row.company_id))),
      getCountries(uniqueIds([data.target_country_id])),
    ]);
    const item = sellPostToItem(data, suppliers, companies, countries);

    return {
      ...item,
      backHref: "/buy-sell/sell-products",
      body: data.description,
      detailTitleKey: "content.sellProducts.detailTitle",
      facts: [
        { labelKey: "content.fact.company", value: item.companyName },
        { labelKey: "content.fact.targetCountry", value: item.meta },
        { labelKey: "content.fact.status", value: "Approved" },
      ],
      kind,
      listTitleKey: "content.sellProducts.title",
    };
  }

  const { data, error } = await supabase
    .from("buy_requests")
    .select("*")
    .eq("id", id)
    .match(publicFilters)
    .is("deleted_at", null)
    .maybeSingle();

  throwIfError(error);
  if (!data) return sampleToDetail(kind, id);

  const [countries, industries] = await Promise.all([
    getCountries(uniqueIds([data.destination_country_id])),
    getIndustries(uniqueIds([data.industry_id])),
  ]);
  const item = buyRequestToItem(data, countries, industries);

  return {
    ...item,
    backHref: "/buy-sell/buy-requests",
    body: data.details,
    detailTitleKey: "content.buyRequests.detailTitle",
    facts: [
      {
        labelKey: "content.fact.destinationCountry",
        value: data.destination_country_id
          ? countries.get(data.destination_country_id)?.name
          : null,
      },
      {
        labelKey: "content.fact.industry",
        value: data.industry_id ? industries.get(data.industry_id)?.name : null,
      },
      { labelKey: "content.fact.quantity", value: data.quantity },
      { labelKey: "content.fact.targetPrice", value: data.target_price },
    ],
    kind,
    listTitleKey: "content.buyRequests.title",
  };
}
