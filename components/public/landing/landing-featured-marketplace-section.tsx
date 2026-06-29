import Link from "next/link";
import { ArrowRightIcon, ShieldCheckIcon } from "@/components/public/icons";

type FeaturedMarketplaceVisibility = {
  isVisible: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
};

export type FeaturedMarketplaceItem = {
  id: string;
  type: "supplier" | "product" | "buy_request";
  title: string;
  description: string;
  meta: string;
  badge: string;
  href: string;
  ctaLabel: string;
};

export type FeaturedMarketplaceGroup = {
  groupKey: "featured_suppliers" | "featured_products" | "buy_requests";
  title: string;
  description: string;
  listHref: string;
  listCtaLabel: string;
  isListEnabled: boolean;
  items: FeaturedMarketplaceItem[];
};

export type LandingFeaturedMarketplaceConfig = {
  sectionId: string;
  visibility: FeaturedMarketplaceVisibility;
  publishState: "draft" | "scheduled" | "published" | "hidden" | "archived";
  title: string;
  subtitle: string;
  policyNotes: string[];
  groups: FeaturedMarketplaceGroup[];
};

export function LandingFeaturedMarketplaceSection({
  config,
}: Readonly<{
  config: LandingFeaturedMarketplaceConfig;
}>) {
  if (!config.visibility.isVisible || config.publishState !== "published") {
    return null;
  }

  return (
    <section
      aria-labelledby={`${config.sectionId}-title`}
      className="landing-featured-marketplace-section"
      id={config.sectionId}
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
        <div className="landing-featured-marketplace-header">
          <p className="landing-section-kicker">Marketplace Preview</p>
          <h2 className="landing-section-title" id={`${config.sectionId}-title`}>
            {config.title}
          </h2>
          <p className="landing-section-lead">{config.subtitle}</p>
        </div>

        <div className="landing-featured-marketplace-policy" aria-label="Marketplace privacy policy">
          {config.policyNotes.map((note) => (
            <span key={note}>
              <ShieldCheckIcon className="h-4 w-4" aria-hidden="true" />
              {note}
            </span>
          ))}
        </div>

        <div className="landing-featured-marketplace-grid">
          {config.groups.map((group) => (
            <article className="landing-featured-marketplace-group" key={group.groupKey}>
              <div className="landing-featured-marketplace-group-header">
                <div>
                  <h3>{group.title}</h3>
                  <p>{group.description}</p>
                </div>

                {group.isListEnabled ? (
                  <Link className="landing-featured-marketplace-list-cta" href={group.listHref}>
                    {group.listCtaLabel}
                    <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : (
                  <button className="landing-featured-marketplace-list-cta" disabled type="button">
                    {group.listCtaLabel}
                  </button>
                )}
              </div>

              <div className="landing-featured-marketplace-items">
                {group.items.map((item) => (
                  <Link
                    className="landing-featured-marketplace-card"
                    data-item-type={item.type}
                    href={item.href}
                    key={item.id}
                  >
                    <span className="landing-featured-marketplace-card-badge">{item.badge}</span>
                    <strong>{item.title}</strong>
                    <p>{item.description}</p>
                    <span className="landing-featured-marketplace-card-meta">{item.meta}</span>
                    <span className="landing-featured-marketplace-card-cta">
                      {item.ctaLabel}
                      <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
