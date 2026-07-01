import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRightIcon,
  BadgeIcon,
  GlobeIcon,
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
  adBanners: {
    cta: CtaLink;
    description: string;
    id: string;
    title: string;
  }[];
  announcements: MarketplaceHomeAnnouncement[];
  buyerRequests: MarketplaceHomeRequest[];
  events: MarketplaceHomeEvent[];
  faqs: MarketplaceHomeFaq[];
  latestProducts: MarketplaceHomeProduct[];
  premiumProducts: MarketplaceHomeProduct[];
  showcases: MarketplaceHomeShowcase[];
  verifiedBuyers: MarketplaceHomeBuyer[];
};

function PublicContainer({
  children,
  className = "",
}: Readonly<{
  children: ReactNode;
  className?: string;
}>) {
  return <div className={`mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

function Eyebrow({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0b63ce]">
      {children}
    </p>
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
    <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-2 text-[28px] font-semibold leading-[1.08] tracking-[-0.035em] text-[#101828] sm:text-[40px]">
          {title}
        </h2>
        {subtitle ? <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#596170] sm:text-[16px]">{subtitle}</p> : null}
      </div>
      {action ? (
        action.isEnabled === false ? (
          <button className="inline-flex min-h-10 w-fit items-center gap-2 rounded-full border border-[#dbe8f7] bg-white px-4 text-[13px] font-bold text-[#0b63ce] shadow-[0_12px_28px_rgba(15,23,42,0.05)]" disabled type="button">
            {action.label}
            <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
          </button>
        ) : (
          <Link className="inline-flex min-h-10 w-fit items-center gap-2 rounded-full border border-[#dbe8f7] bg-white px-4 text-[13px] font-bold text-[#0b63ce] shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition hover:border-[#9cc4f7]" href={action.href}>
            {action.label}
            <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
          </Link>
        )
      ) : null}
    </div>
  );
}

function StatusPill({
  children,
  tone = "blue",
}: Readonly<{
  children: ReactNode;
  tone?: "blue" | "dark" | "soft";
}>) {
  const toneClass = {
    blue: "bg-[#0b63ce] text-white shadow-[0_10px_22px_rgba(11,99,206,0.18)]",
    dark: "bg-[#101828] text-white",
    soft: "bg-[#eef5ff] text-[#0b63ce]",
  }[tone];

  return (
    <span className={`inline-flex min-h-7 items-center gap-1.5 rounded-full px-2.5 text-[10px] font-black uppercase tracking-[0.08em] ${toneClass}`}>
      {children}
    </span>
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
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[22px] border border-[#dbe8f7] bg-white shadow-[0_14px_36px_rgba(15,23,42,0.055)] transition duration-300 hover:-translate-y-1 hover:border-[#9bc4f7] hover:shadow-[0_24px_56px_rgba(15,23,42,0.12)]">
      <Link
        aria-label={`Open ${item.title}`}
        className="absolute inset-0 z-10 rounded-[22px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b63ce]"
        href={item.href}
      />
      <div className="relative aspect-square overflow-hidden bg-[#f3f7fb]">
        <Image
          alt={item.imageAlt}
          className="object-cover transition duration-700 group-hover:scale-[1.045]"
          fill
          loading={priority ? undefined : "lazy"}
          priority={priority}
          sizes="(max-width: 640px) 76vw, (max-width: 1024px) 44vw, 300px"
          src={item.imageUrl}
        />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          {item.isVerifiedSupplier ? (
            <StatusPill tone="blue">
              <ShieldCheckIcon aria-hidden="true" className="h-3.5 w-3.5" />
              Verified
            </StatusPill>
          ) : (
            <StatusPill tone="soft">{item.category}</StatusPill>
          )}
          <button
            aria-label={`Save ${item.title}`}
            className="relative z-20 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/95 text-[19px] text-[#0b63ce] shadow-[0_12px_28px_rgba(15,23,42,0.14)] backdrop-blur transition hover:scale-105"
            type="button"
          >
            <span aria-hidden="true">♡</span>
          </button>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <p className="truncate text-[12px] font-bold text-[#6a7280]">{item.supplierName}</p>
          {item.isVerifiedSupplier ? (
            <span className="shrink-0 rounded-full bg-[#eef5ff] px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-[#0b63ce]">
              Premium
            </span>
          ) : null}
        </div>
        <h3 className="mt-2 line-clamp-2 min-h-[44px] text-[19px] font-semibold leading-[1.16] tracking-[-0.02em] text-[#101828]">
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-2 min-h-[44px] text-[13px] leading-[1.65] text-[#596170]">
          {item.description}
        </p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f8fc] px-2.5 py-1.5 text-[11px] font-bold text-[#596170]">
            <ShieldCheckIcon aria-hidden="true" className="h-3.5 w-3.5 text-[#0b63ce]" />
            RFQ ready
          </span>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#0b63ce] text-white transition group-hover:translate-x-0.5">
            <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
          </span>
        </div>
      </div>
    </article>
  );
}

function ProductGrid({
  priorityCount = 0,
  products,
}: Readonly<{
  priorityCount?: number;
  products: MarketplaceHomeProduct[];
}>) {
  return (
    <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 lg:grid-cols-4 lg:gap-5">
      {products.map((item, index) => (
        <ProductCard item={item} key={item.id} priority={index < priorityCount} />
      ))}
    </div>
  );
}

function HeroProductRail({ products }: Readonly<{ products: MarketplaceHomeProduct[] }>) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] lg:grid lg:grid-cols-2 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden">
      {products.map((item, index) => (
        <div className="w-[76vw] max-w-[300px] shrink-0 lg:w-auto lg:max-w-none lg:shrink" key={item.id}>
          <ProductCard item={item} priority={index < 2} />
        </div>
      ))}
    </div>
  );
}

function CategoryStrip() {
  const items = ["Commercial", "Industrial", "EPC", "Events", "BUY & SELL", "Networking", "FDA Service"];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((item) => (
        <button className="shrink-0 rounded-full border border-[#dbe8f7] bg-white px-4 py-2 text-[13px] font-bold text-[#364152] shadow-[0_10px_24px_rgba(15,23,42,0.045)] transition hover:border-[#9cc4f7] hover:text-[#0b63ce]" disabled key={item} type="button">
          {item}
        </button>
      ))}
    </div>
  );
}

function MarketplaceHero({
  event,
  products,
  request,
}: Readonly<{
  event: MarketplaceHomeEvent;
  products: MarketplaceHomeProduct[];
  request: MarketplaceHomeRequest;
}>) {
  const heroProducts = products.slice(0, 4);

  return (
    <section className="overflow-hidden bg-[#f3f7fd] py-8 sm:py-12 lg:py-14">
      <PublicContainer>
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div className="min-w-0">
            <StatusPill tone="soft">Global B2B Marketplace</StatusPill>
            <h1 className="mt-4 max-w-3xl text-[40px] font-semibold leading-[0.98] tracking-[-0.055em] text-[#101828] sm:text-[58px] lg:text-[70px]">
              Source products that are ready for trade.
            </h1>
            <p className="mt-5 max-w-xl text-[16px] leading-7 text-[#596170] sm:text-[18px]">
              A curated marketplace for approved supplier products, protected buyer requests, and trade programs without exposing buyer identity data.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2 sm:max-w-xl">
              {["Verified suppliers", "Protected RFQ", "Approved content", "Global programs"].map((item) => (
                <span className="rounded-[16px] bg-white px-4 py-3 text-[13px] font-bold text-[#0b63ce] shadow-[0_12px_28px_rgba(15,23,42,0.05)]" key={item}>
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:max-w-xl sm:grid-cols-2">
              <article className="rounded-[22px] border border-[#dbe8f7] bg-white p-4 shadow-[0_16px_36px_rgba(15,23,42,0.055)]">
                <Eyebrow>Protected demand</Eyebrow>
                <h2 className="mt-2 line-clamp-2 text-[20px] font-semibold leading-[1.14] text-[#101828]">{request.title}</h2>
                <p className="mt-2 text-[13px] font-bold text-[#6a7280]">{request.quantity}</p>
              </article>
              <article className="rounded-[22px] border border-[#dbe8f7] bg-white p-4 shadow-[0_16px_36px_rgba(15,23,42,0.055)]">
                <Eyebrow>Trade program</Eyebrow>
                <h2 className="mt-2 line-clamp-2 text-[20px] font-semibold leading-[1.14] text-[#101828]">{event.title}</h2>
                <p className="mt-2 text-[13px] font-bold text-[#6a7280]">{event.locationLabel}</p>
              </article>
            </div>
          </div>

          <div className="rounded-[30px] border border-[#dbe8f7] bg-white p-3 shadow-[0_26px_80px_rgba(15,23,42,0.10)] sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <div>
                <Eyebrow>Featured supplier shelf</Eyebrow>
                <p className="mt-1 text-[14px] font-semibold text-[#596170]">Click any card to open product detail.</p>
              </div>
              <span className="hidden rounded-full bg-[#eef5ff] px-3 py-2 text-[12px] font-black uppercase tracking-[0.08em] text-[#0b63ce] sm:inline-flex">
                No public pricing
              </span>
            </div>
            <HeroProductRail products={heroProducts} />
          </div>
        </div>
        <div className="mt-6">
          <CategoryStrip />
        </div>
      </PublicContainer>
    </section>
  );
}

function ProductShelf({ products }: Readonly<{ products: MarketplaceHomeProduct[] }>) {
  return (
    <section className="bg-white py-12 sm:py-16">
      <PublicContainer>
        <SectionHeader
          eyebrow="Supplier catalog"
          subtitle="A cleaner commerce grid for B2B buyers who scan images first, then trust markers and supplier identity."
          title="Premium supplier showroom"
        />
        <ProductGrid products={products.slice(0, 8)} />
      </PublicContainer>
    </section>
  );
}

function RequestRow({ item }: Readonly<{ item: MarketplaceHomeRequest }>) {
  return (
    <article className="grid grid-cols-[58px_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border border-[#e4edf8] bg-[#f8fbff] p-3">
      <div className="relative aspect-square overflow-hidden rounded-[14px] bg-white">
        {item.imageUrl ? <Image alt={item.imageAlt ?? item.title} className="object-cover" fill sizes="58px" src={item.imageUrl} /> : null}
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-[15px] font-semibold text-[#101828]">{item.title}</h3>
        <p className="mt-1 truncate text-[13px] text-[#596170]">{item.spec}</p>
        <p className="mt-1 text-[11px] font-black uppercase tracking-[0.04em] text-[#8a92a0]">{item.quantity}</p>
      </div>
      <span className="rounded-full bg-white px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-[#0b63ce]">
        {item.badge}
      </span>
    </article>
  );
}

function EventRow({ item }: Readonly<{ item: MarketplaceHomeEvent }>) {
  return (
    <Link className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 rounded-[18px] border border-[#e4edf8] bg-[#f8fbff] p-3 transition hover:border-[#9cc4f7]" href="/events">
      <div className="relative aspect-square overflow-hidden rounded-[14px] bg-white">
        <Image alt={item.imageAlt} className="object-cover" fill sizes="72px" src={item.imageUrl} />
      </div>
      <div className="min-w-0 py-0.5">
        <time className="text-[12px] font-black uppercase tracking-[0.04em] text-[#0b63ce]">{item.dateLabel}</time>
        <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-[1.18] text-[#101828]">{item.title}</h3>
        <p className="mt-1 truncate text-[13px] text-[#596170]">{item.locationLabel}</p>
      </div>
    </Link>
  );
}

function BuyerProof({ item }: Readonly<{ item: MarketplaceHomeBuyer }>) {
  return (
    <article className="grid grid-cols-[42px_minmax(0,1fr)_20px] items-center gap-3 rounded-[18px] border border-[#e4edf8] bg-[#f8fbff] p-3">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[14px] font-black text-[#0b63ce] shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        {item.avatarLabel}
      </span>
      <div className="min-w-0">
        <h3 className="truncate text-[14px] font-semibold text-[#101828]">{item.companyName}</h3>
        <p className="truncate text-[12px] text-[#596170]">{item.role}</p>
        <p className="text-[11px] font-bold text-[#8a92a0]">{item.country}</p>
      </div>
      <ShieldCheckIcon aria-hidden="true" className="h-5 w-5 text-[#0b63ce]" />
    </article>
  );
}

function MarketActivity({
  buyers,
  events,
  requests,
}: Readonly<{
  buyers: MarketplaceHomeBuyer[];
  events: MarketplaceHomeEvent[];
  requests: MarketplaceHomeRequest[];
}>) {
  return (
    <section className="bg-[#f3f7fd] py-12 sm:py-16">
      <PublicContainer>
        <SectionHeader
          eyebrow="Marketplace activity"
          subtitle="Demand, programs, and buyer proof are shown without exposing private contact data."
          title="Live sourcing signals"
        />
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr_0.9fr]">
          <article className="rounded-[26px] border border-[#dbe8f7] bg-white p-4 shadow-[0_16px_42px_rgba(15,23,42,0.06)] sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <Eyebrow>Buyer requests</Eyebrow>
              <StatusPill tone="soft">Masked</StatusPill>
            </div>
            <div className="grid gap-3">
              {requests.slice(0, 3).map((item) => <RequestRow item={item} key={item.id} />)}
            </div>
          </article>

          <article className="rounded-[26px] border border-[#dbe8f7] bg-white p-4 shadow-[0_16px_42px_rgba(15,23,42,0.06)] sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <Eyebrow>Events</Eyebrow>
              <StatusPill tone="soft">Programs</StatusPill>
            </div>
            <div className="grid gap-3">
              {events.slice(0, 3).map((item) => <EventRow item={item} key={item.id} />)}
            </div>
          </article>

          <article className="rounded-[26px] border border-[#dbe8f7] bg-white p-4 shadow-[0_16px_42px_rgba(15,23,42,0.06)] sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <Eyebrow>Verified demand</Eyebrow>
              <StatusPill tone="soft">Private</StatusPill>
            </div>
            <div className="grid gap-3">
              {buyers.slice(0, 4).map((item) => <BuyerProof item={item} key={item.id} />)}
            </div>
          </article>
        </div>
      </PublicContainer>
    </section>
  );
}

function ShowcaseCard({ item }: Readonly<{ item: MarketplaceHomeShowcase }>) {
  return (
    <Link className="group overflow-hidden rounded-[22px] border border-[#dbe8f7] bg-white shadow-[0_14px_36px_rgba(15,23,42,0.055)] transition hover:-translate-y-1 hover:border-[#9cc4f7]" href={item.href}>
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f3f7fb]">
        <Image alt={item.imageAlt} className="object-cover transition duration-700 group-hover:scale-[1.04]" fill sizes="(max-width: 640px) 92vw, 340px" src={item.imageUrl} />
      </div>
      <div className="p-4">
        <span className="rounded-full bg-[#eef5ff] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#0b63ce]">{item.category}</span>
        <h3 className="mt-3 line-clamp-2 text-[19px] font-semibold leading-[1.16] tracking-[-0.02em] text-[#101828]">{item.title}</h3>
        <p className="mt-2 truncate text-[13px] font-semibold text-[#596170]">{item.companyName}</p>
      </div>
    </Link>
  );
}

function ShowcaseAndAds({
  banners,
  showcases,
}: Readonly<{
  banners: MarketplaceHomeConfig["adBanners"];
  showcases: MarketplaceHomeShowcase[];
}>) {
  const banner = banners[0];

  return (
    <section className="bg-white py-12 sm:py-16">
      <PublicContainer>
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-[30px] border border-[#dbe8f7] bg-[#f8fbff] p-5 sm:p-6">
            <SectionHeader
              action={{ href: "/networking", isEnabled: false, label: "View showcase" }}
              eyebrow="Innovation showcase"
              subtitle="Product stories and approved concepts presented as a visual B2B portfolio."
              title="Product stories ready for buyers"
            />
            <div className="grid gap-4 sm:grid-cols-3">
              {showcases.slice(0, 3).map((item) => <ShowcaseCard item={item} key={item.id} />)}
            </div>
          </article>

          <article className="flex min-h-[360px] flex-col justify-between overflow-hidden rounded-[30px] bg-[#101828] p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.16)] sm:p-7">
            <div>
              <StatusPill tone="blue">Premium supplier ads</StatusPill>
              <h2 className="mt-6 text-[34px] font-semibold leading-[1.04] tracking-[-0.04em] sm:text-[46px]">
                {banner?.title ?? "Promote products to verified global buyers"}
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-white/68">
                {banner?.description ?? "Premium placements are prepared for approved supplier exposure."}
              </p>
            </div>
            <div className="mt-7 grid grid-cols-3 gap-2">
              {[
                ["Priority", BadgeIcon],
                ["Verified", ShieldCheckIcon],
                ["Global", GlobeIcon],
              ].map(([label, Icon]) => (
                <div className="rounded-[18px] bg-white/[0.08] p-3" key={label as string}>
                  <Icon aria-hidden="true" className="h-5 w-5 text-[#8ec5ff]" />
                  <p className="mt-3 text-[12px] font-bold leading-4 text-white/82">{label as string}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </PublicContainer>
    </section>
  );
}

function LatestProducts({ products }: Readonly<{ products: MarketplaceHomeProduct[] }>) {
  return (
    <section className="bg-[#f3f7fd] py-12 sm:py-16">
      <PublicContainer>
        <SectionHeader
          action={{ href: "/products", isEnabled: false, label: "View all products" }}
          eyebrow="New arrivals"
          subtitle="Recently added supplier products with clear images, supplier names, and trust markers."
          title="Latest products"
        />
        <ProductGrid products={products.slice(0, 8)} />
      </PublicContainer>
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
    <section className="bg-white py-12 sm:py-16">
      <PublicContainer>
        <div className="grid gap-5 lg:grid-cols-2">
          <article className="rounded-[28px] border border-[#dbe8f7] bg-white p-5 shadow-[0_16px_42px_rgba(15,23,42,0.055)] sm:p-6">
            <SectionHeader eyebrow="Announcements" title="Marketplace updates" />
            <div className="grid gap-3">
              {announcements.slice(0, 3).map((item) => (
                <Link className="grid grid-cols-[70px_minmax(0,1fr)] gap-3 rounded-[18px] border border-[#e4edf8] bg-[#f8fbff] p-3 transition hover:border-[#9cc4f7]" href={item.href} key={item.id}>
                  <time className="grid min-h-[62px] place-items-center rounded-[15px] bg-white text-center text-[11px] font-black text-[#0b63ce]">{item.dateLabel}</time>
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-[0.08em] text-[#0b63ce]">{item.statusLabel}</span>
                    <h3 className="mt-1 line-clamp-1 text-[16px] font-semibold text-[#101828]">{item.title}</h3>
                    <p className="mt-1 line-clamp-2 text-[13px] leading-6 text-[#596170]">{item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </article>

          <article className="rounded-[28px] border border-[#dbe8f7] bg-white p-5 shadow-[0_16px_42px_rgba(15,23,42,0.055)] sm:p-6">
            <SectionHeader eyebrow="FAQ" title="Common sourcing questions" />
            <div className="grid gap-3">
              {faqs.slice(0, 4).map((item) => (
                <details className="group rounded-[18px] border border-[#e4edf8] bg-[#f8fbff] px-4 py-4" key={item.id}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold text-[#101828] [&::-webkit-details-marker]:hidden">
                    <span>{item.question}</span>
                    <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-[#0b63ce] transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-[14px] leading-7 text-[#596170]">{item.answer}</p>
                </details>
              ))}
            </div>
          </article>
        </div>
      </PublicContainer>
    </section>
  );
}

function MarketplaceFooter() {
  const groups = [
    ["Marketplace", "Commercial", "Industrial", "EPC", "BUY & SELL"],
    ["Programs", "Events", "FDA Service", "Supplier Growth", "RFQ Board"],
    ["Network", "Agents", "Verified Buyers", "Product Showcase", "Membership"],
    ["Company", "About", "Announcements", "Security", "Support"],
  ];

  return (
    <footer className="bg-[#0f172a] text-white">
      <PublicContainer className="py-10 sm:py-12">
        <div className="grid gap-8 border-b border-white/10 pb-8 lg:grid-cols-[1fr_2fr_0.95fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#0b63ce] text-[12px] font-black text-white">B2</span>
              <span className="text-[26px] font-black tracking-[-0.06em]">B2B2G</span>
            </div>
            <p className="mt-4 max-w-sm text-[13px] leading-7 text-white/62">
              A controlled B2B commerce platform for verified suppliers, protected buyer demand, trade programs, and marketplace services.
            </p>
          </div>
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {groups.map(([title, ...items]) => (
              <nav aria-label={title} key={title}>
                <h3 className="text-[13px] font-semibold text-white">{title}</h3>
                <div className="mt-4 grid gap-2.5">
                  {items.map((item) => (
                    <button className="w-fit text-left text-[13px] text-white/56 transition hover:text-white" disabled key={item} type="button">
                      {item}
                    </button>
                  ))}
                </div>
              </nav>
            ))}
          </div>
          <div className="rounded-[22px] bg-white/[0.07] p-5">
            <h3 className="text-[15px] font-semibold">Trade brief</h3>
            <p className="mt-3 text-[13px] leading-6 text-white/58">Marketplace updates will be enabled after public subscription policy review.</p>
            <div className="mt-5 flex rounded-full bg-white p-1">
              <input className="min-w-0 flex-1 bg-transparent px-4 text-[13px] text-[#101828] outline-none" disabled placeholder="Email updates coming soon" />
              <button className="grid h-10 w-10 place-items-center rounded-full bg-[#0b63ce] text-white" disabled type="button">
                <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-5 text-[12px] text-white/45 md:flex-row md:items-center md:justify-between">
          <span>© 2026 B2B2G. Buyer identity data is protected by platform policy.</span>
          <span>Privacy · Terms · Security · English</span>
        </div>
      </PublicContainer>
    </footer>
  );
}

export function MarketplaceHome({ config }: Readonly<{ config: MarketplaceHomeConfig }>) {
  return (
    <main className="marketplace-home-root bg-white text-[#101828]">
      <MarketplaceHero event={config.events[0]} products={config.premiumProducts} request={config.buyerRequests[0]} />
      <ProductShelf products={config.premiumProducts} />
      <MarketActivity buyers={config.verifiedBuyers} events={config.events} requests={config.buyerRequests} />
      <ShowcaseAndAds banners={config.adBanners} showcases={config.showcases} />
      <LatestProducts products={config.latestProducts} />
      <UpdatesAndFaq announcements={config.announcements} faqs={config.faqs} />
      <MarketplaceFooter />
    </main>
  );
}
