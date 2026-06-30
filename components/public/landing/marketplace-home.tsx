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
  return <div className={`mx-auto w-full max-w-[1480px] px-4 sm:px-8 lg:px-10 ${className}`}>{children}</div>;
}

function Eyebrow({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#0b63ce]">
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
    <div className="mb-6 flex min-w-0 flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div className="max-w-[calc(100vw-32px)] sm:max-w-3xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-2 max-w-[calc(100vw-32px)] text-[30px] font-semibold leading-[1.08] tracking-[-0.03em] text-[#202124] [overflow-wrap:anywhere] sm:max-w-3xl sm:text-[40px]">
          {title}
        </h2>
        {subtitle ? <p className="mt-3 max-w-[calc(100vw-32px)] text-[16px] leading-7 text-[#4f535b] [overflow-wrap:anywhere] sm:max-w-2xl">{subtitle}</p> : null}
      </div>
      {action ? (
        action.isEnabled === false ? (
          <button className="public-ui-link-button" disabled type="button">
            {action.label}
            <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
          </button>
        ) : (
          <Link className="public-ui-link-button" href={action.href}>
            {action.label}
            <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
          </Link>
        )
      ) : null}
    </div>
  );
}

function MarkBadge({
  children,
  tone = "blue",
}: Readonly<{
  children: ReactNode;
  tone?: "blue" | "dark" | "soft";
}>) {
  const toneClass = {
    blue: "bg-[#0b63ce] text-white shadow-[0_10px_30px_rgba(11,99,206,0.24)]",
    dark: "bg-[#202124] text-white",
    soft: "bg-[#eef5ff] text-[#0b63ce]",
  }[tone];

  return (
    <span className={`inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-[11px] font-bold uppercase tracking-[0.08em] ${toneClass}`}>
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
    <article className="group relative flex h-full w-full max-w-full min-w-0 flex-col overflow-hidden rounded-[20px] border border-[#dce7f6] bg-white shadow-[0_14px_34px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[#9cc4f7] hover:shadow-[0_26px_70px_rgba(15,23,42,0.12)] sm:rounded-[24px] sm:shadow-[0_18px_44px_rgba(15,23,42,0.06)]">
      <Link
        aria-label={`View ${item.title}`}
        className="absolute inset-0 z-10 rounded-[24px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b63ce]"
        href={item.href}
      />
      <div className="relative aspect-square overflow-hidden bg-[#f4f7fb] sm:aspect-[4/3]">
        <Image
          alt={item.imageAlt}
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
          fill
          loading={priority ? undefined : "lazy"}
          priority={priority}
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 44vw, 340px"
          src={item.imageUrl}
        />
        <div className="absolute left-2 right-2 top-2 flex items-start justify-between gap-2 sm:left-3 sm:right-3 sm:top-3">
          {item.isVerifiedSupplier ? (
            <MarkBadge tone="blue">
              <ShieldCheckIcon aria-hidden="true" className="h-3.5 w-3.5" />
              Verified
            </MarkBadge>
          ) : (
            <MarkBadge tone="soft">{item.category}</MarkBadge>
          )}
          <button
            aria-label={`Save ${item.title}`}
            className="relative z-20 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/95 text-[20px] text-[#0b63ce] shadow-[0_12px_30px_rgba(15,23,42,0.12)] backdrop-blur transition hover:scale-105 sm:h-10 sm:w-10 sm:text-[22px]"
            type="button"
          >
            <span aria-hidden="true">♡</span>
          </button>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3.5 min-[420px]:p-4 sm:p-5">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <p className="truncate text-[12px] font-semibold text-[#606672] min-[420px]:text-[13px]">{item.supplierName}</p>
          {item.isVerifiedSupplier ? (
            <span className="w-fit shrink-0 rounded-full bg-[#eef5ff] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#0b63ce]">
              Premium
            </span>
          ) : null}
        </div>
        <h3 className="mt-2 line-clamp-2 min-h-[40px] text-[16px] font-semibold leading-[1.18] tracking-[-0.02em] text-[#202124] min-[420px]:text-[18px] sm:min-h-[52px] sm:text-[22px]">
          {item.title}
        </h3>
        <p className="mt-1.5 hidden text-[12.5px] leading-5 text-[#5f6672] min-[420px]:mt-2 min-[420px]:line-clamp-2 min-[420px]:text-[13px] sm:text-[15px] sm:leading-6">{item.description}</p>
        <div className="mt-auto flex items-center justify-between pt-4 sm:pt-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f7fb] px-2 py-1.5 text-[10.5px] font-semibold text-[#4f535b] min-[420px]:px-2.5 min-[420px]:text-[11px] sm:px-3 sm:text-[12px]">
            <ShieldCheckIcon aria-hidden="true" className="h-3.5 w-3.5 text-[#0b63ce]" />
            <span className="hidden min-[360px]:inline">RFQ ready</span>
            <span className="min-[360px]:hidden">RFQ</span>
          </span>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#0b63ce] text-white transition group-hover:translate-x-0.5 sm:h-9 sm:w-9">
            <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
          </span>
        </div>
      </div>
    </article>
  );
}

function ProductRail({
  priorityCount = 0,
  products,
}: Readonly<{
  priorityCount?: number;
  products: MarketplaceHomeProduct[];
}>) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 pr-4 [scrollbar-width:none] md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:pb-0 md:pr-0 xl:grid-cols-4 [&::-webkit-scrollbar]:hidden">
      {products.map((item, index) => (
        <div className="w-[78vw] max-w-[320px] shrink-0 md:w-auto md:max-w-none md:shrink" key={item.id}>
          <ProductCard item={item} priority={index < priorityCount} />
        </div>
      ))}
    </div>
  );
}

