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
  ctaLabel?: string;
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
  eyebrow,
  subtitle,
  title,
  viewAll,
}: Readonly<{
  eyebrow?: string;
  subtitle?: string;
  title: string;
  viewAll?: CtaLink;
}>) {
  return (
    <div className="apple-landing-section-head">
      <div>
        {eyebrow ? <p className="apple-landing-eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {viewAll ? (
        <SmartLink className="apple-landing-text-link" item={viewAll}>
          {viewAll.label}
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </SmartLink>
      ) : null}
    </div>
  );
}

function ProductCard({
  item,
  priority = false,
}: Readonly<{
  item: LandingProductItem;
  priority?: boolean;
}>) {
  return (
    <article className="apple-product-card">
      <div className="apple-product-media">
        <Image
          alt={item.imageAlt}
          className="object-cover"
          fill
          priority={priority}
          sizes="(max-width: 768px) 86vw, 280px"
          src={item.imageUrl}
        />
        <button aria-label={`Save interest for ${item.title}`} className="apple-heart-button" type="button">
          <span aria-hidden="true">♡</span>
        </button>
        <span className="apple-product-chip">{item.category}</span>
      </div>
      <div className="apple-product-copy">
        <div className="apple-product-supplier">
          <span>{item.supplierName}</span>
          {item.isVerifiedSupplier ? (
            <span className="apple-verified-pill">
              <ShieldCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Verified
            </span>
          ) : null}
        </div>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        {item.ctaLabel ? (
          <Link className="apple-primary-button" href={item.href}>
            {item.ctaLabel}
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function PremiumBannerAds({ config }: Readonly<{ config: LandingMarketplaceConfig["topBanners"] }>) {
  if (!isRenderable(config)) {
    return null;
  }

  return (
    <section className="apple-banner-stage" aria-label="Premium supplier banner ads">
      {config.items.map((item, index) => (
        <article className="apple-banner-card" key={item.id}>
          <div className="apple-banner-copy">
            <span>{item.badge}</span>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <SmartLink className="apple-secondary-button" item={item.cta}>
              {item.cta.label}
            </SmartLink>
          </div>
          <div className="apple-banner-media">
            <Image
              alt={item.imageAlt}
              className="object-cover"
              fill
              priority={index === 0}
              sizes="(max-width: 900px) 84vw, 360px"
              src={item.imageUrl}
            />
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
    <section className="apple-landing-section" id={config.sectionId}>
      <SectionHeader eyebrow="Featured marketplace" subtitle={config.subtitle} title={config.title} viewAll={config.viewAll} />
      <div className="apple-premium-product-grid">
        {config.items.map((item, index) => (
          <ProductCard item={item} key={item.id} priority={index < 2} />
        ))}
      </div>
    </section>
  );
}

function RequestEventBuyerSection({
  config,
  verifiedBuyers,
}: Readonly<{
  config: LandingMarketplaceConfig["intelligencePanel"];
  verifiedBuyers: LandingMarketplaceConfig["verifiedBuyers"];
}>) {
  if (!isRenderable(config)) {
    return null;
  }

  const eventItems = config.eventHighlights.items.slice(0, 3);

  return (
    <section className="apple-three-column-section" id={config.sectionId}>
      <div className="apple-glass-panel">
        <SectionHeader title={config.buyerRequests.title} viewAll={config.buyerRequests.viewAll} />
        <div className="apple-request-list">
          {config.buyerRequests.items.map((item) => (
            <article className="apple-request-item" key={item.id}>
              <div>
                <h3>{item.title}</h3>
                <p>{item.spec}</p>
                <span>{item.quantity}</span>
              </div>
              <strong>{item.badge}</strong>
            </article>
          ))}
        </div>
        <p className="apple-privacy-note">Buyer identity is masked. Contact details are never shown on public listings.</p>
      </div>

      <div className="apple-glass-panel">
        <SectionHeader title="Event banner ads" viewAll={config.eventHighlights.viewAll} />
        <div className="apple-event-list">
          {eventItems.map((item) => (
            <Link className="apple-event-item" href={item.href} key={item.id}>
              <div className="apple-event-image">
                <Image alt={item.imageAlt} className="object-cover" fill sizes="112px" src={item.imageUrl} />
              </div>
              <div>
                <time>{item.dateLabel}</time>
                <h3>{item.title}</h3>
                <p>{item.locationLabel}</p>
                <span>{item.badge}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {isRenderable(verifiedBuyers) ? (
        <div className="apple-glass-panel">
          <SectionHeader subtitle={verifiedBuyers.subtitle} title={verifiedBuyers.title} viewAll={verifiedBuyers.viewAll} />
          <div className="apple-buyer-list">
            {verifiedBuyers.items.map((item) => (
              <article className="apple-buyer-item" key={item.id}>
                <span className="apple-buyer-avatar">{item.avatarLabel}</span>
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

function ShowcaseSection({ config }: Readonly<{ config: LandingMarketplaceConfig["productShowcase"] }>) {
  if (!isRenderable(config)) {
    return null;
  }

  return (
    <section className="apple-landing-section" id={config.sectionId}>
      <SectionHeader eyebrow="Innovation gallery" subtitle={config.subtitle} title={config.title} viewAll={config.viewAll} />
      <div className="apple-showcase-grid">
        {config.items.map((item) => (
          <Link className="apple-showcase-card" href={item.href} key={item.id}>
            <div>
              <Image alt={item.imageAlt} className="object-cover" fill sizes="(max-width: 768px) 86vw, 360px" src={item.imageUrl} />
            </div>
            <span>{item.category}</span>
            <h3>{item.title}</h3>
            <p>{item.companyName}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function PremiumSupplierAdvertising({ config }: Readonly<{ config: LandingMarketplaceConfig["supplierHighlight"] }>) {
  if (!isRenderable(config)) {
    return null;
  }

  return (
    <section className="apple-advertising-card" id={config.sectionId}>
      <div>
        <p className="apple-landing-eyebrow">{config.banner.kicker}</p>
        <h2>{config.banner.title}</h2>
        <p>{config.banner.description}</p>
        <SmartLink className="apple-primary-button apple-advertising-cta" item={config.banner.cta}>
          {config.banner.cta.label}
        </SmartLink>
      </div>
      <div className="apple-ad-product-strip" aria-label="Premium supplier product thumbnails">
        {config.productImages.map((item) => (
          <span key={item.id}>
            <Image alt={item.imageAlt} className="object-cover" fill sizes="120px" src={item.imageUrl} />
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
    <section className="apple-landing-section" id={config.sectionId}>
      <SectionHeader eyebrow="Fresh arrivals" subtitle={config.subtitle} title={config.title} viewAll={config.viewAll} />
      <div className="apple-latest-product-grid">
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
    <section className="apple-announcement-faq-grid">
      {isRenderable(announcements) ? (
        <div className="apple-glass-panel">
          <SectionHeader title={announcements.title} viewAll={announcements.viewAll} />
          <div className="apple-announcement-list">
            {announcements.items.map((item) => (
              <Link className="apple-announcement-item" href={item.href} key={item.id}>
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
        <div className="apple-glass-panel">
          <SectionHeader title={faqs.title} viewAll={faqs.viewAll} />
          <div className="apple-faq-list">
            {faqs.items.map((item) => (
              <details className="apple-faq-item" key={item.id}>
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
    <div className="apple-landing-flow" id={config.sectionId}>
      <PremiumBannerAds config={config.topBanners} />
      <PremiumProducts config={config.premiumProducts} />
      <RequestEventBuyerSection config={config.intelligencePanel} verifiedBuyers={config.verifiedBuyers} />
      <ShowcaseSection config={config.productShowcase} />
      <PremiumSupplierAdvertising config={config.supplierHighlight} />
      <LatestProducts config={config.latestProducts} />
      <AnnouncementsFaq announcements={config.announcements} faqs={config.faqs} />
    </div>
  );
}
