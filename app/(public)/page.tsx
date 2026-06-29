import { LandingMarketplaceSections } from "@/components/public/landing/landing-marketplace-sections";
import { LandingNoticeCtaFooterSection } from "@/components/public/landing/landing-notice-cta-footer-section";
import { staticLandingConfig } from "@/lib/landing/static-landing-config";

export default function HomePage() {
  return (
    <main className="apple-landing-page">
      <LandingMarketplaceSections config={staticLandingConfig.marketplace} />
      <LandingNoticeCtaFooterSection config={staticLandingConfig.noticeCtaFooter} />
    </main>
  );
}
