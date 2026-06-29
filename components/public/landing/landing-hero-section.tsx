import Image from "next/image";
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

type HeroTile = {
  imageAlt: string;
  imageUrl: string;
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
  visualTiles: HeroTile[];
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

        <div className="marketplace-hero-visual" aria-label={t("home.hero.mapPanel")}>
          <div className="marketplace-world-card">
            <div className="marketplace-world-map" aria-hidden="true">
              <span className="marketplace-map-orbit orbit-a" />
              <span className="marketplace-map-orbit orbit-b" />
              <span className="marketplace-map-orbit orbit-c" />
              <span className="marketplace-map-dot dot-a" />
              <span className="marketplace-map-dot dot-b" />
              <span className="marketplace-map-dot dot-c" />
              <span className="marketplace-map-dot dot-d" />
            </div>
            <div className="marketplace-hero-kpi-row" aria-label={t("home.hero.kpiLabel")}>
              {config.kpiItems.map((item) => (
                <div key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="marketplace-hero-tile-row">
              {config.visualTiles.map((tile) => (
                <div className="marketplace-hero-tile" key={tile.label}>
                  <Image
                    alt={tile.imageAlt}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 38vw, 150px"
                    src={tile.imageUrl}
                  />
                  <span>{tile.label}</span>
                </div>
              ))}
            </div>
            <p>
              <GlobeIcon className="h-4 w-4" aria-hidden="true" />
              Global marketplace signals are prepared for brokered trade flows.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
