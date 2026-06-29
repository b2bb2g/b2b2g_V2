import { LandingCountryServiceSection } from "@/components/public/landing/landing-country-service-section";
import { LandingFeaturedMarketplaceSection } from "@/components/public/landing/landing-featured-marketplace-section";
import { LandingHeroSection } from "@/components/public/landing/landing-hero-section";
import { LandingNoticeCtaFooterSection } from "@/components/public/landing/landing-notice-cta-footer-section";
import { LandingRoleGatewaySection } from "@/components/public/landing/landing-role-gateway-section";
import { staticLandingConfig } from "@/lib/landing/static-landing-config";

export default function HomePage() {
  return (
    <main className="landing-v1-page bg-canvas">
      <LandingHeroSection config={staticLandingConfig.hero} />
      <LandingRoleGatewaySection config={staticLandingConfig.roleGateway} />
      <LandingFeaturedMarketplaceSection config={staticLandingConfig.featuredMarketplace} />
      <LandingCountryServiceSection config={staticLandingConfig.countryService} />
      <LandingNoticeCtaFooterSection config={staticLandingConfig.noticeCtaFooter} />
    </main>
  );
}
