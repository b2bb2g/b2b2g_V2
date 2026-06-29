import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/public/icons";
import { BuyRequestPreviewCarousel } from "@/components/public/buy-request-preview-carousel";
import { LandingEventCarousel } from "@/components/public/landing-event-carousel";
import {
  LandingCountryServiceSection,
  type LandingCountryServiceConfig,
} from "@/components/public/landing/landing-country-service-section";
import { LandingHeroSection, type LandingHeroConfig } from "@/components/public/landing/landing-hero-section";
import {
  LandingFeaturedMarketplaceSection,
  type LandingFeaturedMarketplaceConfig,
} from "@/components/public/landing/landing-featured-marketplace-section";
import {
  LandingRoleGatewaySection,
  type LandingRoleGatewayConfig,
} from "@/components/public/landing/landing-role-gateway-section";
import { ProductCarousel } from "@/components/public/marketplace-carousel";
import { Reveal } from "@/components/public/scroll-reveal";
import { SupplierSpotlightCarousel } from "@/components/public/supplier-spotlight-carousel";
import { BrandLogo } from "@/components/shared/brand-logo";
import { getCurrentUser } from "@/lib/auth/session";
import { t } from "@/lib/i18n/translation";
import { getSampleItems } from "@/lib/sample/public-samples";

const trustCategorySignals = [
  "K-Beauty",
  "Food Supplement",
  "Machinery",
  "EPC",
  "Medical Device",
  "Consumer Goods",
] as const;

const trustReadinessItems = [
  "home.trust.readiness.supplier.title",
  "home.trust.readiness.buyer.title",
  "home.trust.readiness.service.title",
] as const;

const fdaCategories = [
  "Cosmetic Registration",
  "Food Supplement Registration",
  "Food Registration",
  "Medical Device Registration",
  "Import License Support",
  "Label Compliance",
  "Formula Review",
] as const;

const landingHeroConfig: LandingHeroConfig = {
  eyebrow: t("home.hero.builderEyebrow"),
  featuredKeywords: [
    { label: "K-Beauty" },
    { label: "Food Supplement" },
    { label: "Industrial" },
    { label: "EPC" },
    { label: "Thailand FDA" },
  ],
  kpiItems: [
    {
      label: t("home.hero.kpi.roles.label"),
      value: t("home.hero.kpi.roles.value"),
    },
    {
      label: t("home.hero.kpi.brokerage.label"),
      value: t("home.hero.kpi.brokerage.value"),
    },
    {
      label: t("home.hero.kpi.privacy.label"),
      value: t("home.hero.kpi.privacy.value"),
    },
  ],
  primaryCta: {
    href: "/signup/supplier",
    label: t("home.hero.cta.supplier"),
  },
  publishState: "published",
  roleCtas: [
    {
      href: "/signup/supplier",
      label: t("home.hero.role.supplier"),
    },
    {
      href: "/signup/buyer",
      label: t("home.hero.role.buyer"),
    },
    {
      href: "/signup/agent",
      label: t("home.hero.role.agent"),
    },
    {
      href: "/signup/professor",
      label: t("home.hero.role.professor"),
    },
    {
      href: "/signup/student",
      label: t("home.hero.role.student"),
    },
  ],
  searchPlaceholder: t("home.hero.searchPlaceholder"),
  secondaryCta: {
    href: "/login",
    label: t("nav.signIn"),
  },
  subtitle: t("home.hero.builderSubtitle"),
  title: t("home.hero.builderTitle"),
  trustItems: [
    { label: t("home.hero.trust.adminApproval") },
    { label: t("home.hero.trust.brokerage") },
    { label: t("home.hero.trust.pii") },
  ],
  visibility: {
    endsAt: null,
    isVisible: true,
    startsAt: null,
  },
  visualTiles: [
    {
      imageAlt: "Korean cosmetic product preview",
      imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80",
      label: t("home.hero.tile.beauty"),
    },
    {
      imageAlt: "Korean industrial supply preview",
      imageUrl: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=900&q=80",
      label: t("home.hero.tile.industrial"),
    },
    {
      imageAlt: "Global buyer meeting preview",
      imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80",
      label: t("home.hero.tile.matching"),
    },
  ],
};

