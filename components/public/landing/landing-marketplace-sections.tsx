import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRightIcon,
  ShieldCheckIcon,
} from "@/components/public/icons";

type LandingSectionVisibility = {
  isVisible: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
};

type PublishState = "draft" | "scheduled" | "published" | "hidden" | "archived";

type CtaLink = {
  href: string;
  isEnabled?: boolean;
  label: string;
};

export type LandingBannerItem = {
  badge: string;
  cta: CtaLink;
  description: string;
  id: string;
  imageAlt: string;
  imageUrl: string;
  title: string;
  tone: "navy" | "blue" | "teal";
};

export type LandingProductItem = {
  category: string;
  ctaLabel: string;
  description: string;
  href: string;
  id: string;
  imageAlt: string;
  imageUrl: string;
  isVerifiedSupplier: boolean;
  supplierName: string;
  title: string;
};

export type LandingBuyerRequestItem = {
  badge: string;
  id: string;
  quantity: string;
  spec: string;
  title: string;
};

export type LandingEventItem = {
  badge: string;
  dateLabel: string;
  description: string;
  href: string;
  id: string;
  imageAlt: string;
  imageUrl: string;
  locationLabel: string;
  title: string;
};

export type LandingShowcaseItem = {
  category: string;
  companyName: string;
  href: string;
  id: string;
  imageAlt: string;
  imageUrl: string;
  title: string;
};

export type LandingVerifiedBuyerItem = {
  avatarLabel: string;
  companyName: string;
  country: string;
  id: string;
  role: string;
};

export type LandingAnnouncementItem = {
  dateLabel: string;
  description: string;
  href: string;
  id: string;
  statusLabel: string;
  title: string;
};

export type LandingFaqItem = {
  answer: string;
  id: string;
  question: string;
};

export type LandingAdBanner = {
  cta: CtaLink;
  description: string;
  imageAlt?: string;
  imageUrl?: string;
  kicker: string;
  title: string;
};

export type LandingMarketplaceConfig = {
  sectionId: string;
  visibility: LandingSectionVisibility;
  publishState: PublishState;
  topBanners: {
    sectionId: string;
    visibility: LandingSectionVisibility;
    publishState: PublishState;
    items: LandingBannerItem[];
  };
  premiumProducts: {
    sectionId: string;
    visibility: LandingSectionVisibility;
    publishState: PublishState;
    title: string;
    subtitle: string;
    viewAll: CtaLink;
    items: LandingProductItem[];
  };
  intelligencePanel: {
    sectionId: string;
    visibility: LandingSectionVisibility;
    publishState: PublishState;
    buyerRequests: {
      title: string;
      viewAll: CtaLink;
      items: LandingBuyerRequestItem[];
    };
    eventHighlights: {
      title: string;
      viewAll: CtaLink;
      items: LandingEventItem[];
    };
    upcomingEvents: {
      title: string;
      viewAll: CtaLink;
      items: LandingEventItem[];
    };
  };
  advertisingBanner: LandingAdBanner;
  productShowcase: {
    sectionId: string;
    visibility: LandingSectionVisibility;
    publishState: PublishState;
    title: string;
    subtitle: string;
    viewAll: CtaLink;
    items: LandingShowcaseItem[];
  };
  verifiedBuyers: {
    sectionId: string;
    visibility: LandingSectionVisibility;
    publishState: PublishState;
    title: string;
    subtitle: string;
    viewAll: CtaLink;
    items: LandingVerifiedBuyerItem[];
  };
  supplierHighlight: {
    sectionId: string;
    visibility: LandingSectionVisibility;
    publishState: PublishState;
    banner: LandingAdBanner;
    productImages: {
      id: string;
      imageAlt: string;
      imageUrl: string;
    }[];
  };
  latestProducts: {
    sectionId: string;
    visibility: LandingSectionVisibility;
    publishState: PublishState;
    title: string;
    subtitle: string;
    viewAll: CtaLink;
    items: LandingProductItem[];
  };
  announcements: {
    sectionId: string;
    visibility: LandingSectionVisibility;
    publishState: PublishState;
    title: string;
    viewAll: CtaLink;
    items: LandingAnnouncementItem[];
  };
  faqs: {
    sectionId: string;
    visibility: LandingSectionVisibility;
    publishState: PublishState;
    title: string;
    viewAll: CtaLink;
    items: LandingFaqItem[];
  };
};

function isRenderable(section: { publishState: PublishState; visibility: LandingSectionVisibility }) {
  return section.visibility.isVisible && section.publishState === "published";
}

function SmartLink({
  children,
  className,
  item,
}: Readonly<{
  children: ReactNode;
  className: string;
  item: CtaLink;
}>) {
  if (item.isEnabled === false) {
    return (
      <button className={className} disabled type="button">
        {children}
      </button>
    );
  }

  return (
    <Link className={className} href={item.href}>
      {children}
    </Link>
  );
}

function SectionHeader({
  subtitle,
  title,
  viewAll,
}: Readonly<{
  subtitle?: string;
  title: string;
  viewAll?: CtaLink;
}>) {
  return (
    <div className="marketplace-section-head">
      <div>
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {viewAll ? (
        <SmartLink className="marketplace-view-link" item={viewAll}>
          {viewAll.label}
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </SmartLink>
      ) : null}
    </div>
  );
}

