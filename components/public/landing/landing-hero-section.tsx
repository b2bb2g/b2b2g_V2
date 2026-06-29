import {
  SearchIcon,
  ShieldCheckIcon,
} from "@/components/public/icons";
import { t } from "@/lib/i18n/translation";

type HeroTrustItem = {
  label: string;
};

type HeroVisibility = {
  isVisible: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
};

export type LandingHeroConfig = {
  eyebrow: string;
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  trustItems: HeroTrustItem[];
  visibility: HeroVisibility;
  publishState: "draft" | "scheduled" | "published" | "hidden" | "archived";
};

export function LandingHeroSection({
  config,
}: Readonly<{
  config: LandingHeroConfig;
}>) {
  if (!config.visibility.isVisible || config.publishState !== "published") {
    return null;
  }

  return (
    <section className="marketplace-hero-section" aria-labelledby="landing-hero-title">
      <div className="marketplace-hero-inner">
        <div className="marketplace-hero-copy">
          <p className="marketplace-hero-eyebrow">{config.eyebrow}</p>
          <h1 id="landing-hero-title">
            {config.title}
          </h1>
          <p>{config.subtitle}</p>

          <div className="marketplace-hero-search" role="search" aria-label={t("home.hero.searchLabel")}>
            <SearchIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <input
              aria-label={t("home.hero.searchLabel")}
              disabled
              placeholder={config.searchPlaceholder}
              type="search"
            />
            <button aria-label="Search coming soon" disabled type="button">
              <SearchIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="marketplace-hero-trust-row" aria-label={t("home.hero.signalPanel")}>
            {config.trustItems.map((item) => (
              <span key={item.label}>
                <ShieldCheckIcon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <p className="marketplace-hero-note">
          Buyer identity stays protected through brokerage-first inquiry handling.
        </p>
      </div>
    </section>
  );
}
