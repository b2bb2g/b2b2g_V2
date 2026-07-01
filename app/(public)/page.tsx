import { MarketplaceHome } from "@/components/public/landing/marketplace-home";
import { getMarketplaceHomeConfig } from "@/lib/landing/marketplace-home-config";

export default async function HomePage() {
  const config = await getMarketplaceHomeConfig();

  return <MarketplaceHome config={config} />;
}
