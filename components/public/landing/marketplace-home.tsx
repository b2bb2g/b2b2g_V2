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

const categoryLinks = [
  { href: "/commercial", label: "Commercial", meta: "Consumer goods" },
  { href: "/industrial", label: "Industrial", meta: "Machinery" },
  { href: "/epc", label: "EPC", meta: "Projects" },
  { href: "/events", label: "Event", meta: "Programs" },
  { href: "/buy-sell", label: "BUY & SELL", meta: "RFQ board" },
  { href: "/networking", label: "Networking", meta: "Partners" },
  { href: "/service", label: "Service", meta: "FDA support" },
] as const;

function PublicContainer({
  children,
  className = "",
}: Readonly<{
  children: ReactNode;
  className?: string;
}>) {
  return (
    <div
      className={`mx-auto box-border min-w-0 max-w-[1440px] px-0 sm:w-full sm:px-6 lg:px-10 ${className}`}
      style={{ width: "min(1440px, calc(100vw - 2rem))" }}
    >
      {children}
    </div>
  );
}

function Eyebrow({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0066cc]">
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
    <div className="mb-5 flex flex-col gap-4 md:mb-7 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-2 text-[26px] font-semibold leading-[1.08] tracking-[-0.035em] text-[#1d1d1f] sm:text-[36px]">
          {title}
        </h2>
        {subtitle ? <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#667085]">{subtitle}</p> : null}
      </div>
      {action ? <HeaderAction action={action} /> : null}
    </div>
  );
}

function HeaderAction({ action }: Readonly<{ action: CtaLink }>) {
  const className =
    "inline-flex min-h-10 w-fit items-center gap-2 rounded-full border border-[#d7e4f5] bg-white px-4 text-[13px] font-semibold text-[#0066cc] transition hover:border-[#8fc1ff] hover:bg-[#f6faff]";

  if (action.isEnabled === false) {
    return (
      <button className={className} disabled type="button">
        {action.label}
        <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
      </button>
    );
  }

  return (
    <Link className={className} href={action.href}>
      {action.label}
      <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
    </Link>
  );
}

function BadgePill({
  children,
  tone = "blue",
}: Readonly<{
  children: ReactNode;
  tone?: "blue" | "dark" | "neutral";
}>) {
  const toneClass = {
    blue: "bg-[#0066cc] text-white",
    dark: "bg-[#1d1d1f] text-white",
    neutral: "bg-[#edf5ff] text-[#0066cc]",
  }[tone];

  return (
    <span className={`inline-flex min-h-7 items-center gap-1.5 rounded-full px-2.5 text-[10px] font-black uppercase tracking-[0.1em] ${toneClass}`}>
      {children}
    </span>
  );
}

