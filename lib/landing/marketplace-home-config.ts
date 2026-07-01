import type { MarketplaceHomeConfig, MarketplaceHomeProduct } from "@/components/public/landing/marketplace-home";
import { staticLandingConfig } from "@/lib/landing/static-landing-config";
import { getMarketplaceProducts } from "@/lib/products/marketplace-products";

const PREMIUM_PRODUCT_LIMIT = 4;
const LATEST_PRODUCT_LIMIT = 8;

function selectPremiumProducts(products: MarketplaceHomeProduct[]): MarketplaceHomeProduct[] {
  const verifiedProducts = products.filter((product) => product.isVerifiedSupplier);
  const selectedProducts = verifiedProducts.length >= PREMIUM_PRODUCT_LIMIT ? verifiedProducts : products;

  return selectedProducts.slice(0, PREMIUM_PRODUCT_LIMIT);
}

function selectLatestProducts(products: MarketplaceHomeProduct[]): MarketplaceHomeProduct[] {
  return products.slice(0, LATEST_PRODUCT_LIMIT);
}

export async function getMarketplaceHomeConfig(): Promise<MarketplaceHomeConfig> {
  const products = await getMarketplaceProducts();

  return {
    ...staticLandingConfig.marketplaceHome,
    latestProducts: selectLatestProducts(products),
    premiumProducts: selectPremiumProducts(products),
  };
}
