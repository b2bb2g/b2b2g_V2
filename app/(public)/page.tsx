import { MarketplaceHome } from "@/components/public/landing/marketplace-home";
import { staticLandingConfig } from "@/lib/landing/static-landing-config";

export default function HomePage() {
  return <MarketplaceHome config={staticLandingConfig.marketplaceHome} />;
}
