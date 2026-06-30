import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRightIcon,
  ShieldCheckIcon,
} from "@/components/public/icons";

type CtaLink = {
  href: string;
  isEnabled?: boolean;
  label: string;
};

export type MarketplaceHomeProduct = {
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

export type MarketplaceHomeRequest = {
  badge: string;
  id: string;
  imageAlt?: string;
  imageUrl?: string;
  quantity: string;
  spec: string;
  title: string;
};

export type MarketplaceHomeEvent = {
  badge: string;
  dateLabel: string;
  id: string;
  imageAlt: string;
  imageUrl: string;
  locationLabel: string;
  title: string;
};

export type MarketplaceHomeShowcase = {
  category: string;
  companyName: string;
  href: string;
  id: string;
  imageAlt: string;
  imageUrl: string;
  title: string;
};

export type MarketplaceHomeBuyer = {
  avatarLabel: string;
  companyName: string;
  country: string;
  id: string;
  role: string;
};

export type MarketplaceHomeAnnouncement = {
  dateLabel: string;
  description: string;
  href: string;
  id: string;
  statusLabel: string;
  title: string;
};

export type MarketplaceHomeFaq = {
  answer: string;
  id: string;
  question: string;
};

export type MarketplaceHomeConfig = {
  premiumProducts: MarketplaceHomeProduct[];
  buyerRequests: MarketplaceHomeRequest[];
  events: MarketplaceHomeEvent[];
  adBanners: {
    cta: CtaLink;
    description: string;
    id: string;
    title: string;
  }[];
  showcases: MarketplaceHomeShowcase[];
  verifiedBuyers: MarketplaceHomeBuyer[];
  latestProducts: MarketplaceHomeProduct[];
  announcements: MarketplaceHomeAnnouncement[];
  faqs: MarketplaceHomeFaq[];
};

const MARKET_STATS = [
  { label: "Approved supplier lanes", value: "Verified" },
  { label: "Buyer identity protection", value: "Masked" },
  { label: "Inquiry workflow", value: "Brokered" },
  { label: "Trade programs", value: "Global" },
];

const OPERATING_PATHWAYS = [
  {
    cta: "Open supplier path",
    description:
      "Company review, product readiness, membership placement, and premium exposure preparation.",
    href: "/signup/supplier",
    title: "Supplier Growth",
  },
  {
    cta: "Review RFQ flow",
    description:
      "Buyer demand is shown as market intent while private identity fields stay protected.",
    href: "/buy-sell",
    title: "Protected RFQ",
  },
  {
    cta: "Explore services",
    description:
      "Events, Thailand FDA service, and marketplace programs support cross-border trade.",
    href: "/service",
    title: "Market Services",
  },
];

function SafeAction({
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

function SectionIntro({
  action,
  eyebrow,
  subtitle,
  title,
}: Readonly<{
  action?: CtaLink;
  eyebrow: string;
  subtitle: string;
  title: string;
}>) {
  return (
    <div className="mb-6 flex min-w-0 flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0 max-w-3xl">
        <p className="type-caption-strong text-action-blue">{eyebrow}</p>
        <h2 className="type-display-lg mt-2 text-calm-ink">{title}</h2>
        <p className="type-body mt-3 max-w-2xl text-calm-ink-muted-80">{subtitle}</p>
      </div>
      {action ? (
        <SafeAction
          className="pill-secondary min-h-11 shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
          item={action}
        >
          {action.label}
          <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
        </SafeAction>
      ) : null}
    </div>
  );
}

function ProductCard({
  item,
  priority = false,
}: Readonly<{
  item: MarketplaceHomeProduct;
  priority?: boolean;
}>) {
  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-calm-hairline bg-white transition hover:-translate-y-0.5 hover:border-action-blue/30">
      <div className="relative aspect-square overflow-hidden bg-canvas-parchment">
        <Image
          alt={item.imageAlt}
          className="object-cover transition duration-700 group-hover:scale-[1.03]"
          fill
          loading={priority ? undefined : "eager"}
          priority={priority}
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 44vw, 280px"
          src={item.imageUrl}
        />
        <div className="absolute left-3 top-3 flex max-w-[calc(100%-64px)] flex-wrap gap-2">
          <span className="rounded-full bg-white/90 px-3 py-1 type-fine-print font-semibold text-action-blue backdrop-blur">
            {item.category}
          </span>
          {item.isVerifiedSupplier ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-calm-ink px-3 py-1 type-fine-print font-semibold text-white">
              <ShieldCheckIcon aria-hidden="true" className="h-3 w-3" />
              Verified
            </span>
          ) : null}
        </div>
        <button
          aria-label={`Save interest for ${item.title}`}
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full border border-calm-hairline bg-white/90 text-[18px] text-action-blue backdrop-blur transition hover:border-action-blue/40"
          type="button"
        >
          <span aria-hidden="true">♡</span>
        </button>
      </div>
      <div className="flex min-h-[224px] flex-1 flex-col p-5">
        <p className="truncate type-caption-strong text-calm-ink-muted-80">{item.supplierName}</p>
        <h3 className="mt-2 line-clamp-2 min-h-[52px] type-tagline text-calm-ink">
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-3 min-h-[60px] type-caption text-calm-ink-muted-80">
          {item.description}
        </p>
        <Link className="pill-primary mt-auto w-full" href={item.href}>
          {item.ctaLabel}
        </Link>
      </div>
    </article>
  );
}

function MarketplaceIntro({ config }: Readonly<{ config: MarketplaceHomeConfig }>) {
  const leadProduct = config.premiumProducts[0];
  const leadEvent = config.events[0];
  const leadRequest = config.buyerRequests[0];

  return (
    <section className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.52fr)]">
      <div className="rounded-[24px] border border-calm-hairline bg-white p-6 sm:p-8 lg:p-10">
        <p className="type-caption-strong text-action-blue">Global B2B marketplace</p>
        <h1 className="mt-4 max-w-3xl text-[42px] font-semibold leading-[1.05] tracking-[-0.02em] text-calm-ink sm:text-[56px] lg:text-[64px]">
          Source verified products through a protected trade workflow.
        </h1>
        <p className="type-body mt-5 max-w-2xl text-calm-ink-muted-80">
          B2B2G connects supplier products, masked buyer demand, events, and trade services in one approval-first marketplace.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link className="pill-primary" href="/signup/supplier">
            Start as supplier
          </Link>
          <Link className="pill-secondary" href="/signup/buyer">
            Buyer onboarding
          </Link>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {MARKET_STATS.map((item) => (
            <div className="rounded-[18px] border border-calm-hairline bg-canvas-parchment p-4" key={item.label}>
              <strong className="type-body-strong block text-calm-ink">{item.value}</strong>
              <span className="type-caption mt-1 block text-calm-ink-muted-80">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <aside className="grid min-w-0 gap-5">
        <article className="rounded-[24px] border border-calm-hairline bg-white p-5">
          <div className="relative aspect-square overflow-hidden rounded-[18px] bg-canvas-parchment">
            <Image
              alt={leadProduct.imageAlt}
              className="object-cover"
              fill
              priority
              sizes="(max-width: 1024px) 92vw, 360px"
              src={leadProduct.imageUrl}
            />
          </div>
          <p className="type-caption-strong mt-5 text-action-blue">Featured supplier</p>
          <h2 className="type-heading-md mt-1 text-calm-ink">{leadProduct.title}</h2>
          <p className="type-caption mt-2 text-calm-ink-muted-80">{leadProduct.description}</p>
          <Link className="pill-primary mt-5 w-full" href={leadProduct.href}>
            Inquire Now
          </Link>
        </article>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
          <article className="rounded-[22px] border border-calm-hairline bg-white p-5">
            <p className="type-caption-strong text-action-blue">Protected RFQ</p>
            <h3 className="type-tagline mt-2 text-calm-ink">{leadRequest.title}</h3>
            <p className="type-caption mt-2 text-calm-ink-muted-80">{leadRequest.spec}</p>
            <span className="mt-4 inline-flex rounded-full bg-status-info-bg px-3 py-1 type-caption-strong text-action-blue">
              {leadRequest.quantity}
            </span>
          </article>
          <article className="rounded-[22px] border border-calm-hairline bg-white p-5">
            <p className="type-caption-strong text-action-blue">Upcoming program</p>
            <h3 className="type-tagline mt-2 text-calm-ink">{leadEvent.title}</h3>
            <p className="type-caption mt-2 text-calm-ink-muted-80">{leadEvent.locationLabel}</p>
            <span className="mt-4 inline-flex rounded-full bg-canvas-parchment px-3 py-1 type-caption-strong text-calm-ink-muted-80">
              {leadEvent.dateLabel}
            </span>
          </article>
        </div>
      </aside>
    </section>
  );
}

function PremiumProducts({ products }: Readonly<{ products: MarketplaceHomeProduct[] }>) {
  return (
    <section>
      <SectionIntro
        action={{ href: "/products", isEnabled: false, label: "Browse catalog" }}
        eyebrow="Premium suppliers"
        subtitle="Large product cards keep supplier identity, verification, and inquiry next steps clear while commercial terms and buyer data stay protected."
        title="Products presented for serious sourcing."
      />
      <div className="grid min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {products.slice(0, 4).map((item, index) => (
          <ProductCard item={item} key={item.id} priority={index < 2} />
        ))}
      </div>
    </section>
  );
}

