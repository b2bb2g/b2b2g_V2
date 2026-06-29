import {
  GlobeIcon,
  SearchIcon,
  ShieldCheckIcon,
} from "@/components/public/icons";
import { t } from "@/lib/i18n/translation";

type HeroCta = {
  href: string;
  label: string;
};

type HeroTrustItem = {
  label: string;
};

type HeroKpiItem = {
  label: string;
  value: string;
};

type HeroKeyword = {
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
  primaryCta: HeroCta;
  secondaryCta: HeroCta;
  roleCtas: HeroCta[];
  searchPlaceholder: string;
  trustItems: HeroTrustItem[];
  kpiItems: HeroKpiItem[];
  featuredKeywords: HeroKeyword[];
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

        <aside className="marketplace-hero-summary" aria-label={t("home.hero.mapPanel")}>
          <p>
            <GlobeIcon className="h-4 w-4" aria-hidden="true" />
            Brokered global trade network
          </p>
          <div className="marketplace-hero-kpi-row" aria-label={t("home.hero.kpiLabel")}>
            {config.kpiItems.map((item) => (
              <div key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="marketplace-hero-keyword-row" aria-label={t("home.hero.keywordLabel")}>
            {config.featuredKeywords.map((keyword) => (
              <span key={keyword.label}>{keyword.label}</span>
            ))}
          </div>
          <div className="marketplace-hero-policy-card">
            <ShieldCheckIcon className="h-5 w-5" aria-hidden="true" />
            <div className="marketplace-hero-policy-copy">
              <strong>Protected inquiry flow</strong>
              <span>Buyer identity stays hidden until approved brokerage rules allow release.</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
