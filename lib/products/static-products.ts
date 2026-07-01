import { staticLandingConfig } from "@/lib/landing/static-landing-config";
import type { MarketplaceHomeProduct } from "@/components/public/landing/marketplace-home";

export type StaticProductGalleryImage = {
  id: string;
  imageAlt: string;
  imageUrl: string;
  label: string;
  objectPosition?: string;
};

export type StaticProductCertificate = {
  id: string;
  scope: string;
  status: string;
  title: string;
};

export type StaticProductRegistrationField = {
  group: string;
  helpText?: string;
  id: string;
  inputType: "file" | "select" | "text" | "textarea" | "url";
  label: string;
  options?: string[];
  placeholder?: string;
  publicDisplay: "hidden" | "summary" | "visible";
  requirement: "optional" | "recommended" | "required";
};

export type StaticProductRegistrationValue = {
  fieldKey: string;
  group: string;
  id: string;
  label: string;
  publicDisplay: "summary" | "visible";
  value: string;
};

export type StaticMarketplaceProduct = MarketplaceHomeProduct & {
  certificates: StaticProductCertificate[];
  detailHref: string;
  galleryImages: StaticProductGalleryImage[];
  registrationFields: StaticProductRegistrationField[];
  registrationValues: StaticProductRegistrationValue[];
};

export const PRODUCT_MARKETPLACE_SECTION_FIELD_ID = "marketplace-section";
export const PRODUCT_MARKETPLACE_SECTION_OPTIONS = ["Commercial", "Industrial", "EPC"] as const;

export const PRODUCT_REGISTRATION_FIELD_TEMPLATE: StaticProductRegistrationField[] = [
  {
    group: "Publishing",
    helpText:
      "Choose the public marketplace section where this supplier product should be reviewed and exposed after approval.",
    id: PRODUCT_MARKETPLACE_SECTION_FIELD_ID,
    inputType: "select",
    label: "Publishing category",
    options: [...PRODUCT_MARKETPLACE_SECTION_OPTIONS],
    placeholder: "Select Commercial, Industrial, or EPC",
    publicDisplay: "summary",
    requirement: "required",
  },
  {
    group: "Product identity",
    helpText: "Use the name buyers will recognize in sourcing documents.",
    id: "product-name",
    inputType: "text",
    label: "Product name",
    placeholder: "Example: Modular GRP Water Tank",
    publicDisplay: "visible",
    requirement: "required",
  },
  {
    group: "Product identity",
    helpText: "Brand can be hidden from public cards if needed, but it helps admin review.",
    id: "brand-name",
    inputType: "text",
    label: "Brand name",
    placeholder: "Example: HAYOUNG SMC",
    publicDisplay: "summary",
    requirement: "recommended",
  },
  {
    group: "Product identity",
    helpText: "Model, SKU, or type information helps distinguish similar products.",
    id: "type-model",
    inputType: "text",
    label: "Type / model",
    placeholder: "Example: Sectional modular panel type",
    publicDisplay: "summary",
    requirement: "recommended",
  },
  {
    group: "Specifications",
    helpText: "Include material, grade, or technical composition.",
    id: "material",
    inputType: "text",
    label: "Material",
    placeholder: "Example: High-strength SMC panels",
    publicDisplay: "summary",
    requirement: "recommended",
  },
  {
    group: "Specifications",
    helpText: "Use ranges if the product is custom-built.",
    id: "dimension",
    inputType: "text",
    label: "Size / dimension",
    placeholder: "Example: Custom-designed by project requirement",
    publicDisplay: "summary",
    requirement: "recommended",
  },
  {
    group: "Specifications",
    helpText: "Describe where the product is used and the buyer problem it solves.",
    id: "application",
    inputType: "textarea",
    label: "Usage / application",
    placeholder: "Example: Potable water storage, industrial facilities, hospitals, high-rise buildings",
    publicDisplay: "visible",
    requirement: "required",
  },
  {
    group: "Trust",
    helpText: "Certificates are reviewed before public trust claims are displayed.",
    id: "certification",
    inputType: "text",
    label: "Certification",
    placeholder: "Example: WRAS, PSB, ISO, CE, FDA registration",
    publicDisplay: "summary",
    requirement: "recommended",
  },
  {
    group: "Trade",
    helpText: "Do not enter public pricing. MOQ is allowed for sourcing readiness.",
    id: "moq",
    inputType: "text",
    label: "MOQ",
    placeholder: "Example: 1 pallet, 100 units, project-based",
    publicDisplay: "summary",
    requirement: "recommended",
  },
  {
    group: "Trade",
    helpText: "Lead time can be approximate and updated during managed RFQ review.",
    id: "lead-time",
    inputType: "select",
    label: "Lead time",
    options: ["Under 7 days", "1-2 weeks", "3-4 weeks", "30+ days", "Project consultation required"],
    placeholder: "Select lead time",
    publicDisplay: "summary",
    requirement: "recommended",
  },
  {
    group: "Trade",
    helpText: "List production or shipping origin, not private contact details.",
    id: "shipping-origin",
    inputType: "text",
    label: "Products shipped from",
    placeholder: "Example: Korea, Thailand, Singapore",
    publicDisplay: "summary",
    requirement: "recommended",
  },
  {
    group: "Documents",
    helpText: "File upload is deferred until Storage and approval workflow are connected.",
    id: "catalog-files",
    inputType: "file",
    label: "Catalog / technical files",
    placeholder: "PDF, catalog, test report, certificate",
    publicDisplay: "hidden",
    requirement: "recommended",
  },
];