function BuyerRequests({
  requests,
}: Readonly<{
  requests: MarketplaceHomeRequest[];
}>) {
  return (
    <article className="rounded-[24px] border border-calm-hairline bg-white p-5 sm:p-6">
      <SectionIntro
        eyebrow="Buyer requests"
        subtitle="Public RFQ cards expose product intent only. Buyer identity and contact data stay protected."
        title="Demand stays private."
      />
      <div className="grid gap-3">
        {requests.slice(0, 3).map((item) => (
          <div className="grid min-w-0 grid-cols-[72px_minmax(0,1fr)] gap-4 rounded-[18px] bg-canvas-parchment p-3 sm:grid-cols-[78px_minmax(0,1fr)_auto]" key={item.id}>
            <div className="relative aspect-square overflow-hidden rounded-[14px] bg-white">
              {item.imageUrl ? (
                <Image
                  alt={item.imageAlt ?? item.title}
                  className="object-cover"
                  fill
                  loading="eager"
                  sizes="78px"
                  src={item.imageUrl}
                />
              ) : null}
            </div>
            <div className="min-w-0">
              <h3 className="truncate type-body-strong text-calm-ink">{item.title}</h3>
              <p className="mt-1 line-clamp-2 type-caption text-calm-ink-muted-80">{item.spec}</p>
              <p className="mt-2 type-caption-strong text-calm-ink-muted-80">{item.quantity}</p>
            </div>
            <span className="col-span-2 h-fit w-fit rounded-full bg-white px-3 py-1 type-caption-strong text-action-blue sm:col-span-1">
              {item.badge}
            </span>
          </div>
        ))}
      </div>
      <p className="type-caption mt-5 rounded-[16px] border border-action-blue/15 bg-status-info-bg p-4 text-calm-ink-muted-80">
        Buyer company, contact person, email, and phone are not displayed on public marketplace surfaces.
      </p>
    </article>
  );
}