function ProductCard({ item, compact = false }: Readonly<{ item: LandingProductItem; compact?: boolean }>) {
  return (
    <article className={compact ? "marketplace-product-card compact" : "marketplace-product-card"}>
      <div className="marketplace-product-image">
        <Image
          alt={item.imageAlt}
          className="object-cover"
          fill
          sizes={compact ? "(max-width: 768px) 46vw, 220px" : "(max-width: 768px) 78vw, 260px"}
          src={item.imageUrl}
        />
        <button aria-label={`Save interest for ${item.title}`} className="marketplace-interest-button" type="button">
          <span aria-hidden="true">♡</span>
        </button>
        <span className="marketplace-product-category">{item.category}</span>
      </div>
      <div className="marketplace-product-body">
        <div className="marketplace-product-company-row">
          <span>{item.supplierName}</span>
          {item.isVerifiedSupplier ? (
            <span className="marketplace-verified-badge">
              <ShieldCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Verified
            </span>
          ) : null}
        </div>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <Link className="marketplace-inquire-button" href={item.href}>
          {item.ctaLabel}
        </Link>
      </div>
    </article>
  );
}

function TopBannerStrip({ config }: Readonly<{ config: LandingMarketplaceConfig["topBanners"] }>) {
  if (!isRenderable(config)) {
    return null;
  }

  return (
    <section className="marketplace-top-banners" aria-label="Marketplace highlights">
      {config.items.map((item) => (
        <article className={`marketplace-banner-card tone-${item.tone}`} key={item.id}>
          <div className="marketplace-banner-copy">
            <span>{item.badge}</span>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <SmartLink className="marketplace-banner-button" item={item.cta}>
              {item.cta.label}
            </SmartLink>
          </div>
          <div className="marketplace-banner-media">
            <Image alt={item.imageAlt} className="object-cover" fill sizes="(max-width: 768px) 72vw, 330px" src={item.imageUrl} />
          </div>
        </article>
      ))}
    </section>
  );
}

function PremiumProducts({ config }: Readonly<{ config: LandingMarketplaceConfig["premiumProducts"] }>) {
  if (!isRenderable(config)) {
    return null;
  }

  return (
    <section className="marketplace-section" id={config.sectionId}>
      <SectionHeader subtitle={config.subtitle} title={config.title} viewAll={config.viewAll} />
      <div className="marketplace-premium-product-row">
        {config.items.map((item) => (
          <ProductCard item={item} key={item.id} />
        ))}
      </div>
    </section>
  );
}