const landingRoleGatewayConfig: LandingRoleGatewayConfig = {
  publishState: "published",
  roles: [
    {
      description: t("home.roleGateway.supplier.description"),
      primaryCtaHref: "/signup/supplier",
      primaryCtaLabel: t("home.roleGateway.supplier.cta"),
      roleKey: "supplier",
      secondaryText: t("home.roleGateway.supplier.secondary"),
      statusLabel: t("home.roleGateway.supplier.status"),
      title: t("home.roleGateway.supplier.title"),
    },
    {
      description: t("home.roleGateway.buyer.description"),
      primaryCtaHref: "/signup/buyer",
      primaryCtaLabel: t("home.roleGateway.buyer.cta"),
      roleKey: "buyer",
      secondaryText: t("home.roleGateway.buyer.secondary"),
      statusLabel: t("home.roleGateway.buyer.status"),
      title: t("home.roleGateway.buyer.title"),
    },
    {
      description: t("home.roleGateway.agent.description"),
      primaryCtaHref: "/signup/agent",
      primaryCtaLabel: t("home.roleGateway.agent.cta"),
      roleKey: "agent",
      secondaryText: t("home.roleGateway.agent.secondary"),
      statusLabel: t("home.roleGateway.agent.status"),
      title: t("home.roleGateway.agent.title"),
    },
    {
      description: t("home.roleGateway.professor.description"),
      primaryCtaHref: "/signup/professor",
      primaryCtaLabel: t("home.roleGateway.professor.cta"),
      roleKey: "professor",
      secondaryText: t("home.roleGateway.professor.secondary"),
      statusLabel: t("home.roleGateway.professor.status"),
      title: t("home.roleGateway.professor.title"),
    },
    {
      description: t("home.roleGateway.student.description"),
      primaryCtaHref: "/signup/student",
      primaryCtaLabel: t("home.roleGateway.student.cta"),
      roleKey: "student",
      secondaryText: t("home.roleGateway.student.secondary"),
      statusLabel: t("home.roleGateway.student.status"),
      title: t("home.roleGateway.student.title"),
    },
  ],
  sectionId: "landing-role-gateway",
  subtitle: t("home.roleGateway.subtitle"),
  title: t("home.roleGateway.title"),
  visibility: {
    endsAt: null,
    isVisible: true,
    startsAt: null,
  },
};

