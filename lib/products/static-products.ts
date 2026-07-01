import { staticLandingConfig } from "@/lib/landing/static-landing-config";
import type { MarketplaceHomeProduct } from "@/components/public/landing/marketplace-home";

export type StaticMarketplaceProduct = MarketplaceHomeProduct & {
  detailHref: string;
};

function uniqueProducts(products: MarketplaceHomeProduct[]): StaticMarketplaceProduct[] {
  const productById = new Map<string, MarketplaceHomeProduct>();

  for (const product of products) {
    if (!productById.has(product.id)) {
      productById.set(product.id, product);
    }
  }

  return [...productById.values()].map((product) => ({
    ...product,
    detailHref: `/products/${product.id}`,
  }));
}

export function getStaticMarketplaceProducts(): StaticMarketplaceProduct[] {
  const { latestProducts, premiumProducts } = staticLandingConfig.marketplaceHome;

  return uniqueProducts([...premiumProducts, ...latestProducts]);
}

export function getStaticMarketplaceProduct(id: string): StaticMarketplaceProduct | null {
  return getStaticMarketplaceProducts().find((product) => product.id === id) ?? null;
}