function IntelligencePanel({ config }: Readonly<{ config: LandingMarketplaceConfig["intelligencePanel"] }>) {
  if (!isRenderable(config)) {
    return null;
  }

  return (
    <section className="marketplace-intelligence-grid" id={config.sectionId}>
      <div className="marketplace-panel">
        <SectionHeader title={config.buyerRequests.title} viewAll={config.buyerRequests.viewAll} />
        <div className="marketplace-request-list">
          {config.buyerRequests.items.map((item) => (
            <article className="marketplace-request-item" key={item.id}>
              <span className="marketplace-request-thumb" aria-hidden="true" />
              <div>
                <h3>{item.title}</h3>
                <p>{item.spec}</p>
                <span>{item.quantity}</span>
              </div>
              <strong>{item.badge}</strong>
            </article>
          ))}
        </div>
        <p className="marketplace-policy-note">Buyer identity and contact details are protected by brokerage controls.</p>
      </div>

      <div className="marketplace-panel">
        <SectionHeader title={config.eventHighlights.title} viewAll={config.eventHighlights.viewAll} />
        <div className="marketplace-event-list">
          {config.eventHighlights.items.map((item) => (
            <Link className="marketplace-event-item" href={item.href} key={item.id}>
              <Image alt={item.imageAlt} className="object-cover" fill sizes="120px" src={item.imageUrl} />
              <span className="marketplace-event-date">{item.dateLabel}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.locationLabel}</p>
                <span>{item.badge}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="marketplace-panel">
        <SectionHeader title={config.upcomingEvents.title} viewAll={config.upcomingEvents.viewAll} />
        <div className="marketplace-event-list">
          {config.upcomingEvents.items.map((item) => (
            <Link className="marketplace-event-item" href={item.href} key={item.id}>
              <Image alt={item.imageAlt} className="object-cover" fill sizes="120px" src={item.imageUrl} />
              <span className="marketplace-event-date">{item.dateLabel}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.locationLabel}</p>
                <span>{item.badge}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function AdvertisingBanner({ banner }: Readonly<{ banner: LandingAdBanner }>) {
  return (
    <section className="marketplace-ad-banner" aria-label={banner.kicker}>
      <div>
        <span>{banner.kicker}</span>
        <h2>{banner.title}</h2>
        <p>{banner.description}</p>
        <SmartLink className="marketplace-ad-button" item={banner.cta}>
          {banner.cta.label}
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </SmartLink>
      </div>
      {banner.imageUrl ? (
        <div className="marketplace-ad-visual">
          <Image alt={banner.imageAlt ?? ""} className="object-cover" fill sizes="(max-width: 768px) 82vw, 360px" src={banner.imageUrl} />
        </div>
      ) : null}
    </section>
  );
}

function ShowcaseAndBuyers({
  showcase,
  verifiedBuyers,
}: Readonly<{
  showcase: LandingMarketplaceConfig["productShowcase"];
  verifiedBuyers: LandingMarketplaceConfig["verifiedBuyers"];
}>) {
  return (
    <section className="marketplace-showcase-buyer-grid">
      {isRenderable(showcase) ? (
        <div className="marketplace-panel">
          <SectionHeader subtitle={showcase.subtitle} title={showcase.title} viewAll={showcase.viewAll} />
          <div className="marketplace-showcase-row">
            {showcase.items.map((item) => (
              <Link className="marketplace-showcase-card" href={item.href} key={item.id}>
                <div>
                  <Image alt={item.imageAlt} className="object-cover" fill sizes="(max-width: 768px) 72vw, 240px" src={item.imageUrl} />
                </div>
                <span>{item.category}</span>
                <h3>{item.title}</h3>
                <p>{item.companyName}</p>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {isRenderable(verifiedBuyers) ? (
        <div className="marketplace-panel">
          <SectionHeader subtitle={verifiedBuyers.subtitle} title={verifiedBuyers.title} viewAll={verifiedBuyers.viewAll} />
          <div className="marketplace-buyer-list">
            {verifiedBuyers.items.map((item) => (
              <article className="marketplace-buyer-item" key={item.id}>
                <span className="marketplace-buyer-avatar">{item.avatarLabel}</span>
                <div>
                  <h3>{item.companyName}</h3>
                  <p>{item.role}</p>
                  <span>{item.country}</span>
                </div>
                <ShieldCheckIcon className="h-5 w-5" aria-hidden="true" />
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function SupplierHighlight({
  config,
}: Readonly<{
  config: LandingMarketplaceConfig["supplierHighlight"];
}>) {
  if (!isRenderable(config)) {
    return null;
  }

  return (
    <section className="marketplace-supplier-highlight" id={config.sectionId}>
      <div>
        <span>{config.banner.kicker}</span>
        <h2>{config.banner.title}</h2>
        <p>{config.banner.description}</p>
        <SmartLink className="marketplace-ad-button" item={config.banner.cta}>
          {config.banner.cta.label}
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </SmartLink>
      </div>
      <div className="marketplace-highlight-products">
        {config.productImages.map((item) => (
          <span key={item.id}>
            <Image alt={item.imageAlt} className="object-cover" fill sizes="96px" src={item.imageUrl} />
          </span>
        ))}
      </div>
    </section>
  );
}

function LatestProducts({ config }: Readonly<{ config: LandingMarketplaceConfig["latestProducts"] }>) {
  if (!isRenderable(config)) {
    return null;
  }

  return (
    <section className="marketplace-section" id={config.sectionId}>
      <SectionHeader subtitle={config.subtitle} title={config.title} viewAll={config.viewAll} />
      <div className="marketplace-latest-products-grid">
        {config.items.map((item) => (
          <ProductCard compact item={item} key={item.id} />
        ))}
      </div>
    </section>
  );
}

function AnnouncementsAndFaqs({
  announcements,
  faqs,
}: Readonly<{
  announcements: LandingMarketplaceConfig["announcements"];
  faqs: LandingMarketplaceConfig["faqs"];
}>) {
  return (
    <section className="marketplace-announcement-faq-grid">
      {isRenderable(announcements) ? (
        <div className="marketplace-panel">
          <SectionHeader title={announcements.title} viewAll={announcements.viewAll} />
          <div className="marketplace-announcement-list">
            {announcements.items.map((item) => (
              <Link className="marketplace-announcement-item" href={item.href} key={item.id}>
                <time>{item.dateLabel}</time>
                <div>
                  <span>{item.statusLabel}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {isRenderable(faqs) ? (
        <div className="marketplace-panel">
          <SectionHeader title={faqs.title} viewAll={faqs.viewAll} />
          <div className="marketplace-faq-list">
            {faqs.items.map((item) => (
              <details className="marketplace-faq-item" key={item.id}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function LandingMarketplaceSections({
  config,
}: Readonly<{
  config: LandingMarketplaceConfig;
}>) {
  if (!isRenderable(config)) {
    return null;
  }

  return (
    <div className="marketplace-landing-flow" id={config.sectionId}>
      <TopBannerStrip config={config.topBanners} />
      <PremiumProducts config={config.premiumProducts} />
      <IntelligencePanel config={config.intelligencePanel} />
      <AdvertisingBanner banner={config.advertisingBanner} />
      <ShowcaseAndBuyers showcase={config.productShowcase} verifiedBuyers={config.verifiedBuyers} />
      <SupplierHighlight config={config.supplierHighlight} />
      <LatestProducts config={config.latestProducts} />
      <AnnouncementsAndFaqs announcements={config.announcements} faqs={config.faqs} />
    </div>
  );
}