function HomeIntro({ products }: Readonly<{ products: MarketplaceHomeProduct[] }>) {
  const spotlight = products[0];

  return (
    <section className="bg-[#f5f8fc] py-8 sm:py-10">
      <PublicContainer>
        <nav className="flex items-center gap-2 text-[13px] font-medium text-[#7a7f89]">
          <Link className="text-[#0066cc]" href="/">
            B2B2G
          </Link>
          <span aria-hidden="true">/</span>
          <span>Marketplace home</span>
        </nav>

        <div className="mt-6 grid min-w-0 max-w-full gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
          <div className="box-border min-w-0 max-w-full rounded-[28px] border border-[#d7e4f5] bg-white p-5 sm:p-8 lg:p-10">
            <BadgePill tone="neutral">Global B2B Marketplace</BadgePill>
            <h1 className="mt-5 max-w-[300px] text-[32px] font-semibold leading-[1.04] tracking-[-0.04em] text-[#1d1d1f] sm:max-w-3xl sm:text-[56px] sm:tracking-[-0.05em] lg:text-[64px]">
              <span className="block">B2B products.</span>
              <span className="block">Verified demand.</span>
              <span className="block">Trade programs.</span>
            </h1>
            <p className="mt-5 max-w-[290px] text-[15px] leading-7 text-[#667085] sm:max-w-2xl sm:text-[17px]">
              Browse approved supplier products, protected buyer demand, and event-ready programs in one marketplace hierarchy.
            </p>
            <div className="mt-7 grid max-w-[290px] grid-cols-1 gap-2 sm:max-w-none sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {["Verified suppliers", "Protected RFQ", "Approved content", "Trade programs"].map((item) => (
                <span className="rounded-2xl bg-[#f5f8fc] px-4 py-3 text-[13px] font-semibold text-[#0066cc]" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {spotlight ? (
            <Link className="group grid min-w-0 max-w-full overflow-hidden rounded-[28px] border border-[#d7e4f5] bg-white transition hover:border-[#8fc1ff]" href={spotlight.href}>
              <div className="grid min-h-full md:grid-cols-[1.05fr_0.95fr]">
                <div className="relative min-h-[260px] overflow-hidden bg-[#eef4fb]">
                  <Image
                    alt={spotlight.imageAlt}
                    className="object-cover transition duration-700 group-hover:scale-[1.035]"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 520px"
                    src={spotlight.imageUrl}
                  />
                  <div className="absolute left-4 top-4 flex gap-2">
                    <BadgePill tone="blue">
                      <ShieldCheckIcon aria-hidden="true" className="h-3.5 w-3.5" />
                      Featured
                    </BadgePill>
                  </div>
                </div>
                <div className="flex flex-col justify-between p-6 sm:p-8">
                  <div>
                    <Eyebrow>Featured supplier product</Eyebrow>
                    <h2 className="mt-3 text-[30px] font-semibold leading-[1.08] tracking-[-0.035em] text-[#1d1d1f] sm:text-[42px]">
                      {spotlight.title}
                    </h2>
                    <p className="mt-3 text-[15px] font-semibold text-[#515966]">{spotlight.supplierName}</p>
                    <p className="mt-4 text-[15px] leading-7 text-[#667085]">{spotlight.description}</p>
                  </div>
                  <div className="mt-8 flex items-center justify-between border-t border-[#e6edf6] pt-5">
                    <span className="text-[13px] font-semibold text-[#667085]">Open product detail</span>
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-[#0066cc] text-white transition group-hover:translate-x-1">
                      <ArrowRightIcon aria-hidden="true" className="h-5 w-5" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ) : null}
        </div>
      </PublicContainer>
    </section>
  );
}

function CategoryIndex() {
  return (
    <section className="border-y border-[#e4edf7] bg-white">
      <PublicContainer>
        <div className="flex gap-3 overflow-x-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categoryLinks.map((item) => (
            <Link
              className="group grid min-w-[176px] rounded-[18px] border border-[#e1eaf5] bg-white px-4 py-3 transition hover:border-[#8fc1ff] hover:bg-[#f7fbff]"
              href={item.href}
              key={item.href}
            >
              <span className="text-[15px] font-semibold text-[#1d1d1f]">{item.label}</span>
              <span className="mt-1 text-[12px] font-medium text-[#8a93a3]">{item.meta}</span>
            </Link>
          ))}
        </div>
      </PublicContainer>
    </section>
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
    <Link
      className="group flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-[#dbe6f2] bg-white transition duration-300 hover:-translate-y-0.5 hover:border-[#8fc1ff]"
      href={item.href}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f0f4f8]">
        <Image
          alt={item.imageAlt}
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
          fill
          loading={priority ? undefined : "lazy"}
          priority={priority}
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 44vw, 320px"
          src={item.imageUrl}
        />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          {item.isVerifiedSupplier ? (
            <BadgePill tone="blue">
              <ShieldCheckIcon aria-hidden="true" className="h-3.5 w-3.5" />
              Verified
            </BadgePill>
          ) : (
            <BadgePill tone="neutral">{item.category}</BadgePill>
          )}
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-[18px] text-[#0066cc]">
            <span aria-hidden="true">♡</span>
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <p className="truncate text-[12px] font-semibold text-[#667085]">{item.supplierName}</p>
          {item.isVerifiedSupplier ? (
            <span className="shrink-0 rounded-full bg-[#edf5ff] px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-[#0066cc]">
              Premium
            </span>
          ) : null}
        </div>
        <h3 className="mt-2 line-clamp-2 min-h-[42px] text-[19px] font-semibold leading-[1.15] tracking-[-0.02em] text-[#1d1d1f]">
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-2 min-h-[42px] text-[13px] leading-6 text-[#667085]">{item.description}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f8fc] px-2.5 py-1.5 text-[11px] font-semibold text-[#667085]">
            <ShieldCheckIcon aria-hidden="true" className="h-3.5 w-3.5 text-[#0066cc]" />
            RFQ ready
          </span>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#edf5ff] text-[#0066cc] transition group-hover:bg-[#0066cc] group-hover:text-white">
            <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
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
    <div className="grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 lg:grid-cols-4 xl:gap-5">
      {products.map((item, index) => (
        <ProductCard item={item} key={item.id} priority={index < priorityCount} />
      ))}
    </div>
  );
}