const landingFeaturedMarketplaceConfig: LandingFeaturedMarketplaceConfig = {
  groups: [
    {
      description: t("home.featuredMarketplace.suppliers.description"),
      groupKey: "featured_suppliers",
      isListEnabled: false,
      items: [
        {
          badge: t("home.featuredMarketplace.suppliers.item1.badge"),
          ctaLabel: t("home.featuredMarketplace.supplierCta"),
          description: t("home.featuredMarketplace.suppliers.item1.description"),
          href: "/commercial",
          id: "featured-supplier-k-beauty-export-desk",
          meta: t("home.featuredMarketplace.suppliers.item1.meta"),
          title: t("home.featuredMarketplace.suppliers.item1.title"),
          type: "supplier",
        },
        {
          badge: t("home.featuredMarketplace.suppliers.item2.badge"),
          ctaLabel: t("home.featuredMarketplace.supplierCta"),
          description: t("home.featuredMarketplace.suppliers.item2.description"),
          href: "/industrial",
          id: "featured-supplier-industrial-parts-network",
          meta: t("home.featuredMarketplace.suppliers.item2.meta"),
          title: t("home.featuredMarketplace.suppliers.item2.title"),
          type: "supplier",
        },
        {
          badge: t("home.featuredMarketplace.suppliers.item3.badge"),
          ctaLabel: t("home.featuredMarketplace.supplierCta"),
          description: t("home.featuredMarketplace.suppliers.item3.description"),
          href: "/thailand-fda-service",
          id: "featured-supplier-food-supplement-partner",
          meta: t("home.featuredMarketplace.suppliers.item3.meta"),
          title: t("home.featuredMarketplace.suppliers.item3.title"),
          type: "supplier",
        },
      ],
      listCtaLabel: t("home.featuredMarketplace.listComingSoon"),
      listHref: "/suppliers",
      title: t("home.featuredMarketplace.suppliers.title"),
    },
    {
      description: t("home.featuredMarketplace.products.description"),
      groupKey: "featured_products",
      isListEnabled: false,
      items: [
        {
          badge: t("home.featuredMarketplace.products.item1.badge"),
          ctaLabel: t("home.featuredMarketplace.productCta"),
          description: t("home.featuredMarketplace.products.item1.description"),
          href: "/commercial",
          id: "featured-product-skincare-starter-set",
          meta: t("home.featuredMarketplace.products.item1.meta"),
          title: t("home.featuredMarketplace.products.item1.title"),
          type: "product",
        },
        {
          badge: t("home.featuredMarketplace.products.item2.badge"),
          ctaLabel: t("home.featuredMarketplace.productCta"),
          description: t("home.featuredMarketplace.products.item2.description"),
          href: "/industrial",
          id: "featured-product-factory-automation-module",
          meta: t("home.featuredMarketplace.products.item2.meta"),
          title: t("home.featuredMarketplace.products.item2.title"),
          type: "product",
        },
        {
          badge: t("home.featuredMarketplace.products.item3.badge"),
          ctaLabel: t("home.featuredMarketplace.productCta"),
          description: t("home.featuredMarketplace.products.item3.description"),
          href: "/thailand-fda-service",
          id: "featured-product-supplement-label-ready-package",
          meta: t("home.featuredMarketplace.products.item3.meta"),
          title: t("home.featuredMarketplace.products.item3.title"),
          type: "product",
        },
      ],
      listCtaLabel: t("home.featuredMarketplace.listComingSoon"),
      listHref: "/products",
      title: t("home.featuredMarketplace.products.title"),
    },
    {
      description: t("home.featuredMarketplace.buyRequests.description"),
      groupKey: "buy_requests",
      isListEnabled: false,
      items: [
        {
          badge: t("home.featuredMarketplace.buyRequests.item1.badge"),
          ctaLabel: t("home.featuredMarketplace.buyRequestCta"),
          description: t("home.featuredMarketplace.buyRequests.item1.description"),
          href: "/buy-sell/buy-requests",
          id: "featured-buy-request-thailand-retail-sourcing-brief",
          meta: t("home.featuredMarketplace.buyRequests.item1.meta"),
          title: t("home.featuredMarketplace.buyRequests.item1.title"),
          type: "buy_request",
        },
        {
          badge: t("home.featuredMarketplace.buyRequests.item2.badge"),
          ctaLabel: t("home.featuredMarketplace.buyRequestCta"),
          description: t("home.featuredMarketplace.buyRequests.item2.description"),
          href: "/buy-sell/buy-requests",
          id: "featured-buy-request-vietnam-machinery-inquiry",
          meta: t("home.featuredMarketplace.buyRequests.item2.meta"),
          title: t("home.featuredMarketplace.buyRequests.item2.title"),
          type: "buy_request",
        },
        {
          badge: t("home.featuredMarketplace.buyRequests.item3.badge"),
          ctaLabel: t("home.featuredMarketplace.buyRequestCta"),
          description: t("home.featuredMarketplace.buyRequests.item3.description"),
          href: "/buy-sell/buy-requests",
          id: "featured-buy-request-uae-project-supply-request",
          meta: t("home.featuredMarketplace.buyRequests.item3.meta"),
          title: t("home.featuredMarketplace.buyRequests.item3.title"),
          type: "buy_request",
        },
      ],
      listCtaLabel: t("home.featuredMarketplace.listComingSoon"),
      listHref: "/buy-requests",
      title: t("home.featuredMarketplace.buyRequests.title"),
    },
  ],
  policyNotes: [
    t("home.featuredMarketplace.policy.buyerContact"),
    t("home.featuredMarketplace.policy.directContact"),
    t("home.featuredMarketplace.policy.brokerage"),
  ],
  publishState: "published",
  sectionId: "landing-featured-marketplace",
  subtitle: t("home.featuredMarketplace.subtitle"),
  title: t("home.featuredMarketplace.title"),
  visibility: {
    endsAt: null,
    isVisible: true,
    startsAt: null,
  },
};

