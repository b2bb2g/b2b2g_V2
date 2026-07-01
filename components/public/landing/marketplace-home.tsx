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
  href: string;
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
  href: string;
  id: string;
  imageAlt: string;
  imageUrl: string;
  locationLabel: string;
  title: string;
};

export type MarketplaceHomeChannel = {
  ctaLabel: string;
  description: string;
  href: string;
  id: string;
  items: {
    href: string;
    id: string;
    imageAlt: string;
    imageUrl: string;
    meta: string;
    summary: string;
    title: string;
  }[];
  statusLabel: string;
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
  channels: MarketplaceHomeChannel[];
  events: MarketplaceHomeEvent[];
  faqs: MarketplaceHomeFaq[];
  latestProducts: MarketplaceHomeProduct[];
  premiumProducts: MarketplaceHomeProduct[];
  showcases: MarketplaceHomeShowcase[];
  verifiedBuyers: MarketplaceHomeBuyer[];
};

const menuStats = [
  "Approved supplier catalog",
  "Masked RFQ demand",
  "Trade programs",
  "Market services",
];

function PublicContainer({
  children,
  className = "",
}: Readonly<{
  children: ReactNode;
  className?: string;
}>) {
  return (
    <div className={`mx-auto box-border w-full max-w-[1480px] px-4 sm:px-6 lg:px-10 ${className}`}>
      {children}
    </div>
  );
}

function Eyebrow({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">
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
    <div className="mb-5 flex flex-col gap-4 sm:mb-7 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-2 text-[28px] font-semibold leading-[1.02] tracking-[-0.05em] text-[#101828] sm:text-[42px]">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#667085]">{subtitle}</p>
        ) : null}
      </div>
      {action ? <HeaderAction action={action} /> : null}
    </div>
  );
}