function PremiumCatalog({ products }: Readonly<{ products: MarketplaceHomeProduct[] }>) {
  return (
    <section className="bg-white py-12 sm:py-16">
      <PublicContainer>
        <SectionHeader
          action={{ href: "/commercial", label: "Open commercial catalog" }}
          eyebrow="Supplier catalog"
          subtitle="A marketplace-style product grid with clear supplier identity, approval signals, and image-led browsing."
          title="Premium supplier showroom"
        />
        <ProductGrid priorityCount={4} products={products.slice(0, 8)} />
      </PublicContainer>
    </section>
  );
}

function RequestRow({ item }: Readonly<{ item: MarketplaceHomeRequest }>) {
  return (
    <article className="grid grid-cols-[58px_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border border-[#e1eaf5] bg-white p-3">
      <div className="relative aspect-square overflow-hidden rounded-[14px] bg-[#f4f7fb]">
        {item.imageUrl ? <Image alt={item.imageAlt ?? item.title} className="object-cover" fill sizes="58px" src={item.imageUrl} /> : null}
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-[15px] font-semibold text-[#1d1d1f]">{item.title}</h3>
        <p className="mt-1 truncate text-[13px] text-[#667085]">{item.spec}</p>
        <p className="mt-1 text-[11px] font-black uppercase tracking-[0.04em] text-[#8a93a3]">{item.quantity}</p>
      </div>
      <span className="rounded-full bg-[#edf5ff] px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-[#0066cc]">
        {item.badge}
      </span>
    </article>
  );
}

function EventRow({ item }: Readonly<{ item: MarketplaceHomeEvent }>) {
  return (
    <Link className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 rounded-[18px] border border-[#e1eaf5] bg-white p-3 transition hover:border-[#8fc1ff]" href="/events">
      <div className="relative aspect-square overflow-hidden rounded-[14px] bg-[#f4f7fb]">
        <Image alt={item.imageAlt} className="object-cover" fill sizes="72px" src={item.imageUrl} />
      </div>
      <div className="min-w-0 py-0.5">
        <time className="text-[12px] font-black uppercase tracking-[0.04em] text-[#0066cc]">{item.dateLabel}</time>
        <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-[1.18] text-[#1d1d1f]">{item.title}</h3>
        <p className="mt-1 truncate text-[13px] text-[#667085]">{item.locationLabel}</p>
      </div>
    </Link>
  );
}

function BuyerProof({ item }: Readonly<{ item: MarketplaceHomeBuyer }>) {
  return (
    <article className="grid grid-cols-[42px_minmax(0,1fr)_20px] items-center gap-3 rounded-[18px] border border-[#e1eaf5] bg-white p-3">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f5f8fc] text-[14px] font-black text-[#0066cc]">
        {item.avatarLabel}
      </span>
      <div className="min-w-0">
        <h3 className="truncate text-[14px] font-semibold text-[#1d1d1f]">{item.companyName}</h3>
        <p className="truncate text-[12px] text-[#667085]">{item.role}</p>
        <p className="text-[11px] font-bold text-[#8a93a3]">{item.country}</p>
      </div>
      <ShieldCheckIcon aria-hidden="true" className="h-5 w-5 text-[#0066cc]" />
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
    <section className="bg-[#f5f8fc] py-12 sm:py-16">
      <PublicContainer>
        <SectionHeader
          eyebrow="Marketplace signals"
          subtitle="Buyer demand, trade programs, and masked buyer proof use the same compact list hierarchy as catalog pages."
          title="Demand and programs"
        />
        <div className="grid gap-5 lg:grid-cols-3">
          <article className="rounded-[26px] border border-[#d7e4f5] bg-[#fbfdff] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <Eyebrow>Buyer requests</Eyebrow>
              <BadgePill tone="neutral">RFQ</BadgePill>
            </div>
            <div className="grid gap-3">
              {requests.slice(0, 3).map((item) => <RequestRow item={item} key={item.id} />)}
            </div>
            <p className="mt-4 rounded-2xl bg-[#edf5ff] p-3 text-[13px] font-semibold leading-6 text-[#596170]">
              Buyer identity and contact details stay protected on public surfaces.
            </p>
          </article>

          <article className="rounded-[26px] border border-[#d7e4f5] bg-[#fbfdff] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <Eyebrow>Trade programs</Eyebrow>
              <BadgePill tone="neutral">Events</BadgePill>
            </div>
            <div className="grid gap-3">
              {events.slice(0, 3).map((item) => <EventRow item={item} key={item.id} />)}
            </div>
          </article>

          <article className="rounded-[26px] border border-[#d7e4f5] bg-[#fbfdff] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <Eyebrow>Verified demand</Eyebrow>
              <BadgePill tone="neutral">Masked</BadgePill>
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
    <Link className="group overflow-hidden rounded-[22px] border border-[#dbe6f2] bg-white transition hover:-translate-y-0.5 hover:border-[#8fc1ff]" href={item.href}>
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f0f4f8]">
        <Image alt={item.imageAlt} className="object-cover transition duration-700 group-hover:scale-[1.035]" fill sizes="(max-width: 640px) 92vw, 360px" src={item.imageUrl} />
      </div>
      <div className="p-4">
        <span className="rounded-full bg-[#edf5ff] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#0066cc]">{item.category}</span>
        <h3 className="mt-3 line-clamp-2 min-h-[44px] text-[19px] font-semibold leading-[1.16] tracking-[-0.02em] text-[#1d1d1f]">{item.title}</h3>
        <p className="mt-2 truncate text-[13px] font-semibold text-[#667085]">{item.companyName}</p>
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
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[28px] border border-[#d7e4f5] bg-white p-5 sm:p-6">
            <SectionHeader
              action={{ href: "/networking", isEnabled: false, label: "View showcase" }}
              eyebrow="Innovation showcase"
              subtitle="Approved product stories, concepts, and team-led market stories presented as commerce-ready cards."
              title="Product stories for global buyers"
            />
            <div className="grid gap-4 sm:grid-cols-3">
              {showcases.slice(0, 3).map((item) => <ShowcaseCard item={item} key={item.id} />)}
            </div>
          </article>

          <article className="flex min-h-[360px] flex-col justify-between overflow-hidden rounded-[28px] bg-[#111827] p-6 text-white sm:p-7">
            <div>
              <BadgePill tone="blue">Premium exposure</BadgePill>
              <h2 className="mt-6 text-[32px] font-semibold leading-[1.05] tracking-[-0.04em] sm:text-[42px]">
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
                  <Icon aria-hidden="true" className="h-5 w-5 text-[#8fc1ff]" />
                  <p className="mt-3 text-[12px] font-semibold leading-4 text-white/82">{label as string}</p>
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
    <section className="bg-[#f5f8fc] py-12 sm:py-16">
      <PublicContainer>
        <SectionHeader
          action={{ href: "/commercial", label: "Browse catalog" }}
          eyebrow="New arrivals"
          subtitle="Recently added supplier products use the same compact card system as the premium showroom."
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
          <article className="rounded-[28px] border border-[#d7e4f5] bg-white p-5 sm:p-6">
            <SectionHeader eyebrow="Announcements" title="Marketplace updates" />
            <div className="grid gap-3">
              {announcements.slice(0, 3).map((item) => (
                <Link className="grid grid-cols-[70px_minmax(0,1fr)] gap-3 rounded-[18px] border border-[#e1eaf5] bg-[#fbfdff] p-3 transition hover:border-[#8fc1ff]" href={item.href} key={item.id}>
                  <time className="grid min-h-[62px] place-items-center rounded-[15px] bg-[#edf5ff] text-center text-[11px] font-black text-[#0066cc]">{item.dateLabel}</time>
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-[0.08em] text-[#0066cc]">{item.statusLabel}</span>
                    <h3 className="mt-1 line-clamp-1 text-[16px] font-semibold text-[#1d1d1f]">{item.title}</h3>
                    <p className="mt-1 line-clamp-2 text-[13px] leading-6 text-[#667085]">{item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </article>

          <article className="rounded-[28px] border border-[#d7e4f5] bg-white p-5 sm:p-6">
            <SectionHeader eyebrow="FAQ" title="Common sourcing questions" />
            <div className="grid gap-3">
              {faqs.slice(0, 4).map((item) => (
                <details className="group rounded-[18px] border border-[#e1eaf5] bg-[#fbfdff] px-4 py-4" key={item.id}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold text-[#1d1d1f] [&::-webkit-details-marker]:hidden">
                    <span>{item.question}</span>
                    <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#edf5ff] text-[#0066cc] transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-[14px] leading-7 text-[#667085]">{item.answer}</p>
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
    <footer className="border-t border-[#e4edf7] bg-[#f5f8fc] text-[#1d1d1f]">
      <PublicContainer className="py-10 sm:py-12">
        <div className="grid gap-8 border-b border-[#d7e4f5] pb-8 lg:grid-cols-[1fr_2fr_0.95fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#0066cc] text-[12px] font-black text-white">B2</span>
              <span className="text-[26px] font-black tracking-[-0.06em]">B2B2G</span>
            </div>
            <p className="mt-4 max-w-sm text-[13px] leading-7 text-[#667085]">
              A controlled B2B commerce platform for verified supplier products, protected buyer demand, trade programs, and marketplace services.
            </p>
          </div>
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {groups.map(([title, ...items]) => (
              <nav aria-label={title} key={title}>
                <h3 className="text-[13px] font-semibold text-[#1d1d1f]">{title}</h3>
                <div className="mt-4 grid gap-2.5">
                  {items.map((item) => (
                    <button className="w-fit text-left text-[13px] text-[#667085] transition hover:text-[#0066cc]" disabled key={item} type="button">
                      {item}
                    </button>
                  ))}
                </div>
              </nav>
            ))}
          </div>
          <div className="rounded-[22px] border border-[#d7e4f5] bg-white p-5">
            <h3 className="text-[15px] font-semibold">Trade brief</h3>
            <p className="mt-3 text-[13px] leading-6 text-[#667085]">Marketplace updates will be enabled after public subscription policy review.</p>
            <div className="mt-5 flex rounded-full border border-[#d7e4f5] bg-[#f5f8fc] p-1">
              <input className="min-w-0 flex-1 bg-transparent px-4 text-[13px] text-[#1d1d1f] outline-none" disabled placeholder="Email updates coming soon" />
              <button className="grid h-10 w-10 place-items-center rounded-full bg-[#0066cc] text-white" disabled type="button">
                <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-5 text-[12px] text-[#7a8391] md:flex-row md:items-center md:justify-between">
          <span>© 2026 B2B2G. Buyer identity data is protected by platform policy.</span>
          <span>Privacy · Terms · Security · English</span>
        </div>
      </PublicContainer>
    </footer>
  );
}

export function MarketplaceHome({ config }: Readonly<{ config: MarketplaceHomeConfig }>) {
  return (
    <main className="marketplace-home-root overflow-x-hidden bg-white text-[#1d1d1f]">
      <HomeIntro products={config.premiumProducts} />
      <CategoryIndex />
      <PremiumCatalog products={config.premiumProducts} />
      <MarketActivity buyers={config.verifiedBuyers} events={config.events} requests={config.buyerRequests} />
      <ShowcaseAndAds banners={config.adBanners} showcases={config.showcases} />
      <LatestProducts products={config.latestProducts} />
      <UpdatesAndFaq announcements={config.announcements} faqs={config.faqs} />
      <MarketplaceFooter />
    </main>
  );
}
