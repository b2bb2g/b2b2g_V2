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

const COMMERCE_CATEGORIES = ["Industrial", "Energy", "Machinery", "Materials", "Chemicals", "Packaging"];
const MARKETPLACE_METRICS = ["Verified supply", "Protected RFQ", "Brokered inquiry", "Admin approval"];

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

function ProductCard({
  item,
  priority = false,
}: Readonly<{
  item: MarketplaceHomeProduct;
  priority?: boolean;
}>) {
  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_14px_50px_rgb(15_23_42/0.07)] transition duration-300 hover:-translate-y-1 hover:border-action-blue/30 hover:shadow-[0_24px_70px_rgb(15_23_42/0.13)]">
      <div className="relative bg-[#f5f8fc] p-3">
        <div className="relative aspect-square overflow-hidden rounded-[20px] bg-white">
          <Image
            alt={item.imageAlt}
            className="object-cover transition duration-700 group-hover:scale-[1.045]"
            fill
            loading={priority ? undefined : "eager"}
            priority={priority}
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 44vw, 300px"
            src={item.imageUrl}
          />
          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-3">
            <span className="max-w-[72%] truncate rounded-full border border-white/80 bg-white/92 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-action-blue backdrop-blur">
              {item.category}
            </span>
            <button
              aria-label={`Save interest for ${item.title}`}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/80 bg-white/90 text-[18px] text-action-blue backdrop-blur transition hover:bg-white"
              type="button"
            >
              <span aria-hidden="true">♡</span>
            </button>
          </div>
          {item.isVerifiedSupplier ? (
            <span className="absolute bottom-3 left-3 inline-flex min-h-8 items-center gap-1.5 rounded-full bg-calm-ink px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.07em] text-white">
              <ShieldCheckIcon aria-hidden="true" className="h-3.5 w-3.5" />
              Verified
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex min-h-[246px] flex-1 flex-col px-5 pb-5 pt-2">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <p className="truncate text-[13px] font-semibold text-calm-ink-muted-80">{item.supplierName}</p>
          <span className="shrink-0 rounded-full bg-action-blue/8 px-2.5 py-1 text-[11px] font-semibold text-action-blue">
            RFQ
          </span>
        </div>
        <h3 className="mt-3 line-clamp-2 min-h-[58px] text-[23px] font-semibold leading-[1.12] tracking-[-0.025em] text-calm-ink">
          {item.title}
        </h3>
        <p className="mt-3 line-clamp-3 min-h-[64px] text-[15px] leading-[1.42] text-calm-ink-muted-80">
          {item.description}
        </p>
        <div className="mt-auto grid gap-3 pt-6">
          <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-semibold text-calm-ink-muted-80">
            <span className="rounded-full bg-canvas-parchment px-3 py-2">Brokered</span>
            <span className="rounded-full bg-canvas-parchment px-3 py-2">Protected</span>
          </div>
          <Link className="pill-primary min-h-12 w-full text-[15px]" href={item.href}>
            {item.ctaLabel}
            <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function FeatureProductCard({ item }: Readonly<{ item: MarketplaceHomeProduct }>) {
  return (
    <article className="grid min-w-0 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_90px_rgb(15_23_42/0.10)] lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative min-h-[360px] bg-[#eef5ff] p-5 sm:min-h-[440px]">
        <div className="relative h-full min-h-[320px] overflow-hidden rounded-[26px] bg-white">
          <Image
            alt={item.imageAlt}
            className="object-cover"
            fill
            priority
            sizes="(max-width: 1024px) 92vw, 620px"
            src={item.imageUrl}
          />
        </div>
        <span className="absolute left-8 top-8 rounded-full bg-calm-ink px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-white">
          Premium supplier
        </span>
      </div>
      <div className="flex min-w-0 flex-col justify-between p-7 sm:p-9">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-action-blue">
            Curated product
          </p>
          <h1 className="mt-4 text-[42px] font-semibold leading-[1.02] tracking-[-0.045em] text-calm-ink sm:text-[56px]">
            {item.title}
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-8 text-calm-ink-muted-80">{item.description}</p>
        </div>
        <div className="mt-8 grid gap-4">
          <div className="flex min-w-0 items-center gap-2 text-[14px] font-semibold text-calm-ink-muted-80">
            <span>{item.supplierName}</span>
            {item.isVerifiedSupplier ? (
              <ShieldCheckIcon aria-hidden="true" className="h-4 w-4 text-action-blue" />
            ) : null}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Link className="pill-primary min-h-12" href={item.href}>
              {item.ctaLabel}
              <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link className="pill-secondary min-h-12" href="/signup/supplier">
              Supplier path
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function CommerceOpening({ products }: Readonly<{ products: MarketplaceHomeProduct[] }>) {
  const [leadProduct, ...rest] = products;
  const sideProducts = rest.slice(0, 4);

  return (
    <section className="bg-[#f6f8fb] pb-16 pt-8">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-action-blue">
              Global B2B commerce portal
            </p>
            <h2 className="mt-3 max-w-4xl text-[44px] font-semibold leading-[1.02] tracking-[-0.05em] text-calm-ink sm:text-[64px]">
              Source verified products with protected RFQ workflows.
            </h2>
          </div>
          <div className="max-w-lg">
            <div className="flex flex-wrap gap-2">
              {COMMERCE_CATEGORIES.map((item) => (
                <button
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-calm-ink-muted-80 shadow-[0_10px_28px_rgb(15_23_42/0.04)]"
                  disabled
                  key={item}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
          <FeatureProductCard item={leadProduct} />
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
            {sideProducts.map((item, index) => (
              <ProductCard item={item} key={item.id} priority={index < 2} />
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MARKETPLACE_METRICS.map((item) => (
            <div className="rounded-[20px] border border-slate-200 bg-white px-5 py-4 text-[14px] font-semibold text-calm-ink-muted-80 shadow-[0_10px_30px_rgb(15_23_42/0.04)]" key={item}>
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  action,
  eyebrow,
  subtitle,
  title,
}: Readonly<{
  action?: CtaLink;
  eyebrow: string;
  subtitle?: string;
  title: string;
}>) {
  return (
    <div className="mb-7 flex min-w-0 flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0 max-w-2xl">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-action-blue">{eyebrow}</p>
        <h2 className="mt-2 text-[34px] font-semibold leading-[1.05] tracking-[-0.035em] text-calm-ink sm:text-[44px]">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-3 text-[16px] leading-7 text-calm-ink-muted-80">{subtitle}</p>
        ) : null}
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

function ProductRail({
  products,
}: Readonly<{
  products: MarketplaceHomeProduct[];
}>) {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <SectionHeader
          action={{ href: "/products", isEnabled: false, label: "Browse product catalog" }}
          eyebrow="Supplier showroom"
          subtitle="A commerce-first product shelf prepared for approved supplier exposure and brokered RFQ flow."
          title="Premium products presented like a global procurement store."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 8).map((item) => (
            <ProductCard item={item} key={item.id} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RequestList({ requests }: Readonly<{ requests: MarketplaceHomeRequest[] }>) {
  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_50px_rgb(15_23_42/0.06)]">
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-action-blue">Buyer demand</p>
      <h3 className="mt-2 text-[30px] font-semibold leading-[1.08] tracking-[-0.03em] text-calm-ink">
        Protected RFQ board
      </h3>
      <p className="mt-3 text-[14px] leading-6 text-calm-ink-muted-80">
        Buyer identity is masked on public surfaces. Suppliers see demand signals only.
      </p>
      <div className="mt-5 grid gap-3">
        {requests.slice(0, 3).map((item) => (
          <div className="grid min-w-0 grid-cols-[64px_minmax(0,1fr)_auto] gap-3 rounded-[18px] bg-[#f6f8fb] p-3" key={item.id}>
            <div className="relative aspect-square overflow-hidden rounded-[14px] bg-white">
              {item.imageUrl ? (
                <Image
                  alt={item.imageAlt ?? item.title}
                  className="object-cover"
                  fill
                  loading="eager"
                  sizes="64px"
                  src={item.imageUrl}
                />
              ) : null}
            </div>
            <div className="min-w-0">
              <h4 className="truncate text-[15px] font-semibold text-calm-ink">{item.title}</h4>
              <p className="mt-1 line-clamp-1 text-[12px] text-calm-ink-muted-80">{item.spec}</p>
              <p className="mt-1 text-[12px] font-semibold text-calm-ink-muted-48">{item.quantity}</p>
            </div>
            <span className="h-fit rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-action-blue">
              {item.badge}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

function EventList({ events }: Readonly<{ events: MarketplaceHomeEvent[] }>) {
  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_50px_rgb(15_23_42/0.06)]">
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-action-blue">Trade programs</p>
      <h3 className="mt-2 text-[30px] font-semibold leading-[1.08] tracking-[-0.03em] text-calm-ink">
        Event schedule
      </h3>
      <div className="mt-5 grid gap-3">
        {events.slice(0, 3).map((item) => (
          <Link className="grid min-w-0 grid-cols-[78px_minmax(0,1fr)] gap-3 rounded-[18px] bg-[#f6f8fb] p-3 transition hover:bg-white" href="/events" key={item.id}>
            <div className="relative aspect-square overflow-hidden rounded-[14px] bg-white">
              <Image alt={item.imageAlt} className="object-cover" fill loading="eager" sizes="78px" src={item.imageUrl} />
            </div>
            <div className="min-w-0">
              <time className="text-[12px] font-semibold text-action-blue">{item.dateLabel}</time>
              <h4 className="mt-1 line-clamp-2 text-[15px] font-semibold text-calm-ink">{item.title}</h4>
              <p className="mt-1 truncate text-[12px] text-calm-ink-muted-80">{item.locationLabel}</p>
            </div>
          </Link>
        ))}
      </div>
    </article>
  );
}

function VerifiedBuyerPanel({ buyers }: Readonly<{ buyers: MarketplaceHomeBuyer[] }>) {
  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_50px_rgb(15_23_42/0.06)]">
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-action-blue">Verified buyers</p>
      <h3 className="mt-2 text-[30px] font-semibold leading-[1.08] tracking-[-0.03em] text-calm-ink">
        Demand proof, masked
      </h3>
      <div className="mt-5 grid gap-3">
        {buyers.slice(0, 4).map((item) => (
          <div className="grid min-w-0 grid-cols-[46px_minmax(0,1fr)_22px] items-center gap-3 rounded-[18px] bg-[#f6f8fb] p-3" key={item.id}>
            <span className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-[14px] font-semibold text-action-blue">
              {item.avatarLabel}
            </span>
            <div className="min-w-0">
              <h4 className="truncate text-[14px] font-semibold text-calm-ink">{item.companyName}</h4>
              <p className="truncate text-[12px] text-calm-ink-muted-80">{item.role}</p>
              <span className="text-[11px] font-semibold text-calm-ink-muted-48">{item.country}</span>
            </div>
            <ShieldCheckIcon aria-hidden="true" className="h-5 w-5 text-action-blue" />
          </div>
        ))}
      </div>
    </article>
  );
}

function MarketplaceSignals({
  buyers,
  events,
  requests,
}: Readonly<{
  buyers: MarketplaceHomeBuyer[];
  events: MarketplaceHomeEvent[];
  requests: MarketplaceHomeRequest[];
}>) {
  return (
    <section className="bg-[#f6f8fb] py-16">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-3">
          <RequestList requests={requests} />
          <EventList events={events} />
          <VerifiedBuyerPanel buyers={buyers} />
        </div>
      </div>
    </section>
  );
}

function ShowcaseGrid({ showcases }: Readonly<{ showcases: MarketplaceHomeShowcase[] }>) {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <SectionHeader
          action={{ href: "/networking", isEnabled: false, label: "View showcases" }}
          eyebrow="Innovation showcase"
          subtitle="Product concepts, projects, and team-led market stories are framed as image-led cards."
          title="Showcase-ready ideas for global buyers."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {showcases.slice(0, 3).map((item) => (
            <Link className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_50px_rgb(15_23_42/0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgb(15_23_42/0.12)]" href={item.href} key={item.id}>
              <div className="relative aspect-[4/3] overflow-hidden bg-[#f5f8fc]">
                <Image
                  alt={item.imageAlt}
                  className="object-cover transition duration-700 group-hover:scale-[1.04]"
                  fill
                  loading="eager"
                  sizes="(max-width: 768px) 92vw, 380px"
                  src={item.imageUrl}
                />
              </div>
              <div className="p-5">
                <span className="rounded-full bg-action-blue/8 px-3 py-1 text-[11px] font-semibold text-action-blue">
                  {item.category}
                </span>
                <h3 className="mt-4 line-clamp-2 text-[24px] font-semibold leading-[1.1] tracking-[-0.025em] text-calm-ink">
                  {item.title}
                </h3>
                <p className="mt-2 truncate text-[14px] text-calm-ink-muted-80">{item.companyName}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function SupplierExposure({ banners }: Readonly<{ banners: MarketplaceHomeConfig["adBanners"] }>) {
  const primary = banners[0];

  return (
    <section className="bg-[#eef5ff] py-14">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <article className="grid overflow-hidden rounded-[32px] bg-calm-ink text-white shadow-[0_24px_90px_rgb(15_23_42/0.20)] lg:grid-cols-[1fr_0.8fr]">
          <div className="p-7 sm:p-10">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/60">
              Premium supplier growth
            </p>
            <h2 className="mt-4 max-w-3xl text-[38px] font-semibold leading-[1.05] tracking-[-0.04em] sm:text-[52px]">
              {primary.title}
            </h2>
            <p className="mt-4 max-w-2xl text-[16px] leading-7 text-white/72">{primary.description}</p>
            <SafeAction className="pill-primary mt-7" item={primary.cta}>
              {primary.cta.label}
              <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
            </SafeAction>
          </div>
          <div className="grid grid-cols-2 gap-3 bg-white/5 p-5">
            {["Priority placement", "Verified badge", "Catalog exposure", "RFQ readiness"].map((item) => (
              <div className="rounded-[22px] border border-white/10 bg-white/8 p-5" key={item}>
                <span className="text-[14px] font-semibold text-white">{item}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function LatestProducts({ products }: Readonly<{ products: MarketplaceHomeProduct[] }>) {
  return (
    <section className="bg-[#f6f8fb] py-16">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <SectionHeader
          action={{ href: "/products", isEnabled: false, label: "View all products" }}
          eyebrow="New arrivals"
          subtitle="A dense but polished two-row product grid for continuous marketplace discovery."
          title="Latest products, ready for sourcing review."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 8).map((item) => (
            <ProductCard item={item} key={item.id} />
          ))}
        </div>
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
    <section className="bg-white py-16">
      <div className="mx-auto grid max-w-[1320px] gap-6 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_50px_rgb(15_23_42/0.06)]">
          <SectionHeader
            eyebrow="Updates"
            subtitle="Operational notices, event windows, and supplier program changes."
            title="Announcements"
          />
          <div className="grid gap-3">
            {announcements.slice(0, 3).map((item) => (
              <Link className="grid min-w-0 grid-cols-[76px_minmax(0,1fr)] gap-4 rounded-[18px] bg-[#f6f8fb] p-3 transition hover:bg-white" href={item.href} key={item.id}>
                <time className="grid min-h-[72px] place-items-center rounded-[14px] bg-white text-center text-[12px] font-semibold text-action-blue">
                  {item.dateLabel}
                </time>
                <div className="min-w-0">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-action-blue">{item.statusLabel}</span>
                  <h3 className="mt-1 line-clamp-1 text-[16px] font-semibold text-calm-ink">{item.title}</h3>
                  <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-calm-ink-muted-80">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_50px_rgb(15_23_42/0.06)]">
          <SectionHeader
            eyebrow="FAQ"
            subtitle="Short answers for marketplace decisions."
            title="Common questions"
          />
          <div className="grid gap-3">
            {faqs.slice(0, 4).map((item) => (
              <details className="rounded-[18px] bg-[#f6f8fb] px-4 py-4" key={item.id}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold text-calm-ink [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <span aria-hidden="true" className="text-xl text-action-blue">+</span>
                </summary>
                <p className="mt-3 text-[14px] leading-6 text-calm-ink-muted-80">{item.answer}</p>
              </details>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function MarketplaceFooter() {
  const columns = [
    ["Marketplace", "Commercial", "Industrial", "EPC", "BUY & SELL"],
    ["Programs", "Supplier growth", "RFQ brokerage", "Events", "FDA service"],
    ["Network", "Agents", "Verified buyers", "Innovation showcase", "Membership"],
    ["Company", "About", "Announcements", "Support", "Help center"],
  ];

  return (
    <footer className="border-t border-slate-200 bg-[#f6f8fb] text-calm-ink">
      <div className="mx-auto max-w-[1320px] px-5 py-12 sm:px-8 lg:px-10">
        <div className="grid min-w-0 gap-10 lg:grid-cols-[1fr_1.6fr_0.9fr]">
          <div>
            <h2 className="text-[30px] font-semibold tracking-[-0.03em] text-calm-ink">B2B2G</h2>
            <p className="mt-4 max-w-sm text-[14px] leading-6 text-calm-ink-muted-80">
              A global B2B marketplace for verified supplier supply, protected buyer demand, events, and service workflows.
            </p>
          </div>
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map(([title, ...items]) => (
              <nav aria-label={title} key={title}>
                <h3 className="text-[13px] font-semibold text-calm-ink">{title}</h3>
                <div className="mt-3 grid gap-2">
                  {items.map((item) => (
                    <button className="w-fit text-left text-[13px] text-calm-ink-muted-80 disabled:cursor-not-allowed" disabled key={item} type="button">
                      {item}
                    </button>
                  ))}
                </div>
              </nav>
            ))}
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-white p-5">
            <h3 className="text-[16px] font-semibold text-calm-ink">Sourcing brief</h3>
            <p className="mt-2 text-[13px] leading-5 text-calm-ink-muted-80">
              Product, event, and service updates for marketplace teams.
            </p>
            <form className="mt-5 grid gap-2">
              <input className="min-h-11 min-w-0 rounded-full border border-slate-200 bg-white px-4 text-[13px] outline-none" disabled placeholder="Work email" type="email" />
              <button className="pill-primary disabled:cursor-not-allowed disabled:opacity-60" disabled type="button">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-[12px] text-calm-ink-muted-48 md:flex-row md:items-center md:justify-between">
          <span>© 2026 B2B2G. Buyer identity data is protected by platform policy.</span>
          <span>Privacy · Terms</span>
        </div>
      </div>
    </footer>
  );
}

export function MarketplaceHome({ config }: Readonly<{ config: MarketplaceHomeConfig }>) {
  const commerceProducts = [...config.premiumProducts, ...config.latestProducts];

  return (
    <div className="marketplace-home-root bg-white text-calm-ink">
      <CommerceOpening products={commerceProducts} />
      <ProductRail products={config.premiumProducts} />
      <MarketplaceSignals buyers={config.verifiedBuyers} events={config.events} requests={config.buyerRequests} />
      <ShowcaseGrid showcases={config.showcases} />
      <SupplierExposure banners={config.adBanners} />
      <LatestProducts products={config.latestProducts} />
      <UpdatesAndFaq announcements={config.announcements} faqs={config.faqs} />
      <MarketplaceFooter />
    </div>
  );
}