function buildProductGallery(
  product: MarketplaceHomeProduct,
  products: MarketplaceHomeProduct[],
): StaticProductGalleryImage[] {
  const fallbackImages = products
    .filter((item) => item.id !== product.id && item.imageUrl !== product.imageUrl)
    .slice(0, 3);

  const images = [
    {
      id: `${product.id}-primary`,
      imageAlt: product.imageAlt,
      imageUrl: product.imageUrl,
      label: "Primary image",
      objectPosition: "center",
    },
    ...fallbackImages.map((item, index) => ({
      id: `${product.id}-reference-${index + 1}`,
      imageAlt: `${product.title} sourcing reference ${index + 1}`,
      imageUrl: item.imageUrl,
      label: ["Application view", "Technical context", "Supplier environment"][index] ?? "Reference view",
      objectPosition: index === 0 ? "center" : "center",
    })),
  ];

  return images.slice(0, 4);
}

function buildProductCertificates(product: MarketplaceHomeProduct): StaticProductCertificate[] {
  return [
    {
      id: `${product.id}-supplier-verification`,
      scope: "Supplier trust",
      status: product.isVerifiedSupplier ? "Verified" : "Pending review",
      title: "Supplier verification",
    },
    {
      id: `${product.id}-product-approval`,
      scope: "Public exposure",
      status: "Admin approved preview",
      title: "Product approval",
    },
    {
      id: `${product.id}-document-review`,
      scope: "Catalog and proof files",
      status: "Document workflow planned",
      title: "Document review",
    },
  ];
}

function buildProductRegistrationFields(product: MarketplaceHomeProduct): StaticProductRegistrationField[] {
  return PRODUCT_REGISTRATION_FIELD_TEMPLATE.map((field) => ({
    ...field,
    id: `${product.id}-${field.id}`,
  }));
}

function uniqueProducts(products: MarketplaceHomeProduct[]): StaticMarketplaceProduct[] {
  const productById = new Map<string, MarketplaceHomeProduct>();

  for (const product of products) {
    if (!productById.has(product.id)) {
      productById.set(product.id, product);
    }
  }

  const uniqueProductList = [...productById.values()];

  return uniqueProductList.map((product) => ({
    ...product,
    certificates: buildProductCertificates(product),
    detailHref: `/products/${product.id}`,
    galleryImages: buildProductGallery(product, uniqueProductList),
    registrationFields: buildProductRegistrationFields(product),
    registrationValues: [],
  }));
}

export function getStaticMarketplaceProducts(): StaticMarketplaceProduct[] {
  const { latestProducts, premiumProducts } = staticLandingConfig.marketplaceHome;

  return uniqueProducts([...premiumProducts, ...latestProducts]);
}

export function getStaticMarketplaceProduct(id: string): StaticMarketplaceProduct | null {
  return getStaticMarketplaceProducts().find((product) => product.id === id) ?? null;
}
