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
  id: string;
  label: string;
  publicDisplay: "hidden" | "summary" | "visible";
  requirement: "optional" | "recommended" | "required";
};

export type StaticMarketplaceProduct = MarketplaceHomeProduct & {
  certificates: StaticProductCertificate[];
  detailHref: string;
  galleryImages: StaticProductGalleryImage[];
  registrationFields: StaticProductRegistrationField[];
};

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
  return [
    { group: "Product identity", id: `${product.id}-product-name`, label: "Product name", publicDisplay: "visible", requirement: "required" },
    { group: "Product identity", id: `${product.id}-brand-name`, label: "Brand name", publicDisplay: "summary", requirement: "recommended" },
    { group: "Product identity", id: `${product.id}-type-model`, label: "Type / model", publicDisplay: "summary", requirement: "recommended" },
    { group: "Specifications", id: `${product.id}-material`, label: "Material", publicDisplay: "summary", requirement: "recommended" },
    { group: "Specifications", id: `${product.id}-dimension`, label: "Size / dimension", publicDisplay: "summary", requirement: "recommended" },
    { group: "Specifications", id: `${product.id}-application`, label: "Usage / application", publicDisplay: "visible", requirement: "required" },
    { group: "Trust", id: `${product.id}-certification`, label: "Certification", publicDisplay: "summary", requirement: "recommended" },
    { group: "Trade", id: `${product.id}-moq`, label: "MOQ", publicDisplay: "summary", requirement: "recommended" },
    { group: "Trade", id: `${product.id}-lead-time`, label: "Lead time", publicDisplay: "summary", requirement: "recommended" },
    { group: "Trade", id: `${product.id}-shipping-origin`, label: "Products shipped from", publicDisplay: "summary", requirement: "recommended" },
    { group: "Documents", id: `${product.id}-catalog-files`, label: "Catalog / technical files", publicDisplay: "hidden", requirement: "recommended" },
  ];
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
  }));
}

export function getStaticMarketplaceProducts(): StaticMarketplaceProduct[] {
  const { latestProducts, premiumProducts } = staticLandingConfig.marketplaceHome;

  return uniqueProducts([...premiumProducts, ...latestProducts]);
}

export function getStaticMarketplaceProduct(id: string): StaticMarketplaceProduct | null {
  return getStaticMarketplaceProducts().find((product) => product.id === id) ?? null;
}
