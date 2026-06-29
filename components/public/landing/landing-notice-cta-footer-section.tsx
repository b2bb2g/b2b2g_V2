import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon, ShieldCheckIcon } from "@/components/public/icons";
import { BrandLogo } from "@/components/shared/brand-logo";

type LandingFooterVisibility = {
  isVisible: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
};

export type LandingNoticeItem = {
  id: string;
  title: string;
  description: string;
  dateLabel: string;
  href: string;
  statusLabel: string;
  isEnabled?: boolean;
};

export type LandingEventPreviewItem = {
  id: string;
  title: string;
  description: string;
  dateLabel: string;
  locationLabel: string;
  href: string;
  statusLabel: string;
  isEnabled?: boolean;
};

type LandingFooterCtaLink = {
  label: string;
  href: string;
  isEnabled?: boolean;
};

export type LandingFinalCta = {
  title: string;
  subtitle: string;
  primaryCta: LandingFooterCtaLink;
  secondaryCta: LandingFooterCtaLink;
  signInCta: LandingFooterCtaLink;
};

export type LandingFooterGroup = {
  groupTitle: string;
  links: LandingFooterCtaLink[];
};

export type LandingNoticeCtaFooterConfig = {
  sectionId: string;
  visibility: LandingFooterVisibility;
  publishState: "draft" | "scheduled" | "published" | "hidden" | "archived";
  eyebrow: string;
  title: string;
  subtitle: string;
  noticeTitle: string;
  eventTitle: string;
  brandLabel: string;
  footerTagline: string;
  rightsLabel: string;
  noticeItems: LandingNoticeItem[];
  eventItems: LandingEventPreviewItem[];
  finalCta: LandingFinalCta;
  footerGroups: LandingFooterGroup[];
};

function GatewayLink({
  className,
  item,
  showIcon = true,
}: Readonly<{
  className: string;
  item: LandingFooterCtaLink;
  showIcon?: boolean;
}>) {
  if (item.isEnabled === false) {
    return (
      <button className={className} disabled type="button">
        {item.label}
      </button>
    );
  }

  return (
    <Link className={className} href={item.href}>
      {item.label}
      {showIcon ? <ArrowRightIcon className="h-4 w-4" aria-hidden="true" /> : null}
    </Link>
  );
}

function PreviewLink({
  children,
  className,
  href,
  isEnabled,
}: Readonly<{
  children: ReactNode;
  className: string;
  href: string;
  isEnabled?: boolean;
}>) {
  if (isEnabled === false) {
    return (
      <button className={className} disabled type="button">
        {children}
      </button>
    );
  }

  return (
    <Link className={className} href={href}>
      {children}
    </Link>
  );
}

export function LandingNoticeCtaFooterSection({
  config,
}: Readonly<{
  config: LandingNoticeCtaFooterConfig;
}>) {
  if (!config.visibility.isVisible || config.publishState !== "published") {
    return null;
  }

  return (
    <section
      aria-labelledby={`${config.sectionId}-title`}
      className="landing-notice-footer-section"
      id={config.sectionId}
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
        <div className="landing-notice-footer-header">
          <p className="landing-section-kicker">{config.eyebrow}</p>
          <h2 className="landing-section-title" id={`${config.sectionId}-title`}>
            {config.title}
          </h2>
          <p className="landing-section-lead">{config.subtitle}</p>
        </div>

        <div className="landing-notice-event-grid">
          <div className="landing-notice-event-panel">
            <div className="landing-notice-event-panel-head">
              <h3>{config.noticeTitle}</h3>
              <span>{config.noticeItems.length}</span>
            </div>
            <div className="landing-notice-list">
              {config.noticeItems.map((item) => (
                <PreviewLink
                  className="landing-notice-item"
                  href={item.href}
                  isEnabled={item.isEnabled}
                  key={item.id}
                >
                  <span className="landing-notice-item-meta">
                    <span>{item.statusLabel}</span>
                    <time>{item.dateLabel}</time>
                  </span>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </PreviewLink>
              ))}
            </div>
          </div>

          <div className="landing-notice-event-panel landing-event-preview-panel">
            <div className="landing-notice-event-panel-head">
              <h3>{config.eventTitle}</h3>
              <span>{config.eventItems.length}</span>
            </div>
            <div className="landing-event-preview-list">
              {config.eventItems.map((item) => (
                <PreviewLink
                  className="landing-event-preview-item"
                  href={item.href}
                  isEnabled={item.isEnabled}
                  key={item.id}
                >
                  <span className="landing-event-preview-status">
                    <ShieldCheckIcon className="h-4 w-4" aria-hidden="true" />
                    {item.statusLabel}
                  </span>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                  <span className="landing-event-preview-meta">
                    <span>{item.dateLabel}</span>
                    <span>{item.locationLabel}</span>
                  </span>
                </PreviewLink>
              ))}
            </div>
          </div>
        </div>

        <div className="landing-final-cta-panel">
          <div className="landing-final-cta-copy">
            <p className="landing-section-kicker landing-section-kicker-on-dark">{config.eyebrow}</p>
            <h2>{config.finalCta.title}</h2>
            <p>{config.finalCta.subtitle}</p>
          </div>

          <div className="landing-final-cta-actions">
            <GatewayLink className="landing-final-cta-primary" item={config.finalCta.primaryCta} />
            <GatewayLink className="landing-final-cta-secondary" item={config.finalCta.secondaryCta} />
            <GatewayLink className="landing-final-cta-secondary" item={config.finalCta.signInCta} />
          </div>
        </div>

        <footer className="landing-builder-footer">
          <div className="landing-builder-footer-brand">
            <Link aria-label={config.brandLabel} className="inline-flex w-fit" href="/">
              <BrandLogo className="h-9 w-[150px] rounded-[10px]" />
            </Link>
            <p>{config.footerTagline}</p>
          </div>

          <div className="landing-builder-footer-groups">
            {config.footerGroups.map((group) => (
              <nav aria-label={group.groupTitle} className="landing-builder-footer-group" key={group.groupTitle}>
                <h3>{group.groupTitle}</h3>
                <div>
                  {group.links.map((link) => (
                    <GatewayLink
                      className="landing-builder-footer-link"
                      item={link}
                      key={`${group.groupTitle}-${link.label}`}
                      showIcon={false}
                    />
                  ))}
                </div>
              </nav>
            ))}
          </div>

          <div className="landing-builder-footer-bottom">
            <p>{config.rightsLabel}</p>
          </div>
        </footer>
      </div>
    </section>
  );
}