const landingCountryServiceConfig: LandingCountryServiceConfig = {
  countryGatewaySubtitle: t("home.countryService.country.subtitle"),
  countryGatewayTitle: t("home.countryService.country.title"),
  countryGateways: [
    {
      countryName: t("home.countryService.country.korea.name"),
      ctaLabel: t("home.countryService.viewGateway"),
      description: t("home.countryService.country.korea.description"),
      href: "/commercial",
      id: "country-gateway-korea",
      marketLabel: t("home.countryService.country.korea.market"),
      statusLabel: t("home.countryService.country.korea.status"),
    },
    {
      countryName: t("home.countryService.country.thailand.name"),
      ctaLabel: t("home.countryService.viewGateway"),
      description: t("home.countryService.country.thailand.description"),
      href: "/thailand-fda-service",
      id: "country-gateway-thailand",
      marketLabel: t("home.countryService.country.thailand.market"),
      statusLabel: t("home.countryService.country.thailand.status"),
    },
    {
      countryName: t("home.countryService.country.japan.name"),
      ctaLabel: t("home.countryService.comingSoon"),
      description: t("home.countryService.country.japan.description"),
      href: "/countries/japan",
      id: "country-gateway-japan",
      isEnabled: false,
      marketLabel: t("home.countryService.country.japan.market"),
      statusLabel: t("home.countryService.country.japan.status"),
    },
    {
      countryName: t("home.countryService.country.vietnam.name"),
      ctaLabel: t("home.countryService.comingSoon"),
      description: t("home.countryService.country.vietnam.description"),
      href: "/countries/vietnam",
      id: "country-gateway-vietnam",
      isEnabled: false,
      marketLabel: t("home.countryService.country.vietnam.market"),
      statusLabel: t("home.countryService.country.vietnam.status"),
    },
    {
      countryName: t("home.countryService.country.indonesia.name"),
      ctaLabel: t("home.countryService.comingSoon"),
      description: t("home.countryService.country.indonesia.description"),
      href: "/countries/indonesia",
      id: "country-gateway-indonesia",
      isEnabled: false,
      marketLabel: t("home.countryService.country.indonesia.market"),
      statusLabel: t("home.countryService.country.indonesia.status"),
    },
  ],
  eyebrow: t("home.countryService.eyebrow"),
  publishState: "published",
  sectionId: "landing-country-service-gateway",
  serviceGatewaySubtitle: t("home.countryService.service.subtitle"),
  serviceGatewayTitle: t("home.countryService.service.title"),
  serviceGateways: [
    {
      ctaLabel: t("home.countryService.viewGateway"),
      description: t("home.countryService.service.fda.description"),
      href: "/thailand-fda-service",
      id: "service-gateway-thailand-fda",
      serviceName: t("home.countryService.service.fda.name"),
      statusLabel: t("home.countryService.service.fda.status"),
    },
    {
      ctaLabel: t("home.countryService.viewGateway"),
      description: t("home.countryService.service.events.description"),
      href: "/events",
      id: "service-gateway-events",
      serviceName: t("home.countryService.service.events.name"),
      statusLabel: t("home.countryService.service.events.status"),
    },
    {
      ctaLabel: t("home.countryService.comingSoon"),
      description: t("home.countryService.service.studentShowcase.description"),
      href: "/student-showcase",
      id: "service-gateway-student-showcase",
      isEnabled: false,
      serviceName: t("home.countryService.service.studentShowcase.name"),
      statusLabel: t("home.countryService.service.studentShowcase.status"),
    },
    {
      ctaLabel: t("home.countryService.viewGateway"),
      description: t("home.countryService.service.buyRequestBrokerage.description"),
      href: "/buy-sell/buy-requests",
      id: "service-gateway-buy-request-brokerage",
      serviceName: t("home.countryService.service.buyRequestBrokerage.name"),
      statusLabel: t("home.countryService.service.buyRequestBrokerage.status"),
    },
    {
      ctaLabel: t("home.countryService.comingSoon"),
      description: t("home.countryService.service.supplierMembership.description"),
      href: "/supplier-membership",
      id: "service-gateway-supplier-membership",
      isEnabled: false,
      serviceName: t("home.countryService.service.supplierMembership.name"),
      statusLabel: t("home.countryService.service.supplierMembership.status"),
    },
  ],
  subtitle: t("home.countryService.subtitle"),
  title: t("home.countryService.title"),
  visibility: {
    endsAt: null,
    isVisible: true,
    startsAt: null,
  },
};

type LandingProductItem = ReturnType<typeof getSampleItems>[number];

function SectionIntro({
  descriptionKey,
  eyebrowKey,
  href,
  titleKey,
}: Readonly<{
  descriptionKey?: string;
  eyebrowKey?: string;
  href?: string;
  titleKey: string;
}>) {
  return (
    <div className="landing-section-header">
      <div className="landing-section-copy">
        {eyebrowKey ? (
          <p className="landing-section-kicker">{t(eyebrowKey)}</p>
        ) : null}
        <h2 className="landing-section-title">{t(titleKey)}</h2>
        {descriptionKey ? (
          <p className="landing-section-lead">
            {t(descriptionKey)}
          </p>
        ) : null}
      </div>
      {href ? (
        <Link className="landing-action-pill" href={href}>
          {t("home.viewAll")}
        </Link>
      ) : null}
    </div>
  );
}