function OpeningStage({ products }: Readonly<{ products: MarketplaceHomeProduct[] }>) {
  const trustItems = [
    { desktop: "Verified suppliers", mobile: "Verified" },
    { desktop: "Protected buyer identity", mobile: "Protected" },
    { desktop: "Approved content", mobile: "Approved" },
    { desktop: "Managed RFQ workflow", mobile: "RFQ ready" },
  ];

  return (
    <section className="bg-[#f3f7fd] py-7 sm:py-14">
      <PublicContainer>
        <div className="mb-5 flex min-w-0 flex-col gap-4 overflow-hidden lg:mb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <MarkBadge tone="soft">Global B2B Marketplace</MarkBadge>
            <h1 className="mt-4 max-w-4xl text-[30px] font-semibold leading-[1.04] tracking-[-0.035em] text-[#202124] [overflow-wrap:anywhere] sm:mt-5 sm:text-[52px] lg:text-[64px]">
              <span className="block sm:inline">Source verified products</span>
              <span className="block sm:inline"> from approved</span>
              <span className="block sm:inline"> global suppliers.</span>
            </h1>
            <p className="mt-3 max-w-[28rem] text-[15px] leading-7 text-[#4f535b] [overflow-wrap:anywhere] sm:mt-4 sm:max-w-2xl sm:text-[18px]">
              <span className="block sm:inline">Approved products.</span>
              <span className="block sm:inline"> Protected buyer demand.</span>
              <span className="block sm:inline"> Built for B2B sourcing.</span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 lg:w-[520px]">
            {trustItems.map((item) => (
              <span className="min-w-0 rounded-[16px] bg-white px-3 py-2.5 text-[12px] font-semibold leading-tight text-[#0b63ce] shadow-[0_12px_30px_rgba(15,23,42,0.05)] [overflow-wrap:anywhere] sm:rounded-full sm:px-4 sm:py-3 sm:text-[14px]" key={item.desktop}>
                <span className="sm:hidden">{item.mobile}</span>
                <span className="hidden sm:inline">{item.desktop}</span>
              </span>
            ))}
          </div>
        </div>

        <ProductRail priorityCount={2} products={products.slice(0, 4)} />
      </PublicContainer>
    </section>
  );
}

