import Link from "next/link";
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
      {showIcon ? <span aria-hidden="true">→</span> : null}
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
      className="apple-footer-section"
      id={config.sectionId}
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
        <footer className="apple-footer">
          <div className="apple-footer-brand">
            <Link aria-label={config.brandLabel} className="inline-flex w-fit" href="/">
              <BrandLogo className="h-10 w-[160px] rounded-[12px]" />
            </Link>
            <p>{config.footerTagline}</p>
            <div className="apple-footer-socials" aria-label="Social links coming soon">
              <button disabled type="button">IN</button>
              <button disabled type="button">YT</button>
              <button disabled type="button">X</button>
            </div>
          </div>

          <div className="apple-footer-groups">
            {config.footerGroups.map((group) => (
              <nav aria-label={group.groupTitle} className="apple-footer-group" key={group.groupTitle}>
                <h3>{group.groupTitle}</h3>
                <div>
                  {group.links.map((link) => (
                    <GatewayLink
                      className="apple-footer-link"
                      item={link}
                      key={`${group.groupTitle}-${link.label}`}
                      showIcon={false}
                    />
                  ))}
                </div>
              </nav>
            ))}
          </div>

          <div className="apple-footer-newsletter">
            <h3>Subscribe to our newsletter</h3>
            <p>Get marketplace updates, event notices, and supplier exposure news.</p>
            <form>
              <input disabled placeholder="Enter your email" type="email" />
              <button disabled type="button">Submit</button>
            </form>
          </div>

          <div className="apple-footer-bottom">
            <p>{config.rightsLabel}</p>
            <div>
              <button disabled type="button">English</button>
              <button disabled type="button">Legal</button>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
}