function TrustInfrastructureSection() {
  return (
    <section className="trust-network-section">
      <div className="trust-network-backdrop" />
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="trust-banner-panel">
            <div className="trust-banner-copy">
              <p className="landing-section-kicker landing-section-kicker-on-dark">
                {t("home.trust.eyebrow")}
              </p>
              <h2 className="trust-banner-title">
                {t("home.trust.title")}
              </h2>
              <p className="trust-banner-lead">
                {t("home.trust.description")}
              </p>
            </div>

            <div className="trust-banner-right">
              <div className="trust-banner-status">
                <span className="signal-dot" />
                <span>{t("home.trust.liveLabel")}</span>
              </div>
              <div className="trust-readiness-row">
                {trustReadinessItems.map((item) => (
                  <span className="trust-readiness-pill" key={item}>
                    {t(item)}
                  </span>
                ))}
              </div>
              <div className="trust-category-row">
                {trustCategorySignals.slice(0, 4).map((category) => (
                  <span className="trust-category-chip trust-category-chip-on-dark" key={category}>
                    {category}
                  </span>
                ))}
              </div>
              <div className="trust-banner-actions">
                <Link className="landing-action-pill landing-action-pill-primary" href="/commercial">
                  {t("home.trust.primaryCta")}
                </Link>
                <Link className="landing-action-pill landing-action-pill-on-dark" href="/buy-sell">
                  {t("home.trust.secondaryCta")}
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ServiceCatalogSection() {
  const compactCategories = fdaCategories.slice(0, 4);

  return (
    <section className="relative overflow-hidden bg-surface-tile-2 py-12 md:py-14">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="relative">
            <div className="landing-section-header">
              <div className="landing-section-copy">
                <p className="landing-section-kicker landing-section-kicker-on-dark">{t("home.promo.fda.metric")}</p>
                <h2 className="landing-section-title landing-section-title-on-dark">
                  {t("home.promo.fda.title")}
                </h2>
                <p className="landing-section-lead landing-section-lead-on-dark">
                  {t("home.fda.spotlightLead")}
                </p>
              </div>
              <Link className="landing-action-pill landing-action-pill-on-dark" href="/service">
                {t("home.promo.fda.cta")}
              </Link>
            </div>

            <div className="service-simple-panel mt-6">
              <Link className="service-simple-hero group" href="/service">
                <span className="flex items-center justify-between gap-4">
                  <span className="service-live-pill">{t("home.service.panel.status")}</span>
                  <span className="type-caption-strong text-sky-link">
                    {t("home.service.active.label")}
                  </span>
                </span>
                <span className="mt-5 block text-[26px] font-semibold leading-tight text-white">
                  {t("home.service.active.title")}
                </span>
                <span className="mt-2 block max-w-lg type-caption text-white/60">
                  {t("home.service.active.status")}
                </span>
                <span className="mt-5 inline-flex items-center gap-2 type-caption-strong text-sky-link">
                  {t("home.promo.fda.cta")}
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>

              <div className="service-simple-catalog">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="type-caption-strong text-sky-link">
                      {t("home.service.categories.label")}
                    </p>
                    <h3 className="mt-1 text-[20px] font-semibold leading-tight text-white">
                      {t("home.service.panel.title")}
                    </h3>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {compactCategories.map((category) => (
                    <span className="service-category-chip" key={category}>
                      {category}
                    </span>
                  ))}
                  <span className="service-category-chip text-white/54">
                    {t("home.service.categories.more")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function BuyRequestTeaserSection({
  isAuthenticated,
  items,
}: Readonly<{
  isAuthenticated: boolean;
  items: LandingProductItem[];
}>) {
  const peekItems = items.slice(0, 10);

  return (
    <section className="overflow-hidden bg-canvas py-20">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="landing-section-header">
            <div className="landing-section-copy">
              <p className="landing-section-kicker">
                {t("home.buyRequests.eyebrow")}
              </p>
              <h2 className="landing-section-title">
                {t("home.section.urgentBuyRequests")}
              </h2>
              <p className="landing-section-lead">
                {t(
                  isAuthenticated
                    ? "home.buyRequests.memberDescription"
                    : "home.buyRequests.lockedDescription",
                )}
              </p>
            </div>
            <div className="landing-section-actions">
              <div className="landing-count-pill">
                {peekItems.length}+ {t("home.buyRequests.screenedRequests")}
              </div>
              <Link className="landing-action-pill" href="/buy-sell/buy-requests">
                {t("home.viewAll")}
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-8" delayMs={80}>
          <BuyRequestPreviewCarousel isAuthenticated={isAuthenticated} items={peekItems} />
        </Reveal>
      </div>
    </section>
  );
}

function ProductIntroBanner({
  accentKey,
  descriptionKey,
  href,
  items,
  leadItem,
  listVariant = "grid",
  titleKey,
}: Readonly<{
  accentKey: string;
  descriptionKey: string;
  href: string;
  items: LandingProductItem[];
  leadItem: LandingProductItem;
  listVariant?: "grid" | "peek";
  titleKey: string;
}>) {
  const accent = t(accentKey);
  const isPeekList = listVariant === "peek";

  if (isPeekList) {
    const spotlightItems = [leadItem, ...items].slice(0, 4);

    return (
      <section className="bg-surface-tile-1 py-20 text-white">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
          <Reveal>
            <div className="landing-section-header">
              <div className="landing-section-copy">
                <p className="landing-section-kicker landing-section-kicker-on-dark">{accent}</p>
                <h2 className="landing-section-title landing-section-title-on-dark">{t(titleKey)}</h2>
                <p className="landing-section-lead landing-section-lead-on-dark">
                  {t(descriptionKey)}
                </p>
              </div>
              <Link className="landing-action-pill landing-action-pill-primary" href={href}>
                {t("home.banner.viewProducts")}
              </Link>
            </div>

            <SupplierSpotlightCarousel items={spotlightItems} />
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-surface-tile-1 py-20 text-white">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            {isPeekList ? (
              <Link className="supplier-feature-card group" href={leadItem.href}>
                <span className="relative block h-[260px] overflow-hidden rounded-[18px] bg-black">
                  <Image
                    alt={leadItem.imageAlt}
                    className="object-cover transition duration-500 group-hover:scale-[1.04]"
                    fill
                    sizes="(min-width: 1024px) 42vw, 100vw"
                    src={leadItem.imageUrl}
                  />
                </span>
                <span className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <span>
                    <span className="block text-[13px] font-semibold text-white/48">
                      {leadItem.companyName}
                    </span>
                    <span className="mt-2 block text-[28px] font-semibold leading-tight text-white">
                      {leadItem.title}
                    </span>
                  </span>
                  <span className="rounded-full border border-white/12 px-3 py-1.5 text-[12px] font-semibold text-sky-link">
                    {accent}
                  </span>
                </span>
                <span className="mt-4 block max-w-xl text-[15px] leading-6 text-white/62">
                  {leadItem.summary}
                </span>
              </Link>
            ) : (
              <Link
                className="group relative min-h-[320px] overflow-hidden rounded-[18px] bg-black"
                href={leadItem.href}
              >
                <Image
                  alt={leadItem.imageAlt}
                  className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  fill
                  sizes="(min-width: 1024px) 42vw, 100vw"
                  src={leadItem.imageUrl}
                />
                <span className="absolute inset-0 bg-black/35" />
                <span className="absolute left-5 top-5 rounded-full bg-white px-3.5 py-1.5 text-[12px] font-semibold text-calm-ink">
                  {accent}
                </span>
                <span className="absolute inset-x-5 bottom-5">
                  <span className="block text-[13px] font-semibold text-white/70">
                    {leadItem.companyName}
                  </span>
                  <span className="mt-1 block text-[28px] font-semibold leading-tight">
                    {leadItem.title}
                  </span>
                  <span className="mt-3 block max-w-xl text-[15px] leading-6 text-white/72">
                    {leadItem.summary}
                  </span>
                </span>
              </Link>
            )}

            <div>
              <p className="landing-section-kicker landing-section-kicker-on-dark">{accent}</p>
              <h2 className="landing-section-title landing-section-title-on-dark">{t(titleKey)}</h2>
              <p className="landing-section-lead landing-section-lead-on-dark">
                {t(descriptionKey)}
              </p>
              {isPeekList ? (
                <div className="supplier-peek-shell mt-8">
                  <div className="supplier-peek-track">
                    {items.map((item) => (
                      <Link className="supplier-peek-item group" href={item.href} key={item.id}>
                        <article className="supplier-peek-card">
                          <span className="relative block h-[178px] overflow-hidden rounded-[14px] bg-black">
                            <Image
                              alt={item.imageAlt}
                              className="object-cover transition duration-500 group-hover:scale-[1.05]"
                              fill
                              sizes="(min-width: 1024px) 36vw, 78vw"
                              src={item.imageUrl}
                            />
                          </span>
                          <span className="mt-4 block truncate text-[12px] font-semibold text-white/52">
                            {item.companyName}
                          </span>
                          <span className="mt-1 block line-clamp-2 text-[18px] font-semibold leading-tight text-white">
                            {item.title}
                          </span>
                          <span className="mt-3 block line-clamp-2 text-[13px] leading-5 text-white/58">
                            {item.summary}
                          </span>
                        </article>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {items.map((item) => (
                    <Link
                      className="group min-w-0 rounded-[14px] border border-white/10 bg-white/6 p-3 transition hover:border-white/25 hover:bg-white/10"
                      href={item.href}
                      key={item.id}
                    >
                      <span className="relative block aspect-[4/3] overflow-hidden rounded-[10px] bg-black">
                        <Image
                          alt={item.imageAlt}
                          className="object-cover transition duration-500 group-hover:scale-[1.06]"
                          fill
                          sizes="(min-width: 1024px) 12vw, 33vw"
                          src={item.imageUrl}
                        />
                      </span>
                      <span className="mt-3 block truncate text-[12px] font-semibold text-white/50">
                        {item.companyName}
                      </span>
                      <span className="mt-1 block line-clamp-2 text-[14px] font-semibold leading-snug text-white">
                        {item.title}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
              <div className="mt-8">
                <Link className="landing-action-pill landing-action-pill-primary" href={href}>
                  {t("home.banner.viewProducts")}
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const currentUser = await getCurrentUser();
  const isAuthenticated = Boolean(currentUser);
  const commercialItems = getSampleItems("commercial");
  const sellProductItems = getSampleItems("sell-products");
  const buyRequestItems = getSampleItems("buy-requests");
  const industrialItems = getSampleItems("industrial");
  const epcItems = getSampleItems("epc");
  const eventItems = getSampleItems("events");
  const noticeItems = getSampleItems("notice").slice(0, 4);
  const tradeAmbassadorItems = commercialItems.slice(4, 12).map((item) => ({
    ...item,
    meta: t("home.section.studentShowcase"),
  }));
  const featuredSupplierBannerItems = commercialItems.slice(1, 4);
  const industrialBannerItems = industrialItems.slice(1, 4);
  const legalFooterLinks = [
    { href: "/privacy", label: t("legal.privacy.title") },
    { href: "/terms", label: t("legal.terms.title") },
    { href: "/cookies", label: t("legal.cookies.title") },
    { href: "/guide", label: t("legal.guide.title") },
  ] as const;

  return (
    <main className="bg-canvas">
      <LandingHeroSection config={landingHeroConfig} />
      <LandingRoleGatewaySection config={landingRoleGatewayConfig} />
      <LandingFeaturedMarketplaceSection config={landingFeaturedMarketplaceConfig} />
      <LandingCountryServiceSection config={landingCountryServiceConfig} />

      <TrustInfrastructureSection />

      <ProductIntroBanner
        accentKey="home.banner.supplier.eyebrow"
        descriptionKey="home.banner.supplier.description"
        href="/commercial"
        items={featuredSupplierBannerItems}
        leadItem={commercialItems[0]}
        listVariant="peek"
        titleKey="home.banner.supplier.title"
      />

      <BuyRequestTeaserSection
        isAuthenticated={isAuthenticated}
        items={buyRequestItems}
      />

      <ProductIntroBanner
        accentKey="home.banner.industrial.eyebrow"
        descriptionKey="home.banner.industrial.description"
        href="/industrial"
        items={industrialBannerItems}
        leadItem={industrialItems[0]}
        titleKey="home.banner.industrial.title"
      />

      <section className="bg-canvas-parchment py-20">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
          <Reveal>
            <ProductCarousel
              href="/commercial"
              items={[...commercialItems, ...sellProductItems]}
              titleKey="home.section.featuredSuppliers"
            />
          </Reveal>
        </div>
      </section>

      <section className="bg-canvas py-20">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
          <Reveal>
            <ProductCarousel
              href="/commercial"
              items={commercialItems}
              titleKey="home.section.featuredProducts"
            />
          </Reveal>
        </div>
      </section>

      <section className="bg-canvas-parchment py-20">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
          <Reveal className="mt-8" delayMs={80}>
            <ProductCarousel
              href="/industrial"
              items={industrialItems}
              lead={t("content.industrial.description")}
              titleKey="home.section.industrial"
            />
          </Reveal>
        </div>
      </section>

      <section className="bg-canvas py-20">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
          <Reveal className="mt-8" delayMs={80}>
            <ProductCarousel
              href="/epc"
              items={epcItems}
              lead={t("content.epc.description")}
              titleKey="home.section.epc"
            />
          </Reveal>
        </div>
      </section>

      <section className="bg-canvas-parchment py-20">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
          <Reveal className="mt-8" delayMs={80}>
            <ProductCarousel
              href="/commercial"
              items={tradeAmbassadorItems}
              lead={t("home.showcase.description")}
              titleKey="home.section.studentShowcase"
            />
          </Reveal>
        </div>
      </section>

      <section className="bg-canvas py-20">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
          <Reveal>
            <SectionIntro
              descriptionKey="content.events.description"
              href="/events"
              titleKey="home.section.events"
            />
          </Reveal>
          <Reveal delayMs={80}>
            <LandingEventCarousel items={eventItems} />
          </Reveal>
        </div>
      </section>

      <ServiceCatalogSection />

      <section className="bg-canvas py-20">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
          <Reveal>
            <SectionIntro
              descriptionKey="home.notice.description"
              href="/notice"
              titleKey="home.section.notice"
            />
          </Reveal>
          <div className="mt-8 divide-y divide-calm-divider-soft border-t border-b border-calm-divider-soft">
            {noticeItems.map((item, index) => (
              <Reveal delayMs={index * 50} key={item.id}>
                <Link
                  className="flex flex-col gap-2 py-5 transition hover:opacity-70 sm:flex-row sm:items-center sm:justify-between"
                  href={item.href}
                >
                  <span className="flex items-center gap-3">
                    <span className="type-caption-strong shrink-0 text-action-blue">
                      {item.meta}
                    </span>
                    <span className="type-body-strong text-calm-ink">{item.title}</span>
                  </span>
                  <span className="type-caption text-calm-ink-muted-48">
                    {item.createdAt.slice(0, 10)}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="closing-cta-section">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
          <Reveal>
            <div className="closing-cta-panel">
              <div className="closing-cta-copy">
                <p className="landing-section-kicker landing-section-kicker-on-dark">{t("footer.cta.eyebrow")}</p>
                <h2 className="closing-cta-title">
                  {t("footer.cta.title")}
                </h2>
                <p className="closing-cta-lead">
                  {t("footer.cta.description")}
                </p>
              </div>

              <div className="closing-cta-aside">
                <div className="closing-lane-strip" aria-hidden="true">
                  <span>K-Beauty</span>
                  <span>Food Supplement</span>
                  <span>Machinery</span>
                  <span>EPC</span>
                  <span>Trade Service</span>
                  <span>Buyer Matching</span>
                </div>
                <div className="closing-cta-actions">
                  <Link className="landing-action-pill landing-action-pill-primary" href="/buy-sell/buy-requests">
                    {t("footer.cta.primary")}
                  </Link>
                  <Link className="landing-action-pill landing-action-pill-on-dark" href="/commercial">
                    {t("footer.cta.secondary")}
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <Link aria-label={t("brand.name")} className="inline-flex w-fit" href="/">
                <BrandLogo className="h-9 w-[150px] rounded-[10px]" />
              </Link>
              <p className="max-w-md text-[13px] font-medium leading-6 text-calm-ink-muted-80">
                {t("footer.tagline")}
              </p>
            </div>

            <nav
              className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-bold text-calm-ink-muted-80 lg:justify-end"
              aria-label={t("footer.columns.platform")}
            >
              <Link className="transition hover:text-action-blue" href="/commercial">{t("nav.commercial")}</Link>
              <Link className="transition hover:text-action-blue" href="/industrial">{t("nav.industrial")}</Link>
              <Link className="transition hover:text-action-blue" href="/epc">{t("nav.epc")}</Link>
              <Link className="transition hover:text-action-blue" href="/buy-sell">{t("nav.buySell")}</Link>
              <Link className="transition hover:text-action-blue" href="/service">{t("nav.thailandFda")}</Link>
              <Link className="transition hover:text-action-blue" href="/events">{t("nav.events")}</Link>
              <Link className="transition hover:text-action-blue" href="/notice">{t("nav.notice")}</Link>
            </nav>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 text-[12px] text-calm-ink-muted-48 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium">
              &copy; {new Date().getFullYear()} {t("brand.name")}. {t("footer.rights")}
            </p>
            <nav
              className="flex flex-wrap gap-x-4 gap-y-2 sm:justify-end"
              aria-label={t("footer.legal.label")}
            >
              {legalFooterLinks.map((item) => (
                <Link
                  className="font-semibold transition hover:text-action-blue"
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </footer>
    </main>
  );
}
