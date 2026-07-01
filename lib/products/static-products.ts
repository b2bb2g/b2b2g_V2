import { staticLandingConfig } from "@/lib/landing/static-landing-config";
import type { MarketplaceHomeProduct } from "@/components/public/landing/marketplace-home";

export type StaticProductGalleryImage = {
  id: string;
  imageAlt: string;
  imageUrl: string;
  label: string;
  objectPosition?: string;
};

export type StaticMarketplaceProduct = MarketplaceHomeProduct & {
  detailHref: string;
  galleryImages: StaticProductGalleryImage[];
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
    detailHref: `/products/${product.id}`,
    galleryImages: buildProductGallery(product, uniqueProductList),
  }));
}

export function getStaticMarketplaceProducts(): StaticMarketplaceProduct[] {
  const { latestProducts, premiumProducts } = staticLandingConfig.marketplaceHome;

  return uniqueProducts([...premiumProducts, ...latestProducts]);
}

export function getStaticMarketplaceProduct(id: string): StaticMarketplaceProduct | null {
  return getStaticMarketplaceProducts().find((product) => product.id === id) ?? null;
}