function EventSchedule({ events }: Readonly<{ events: MarketplaceHomeEvent[] }>) {
  return (
    <article className="rounded-[24px] border border-calm-hairline bg-white p-5 sm:p-6">
      <SectionIntro
        eyebrow="Trade programs"
        subtitle="Curated events and service windows create marketplace momentum."
        title="Programs in motion."
      />
      <div className="grid gap-3">
        {events.slice(0, 3).map((item) => (
          <Link className="grid min-w-0 grid-cols-[92px_minmax(0,1fr)] gap-4 rounded-[18px] bg-canvas-parchment p-3 transition hover:bg-white" href="/events" key={item.id}>
            <div className="relative aspect-square overflow-hidden rounded-[14px] bg-white">
              <Image alt={item.imageAlt} className="object-cover" fill loading="eager" sizes="92px" src={item.imageUrl} />
            </div>
            <div className="min-w-0">
              <time className="type-caption-strong text-action-blue">{item.dateLabel}</time>
              <h3 className="mt-1 line-clamp-2 type-body-strong text-calm-ink">{item.title}</h3>
              <p className="mt-1 truncate type-caption text-calm-ink-muted-80">{item.locationLabel}</p>
              <span className="mt-2 inline-flex rounded-full bg-white px-3 py-1 type-fine-print font-semibold text-calm-ink-muted-80">
                {item.badge}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </article>
  );
}

function DemandPrograms({
  events,
  requests,
}: Readonly<{
  events: MarketplaceHomeEvent[];
  requests: MarketplaceHomeRequest[];
}>) {
  return (
    <section className="grid min-w-0 gap-5 lg:grid-cols-2">
      <BuyerRequests requests={requests} />
      <EventSchedule events={events} />
    </section>
  );
}

function OperatingPathways() {
  return (
    <section className="rounded-[24px] border border-calm-hairline bg-white p-5 sm:p-6 lg:p-8">
      <SectionIntro
        eyebrow="Operating system"
        subtitle="B2B2G is structured around approval, brokerage, and role boundaries before open transactions."
        title="One marketplace, controlled pathways."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {OPERATING_PATHWAYS.map((item) => (
          <Link className="group rounded-[20px] border border-calm-hairline bg-canvas-parchment p-5 transition hover:border-action-blue/30 hover:bg-white" href={item.href} key={item.title}>
            <h3 className="type-tagline text-calm-ink">{item.title}</h3>
            <p className="type-caption mt-3 min-h-[80px] text-calm-ink-muted-80">{item.description}</p>
            <span className="type-caption-strong mt-5 inline-flex items-center gap-2 text-action-blue">
              {item.cta}
              <ArrowRightIcon aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ShowcaseAndBuyers({
  buyers,
  showcases,
}: Readonly<{
  buyers: MarketplaceHomeBuyer[];
  showcases: MarketplaceHomeShowcase[];
}>) {
  return (
    <section className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
      <article className="rounded-[24px] border border-calm-hairline bg-white p-5 sm:p-6">
        <SectionIntro
          eyebrow="Innovation showcase"
          subtitle="Image-led product and project concepts prepared for global buyer attention."
          title="Showcase ready for global buyers."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {showcases.slice(0, 3).map((item) => (
            <Link className="group min-w-0" href={item.href} key={item.id}>
              <div className="relative aspect-square overflow-hidden rounded-[18px] bg-canvas-parchment">
                <Image
                  alt={item.imageAlt}
                  className="object-cover transition duration-700 group-hover:scale-[1.03]"
                  fill
                  loading="eager"
                  sizes="(max-width: 640px) 92vw, 260px"
                  src={item.imageUrl}
                />
              </div>
              <span className="type-fine-print mt-3 inline-flex rounded-full bg-status-info-bg px-3 py-1 font-semibold text-action-blue">
                {item.category}
              </span>
              <h3 className="type-body-strong mt-2 line-clamp-2 text-calm-ink">{item.title}</h3>
              <p className="type-caption mt-1 truncate text-calm-ink-muted-80">{item.companyName}</p>
            </Link>
          ))}
        </div>
      </article>

      <article className="rounded-[24px] border border-calm-hairline bg-white p-5 sm:p-6">
        <SectionIntro
          eyebrow="Verified buyers"
          subtitle="Demand proof without public contact exposure."
          title="Masked buyer proof."
        />
        <div className="grid gap-3">
          {buyers.slice(0, 4).map((item) => (
            <div className="grid min-w-0 grid-cols-[46px_minmax(0,1fr)_22px] items-center gap-3 rounded-[18px] bg-canvas-parchment p-3" key={item.id}>
              <span className="grid h-11 w-11 place-items-center rounded-full border border-calm-hairline bg-white type-body-strong text-action-blue">
                {item.avatarLabel}
              </span>
              <div className="min-w-0">
                <h3 className="truncate type-caption-strong text-calm-ink">{item.companyName}</h3>
                <p className="truncate type-caption text-calm-ink-muted-80">{item.role}</p>
                <span className="type-fine-print font-semibold text-calm-ink-muted-48">{item.country}</span>
              </div>
              <ShieldCheckIcon aria-hidden="true" className="h-5 w-5 text-action-blue" />
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function SupplierExposure({ banners }: Readonly<{ banners: MarketplaceHomeConfig["adBanners"] }>) {
  const primary = banners[0];
  const secondary = banners[1];

  return (
    <section className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
      <article className="rounded-[24px] border border-action-blue/15 bg-status-info-bg p-6 sm:p-8">
        <p className="type-caption-strong text-action-blue">Premium supplier exposure</p>
        <h2 className="type-display-lg mt-3 max-w-3xl text-calm-ink">{primary.title}</h2>
        <p className="type-body mt-3 max-w-2xl text-calm-ink-muted-80">{primary.description}</p>
        <SafeAction className="pill-primary mt-6" item={primary.cta}>
          {primary.cta.label}
        </SafeAction>
      </article>
      {secondary ? (
        <article className="rounded-[24px] border border-calm-hairline bg-white p-6">
          <p className="type-caption-strong text-action-blue">Membership</p>
          <h3 className="type-tagline mt-3 text-calm-ink">{secondary.title}</h3>
          <p className="type-caption mt-3 text-calm-ink-muted-80">{secondary.description}</p>
          <SafeAction className="pill-secondary mt-6" item={secondary.cta}>
            {secondary.cta.label}
          </SafeAction>
        </article>
      ) : null}
    </section>
  );
}

function LatestProducts({ products }: Readonly<{ products: MarketplaceHomeProduct[] }>) {
  return (
    <section>
      <SectionIntro
        action={{ href: "/products", isEnabled: false, label: "View all products" }}
        eyebrow="Latest products"
        subtitle="A clean two-row product grid prepared for approval-state data and exposure ranking later."
        title="New supply, clearly presented."
      />
      <div className="grid min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {products.slice(0, 8).map((item) => (
          <ProductCard item={item} key={item.id} />
        ))}
      </div>
    </section>
  );
}

function UpdatesAndFaq({
  announcements,
  faqs,
}: Readonly<{
  announcements: MarketplaceHomeAnnouncement[];
  faqs: MarketplaceHomeFaq[];
}>) {
  return (
    <section className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.86fr)]">
      <article className="rounded-[24px] border border-calm-hairline bg-white p-5 sm:p-6">
        <SectionIntro
          eyebrow="Updates"
          subtitle="Operational notices, event windows, and supplier program changes."
          title="Announcements"
        />
        <div className="grid gap-3">
          {announcements.slice(0, 3).map((item) => (
            <Link className="grid min-w-0 grid-cols-[76px_minmax(0,1fr)] gap-4 rounded-[18px] bg-canvas-parchment p-3 transition hover:bg-white" href={item.href} key={item.id}>
              <time className="grid min-h-[72px] place-items-center rounded-[14px] bg-white text-center type-caption-strong text-action-blue">
                {item.dateLabel}
              </time>
              <div className="min-w-0">
                <span className="type-fine-print font-semibold text-action-blue">{item.statusLabel}</span>
                <h3 className="type-body-strong mt-1 line-clamp-1 text-calm-ink">{item.title}</h3>
                <p className="type-caption mt-1 line-clamp-2 text-calm-ink-muted-80">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </article>

      <article className="rounded-[24px] border border-calm-hairline bg-white p-5 sm:p-6">
        <SectionIntro
          eyebrow="FAQ"
          subtitle="Short answers for marketplace decisions."
          title="Common questions"
        />
        <div className="grid gap-3">
          {faqs.slice(0, 4).map((item) => (
            <details className="rounded-[18px] bg-canvas-parchment px-4 py-4" key={item.id}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 type-body-strong text-calm-ink [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <span aria-hidden="true" className="text-xl text-action-blue">+</span>
              </summary>
              <p className="type-caption mt-3 text-calm-ink-muted-80">{item.answer}</p>
            </details>
          ))}
        </div>
      </article>
    </section>
  );
}

function MarketplaceFooter() {
  const columns = [
    ["Marketplace", "Commercial", "Industrial", "EPC", "BUY & SELL"],
    ["Programs", "Supplier growth", "RFQ brokerage", "Events", "FDA service"],
    ["Network", "Agents", "Verified buyers", "Innovation showcase", "Membership"],
    ["Company", "About", "Announcements", "Support", "Language"],
  ];

  return (
    <footer className="border-t border-calm-hairline bg-canvas-parchment text-calm-ink">
      <div className="mx-auto max-w-[1180px] px-5 py-12 sm:px-8 lg:px-10">
        <div className="grid min-w-0 gap-10 lg:grid-cols-[1fr_1.6fr_0.9fr]">
          <div>
            <h2 className="text-[30px] font-semibold tracking-[-0.03em] text-calm-ink">B2B2G</h2>
            <p className="type-caption mt-4 max-w-sm text-calm-ink-muted-80">
              A global B2B marketplace for verified supplier supply, protected buyer demand, events, and service workflows.
            </p>
          </div>
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map(([title, ...items]) => (
              <nav aria-label={title} key={title}>
                <h3 className="type-caption-strong text-calm-ink">{title}</h3>
                <div className="mt-3 grid gap-2">
                  {items.map((item) => (
                    <button className="w-fit text-left type-caption text-calm-ink-muted-80 disabled:cursor-not-allowed" disabled key={item} type="button">
                      {item}
                    </button>
                  ))}
                </div>
              </nav>
            ))}
          </div>
          <div className="rounded-[22px] border border-calm-hairline bg-white p-5">
            <h3 className="type-body-strong text-calm-ink">Trade brief</h3>
            <p className="type-caption mt-2 text-calm-ink-muted-80">
              Product, event, and service updates for marketplace teams.
            </p>
            <form className="mt-5 grid gap-2">
              <input className="min-h-11 min-w-0 rounded-full border border-calm-hairline bg-white px-4 type-caption outline-none" disabled placeholder="Work email" type="email" />
              <button className="pill-primary disabled:cursor-not-allowed disabled:opacity-60" disabled type="button">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-calm-hairline pt-6 type-fine-print text-calm-ink-muted-48 md:flex-row md:items-center md:justify-between">
          <span>© 2026 B2B2G. Buyer identity data is protected by platform policy.</span>
          <span>Privacy · Terms · Language</span>
        </div>
      </div>
    </footer>
  );
}

export function MarketplaceHome({ config }: Readonly<{ config: MarketplaceHomeConfig }>) {
  return (
    <div className="marketplace-home-root bg-[#f7f9fc] text-calm-ink">
      <main className="mx-auto grid max-w-[1180px] gap-12 px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-14">
        <MarketplaceIntro config={config} />
        <PremiumProducts products={config.premiumProducts} />
        <DemandPrograms events={config.events} requests={config.buyerRequests} />
        <OperatingPathways />
        <ShowcaseAndBuyers buyers={config.verifiedBuyers} showcases={config.showcases} />
        <SupplierExposure banners={config.adBanners} />
        <LatestProducts products={config.latestProducts} />
        <UpdatesAndFaq announcements={config.announcements} faqs={config.faqs} />
      </main>
      <MarketplaceFooter />
    </div>
  );
}
