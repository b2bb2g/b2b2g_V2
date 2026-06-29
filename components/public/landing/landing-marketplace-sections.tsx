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
  activeProjects: {
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

function ProductCard({ item }: Readonly<{ item: LandingProductItem }>) {
  return (
    <article className="marketplace-product-card">
      <div className="marketplace-product-image">
        <Image
          alt={item.imageAlt}
          className="object-cover"
          fill
          sizes="(max-width: 768px) 78vw, 260px"
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

function BannerRow({ config }: Readonly<{ config: LandingMarketplaceConfig["topBanners"] }>) {
  if (!isRenderable(config)) {
    return null;
  }

  return (
    <section className="marketplace-banner-row" aria-label="Marketplace banners">
      {config.items.map((item) => (
        <article className={`marketplace-banner-card tone-${item.tone}`} key={item.id}>
          <div>
            <span>{item.badge}</span>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <SmartLink className="marketplace-small-link" item={item.cta}>
              {item.cta.label}
            </SmartLink>
          </div>
          <div className="marketplace-banner-media">
            <Image alt={item.imageAlt} className="object-cover" fill sizes="(max-width: 768px) 42vw, 160px" src={item.imageUrl} />
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
      <div className="marketplace-product-carousel">
        {config.items.map((item) => (
          <ProductCard item={item} key={item.id} />
        ))}
      </div>
    </section>
  );
}

function MarketActivityGrid({
  config,
  verifiedBuyers,
}: Readonly<{
  config: LandingMarketplaceConfig["intelligencePanel"];
  verifiedBuyers: LandingMarketplaceConfig["verifiedBuyers"];
}>) {
  if (!isRenderable(config)) {
    return null;
  }

  const eventItems = [
    ...config.eventHighlights.items,
    ...config.upcomingEvents.items,
  ].slice(0, 4);

  return (
    <section className="marketplace-activity-grid" id={config.sectionId}>
      <div className="marketplace-panel">
        <SectionHeader title={config.buyerRequests.title} viewAll={config.buyerRequests.viewAll} />
        <div className="marketplace-request-list">
          {config.buyerRequests.items.map((item) => (
            <article className="marketplace-request-item" key={item.id}>
              <div>
                <h3>{item.title}</h3>
                <p>{item.spec}</p>
                <span>{item.quantity}</span>
              </div>
              <strong>{item.badge}</strong>
            </article>
          ))}
        </div>
        <p className="marketplace-policy-note">Buyer identity is protected. Contact details are not shown to suppliers.</p>
      </div>

      <div className="marketplace-panel">
        <SectionHeader title="Event Schedule" viewAll={config.upcomingEvents.viewAll} />
        <div className="marketplace-event-list">
          {eventItems.map((item) => (
            <Link className="marketplace-event-item" href={item.href} key={item.id}>
              <div className="marketplace-event-thumb">
                <Image alt={item.imageAlt} className="object-cover" fill sizes="96px" src={item.imageUrl} />
              </div>
              <div>
                <time>{item.dateLabel}</time>
                <strong>{item.title}</strong>
                <p>{item.locationLabel}</p>
                <span>{item.badge}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {isRenderable(verifiedBuyers) ? (
        <div className="marketplace-panel">
          <SectionHeader title={verifiedBuyers.title} viewAll={verifiedBuyers.viewAll} />
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

function ShowcaseProjects({
  activeProjects,
  showcase,
}: Readonly<{
  activeProjects: LandingMarketplaceConfig["activeProjects"];
  showcase: LandingMarketplaceConfig["productShowcase"];
}>) {
  if (!isRenderable(showcase) && !isRenderable(activeProjects)) {
    return null;
  }

  return (
    <section className="marketplace-showcase-project-grid">
      {isRenderable(showcase) ? (
        <div className="marketplace-panel">
          <SectionHeader subtitle={showcase.subtitle} title={showcase.title} viewAll={showcase.viewAll} />
          <div className="marketplace-showcase-grid">
            {showcase.items.map((item) => (
              <Link className="marketplace-showcase-card" href={item.href} key={item.id}>
                <div>
                  <Image alt={item.imageAlt} className="object-cover" fill sizes="(max-width: 768px) 70vw, 220px" src={item.imageUrl} />
                </div>
                <span>{item.category}</span>
                <h3>{item.title}</h3>
                <p>{item.companyName}</p>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {isRenderable(activeProjects) ? (
        <div className="marketplace-panel">
          <SectionHeader subtitle={activeProjects.subtitle} title={activeProjects.title} viewAll={activeProjects.viewAll} />
          <div className="marketplace-project-list">
            {activeProjects.items.map((item) => (
              <Link className="marketplace-project-item" href={item.href} key={item.id}>
                <div className="marketplace-project-thumb">
                  <Image alt={item.imageAlt} className="object-cover" fill sizes="96px" src={item.imageUrl} />
                </div>
                <div>
                  <span>{item.category}</span>
                  <h3>{item.title}</h3>
                  <p>{item.companyName}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function PremiumSupplierAd({ config }: Readonly<{ config: LandingMarketplaceConfig["supplierHighlight"] }>) {
  if (!isRenderable(config)) {
    return null;
  }

  return (
    <section className="marketplace-supplier-ad" id={config.sectionId}>
      <div>
        <span>{config.banner.kicker}</span>
        <h2>{config.banner.title}</h2>
        <p>{config.banner.description}</p>
        <SmartLink className="marketplace-primary-link" item={config.banner.cta}>
          {config.banner.cta.label}
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </SmartLink>
      </div>
      <div className="marketplace-ad-products" aria-label="Premium supplier product thumbnails">
        {config.productImages.map((item) => (
          <span key={item.id}>
            <Image alt={item.imageAlt} className="object-cover" fill sizes="84px" src={item.imageUrl} />
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
          <ProductCard item={item} key={item.id} />
        ))}
      </div>
    </section>
  );
}

function AnnouncementsFaq({
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
                <summary>
                  <span>{item.question}</span>
                  <span aria-hidden="true">+</span>
                </summary>
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
      <BannerRow config={config.topBanners} />
      <PremiumProducts config={config.premiumProducts} />
      <MarketActivityGrid config={config.intelligencePanel} verifiedBuyers={config.verifiedBuyers} />
      <ShowcaseProjects activeProjects={config.activeProjects} showcase={config.productShowcase} />
      <PremiumSupplierAd config={config.supplierHighlight} />
      <LatestProducts config={config.latestProducts} />
      <AnnouncementsFaq announcements={config.announcements} faqs={config.faqs} />
    </div>
  );
}