function ProductShelf({
  products,
}: Readonly<{
  products: MarketplaceHomeProduct[];
}>) {
  return (
    <section className="bg-white py-12 sm:py-20">
      <PublicContainer>
        <SectionHeader
          eyebrow="Supplier catalog"
          subtitle="A curated product shelf designed for B2B buyers who need visual clarity, supplier trust, and protected inquiry routing."
          title="Premium supplier showroom"
        />
        <ProductRail priorityCount={2} products={products.slice(0, 8)} />
      </PublicContainer>
    </section>
  );
}

function RequestRow({ item }: Readonly<{ item: MarketplaceHomeRequest }>) {
  return (
    <article className="grid min-w-0 grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border border-[#e3ebf7] bg-white p-3 sm:grid-cols-[64px_minmax(0,1fr)_auto] sm:gap-4 sm:rounded-[20px]">
      <div className="relative aspect-square overflow-hidden rounded-[16px] bg-[#f4f7fb]">
        {item.imageUrl ? <Image alt={item.imageAlt ?? item.title} className="object-cover" fill sizes="64px" src={item.imageUrl} /> : null}
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-[16px] font-semibold text-[#202124] sm:text-[17px]">{item.title}</h3>
        <p className="mt-1 truncate text-[14px] text-[#5f6672]">{item.spec}</p>
        <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.04em] text-[#858891]">{item.quantity}</p>
      </div>
      <span className="rounded-full bg-[#eef5ff] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#0b63ce]">
        {item.badge}
      </span>
    </article>
  );
}

function EventRow({ item }: Readonly<{ item: MarketplaceHomeEvent }>) {
  return (
    <Link className="grid min-w-0 grid-cols-[68px_minmax(0,1fr)] gap-3 rounded-[18px] border border-[#e3ebf7] bg-white p-3 transition hover:border-[#9cc4f7] sm:grid-cols-[82px_minmax(0,1fr)] sm:gap-4 sm:rounded-[20px]" href="/events">
      <div className="relative aspect-square overflow-hidden rounded-[16px] bg-[#f4f7fb]">
        <Image alt={item.imageAlt} className="object-cover" fill sizes="82px" src={item.imageUrl} />
      </div>
      <div className="min-w-0 py-1">
        <time className="text-[13px] font-bold text-[#0b63ce]">{item.dateLabel}</time>
        <h3 className="mt-1 line-clamp-2 text-[17px] font-semibold leading-[1.18] text-[#202124]">{item.title}</h3>
        <p className="mt-1 truncate text-[14px] text-[#5f6672]">{item.locationLabel}</p>
      </div>
    </Link>
  );
}

function BuyerProof({ item }: Readonly<{ item: MarketplaceHomeBuyer }>) {
  return (
    <article className="grid min-w-0 grid-cols-[46px_minmax(0,1fr)_22px] items-center gap-3 rounded-[20px] border border-[#e3ebf7] bg-white p-3">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-[#eef5ff] text-[15px] font-bold text-[#0b63ce]">
        {item.avatarLabel}
      </span>
      <div className="min-w-0">
        <h3 className="truncate text-[15px] font-semibold text-[#202124]">{item.companyName}</h3>
        <p className="truncate text-[13px] text-[#5f6672]">{item.role}</p>
        <p className="text-[12px] font-semibold text-[#858891]">{item.country}</p>
      </div>
      <ShieldCheckIcon aria-hidden="true" className="h-5 w-5 text-[#0b63ce]" />
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
    <section className="bg-[#f3f7fd] py-12 sm:py-20">
      <PublicContainer>
        <div className="grid gap-5 lg:grid-cols-3">
          <article className="rounded-[24px] border border-[#dce7f6] bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:rounded-[28px] sm:p-6">
            <Eyebrow>Buyer requests</Eyebrow>
            <h2 className="mt-2 text-[28px] font-semibold leading-[1.06] tracking-[-0.03em] text-[#202124] sm:text-[34px]">Protected RFQ board</h2>
            <div className="mt-6 grid gap-3">
              {requests.slice(0, 3).map((item) => <RequestRow item={item} key={item.id} />)}
            </div>
            <p className="mt-4 rounded-[18px] bg-[#f4f8ff] p-4 text-[14px] font-semibold leading-6 text-[#4f535b]">
              Buyer identity and contact details are protected on public surfaces.
            </p>
          </article>

          <article className="rounded-[24px] border border-[#dce7f6] bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:rounded-[28px] sm:p-6">
            <Eyebrow>Trade programs</Eyebrow>
            <h2 className="mt-2 text-[28px] font-semibold leading-[1.06] tracking-[-0.03em] text-[#202124] sm:text-[34px]">Event schedule</h2>
            <div className="mt-6 grid gap-3">
              {events.slice(0, 3).map((item) => <EventRow item={item} key={item.id} />)}
            </div>
          </article>

          <article className="rounded-[24px] border border-[#dce7f6] bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:rounded-[28px] sm:p-6">
            <Eyebrow>Verified demand</Eyebrow>
            <h2 className="mt-2 text-[28px] font-semibold leading-[1.06] tracking-[-0.03em] text-[#202124] sm:text-[34px]">Masked buyer network</h2>
            <div className="mt-6 grid gap-3">
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
    <Link className="group overflow-hidden rounded-[24px] border border-[#dce7f6] bg-white shadow-[0_18px_44px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-[#9cc4f7]" href={item.href}>
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f4f7fb]">
        <Image alt={item.imageAlt} className="object-cover transition duration-700 group-hover:scale-[1.04]" fill sizes="(max-width: 640px) 92vw, 360px" src={item.imageUrl} />
      </div>
      <div className="p-5">
        <span className="rounded-full bg-[#eef5ff] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#0b63ce]">{item.category}</span>
        <h3 className="mt-4 line-clamp-2 text-[22px] font-semibold leading-[1.12] tracking-[-0.02em] text-[#202124]">{item.title}</h3>
        <p className="mt-2 truncate text-[14px] text-[#5f6672]">{item.companyName}</p>
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
    <section className="bg-white py-16 sm:py-20">
      <PublicContainer>
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[32px] bg-[#f3f7fd] p-5 sm:p-7">
            <SectionHeader
              action={{ href: "/networking", isEnabled: false, label: "View showcase" }}
              eyebrow="Innovation showcase"
              subtitle="Product concepts and approved market stories presented as a visual B2B portfolio."
              title="Product stories ready for global buyers"
            />
            <div className="grid gap-5 sm:grid-cols-3">
              {showcases.slice(0, 3).map((item) => <ShowcaseCard item={item} key={item.id} />)}
            </div>
          </article>

          <article className="flex min-h-[420px] flex-col justify-between rounded-[32px] bg-[#101828] p-7 text-white shadow-[0_22px_70px_rgba(15,23,42,0.18)] sm:p-8">
            <div>
              <MarkBadge tone="blue">Premium supplier ads</MarkBadge>
              <h2 className="mt-7 text-[40px] font-semibold leading-[1.04] tracking-[-0.035em] sm:text-[52px]">
                {banner?.title ?? "Promote products to verified global buyers"}
              </h2>
              <p className="mt-5 text-[16px] leading-7 text-white/68">
                {banner?.description ?? "Premium placements are prepared for approved supplier exposure."}
              </p>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[
                ["Priority", BadgeIcon],
                ["Verified", ShieldCheckIcon],
                ["Global", GlobeIcon],
              ].map(([label, Icon]) => (
                <div className="rounded-[20px] bg-white/[0.08] p-4" key={label as string}>
                  <Icon aria-hidden="true" className="h-6 w-6 text-[#8ec5ff]" />
                  <p className="mt-4 text-[14px] font-semibold text-white/82">{label as string} exposure</p>
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
    <section className="bg-[#f3f7fd] py-16 sm:py-20">
      <PublicContainer>
        <SectionHeader
          action={{ href: "/products", isEnabled: false, label: "View all products" }}
          eyebrow="New arrivals"
          subtitle="Recently added supplier products with large thumbnails, concise descriptions, and clear trust markers."
          title="Latest products"
        />
        <ProductRail products={products.slice(0, 8)} />
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
    <section className="bg-white py-16 sm:py-20">
      <PublicContainer>
        <div className="grid gap-5 lg:grid-cols-2">
          <article className="rounded-[28px] border border-[#dce7f6] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.06)] sm:p-7">
            <SectionHeader eyebrow="Announcements" title="Marketplace updates" />
            <div className="grid gap-3">
              {announcements.slice(0, 3).map((item) => (
                <Link className="grid min-w-0 grid-cols-[76px_minmax(0,1fr)] gap-4 rounded-[20px] border border-[#e3ebf7] bg-[#f8fbff] p-4 transition hover:border-[#9cc4f7]" href={item.href} key={item.id}>
                  <time className="grid min-h-[70px] place-items-center rounded-[16px] bg-white text-center text-[12px] font-bold text-[#0b63ce]">{item.dateLabel}</time>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#0b63ce]">{item.statusLabel}</span>
                    <h3 className="mt-1 line-clamp-1 text-[18px] font-semibold text-[#202124]">{item.title}</h3>
                    <p className="mt-1 line-clamp-2 text-[14px] leading-6 text-[#5f6672]">{item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </article>

          <article className="rounded-[28px] border border-[#dce7f6] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.06)] sm:p-7">
            <SectionHeader eyebrow="FAQ" title="Common sourcing questions" />
            <div className="grid gap-3">
              {faqs.slice(0, 4).map((item) => (
                <details className="group rounded-[20px] border border-[#e3ebf7] bg-[#f8fbff] px-5 py-5" key={item.id}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[18px] font-semibold text-[#202124] [&::-webkit-details-marker]:hidden">
                    <span>{item.question}</span>
                    <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-[#0b63ce] transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-4 text-[15px] leading-7 text-[#5f6672]">{item.answer}</p>
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
      <PublicContainer className="py-12 sm:py-14">
        <div className="grid gap-10 border-b border-white/10 pb-10 lg:grid-cols-[1.15fr_2fr_0.95fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-white text-[13px] font-black text-[#0b63ce]">B2</span>
              <span className="text-[28px] font-black tracking-[-0.06em]">B2B2G</span>
            </div>
            <p className="mt-5 max-w-sm text-[14px] leading-7 text-white/62">
              A controlled B2B commerce platform for verified suppliers, protected buyer demand, trade programs, and marketplace services.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {groups.map(([title, ...items]) => (
              <nav aria-label={title} key={title}>
                <h3 className="text-[13px] font-semibold text-white">{title}</h3>
                <div className="mt-4 grid gap-3">
                  {items.map((item) => (
                    <button className="w-fit text-left text-[13px] text-white/54 transition hover:text-white" disabled key={item} type="button">
                      {item}
                    </button>
                  ))}
                </div>
              </nav>
            ))}
          </div>
          <div className="rounded-[22px] bg-white/[0.07] p-5">
            <h3 className="text-[15px] font-semibold">Trade brief</h3>
            <p className="mt-3 text-[13px] leading-6 text-white/58">Newsletter and marketplace updates will be enabled after public subscription policy review.</p>
            <div className="mt-5 flex rounded-full bg-white p-1">
              <input className="min-w-0 flex-1 bg-transparent px-4 text-[13px] text-[#202124] outline-none" disabled placeholder="Email updates coming soon" />
              <button className="grid h-10 w-10 place-items-center rounded-full bg-[#0b63ce] text-white" disabled type="button">
                <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-6 text-[12px] text-white/45 md:flex-row md:items-center md:justify-between">
          <span>© 2026 B2B2G. Buyer identity data is protected by platform policy.</span>
          <span>Privacy · Terms · Security · English</span>
        </div>
      </PublicContainer>
    </footer>
  );
}

export function MarketplaceHome({ config }: Readonly<{ config: MarketplaceHomeConfig }>) {
  return (
    <main className="marketplace-home-root bg-white text-[#202124]">
      <OpeningStage products={config.premiumProducts} />
      <ProductShelf products={config.premiumProducts} />
      <MarketplaceSignals buyers={config.verifiedBuyers} events={config.events} requests={config.buyerRequests} />
      <ShowcaseAndAds banners={config.adBanners} showcases={config.showcases} />
      <LatestProducts products={config.latestProducts} />
      <UpdatesAndFaq announcements={config.announcements} faqs={config.faqs} />
      <MarketplaceFooter />
    </main>
  );
}