function HeaderAction({ action }: Readonly<{ action: CtaLink }>) {
  const className =
    "inline-flex min-h-10 w-fit items-center gap-2 rounded-full border border-[#d7e4f5] bg-white px-4 text-[13px] font-semibold text-[#0b63ce] transition hover:border-[#8fc1ff] hover:bg-[#f6faff]";

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

function StatusPill({
  children,
  tone = "blue",
}: Readonly<{
  children: ReactNode;
  tone?: "blue" | "dark" | "soft";
}>) {
  const toneClass = {
    blue: "bg-[#0b74ff] text-white shadow-[0_10px_24px_rgba(11,116,255,0.22)]",
    dark: "bg-[#101828] text-white",
    soft: "bg-[#edf5ff] text-[#0b63ce] ring-1 ring-[#dbeafe]",
  }[tone];

  return (
    <span className={`inline-flex min-h-7 items-center gap-1.5 rounded-full px-3 text-[10px] font-black uppercase tracking-[0.1em] ${toneClass}`}>
      {children}
    </span>
  );
}

function ProductCard({
  className = "",
  item,
  priority = false,
}: Readonly<{
  className?: string;
  item: MarketplaceHomeProduct;
  priority?: boolean;
}>) {
  return (
    <Link
      className={`group grid min-w-0 overflow-hidden rounded-[24px] border border-[#dbe6f2] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.055)] transition duration-300 hover:-translate-y-1 hover:border-[#93c5fd] hover:shadow-[0_28px_80px_rgba(15,23,42,0.12)] ${className}`}
      href={item.href}
    >
      <div className="relative aspect-[5/4] overflow-hidden bg-[#eef4fb]">
        <Image
          alt={item.imageAlt}
          className="object-cover transition duration-700 group-hover:scale-[1.045]"
          fill
          loading={priority ? undefined : "lazy"}
          priority={priority}
          sizes="(max-width: 640px) 88vw, (max-width: 1024px) 44vw, 330px"
          src={item.imageUrl}
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#07111f]/45 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {item.isVerifiedSupplier ? (
            <StatusPill tone="blue">
              <ShieldCheckIcon aria-hidden="true" className="h-3.5 w-3.5" />
              Verified
            </StatusPill>
          ) : null}
          <StatusPill tone="dark">{item.category}</StatusPill>
        </div>
        <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-[18px] text-[#0b63ce] shadow-[0_12px_26px_rgba(15,23,42,0.14)]">
          <span aria-hidden="true">♡</span>
        </span>
      </div>
      <div className="grid min-h-[186px] grid-rows-[auto_auto_1fr_auto] p-4">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <p className="truncate text-[12px] font-bold text-[#667085]">{item.supplierName}</p>
          {item.isVerifiedSupplier ? (
            <span className="rounded-full bg-[#edf5ff] px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-[#0b63ce]">
              Premium
            </span>
          ) : null}
        </div>
        <h3 className="mt-2 line-clamp-2 text-[20px] font-semibold leading-[1.08] tracking-[-0.025em] text-[#101828]">
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-[#667085]">{item.description}</p>
        <div className="mt-4 flex items-center justify-between border-t border-[#e9f0f8] pt-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#667085]">
            <ShieldCheckIcon aria-hidden="true" className="h-3.5 w-3.5 text-[#0b63ce]" />
            RFQ ready
          </span>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#0b74ff] text-white transition group-hover:scale-105">
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

function CommerceHero({ products }: Readonly<{ products: MarketplaceHomeProduct[] }>) {
  const [lead, ...secondary] = products;

  return (
    <section className="bg-[linear-gradient(180deg,#f5f9ff_0%,#ffffff_100%)] py-8 sm:py-12 lg:py-16">
      <PublicContainer>
        <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch">
          <article className="flex min-h-[340px] flex-col justify-between overflow-hidden rounded-[28px] border border-[#d7e4f5] bg-[#07111f] p-5 text-white shadow-[0_34px_90px_rgba(15,23,42,0.16)] sm:min-h-[430px] sm:rounded-[34px] sm:p-8 lg:min-h-[540px]">
            <div>
              <StatusPill tone="blue">Global B2B commerce</StatusPill>
              <h1 className="mt-5 max-w-xl text-[37px] font-semibold leading-[0.96] tracking-[-0.065em] sm:mt-6 sm:text-[68px] lg:text-[78px]">
                Verified products for serious global sourcing.
              </h1>
              <p className="mt-4 max-w-lg text-[14px] leading-6 text-white/68 sm:mt-5 sm:text-[18px] sm:leading-7">
                Browse approved supplier listings, protected buyer demand, trade programs, and export services from one controlled marketplace home.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-8">
              {menuStats.map((item) => (
                <span className="rounded-[16px] border border-white/10 bg-white/[0.07] px-3 py-2.5 text-[11px] font-semibold leading-4 text-white/82 sm:rounded-[18px] sm:px-4 sm:py-3 sm:text-[13px]" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </article>

          <div className="grid gap-4 lg:grid-rows-[0.95fr_1fr]">
            {lead ? (
              <Link
                className="group grid overflow-hidden rounded-[30px] border border-[#d7e4f5] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.09)] transition hover:-translate-y-1 hover:border-[#93c5fd] md:grid-cols-[0.95fr_1fr]"
                href={lead.href}
              >
                <div className="relative min-h-[260px] overflow-hidden bg-[#eef4fb] md:min-h-full">
                  <Image
                    alt={lead.imageAlt}
                    className="object-cover transition duration-700 group-hover:scale-[1.035]"
                    fill
                    priority
                    sizes="(max-width: 768px) 92vw, 520px"
                    src={lead.imageUrl}
                  />
                  <span className="absolute left-4 top-4">
                    <StatusPill tone="blue">Featured supplier product</StatusPill>
                  </span>
                </div>
                <div className="flex flex-col justify-between p-6 sm:p-7">
                  <div>
                    <p className="text-[12px] font-black uppercase tracking-[0.14em] text-[#0b63ce]">{lead.category}</p>
                    <h2 className="mt-3 text-[36px] font-semibold leading-[1.02] tracking-[-0.05em] text-[#101828] sm:text-[46px]">
                      {lead.title}
                    </h2>
                    <p className="mt-3 text-[15px] font-semibold text-[#475467]">{lead.supplierName}</p>
                    <p className="mt-4 max-w-md text-[15px] leading-7 text-[#667085]">{lead.description}</p>
                  </div>
                  <div className="mt-7 flex items-center justify-between border-t border-[#e9f0f8] pt-4">
                    <span className="text-[13px] font-semibold text-[#667085]">Open product detail</span>
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-[#0b74ff] text-white transition group-hover:scale-105">
                      <ArrowRightIcon aria-hidden="true" className="h-5 w-5" />
                    </span>
                  </div>
                </div>
              </Link>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-3">
              {secondary.slice(0, 3).map((item, index) => (
                <ProductCard item={item} key={item.id} priority={index === 0} />
              ))}
            </div>
          </div>
        </div>
      </PublicContainer>
    </section>
  );
}

function ChannelCard({ channel }: Readonly<{ channel: MarketplaceHomeChannel }>) {
  const [featuredItem] = channel.items;

  return (
    <Link
      className="group flex min-w-[250px] snap-start flex-col justify-between rounded-[24px] border border-[#dbe6f2] bg-white p-5 shadow-[0_18px_46px_rgba(15,23,42,0.045)] transition hover:-translate-y-1 hover:border-[#93c5fd] hover:shadow-[0_26px_70px_rgba(15,23,42,0.09)] sm:min-w-0"
      href={channel.href}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <StatusPill tone="soft">{channel.statusLabel}</StatusPill>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f5f9ff] text-[#0b63ce] ring-1 ring-[#dbeafe] transition group-hover:bg-[#0b74ff] group-hover:text-white">
            <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
          </span>
        </div>
        <h3 className="mt-5 text-[25px] font-semibold leading-[1.02] tracking-[-0.045em] text-[#101828]">
          {channel.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-[14px] leading-6 text-[#667085]">{channel.description}</p>
      </div>
      {featuredItem ? (
        <div className="mt-5 rounded-[18px] bg-[#f6faff] p-3">
          <p className="line-clamp-1 text-[13px] font-semibold text-[#101828]">{featuredItem.title}</p>
          <p className="mt-1 line-clamp-1 text-[11px] text-[#667085]">{featuredItem.meta}</p>
        </div>
      ) : null}
    </Link>
  );
}

function MarketplaceChannels({ channels }: Readonly<{ channels: MarketplaceHomeChannel[] }>) {
  if (channels.length === 0) return null;

  return (
    <section className="bg-white py-10 sm:py-14">
      <PublicContainer>
        <SectionHeader
          action={{ href: "/commercial", label: "Start with Commercial" }}
          eyebrow="Marketplace channels"
          subtitle="Every public menu is a commerce lane. The home page now previews the same approved items shown inside each channel."
          title="Seven storefronts, one sourcing system."
        />
        <div className="flex snap-x gap-4 overflow-x-auto pb-3 [scrollbar-width:none] md:grid md:grid-cols-2 md:overflow-visible md:pb-0 xl:grid-cols-4 [&::-webkit-scrollbar]:hidden">
          {channels.map((channel) => (
            <ChannelCard channel={channel} key={channel.id} />
          ))}
        </div>
      </PublicContainer>
    </section>
  );
}

function RequestRow({ item }: Readonly<{ item: MarketplaceHomeRequest }>) {
  return (
    <Link className="group grid grid-cols-[54px_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border border-[#e5edf7] bg-white px-3 py-3 transition hover:border-[#8fc1ff] hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)]" href={item.href}>
      <div className="relative aspect-square overflow-hidden rounded-[14px] bg-[#f4f7fb]">
        {item.imageUrl ? <Image alt={item.imageAlt ?? item.title} className="object-cover transition duration-500 group-hover:scale-[1.04]" fill sizes="54px" src={item.imageUrl} /> : null}
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-[15px] font-semibold text-[#101828]">{item.title}</h3>
        <p className="mt-0.5 truncate text-[12px] text-[#667085]">{item.spec}</p>
        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#8a93a3]">{item.quantity}</p>
      </div>
      <span className="rounded-full bg-[#edf5ff] px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-[#0b63ce] ring-1 ring-[#dbeafe]">
        {item.badge}
      </span>
    </Link>
  );
}

function EventRow({ item }: Readonly<{ item: MarketplaceHomeEvent }>) {
  return (
    <Link className="group grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border border-[#e5edf7] bg-white px-3 py-3 transition hover:border-[#8fc1ff] hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)]" href={item.href}>
      <div className="relative aspect-square overflow-hidden rounded-[15px] bg-[#f4f7fb]">
        <Image alt={item.imageAlt} className="object-cover transition duration-500 group-hover:scale-[1.04]" fill sizes="64px" src={item.imageUrl} />
      </div>
      <div className="min-w-0">
        <time className="text-[11px] font-black uppercase tracking-[0.08em] text-[#0b63ce]">{item.dateLabel}</time>
        <h3 className="mt-0.5 line-clamp-1 text-[15px] font-semibold leading-[1.2] text-[#101828]">{item.title}</h3>
        <p className="mt-0.5 truncate text-[12px] text-[#667085]">{item.locationLabel}</p>
      </div>
      <span className="grid h-8 w-8 place-items-center rounded-full bg-[#edf5ff] text-[#0b63ce] transition group-hover:bg-[#0b74ff] group-hover:text-white">
        <ArrowRightIcon aria-hidden="true" className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

function BuyerProof({ item }: Readonly<{ item: MarketplaceHomeBuyer }>) {
  return (
    <article className="grid grid-cols-[42px_minmax(0,1fr)_20px] items-center gap-3 rounded-[18px] border border-[#e5edf7] bg-white px-3 py-3">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-[#edf5ff] text-[13px] font-black text-[#0b63ce] ring-1 ring-[#dbeafe]">
        {item.avatarLabel}
      </span>
      <div className="min-w-0">
        <h3 className="truncate text-[14px] font-semibold text-[#101828]">{item.companyName}</h3>
        <p className="truncate text-[12px] text-[#667085]">{item.role}</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8a93a3]">{item.country}</p>
      </div>
      <ShieldCheckIcon aria-hidden="true" className="h-4 w-4 text-[#0b63ce]" />
    </article>
  );
}

function SignalPanel({
  children,
  label,
  title,
}: Readonly<{
  children: ReactNode;
  label: string;
  title: string;
}>) {
  return (
    <article className="rounded-[28px] border border-[#d7e4f5] bg-[#fbfdff] p-4 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <Eyebrow>{label}</Eyebrow>
          <h3 className="mt-1 text-[22px] font-semibold tracking-[-0.035em] text-[#101828]">{title}</h3>
        </div>
      </div>
      {children}
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
    <section className="bg-[#f5f9ff] py-10 sm:py-14">
      <PublicContainer>
        <SectionHeader
          eyebrow="Demand intelligence"
          subtitle="RFQs, trade programs, and buyer proof are compact, privacy-safe signals. Buyer identity and contact details are not public."
          title="What buyers need now"
        />
        <div className="grid gap-4 lg:grid-cols-3">
          <SignalPanel label="Buyer requests" title="Protected RFQ board">
            <div className="grid gap-3">
              {requests.slice(0, 3).map((item) => <RequestRow item={item} key={item.id} />)}
            </div>
            <p className="mt-3 rounded-[18px] bg-[#edf5ff] px-4 py-3 text-[12px] font-semibold leading-5 text-[#596170]">
              Buyer identity and contact details stay protected on public marketplace surfaces.
            </p>
          </SignalPanel>
          <SignalPanel label="Trade programs" title="Event schedule">
            <div className="grid gap-3">
              {events.slice(0, 3).map((item) => <EventRow item={item} key={item.id} />)}
            </div>
          </SignalPanel>
          <SignalPanel label="Verified demand" title="Masked buyer network">
            <div className="grid gap-3">
              {buyers.slice(0, 4).map((item) => <BuyerProof item={item} key={item.id} />)}
            </div>
          </SignalPanel>
        </div>
      </PublicContainer>
    </section>
  );
}

function ShowcaseCard({ item }: Readonly<{ item: MarketplaceHomeShowcase }>) {
  return (
    <Link className="group overflow-hidden rounded-[24px] border border-[#dbe6f2] bg-white shadow-[0_18px_48px_rgba(15,23,42,0.045)] transition hover:-translate-y-1 hover:border-[#93c5fd]" href={item.href}>
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f0f4f8]">
        <Image alt={item.imageAlt} className="object-cover transition duration-700 group-hover:scale-[1.04]" fill sizes="(max-width: 640px) 88vw, 360px" src={item.imageUrl} />
      </div>
      <div className="p-4">
        <span className="rounded-full bg-[#edf5ff] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#0b63ce]">{item.category}</span>
        <h3 className="mt-3 line-clamp-2 min-h-[44px] text-[20px] font-semibold leading-[1.1] tracking-[-0.03em] text-[#101828]">{item.title}</h3>
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
        <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <article className="rounded-[30px] border border-[#d7e4f5] bg-white p-5 shadow-[0_22px_70px_rgba(15,23,42,0.05)] sm:p-6">
            <SectionHeader
              action={{ href: "/networking", isEnabled: false, label: "View showcase" }}
              eyebrow="Innovation showcase"
              subtitle="Approved product stories, concepts, and market-ready projects presented without exposing private contacts."
              title="Product stories ready for buyers"
            />
            <div className="grid gap-4 sm:grid-cols-3">
              {showcases.slice(0, 3).map((item) => <ShowcaseCard item={item} key={item.id} />)}
            </div>
          </article>
          <article className="flex min-h-[360px] flex-col justify-between overflow-hidden rounded-[30px] bg-[#07111f] p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.18)] sm:p-7">
            <div>
              <StatusPill tone="blue">Premium supplier ads</StatusPill>
              <h2 className="mt-6 text-[35px] font-semibold leading-[1.02] tracking-[-0.055em] sm:text-[48px]">
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
    <section className="bg-[#f5f9ff] py-10 sm:py-14">
      <PublicContainer>
        <SectionHeader
          action={{ href: "/commercial", label: "Browse channels" }}
          eyebrow="Supplier catalog"
          subtitle="Recent approved listings from Commercial, Industrial, EPC, and BUY & SELL channels. Cards link to their channel detail pages."
          title="Latest approved marketplace products"
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
    <section className="bg-white py-10 sm:py-14">
      <PublicContainer>
        <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <article className="rounded-[28px] border border-[#d7e4f5] bg-[#fbfdff] p-5 shadow-[0_22px_70px_rgba(15,23,42,0.05)] sm:p-6">
            <SectionHeader eyebrow="Announcements" title="Marketplace updates" />
            <div className="grid gap-3">
              {announcements.slice(0, 3).map((item) => (
                <Link className="group grid grid-cols-[62px_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border border-[#e5edf7] bg-white px-3 py-3 transition hover:border-[#8fc1ff] hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)]" href={item.href} key={item.id}>
                  <time className="grid min-h-[58px] place-items-center rounded-[15px] bg-[#edf5ff] text-center text-[10px] font-black uppercase leading-4 text-[#0b63ce]">{item.dateLabel}</time>
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-[0.08em] text-[#0b63ce]">{item.statusLabel}</span>
                    <h4 className="mt-0.5 line-clamp-1 text-[15px] font-semibold text-[#101828]">{item.title}</h4>
                    <p className="mt-0.5 line-clamp-1 text-[12px] leading-5 text-[#667085]">{item.description}</p>
                  </div>
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#edf5ff] text-[#0b63ce] transition group-hover:bg-[#0b74ff] group-hover:text-white">
                    <ArrowRightIcon aria-hidden="true" className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </article>
          <article className="rounded-[28px] border border-[#d7e4f5] bg-[#fbfdff] p-5 shadow-[0_22px_70px_rgba(15,23,42,0.05)] sm:p-6">
            <SectionHeader eyebrow="FAQ" title="Sourcing questions" />
            <div className="grid gap-3">
              {faqs.slice(0, 4).map((item) => (
                <details className="group rounded-[18px] border border-[#e5edf7] bg-white px-4 py-4 transition open:border-[#8fc1ff]" key={item.id}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold text-[#101828] [&::-webkit-details-marker]:hidden">
                    <span>{item.question}</span>
                    <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#edf5ff] text-[19px] leading-none text-[#0b63ce] transition group-open:rotate-45">+</span>
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
    {
      links: [
        ["Commercial", "/commercial"],
        ["Industrial", "/industrial"],
        ["EPC", "/epc"],
        ["BUY & SELL", "/buy-sell"],
      ],
      title: "Marketplace",
    },
    {
      links: [
        ["Event", "/events"],
        ["Networking", "/networking"],
        ["Service", "/service"],
        ["Dashboard", "/dashboard"],
      ],
      title: "Programs",
    },
    {
      links: [
        ["Supplier signup", "/signup/supplier"],
        ["Agent signup", "/signup/agent"],
        ["Buyer signup", "/signup/buyer"],
        ["Professor signup", "/signup/professor"],
      ],
      title: "Start",
    },
  ];

  return (
    <footer className="bg-[#07111f] text-white">
      <PublicContainer className="py-10 sm:py-12">
        <div className="grid gap-8 border-b border-white/10 pb-8 lg:grid-cols-[1.05fr_1.7fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-[15px] bg-[#0b74ff] text-[12px] font-black text-white shadow-[0_18px_42px_rgba(11,116,255,0.28)]">B2</span>
              <span>
                <span className="block text-[28px] font-black leading-none tracking-[-0.065em]">B2B2G</span>
                <span className="mt-1 block text-[10px] font-black uppercase tracking-[0.22em] text-[#7db7ff]">Global Trade OS</span>
              </span>
            </div>
            <p className="mt-5 max-w-sm text-[13px] leading-7 text-white/62">
              A controlled B2B commerce operating system for verified products, protected demand, trade programs, and marketplace services.
            </p>
          </div>
          <div className="grid gap-7 sm:grid-cols-3">
            {groups.map((group) => (
              <nav aria-label={group.title} key={group.title}>
                <h3 className="text-[13px] font-semibold text-white">{group.title}</h3>
                <div className="mt-4 grid gap-2.5">
                  {group.links.map(([label, href]) => (
                    <Link className="w-fit text-[13px] text-white/54 transition hover:text-white" href={href} key={href}>
                      {label}
                    </Link>
                  ))}
                </div>
              </nav>
            ))}
          </div>
          <div className="rounded-[26px] border border-white/10 bg-white/[0.07] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.24)]">
            <StatusPill tone="blue">Policy-first commerce</StatusPill>
            <div className="mt-4 grid gap-2">
              {["No public pricing", "Buyer PII protected", "Admin-reviewed exposure"].map((item) => (
                <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-[12px] font-bold text-white/74" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-5 text-[12px] text-white/44 md:flex-row md:items-center md:justify-between">
          <span>© 2026 B2B2G. Buyer identity data is protected by platform policy.</span>
          <span>Privacy · Terms · Security · English</span>
        </div>
      </PublicContainer>
    </footer>
  );
}

export function MarketplaceHome({ config }: Readonly<{ config: MarketplaceHomeConfig }>) {
  return (
    <main className="marketplace-home-root overflow-x-hidden bg-white text-[#101828]">
      <CommerceHero products={config.premiumProducts} />
      <MarketplaceChannels channels={config.channels} />
      <LatestProducts products={config.latestProducts} />
      <MarketActivity buyers={config.verifiedBuyers} events={config.events} requests={config.buyerRequests} />
      <ShowcaseAndAds banners={config.adBanners} showcases={config.showcases} />
      <UpdatesAndFaq announcements={config.announcements} faqs={config.faqs} />
      <MarketplaceFooter />
    </main>
  );
}
