import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRightIcon,
  BadgeIcon,
  GlobeIcon,
  SearchIcon,
  ShieldCheckIcon,
} from "@/components/public/icons";

type CtaLink = {
  href: string;
  isEnabled?: boolean;
  label: string;
};

export type MarketplaceHomeProduct = {
  category: string;
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

const STORE_CHANNELS = [
  { href: "/commercial", label: "Commercial", meta: "Consumer goods" },
  { href: "/industrial", label: "Industrial", meta: "Machinery" },
  { href: "/epc", label: "EPC", meta: "Projects" },
  { href: "/events", label: "Event", meta: "Programs" },
  { href: "/buy-sell", label: "BUY & SELL", meta: "RFQ board" },
  { href: "/service", label: "Service", meta: "FDA desk" },
];

const FOOTER_GROUPS = [
  ["Marketplace", "Commercial", "Industrial", "EPC", "BUY & SELL"],
  ["Programs", "Supplier growth", "RFQ readiness", "Events", "FDA service"],
  ["Network", "Agents", "Verified buyers", "Innovation showcase", "Membership"],
  ["Company", "About", "Announcements", "Security", "Support"],
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

function Eyebrow({ children }: Readonly<{ children: ReactNode }>) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#0066cc]">{children}</p>;
}

function StoreSectionHeader({
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
    <div className="mb-8 flex min-w-0 flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-4xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-3 max-w-3xl text-[34px] font-semibold leading-[1.05] tracking-[-0.02em] text-[#1d1d1f] sm:text-[48px]">
          {title}
        </h2>
        {subtitle ? <p className="mt-4 max-w-2xl text-[17px] leading-7 text-[#6e6e73]">{subtitle}</p> : null}
      </div>
      {action ? (
        <SafeAction
          className="inline-flex min-h-11 w-fit shrink-0 items-center justify-center gap-2 rounded-full bg-[#0066cc] px-5 text-[15px] font-semibold text-white transition hover:bg-[#0057b8] disabled:cursor-not-allowed disabled:opacity-60"
          item={action}
        >
          {action.label}
          <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
        </SafeAction>
      ) : null}
    </div>
  );
}

function StatusPill({
  children,
  tone = "blue",
}: Readonly<{
  children: ReactNode;
  tone?: "blue" | "dark" | "light";
}>) {
  const toneClass = {
    blue: "bg-[#0066cc] text-white",
    dark: "bg-[#1d1d1f] text-white",
    light: "bg-white text-[#0066cc] ring-1 ring-black/5",
  }[tone];

  return (
    <span className={`inline-flex min-h-8 items-center gap-1.5 rounded-full px-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${toneClass}`}>
      {children}
    </span>
  );
}

function CommerceProductCard({
  item,
  priority = false,
}: Readonly<{
  item: MarketplaceHomeProduct;
  priority?: boolean;
}>) {
  return (
    <article className="group relative flex h-full min-w-[268px] flex-col overflow-hidden rounded-[28px] bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[inset_0_0_0_1px_rgba(0,102,204,0.28),0_24px_60px_rgba(0,0,0,0.10)] sm:min-w-0">
      <Link
        aria-label={`Open product detail for ${item.title}`}
        className="absolute inset-0 z-10 rounded-[28px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0066cc]"
        href={item.href}
      />
      <div className="relative aspect-square overflow-hidden bg-[#f5f5f7]">
        <Image
          alt={item.imageAlt}
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
          fill
          loading={priority ? undefined : "lazy"}
          priority={priority}
          sizes="(max-width: 640px) 78vw, (max-width: 1024px) 38vw, 290px"
          src={item.imageUrl}
        />
        <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
          {item.isVerifiedSupplier ? (
            <StatusPill tone="blue">
              <ShieldCheckIcon aria-hidden="true" className="h-3.5 w-3.5" />
              Verified
            </StatusPill>
          ) : (
            <StatusPill tone="light">{item.category}</StatusPill>
          )}
          <button
            aria-label={`Save ${item.title}`}
            className="relative z-20 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/92 text-[20px] text-[#0066cc] shadow-[0_8px_22px_rgba(0,0,0,0.10)] backdrop-blur transition hover:scale-105"
            type="button"
          >
            <span aria-hidden="true">♡</span>
          </button>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <p className="truncate text-[13px] font-semibold text-[#6e6e73]">{item.supplierName}</p>
          {item.isVerifiedSupplier ? (
            <span className="shrink-0 rounded-full bg-[#f5f5f7] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#0066cc]">
              Premium
            </span>
          ) : null}
        </div>
        <h3 className="mt-3 line-clamp-2 min-h-[48px] text-[22px] font-semibold leading-[1.08] tracking-[-0.02em] text-[#1d1d1f]">
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-2 min-h-[48px] text-[15px] leading-6 text-[#6e6e73]">{item.description}</p>
        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#6e6e73]">
            <ShieldCheckIcon aria-hidden="true" className="h-4 w-4 text-[#0066cc]" />
            Protected RFQ
          </span>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f5f5f7] text-[#0066cc] transition group-hover:bg-[#0066cc] group-hover:text-white">
            <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
          </span>
        </div>
      </div>
    </article>
  );
}

function StoreHero({ products }: Readonly<{ products: MarketplaceHomeProduct[] }>) {
  return (
    <section className="bg-[#f5f5f7] pb-12 pt-12 sm:pb-16 sm:pt-16">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.45fr)] lg:items-end">
          <div>
            <h1 className="max-w-5xl text-[44px] font-semibold leading-[1.04] tracking-[-0.035em] text-[#1d1d1f] sm:text-[64px] lg:text-[76px]">
              Storefront for verified B2B products and protected demand.
            </h1>
          </div>
          <div className="rounded-[28px] bg-white p-6 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
            <p className="text-[17px] font-semibold leading-7 text-[#1d1d1f]">
              Source approved supplier products, review masked RFQ signals, and prepare trade programs without exposing buyer identity data.
            </p>
            <div className="mt-5 grid gap-2">
              {["Verified supplier catalog", "Buyer identity protected", "Admin-reviewed content"].map((item) => (
                <span className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] px-4 py-2 text-[14px] font-semibold text-[#0066cc]" key={item}>
                  <ShieldCheckIcon aria-hidden="true" className="h-4 w-4" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {STORE_CHANNELS.map((item) => (
            <Link
              className="group flex min-w-[190px] flex-col justify-between rounded-[24px] bg-white p-5 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] transition hover:-translate-y-0.5 hover:shadow-[inset_0_0_0_1px_rgba(0,102,204,0.24),0_18px_44px_rgba(0,0,0,0.08)]"
              href={item.href}
              key={item.href}
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#f5f5f7] text-[#0066cc]">
                <SearchIcon aria-hidden="true" className="h-5 w-5" />
              </span>
              <span className="mt-8 text-[19px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">{item.label}</span>
              <span className="mt-1 text-[13px] font-medium text-[#6e6e73]">{item.meta}</span>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex gap-5 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {products.slice(0, 5).map((item, index) => (
            <div className="w-[78vw] shrink-0 sm:w-[330px]" key={item.id}>
              <CommerceProductCard item={item} priority={index < 2} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PremiumProducts({ products }: Readonly<{ products: MarketplaceHomeProduct[] }>) {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
        <StoreSectionHeader
          action={{ href: "/products", isEnabled: false, label: "Browse catalog" }}
          eyebrow="Premium supplier products"
          subtitle="Image-led product cards with clear verification marks. Product cards are clickable and do not show commercial amounts or buyer identity data."
          title="A commerce shelf built for sourcing teams."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 8).map((item, index) => (
            <CommerceProductCard item={item} key={item.id} priority={index < 2} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RequestCard({ item }: Readonly<{ item: MarketplaceHomeRequest }>) {
  return (
    <article className="grid min-w-0 grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-4 rounded-[22px] bg-white p-3 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
      <div className="relative aspect-square overflow-hidden rounded-[18px] bg-[#f5f5f7]">
        {item.imageUrl ? (
          <Image alt={item.imageAlt ?? item.title} className="object-cover" fill sizes="72px" src={item.imageUrl} />
        ) : null}
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-[18px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">{item.title}</h3>
        <p className="mt-1 truncate text-[14px] text-[#6e6e73]">{item.spec}</p>
        <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#86868b]">{item.quantity}</p>
      </div>
      <span className="rounded-full bg-[#f5f5f7] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0066cc]">
        {item.badge}
      </span>
    </article>
  );
}

function EventCard({ item }: Readonly<{ item: MarketplaceHomeEvent }>) {
  return (
    <Link className="grid min-w-0 grid-cols-[96px_minmax(0,1fr)] gap-4 rounded-[22px] bg-white p-3 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] transition hover:bg-[#fbfbfd]" href="/events">
      <div className="relative aspect-square overflow-hidden rounded-[18px] bg-[#f5f5f7]">
        <Image alt={item.imageAlt} className="object-cover" fill sizes="96px" src={item.imageUrl} />
      </div>
      <div className="min-w-0 py-1">
        <time className="text-[13px] font-semibold text-[#0066cc]">{item.dateLabel}</time>
        <h3 className="mt-2 line-clamp-2 text-[18px] font-semibold leading-[1.15] tracking-[-0.01em] text-[#1d1d1f]">{item.title}</h3>
        <p className="mt-1 truncate text-[14px] text-[#6e6e73]">{item.locationLabel}</p>
      </div>
    </Link>
  );
}

function ActivityBoard({
  buyers,
  events,
  requests,
}: Readonly<{
  buyers: MarketplaceHomeBuyer[];
  events: MarketplaceHomeEvent[];
  requests: MarketplaceHomeRequest[];
}>) {
  return (
    <section className="bg-[#f5f5f7] py-20">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
        <StoreSectionHeader
          eyebrow="Marketplace activity"
          subtitle="Demand, programs, and buyer network signals are shown without revealing identity fields."
          title="The market is active. Private data stays private."
        />
        <div className="grid gap-5 lg:grid-cols-[1.05fr_1fr_0.95fr]">
          <article className="rounded-[30px] bg-[#fbfbfd] p-5 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
            <h2 className="text-[30px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Buyer product requests</h2>
            <div className="mt-5 grid gap-3">
              {requests.slice(0, 3).map((item) => <RequestCard item={item} key={item.id} />)}
            </div>
            <p className="mt-5 rounded-[20px] bg-white p-4 text-[14px] font-semibold leading-6 text-[#6e6e73] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
              Buyer company and identity fields are masked on public surfaces.
            </p>
          </article>

          <article className="rounded-[30px] bg-[#fbfbfd] p-5 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
            <h2 className="text-[30px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Trade programs</h2>
            <div className="mt-5 grid gap-3">
              {events.slice(0, 3).map((item) => <EventCard item={item} key={item.id} />)}
            </div>
          </article>

          <article className="rounded-[30px] bg-[#1d1d1f] p-5 text-white">
            <h2 className="text-[30px] font-semibold tracking-[-0.02em]">Verified demand</h2>
            <div className="mt-5 grid gap-3">
              {buyers.slice(0, 4).map((item) => (
                <div className="grid min-w-0 grid-cols-[48px_minmax(0,1fr)_24px] items-center gap-3 rounded-[20px] bg-white/[0.08] p-3" key={item.id}>
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-[15px] font-semibold text-[#0066cc]">{item.avatarLabel}</span>
                  <div className="min-w-0">
                    <h3 className="truncate text-[15px] font-semibold">{item.companyName}</h3>
                    <p className="truncate text-[13px] text-white/62">{item.role}</p>
                    <p className="text-[12px] font-semibold text-white/48">{item.country}</p>
                  </div>
                  <ShieldCheckIcon aria-hidden="true" className="h-5 w-5 text-[#2997ff]" />
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function ShowcaseAndBanner({
  banners,
  showcases,
}: Readonly<{
  banners: MarketplaceHomeConfig["adBanners"];
  showcases: MarketplaceHomeShowcase[];
}>) {
  const primary = banners[0];

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[34px] bg-[#f5f5f7] p-6 sm:p-8">
            <StoreSectionHeader
              action={{ href: "/networking", isEnabled: false, label: "View showcase" }}
              eyebrow="Innovation showcase"
              subtitle="A visual shelf for approved concepts, projects, and product-led market stories."
              title="New ideas ready for global buyers."
            />
            <div className="grid gap-4 sm:grid-cols-3">
              {showcases.slice(0, 3).map((item) => (
                <Link className="group overflow-hidden rounded-[26px] bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] transition hover:-translate-y-1" href={item.href} key={item.id}>
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#f5f5f7]">
                    <Image alt={item.imageAlt} className="object-cover transition duration-700 group-hover:scale-[1.04]" fill sizes="(max-width: 640px) 82vw, 260px" src={item.imageUrl} />
                  </div>
                  <div className="p-5">
                    <span className="rounded-full bg-[#f5f5f7] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0066cc]">{item.category}</span>
                    <h3 className="mt-4 line-clamp-2 text-[20px] font-semibold leading-[1.12] tracking-[-0.02em] text-[#1d1d1f]">{item.title}</h3>
                    <p className="mt-2 truncate text-[14px] text-[#6e6e73]">{item.companyName}</p>
                  </div>
                </Link>
              ))}
            </div>
          </article>

          <article className="flex min-h-[520px] flex-col justify-between overflow-hidden rounded-[34px] bg-[#1d1d1f] p-8 text-white">
            <div>
              <StatusPill tone="light">Premium supplier ads</StatusPill>
              <h2 className="mt-8 max-w-lg text-[42px] font-semibold leading-[1.04] tracking-[-0.035em] sm:text-[56px]">
                {primary?.title ?? "Promote products to verified global buyers."}
              </h2>
              <p className="mt-5 max-w-md text-[17px] leading-7 text-white/64">
                {primary?.description ?? "Premium placements are prepared for approved supplier exposure."}
              </p>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[
                ["Priority", BadgeIcon],
                ["Trusted", ShieldCheckIcon],
                ["Global", GlobeIcon],
              ].map(([label, Icon]) => (
                <div className="rounded-[24px] bg-white/[0.08] p-4" key={label as string}>
                  <Icon aria-hidden="true" className="h-6 w-6 text-[#2997ff]" />
                  <p className="mt-4 text-[14px] font-semibold text-white/82">{label as string} exposure</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function LatestProducts({ products }: Readonly<{ products: MarketplaceHomeProduct[] }>) {
  return (
    <section className="bg-[#f5f5f7] py-20">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
        <StoreSectionHeader
          action={{ href: "/products", isEnabled: false, label: "View all products" }}
          eyebrow="Latest products"
          subtitle="A clean two-row catalog with large thumbnails, supplier names, and protected RFQ readiness."
          title="Recently added to the marketplace."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 8).map((item) => (
            <CommerceProductCard item={item} key={item.id} />
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
    <section className="bg-white py-20">
      <div className="mx-auto grid max-w-[1440px] gap-5 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
        <article className="rounded-[34px] bg-[#f5f5f7] p-6 sm:p-8">
          <StoreSectionHeader eyebrow="Announcements" title="Marketplace updates." />
          <div className="grid gap-3">
            {announcements.slice(0, 3).map((item) => (
              <Link className="grid min-w-0 grid-cols-[74px_minmax(0,1fr)] gap-4 rounded-[24px] bg-white p-4 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] transition hover:bg-[#fbfbfd]" href={item.href} key={item.id}>
                <time className="grid min-h-[70px] place-items-center rounded-[18px] bg-[#f5f5f7] text-center text-[12px] font-semibold text-[#0066cc]">{item.dateLabel}</time>
                <div className="min-w-0">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0066cc]">{item.statusLabel}</span>
                  <h3 className="mt-1 line-clamp-1 text-[18px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">{item.title}</h3>
                  <p className="mt-1 line-clamp-2 text-[14px] leading-6 text-[#6e6e73]">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </article>

        <article className="rounded-[34px] bg-[#f5f5f7] p-6 sm:p-8">
          <StoreSectionHeader eyebrow="FAQ" title="Before you source." />
          <div className="grid gap-3">
            {faqs.slice(0, 4).map((item) => (
              <details className="group rounded-[24px] bg-white px-5 py-5 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]" key={item.id}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[18px] font-semibold tracking-[-0.01em] text-[#1d1d1f] [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f5f5f7] text-[#0066cc] transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 text-[15px] leading-7 text-[#6e6e73]">{item.answer}</p>
              </details>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function MarketplaceFooter() {
  return (
    <footer className="bg-[#f5f5f7]">
      <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-10">
        <div className="grid gap-10 border-b border-black/10 pb-10 lg:grid-cols-[1fr_2.2fr_0.9fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-[16px] bg-[#1d1d1f] text-[13px] font-semibold text-white">B2</span>
              <span className="text-[28px] font-semibold tracking-[-0.03em] text-[#1d1d1f]">B2B2G</span>
            </div>
            <p className="mt-5 max-w-sm text-[14px] leading-6 text-[#6e6e73]">
              Global B2B commerce for approved products, protected demand, trade programs, and service workflows.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FOOTER_GROUPS.map(([title, ...items]) => (
              <nav aria-label={title} key={title}>
                <h3 className="text-[13px] font-semibold text-[#1d1d1f]">{title}</h3>
                <div className="mt-4 grid gap-3">
                  {items.map((item) => (
                    <button className="w-fit text-left text-[13px] text-[#6e6e73] transition hover:text-[#0066cc] disabled:cursor-not-allowed" disabled key={item} type="button">
                      {item}
                    </button>
                  ))}
                </div>
              </nav>
            ))}
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-[#1d1d1f]">Marketplace notes</h3>
            <p className="mt-3 text-[13px] leading-6 text-[#6e6e73]">Commercial amounts are hidden. Buyer identity data stays hidden. Supplier inquiries use managed RFQ readiness.</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-6 text-[12px] text-[#86868b] md:flex-row md:items-center md:justify-between">
          <span>© 2026 B2B2G. Buyer identity data is protected by platform policy.</span>
          <span>Privacy · Terms · Security · English</span>
        </div>
      </div>
    </footer>
  );
}

export function MarketplaceHome({ config }: Readonly<{ config: MarketplaceHomeConfig }>) {
  const heroProducts = [...config.premiumProducts, ...config.latestProducts];

  return (
    <main className="marketplace-home-root bg-white text-[#1d1d1f]">
      <StoreHero products={heroProducts} />
      <PremiumProducts products={config.premiumProducts} />
      <ActivityBoard buyers={config.verifiedBuyers} events={config.events} requests={config.buyerRequests} />
      <ShowcaseAndBanner banners={config.adBanners} showcases={config.showcases} />
      <LatestProducts products={config.latestProducts} />
      <UpdatesAndFaq announcements={config.announcements} faqs={config.faqs} />
      <MarketplaceFooter />
    </main>
  );
}
