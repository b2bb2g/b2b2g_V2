import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
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

  const primaryRoleCtas = config.roleCtas.slice(0, 5);

  return (
    <section className="home-hero-shell landing-hero-builder-section" aria-labelledby="landing-hero-title">
      <div className="home-hero-inner landing-hero-builder-inner">
        <div className="home-hero-copy landing-hero-builder-copy">
          <p className="home-hero-badge">{config.eyebrow}</p>
          <h1 className="home-hero-title" id="landing-hero-title">
            {config.title}
          </h1>
          <p className="home-hero-lead">{config.subtitle}</p>

          <div className="landing-hero-search" role="search" aria-label={t("home.hero.searchLabel")}>
            <SearchIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <input
              aria-label={t("home.hero.searchLabel")}
              disabled
              placeholder={config.searchPlaceholder}
              type="search"
            />
            <button disabled type="button">
              {t("home.hero.searchComingSoon")}
            </button>
          </div>

          <div className="home-hero-actions landing-hero-main-actions">
            <Link className="landing-action-pill landing-action-pill-primary" href={config.primaryCta.href}>
              {config.primaryCta.label}
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link className="landing-action-pill landing-action-pill-on-light" href={config.secondaryCta.href}>
              {config.secondaryCta.label}
            </Link>
          </div>

          <div className="landing-hero-role-grid" aria-label={t("home.hero.roleCtaLabel")}>
            {primaryRoleCtas.map((cta) => (
              <Link className="landing-hero-role-card" href={cta.href} key={cta.href}>
                <span>{cta.label}</span>
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
            ))}
          </div>

          <div className="home-hero-proof-row" aria-label={t("home.hero.signalPanel")}>
            {config.trustItems.map((item) => (
              <span key={item.label}>
                <ShieldCheckIcon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <div className="home-hero-visual landing-hero-builder-visual" aria-label={t("home.hero.mapPanel")}>
          <div className="home-hero-ad-top">
            <span className="home-hero-ad-status">
              <span className="signal-dot" />
              {t("home.hero.commandStatus")}
            </span>
            <span>{t("home.hero.commandPanel")}</span>
          </div>

          <div className="landing-hero-kpi-grid" aria-label={t("home.hero.kpiLabel")}>
            {config.kpiItems.map((item) => (
              <div className="landing-hero-kpi-card" key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="home-hero-ad-board landing-hero-market-board">
            <div className="home-hero-route-line" aria-hidden="true">
              <span className="home-map-korea-pin home-hero-korea-pin">
                <span className="home-map-korea-pulse" />
                <span className="home-map-korea-dot" />
              </span>
              <span className="home-hero-market-pin home-hero-market-pin-a">TH</span>
              <span className="home-hero-market-pin home-hero-market-pin-b">VN</span>
              <span className="home-hero-market-pin home-hero-market-pin-c">UAE</span>
            </div>

            <div className="home-hero-tile-track">
              {config.visualTiles.map((tile) => (
                <div className="home-hero-image-tile" key={tile.label}>
                  <Image
                    alt={tile.imageAlt}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 54vw, 210px"
                    src={tile.imageUrl}
                  />
                  <span>{tile.label}</span>
                </div>
              ))}
            </div>

            <div className="landing-hero-keyword-row" aria-label={t("home.hero.keywordLabel")}>
              {config.featuredKeywords.map((keyword) => (
                <span key={keyword.label}>{keyword.label}</span>
              ))}
            </div>

            <p className="home-hero-map-lead">
              <GlobeIcon className="h-4 w-4" aria-hidden="true" />
              {t("home.hero.mapLead")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
