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
  return (
    <div className={`mx-auto box-border w-full min-w-0 max-w-[1440px] px-4 sm:px-6 lg:px-10 ${className}`}>
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
        <h2 className="mt-2 text-[25px] font-semibold leading-[1.08] tracking-[-0.035em] text-[#1d1d1f] sm:text-[36px]">
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

function HomeIntro({
  products,
}: Readonly<{
  products: MarketplaceHomeProduct[];
}>) {
  const spotlight = products[0];
  const topProducts = products.slice(1, 4);

  return (
    <section className="bg-[#f5f8fc] py-5 sm:py-9">
      <PublicContainer>
        <div className="grid min-w-0 gap-4 lg:grid-cols-[0.68fr_1.32fr] lg:items-stretch">
          <div className="flex min-w-0 flex-col justify-between rounded-[24px] border border-[#d7e4f5] bg-white p-5 shadow-[0_22px_70px_rgba(15,23,42,0.055)] sm:rounded-[28px] sm:p-7 lg:min-h-[410px]">
            <div>
              <BadgePill tone="blue">Global B2B Marketplace</BadgePill>
              <h1 className="mt-4 max-w-[330px] text-[32px] font-semibold leading-[1.02] tracking-[-0.055em] text-[#101828] sm:mt-5 sm:max-w-full sm:text-[56px] lg:text-[62px]">
                Source verified products with confidence.
              </h1>
              <p className="mt-3 line-clamp-3 max-w-[330px] text-[14px] leading-6 text-[#667085] sm:mt-4 sm:max-w-xl sm:text-[17px] sm:leading-7">
                Browse approved supplier products, protected demand signals, and trade programs in one controlled B2B commerce home.
              </p>
            </div>
            <div className="mt-5 grid gap-2 sm:mt-7 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {["Verified suppliers", "Private buyer demand", "Admin-reviewed exposure"].map((item) => (
                <span className="min-w-0 rounded-[14px] border border-[#d7e4f5] bg-[#f5f8fc] px-3 py-2.5 text-[12px] font-semibold text-[#344054] sm:rounded-[18px] sm:px-4 sm:py-3 sm:text-[13px]" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid min-w-0 gap-4">
            {spotlight ? (
              <Link className="group grid min-w-0 overflow-hidden rounded-[24px] border border-[#d7e4f5] bg-white shadow-[0_22px_70px_rgba(15,23,42,0.055)] transition hover:-translate-y-0.5 hover:border-[#8fc1ff] sm:rounded-[28px] md:grid-cols-[0.95fr_1.05fr]" href={spotlight.href}>
                <div className="relative aspect-[16/10] min-h-[180px] overflow-hidden bg-[#eef4fb] sm:min-h-[220px] md:aspect-auto md:min-h-full">
                  <Image
                    alt={spotlight.imageAlt}
                    className="object-cover transition duration-700 group-hover:scale-[1.035]"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 520px"
                    src={spotlight.imageUrl}
                  />
                  <div className="absolute left-4 top-4">
                    <BadgePill tone="blue">
                      <ShieldCheckIcon aria-hidden="true" className="h-3.5 w-3.5" />
                      Featured
                    </BadgePill>
                  </div>
                </div>
                <div className="flex min-w-0 max-w-full flex-col justify-between p-5 sm:p-7">
                  <div>
                    <Eyebrow>Featured product</Eyebrow>
                    <h2 className="mt-3 line-clamp-2 text-[27px] font-semibold leading-[1.06] tracking-[-0.04em] text-[#1d1d1f] sm:text-[44px]">
                      {spotlight.title}
                    </h2>
                    <p className="mt-3 text-[15px] font-semibold text-[#515966]">{spotlight.supplierName}</p>
                    <p className="mt-4 line-clamp-2 text-[15px] leading-7 text-[#667085]">{spotlight.description}</p>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-[#e6edf6] pt-5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf5ff] px-3 py-2 text-[12px] font-semibold text-[#0066cc]">
                      <ShieldCheckIcon aria-hidden="true" className="h-3.5 w-3.5" />
                      Inquiry reviewed
                    </span>
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-[#0066cc] text-white transition group-hover:translate-x-1">
                      <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ) : null}

            <div className="grid gap-3 md:grid-cols-3">
              {topProducts.map((item) => (
                <Link className="group grid grid-cols-[76px_minmax(0,1fr)] gap-3 rounded-[20px] border border-[#d7e4f5] bg-white p-3 shadow-[0_16px_44px_rgba(15,23,42,0.045)] transition hover:border-[#8fc1ff] sm:grid-cols-[92px_minmax(0,1fr)]" href={item.href} key={item.id}>
                  <div className="relative aspect-square overflow-hidden rounded-[15px] bg-[#eef4fb] sm:rounded-[16px]">
                    <Image alt={item.imageAlt} className="object-cover transition duration-500 group-hover:scale-[1.04]" fill sizes="92px" src={item.imageUrl} />
                  </div>
                  <div className="min-w-0 py-1">
                    <p className="truncate text-[11px] font-semibold text-[#667085]">{item.supplierName}</p>
                    <h2 className="mt-1 line-clamp-2 text-[17px] font-semibold leading-[1.14] tracking-[-0.02em] text-[#1d1d1f]">{item.title}</h2>
                    <span className="mt-3 inline-flex rounded-full bg-[#edf5ff] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.06em] text-[#0066cc]">
                      {item.isVerifiedSupplier ? "Verified" : item.category}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </PublicContainer>
    </section>
  );
}

function CommerceQuickNav() {
  const items = [
    ["Commercial", "Consumer goods", "/commercial"],
    ["Industrial", "Machinery", "/industrial"],
    ["EPC", "Projects", "/epc"],
    ["BUY & SELL", "RFQ board", "/buy-sell"],
    ["Event", "Programs", "/events"],
    ["Service", "FDA support", "/service"],
  ] as const;

  return (
    <section className="border-y border-[#e6edf6] bg-white">
      <PublicContainer className="py-3">
        <nav aria-label="Marketplace discovery shortcuts" className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map(([label, meta, href]) => (
            <Link className="group flex min-w-[154px] items-center justify-between rounded-[16px] border border-[#d7e4f5] bg-[#fbfdff] px-4 py-3 text-left transition hover:border-[#8fc1ff] hover:bg-[#f5faff]" href={href} key={label}>
              <span>
                <span className="block text-[14px] font-semibold text-[#1d1d1f]">{label}</span>
                <span className="mt-1 block text-[11px] font-semibold text-[#8a93a3]">{meta}</span>
              </span>
              <ArrowRightIcon aria-hidden="true" className="h-3.5 w-3.5 text-[#0066cc] opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
            </Link>
          ))}
        </nav>
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
      className="group flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-[#dbe6f2] bg-white transition duration-300 hover:-translate-y-0.5 hover:border-[#8fc1ff] hover:shadow-[0_22px_60px_rgba(15,23,42,0.08)]"
      href={item.href}
    >
      <div className="relative aspect-square overflow-hidden bg-[#f0f4f8]">
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
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-[18px] text-[#0066cc] shadow-[0_10px_22px_rgba(15,23,42,0.12)]">
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
        <p className="mt-2 line-clamp-2 min-h-[40px] text-[13px] leading-5 text-[#667085]">{item.description}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f8fc] px-2.5 py-1.5 text-[11px] font-semibold text-[#667085]">
            <ShieldCheckIcon aria-hidden="true" className="h-3.5 w-3.5 text-[#0066cc]" />
            Reviewed
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf5ff] px-2.5 py-1.5 text-[11px] font-bold text-[#0066cc] transition group-hover:bg-[#0066cc] group-hover:text-white">
            Details
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
    <section className="bg-white py-10 sm:py-14">
      <PublicContainer>
        <SectionHeader
          action={{ href: "/commercial", label: "Open commercial catalog" }}
          eyebrow="Supplier catalog"
          subtitle="Curated supplier products with clear images, verification marks, and protected inquiry routing."
          title="Verified supplier products"
        />
        <ProductGrid priorityCount={4} products={products.slice(0, 8)} />
      </PublicContainer>
    </section>
  );
}

function RequestRow({ item }: Readonly<{ item: MarketplaceHomeRequest }>) {
  return (
    <article className="group grid grid-cols-[50px_minmax(0,1fr)_auto] items-center gap-3 rounded-[16px] border border-[#e5edf7] bg-white px-3 py-2.5 transition hover:border-[#8fc1ff] hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
      <div className="relative aspect-square overflow-hidden rounded-[13px] bg-[#f4f7fb]">
        {item.imageUrl ? <Image alt={item.imageAlt ?? item.title} className="object-cover transition duration-500 group-hover:scale-[1.04]" fill sizes="50px" src={item.imageUrl} /> : null}
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-[14px] font-semibold text-[#1d1d1f]">{item.title}</h3>
        <p className="mt-0.5 truncate text-[12px] text-[#667085]">{item.spec}</p>
        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#8a93a3]">{item.quantity}</p>
      </div>
      <span className="rounded-full bg-[#edf5ff] px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-[#0066cc] ring-1 ring-[#dbeafe]">
        {item.badge}
      </span>
    </article>
  );
}

function EventRow({ item }: Readonly<{ item: MarketplaceHomeEvent }>) {
  return (
    <Link className="group grid grid-cols-[60px_minmax(0,1fr)_auto] items-center gap-3 rounded-[16px] border border-[#e5edf7] bg-white px-3 py-2.5 transition hover:border-[#8fc1ff] hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)]" href="/events">
      <div className="relative aspect-square overflow-hidden rounded-[13px] bg-[#f4f7fb]">
        <Image alt={item.imageAlt} className="object-cover transition duration-500 group-hover:scale-[1.04]" fill sizes="60px" src={item.imageUrl} />
      </div>
      <div className="min-w-0">
        <time className="text-[11px] font-black uppercase tracking-[0.08em] text-[#0066cc]">{item.dateLabel}</time>
        <h3 className="mt-0.5 line-clamp-1 text-[14px] font-semibold leading-[1.2] text-[#1d1d1f]">{item.title}</h3>
        <p className="mt-0.5 truncate text-[12px] text-[#667085]">{item.locationLabel}</p>
      </div>
      <span className="grid h-8 w-8 place-items-center rounded-full bg-[#edf5ff] text-[#0066cc] transition group-hover:bg-[#0066cc] group-hover:text-white">
        <ArrowRightIcon aria-hidden="true" className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

function BuyerProof({ item }: Readonly<{ item: MarketplaceHomeBuyer }>) {
  return (
    <article className="grid grid-cols-[38px_minmax(0,1fr)_18px] items-center gap-3 rounded-[16px] border border-[#e5edf7] bg-white px-3 py-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-[#edf5ff] text-[13px] font-black text-[#0066cc] ring-1 ring-[#dbeafe]">
        {item.avatarLabel}
      </span>
      <div className="min-w-0">
        <h3 className="truncate text-[13px] font-semibold text-[#1d1d1f]">{item.companyName}</h3>
        <p className="truncate text-[11px] text-[#667085]">{item.role}</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8a93a3]">{item.country}</p>
      </div>
      <ShieldCheckIcon aria-hidden="true" className="h-4 w-4 text-[#0066cc]" />
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
    <section className="bg-[#f5f8fc] py-10 sm:py-14">
      <PublicContainer>
        <div className="mb-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <Eyebrow>Trade signals</Eyebrow>
            <h2 className="mt-2 text-[30px] font-semibold leading-[1.05] tracking-[-0.04em] text-[#1d1d1f] sm:text-[42px]">
              Demand, programs, and verified buyers
            </h2>
            <p className="mt-3 max-w-2xl text-[14px] leading-6 text-[#667085] sm:text-[15px]">
              Active sourcing signals are shown without exposing buyer contact data or private identity fields.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-[20px] border border-[#d7e4f5] bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
            {[
              ["3", "RFQs"],
              ["3", "Programs"],
              ["4", "Buyers"],
            ].map(([value, label]) => (
              <div className="min-w-[78px] rounded-[15px] bg-[#f5f8fc] px-3 py-2 text-center" key={label}>
                <p className="text-[18px] font-semibold leading-none text-[#0066cc]">{value}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#667085]">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr_0.85fr]">
          <article className="rounded-[24px] border border-[#d7e4f5] bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <Eyebrow>Buyer requests</Eyebrow>
                <h3 className="mt-1 text-[20px] font-semibold tracking-[-0.025em] text-[#1d1d1f]">Buyer product requests</h3>
              </div>
              <BadgePill tone="neutral">Private</BadgePill>
            </div>
            <div className="grid gap-3">
              {requests.slice(0, 3).map((item) => <RequestRow item={item} key={item.id} />)}
            </div>
            <p className="mt-3 rounded-[16px] bg-[#edf5ff] px-3 py-2.5 text-[12px] font-semibold leading-5 text-[#596170]">
              Buyer identity stays masked on public marketplace surfaces.
            </p>
          </article>

          <article className="rounded-[24px] border border-[#d7e4f5] bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <Eyebrow>Trade programs</Eyebrow>
                <h3 className="mt-1 text-[20px] font-semibold tracking-[-0.025em] text-[#1d1d1f]">Event schedule</h3>
              </div>
              <BadgePill tone="neutral">Events</BadgePill>
            </div>
            <div className="grid gap-3">
              {events.slice(0, 3).map((item) => <EventRow item={item} key={item.id} />)}
            </div>
          </article>

          <article className="rounded-[24px] border border-[#d7e4f5] bg-[#111827] p-4 text-white shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8fc1ff]">Verified demand</p>
                <h3 className="mt-1 text-[20px] font-semibold tracking-[-0.025em] text-white">Masked buyer network</h3>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-white">Masked</span>
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
    <section className="bg-[#f5f8fc] py-10 sm:py-14">
      <PublicContainer>
        <SectionHeader
          action={{ href: "/commercial", label: "Browse catalog" }}
          eyebrow="New arrivals"
          subtitle="Recently added approved products, presented for quick image-led browsing."
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
    <section className="bg-white py-8 sm:py-12">
      <PublicContainer>
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow>Operations desk</Eyebrow>
            <h2 className="mt-2 text-[28px] font-semibold leading-[1.05] tracking-[-0.04em] text-[#1d1d1f] sm:text-[40px]">
              Marketplace updates
            </h2>
          </div>
          <p className="max-w-xl text-[14px] leading-6 text-[#667085]">
            Marketplace notices and common sourcing questions, arranged for quick scanning before signup.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-[24px] border border-[#d7e4f5] bg-[#fbfdff] p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <Eyebrow>Announcements</Eyebrow>
                <h3 className="mt-1 text-[20px] font-semibold tracking-[-0.025em] text-[#1d1d1f]">Marketplace updates</h3>
              </div>
              <BadgePill tone="neutral">Latest</BadgePill>
            </div>
            <div className="grid gap-2.5">
              {announcements.slice(0, 3).map((item) => (
                <Link className="group grid grid-cols-[58px_minmax(0,1fr)_auto] items-center gap-3 rounded-[16px] border border-[#e5edf7] bg-white px-3 py-2.5 transition hover:border-[#8fc1ff] hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)]" href={item.href} key={item.id}>
                  <time className="grid min-h-[54px] place-items-center rounded-[14px] bg-[#edf5ff] text-center text-[10px] font-black uppercase leading-4 text-[#0066cc]">{item.dateLabel}</time>
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-[0.08em] text-[#0066cc]">{item.statusLabel}</span>
                    <h4 className="mt-0.5 line-clamp-1 text-[15px] font-semibold text-[#1d1d1f]">{item.title}</h4>
                    <p className="mt-0.5 line-clamp-1 text-[12px] leading-5 text-[#667085]">{item.description}</p>
                  </div>
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#edf5ff] text-[#0066cc] transition group-hover:bg-[#0066cc] group-hover:text-white">
                    <ArrowRightIcon aria-hidden="true" className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </article>

          <article className="rounded-[24px] border border-[#d7e4f5] bg-[#fbfdff] p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <Eyebrow>FAQ</Eyebrow>
                <h3 className="mt-1 text-[20px] font-semibold tracking-[-0.025em] text-[#1d1d1f]">Sourcing questions</h3>
              </div>
              <BadgePill tone="neutral">Help</BadgePill>
            </div>
            <div className="grid gap-2.5">
              {faqs.slice(0, 4).map((item) => (
                <details className="group rounded-[16px] border border-[#e5edf7] bg-white px-4 py-3.5 transition open:border-[#8fc1ff]" key={item.id}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-[#1d1d1f] [&::-webkit-details-marker]:hidden">
                    <span>{item.question}</span>
                    <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#edf5ff] text-[18px] leading-none text-[#0066cc] transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 border-t border-[#e6edf6] pt-3 text-[13px] leading-6 text-[#667085]">{item.answer}</p>
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
    <footer className="border-t border-[#e4edf7] bg-[#f7faff] text-[#1d1d1f]">
      <PublicContainer className="py-8 sm:py-10">
        <div className="grid gap-7 border-b border-[#d7e4f5] pb-7 lg:grid-cols-[1fr_2fr_0.95fr]">
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
      <CommerceQuickNav />
      <PremiumCatalog products={config.premiumProducts} />
      <MarketActivity buyers={config.verifiedBuyers} events={config.events} requests={config.buyerRequests} />
      <ShowcaseAndAds banners={config.adBanners} showcases={config.showcases} />
      <LatestProducts products={config.latestProducts} />
      <UpdatesAndFaq announcements={config.announcements} faqs={config.faqs} />
      <MarketplaceFooter />
    </main>
  );
}
