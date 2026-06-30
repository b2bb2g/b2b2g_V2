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

const MARKET_LANES = [
  "Commercial sourcing",
  "Industrial equipment",
  "EPC projects",
  "FDA service desk",
  "Events",
  "Brokered RFQ",
];

const OPERATING_STEPS = [
  "Supplier approval",
  "Company profile",
  "Product review",
  "Brokered inquiry",
];

const ROLE_PATHWAYS = [
  {
    cta: "Apply as supplier",
    description: "Prepare supplier approval, company setup, products, and premium exposure.",
    href: "/signup/supplier",
    key: "supplier",
    label: "Supplier",
  },
  {
    cta: "Apply as agent",
    description: "Build assigned buyer networks without crossing protected data boundaries.",
    href: "/signup/agent",
    key: "agent",
    label: "Agent",
  },
  {
    cta: "Buyer onboarding",
    description: "Join invited buying workflows and submit structured product demand.",
    href: "/signup/buyer",
    key: "buyer",
    label: "Buyer",
  },
  {
    cta: "Professor access",
    description: "Run program-based onboarding and innovation showcase preparation.",
    href: "/signup/professor",
    key: "professor",
    label: "Professor",
  },
];

function ActionLink({
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

function SectionHeader({
  action,
  eyebrow,
  subtitle,
  title,
}: Readonly<{
  action?: CtaLink;
  eyebrow?: string;
  subtitle?: string;
  title: string;
}>) {
  return (
    <div className="mb-5 flex flex-col gap-4 md:mb-7 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#2563eb]">{eyebrow}</p>
        ) : null}
        <h2 className="mt-2 max-w-4xl text-[32px] font-black leading-[0.98] tracking-[-0.065em] text-[#07111f] md:text-[48px]">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-600 md:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? (
        <ActionLink
          className="inline-flex h-11 w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-black text-[#2563eb] shadow-sm transition hover:-translate-y-0.5 hover:border-[#2563eb]/30 disabled:cursor-not-allowed disabled:opacity-60"
          item={action}
        >
          {action.label}
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </ActionLink>
      ) : null}
    </div>
  );
}

function ProductCard({
  featured = false,
  item,
  priority = false,
}: Readonly<{
  featured?: boolean;
  item: MarketplaceHomeProduct;
  priority?: boolean;
}>) {
  return (
    <article className={`group flex min-w-0 flex-col overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_20px_80px_rgb(15_23_42/0.08)] transition hover:-translate-y-1 hover:shadow-[0_34px_90px_rgb(15_23_42/0.13)] ${featured ? "h-full" : ""}`}>
      <div className="relative aspect-square overflow-hidden bg-[#eef5ff]">
        <Image
          alt={item.imageAlt}
          className="object-cover transition duration-500 group-hover:scale-[1.035]"
          fill
          priority={priority}
          sizes={featured ? "(max-width: 768px) 92vw, 520px" : "(max-width: 768px) 92vw, 340px"}
          src={item.imageUrl}
        />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#2563eb] backdrop-blur">
            {item.category}
          </span>
          {item.isVerifiedSupplier ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#07111f] px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-white">
              <ShieldCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Verified
            </span>
          ) : null}
        </div>
        <button
          aria-label={`Save interest for ${item.title}`}
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/70 bg-white/90 text-lg font-black text-[#2563eb] backdrop-blur"
          type="button"
        >
          <span aria-hidden="true">♡</span>
        </button>
      </div>
      <div className="flex min-h-[244px] flex-1 flex-col p-5">
        <span className="min-w-0 truncate text-sm font-bold text-slate-500">{item.supplierName}</span>
        <h3 className="mt-3 line-clamp-2 min-h-[58px] text-[21px] font-black leading-tight tracking-[-0.04em] text-[#07111f]">
          {item.title}
        </h3>
        <p className="mt-3 line-clamp-3 min-h-[72px] text-[15px] leading-6 text-slate-600">{item.description}</p>
        <Link
          className="mt-auto inline-flex h-11 w-full items-center justify-center rounded-full bg-[#2563eb] px-5 text-sm font-black text-white shadow-[0_16px_34px_rgb(37_99_235/0.22)] transition hover:bg-[#1d4ed8]"
          href={item.href}
        >
          {item.ctaLabel}
        </Link>
      </div>
    </article>
  );
}

function HeroCommandCenter({ config }: Readonly<{ config: MarketplaceHomeConfig }>) {
  const heroProduct = config.premiumProducts[0];
  const leadRequest = config.buyerRequests[0];
  const leadEvent = config.events[0];

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(460px,0.92fr)]">
      <div className="relative min-w-0 overflow-hidden rounded-[38px] border border-slate-200 bg-[#07111f] p-7 text-white shadow-[0_30px_100px_rgb(7_17_31/0.20)] md:p-10">
        <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#60a5fa,#34d399,#fbbf24)]" />
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#93c5fd]">B2B2G Trade Operating Home</p>
        <h1 className="mt-5 max-w-4xl text-[42px] font-black leading-[0.93] tracking-[-0.08em] md:text-[72px]">
          Source, verify, broker, and grow global B2B demand.
        </h1>
        <p className="mt-6 max-w-2xl text-[17px] leading-8 text-white/72">
          One marketplace surface for approved suppliers, masked buyer requests, trade events, FDA service pathways, and role-based onboarding.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          {MARKET_LANES.map((item) => (
            <span className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-bold text-white/78" key={item}>
              {item}
            </span>
          ))}
        </div>
        <div className="mt-10 grid gap-3 md:grid-cols-4">
          {OPERATING_STEPS.map((item, index) => (
            <div className="rounded-[22px] border border-white/10 bg-white/[0.06] p-4" key={item}>
              <span className="text-xs font-black text-[#93c5fd]">0{index + 1}</span>
              <p className="mt-2 text-sm font-black leading-5 text-white">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-1">
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_220px] xl:grid-cols-[minmax(0,1fr)_180px]">
          <ProductCard featured item={heroProduct} priority />
          <div className="grid gap-5">
            <article className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_20px_80px_rgb(15_23_42/0.08)]">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#2563eb]">Protected RFQ</p>
              <h2 className="mt-3 text-[24px] font-black leading-[1.02] tracking-[-0.05em] text-[#07111f]">
                {leadRequest.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{leadRequest.spec}</p>
              <span className="mt-4 inline-flex rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-black text-[#2563eb]">
                {leadRequest.quantity}
              </span>
            </article>
            <article className="rounded-[30px] border border-slate-200 bg-[#f8fafc] p-5 shadow-[0_20px_80px_rgb(15_23_42/0.06)]">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0f766e]">Next program</p>
              <h2 className="mt-3 text-[24px] font-black leading-[1.02] tracking-[-0.05em] text-[#07111f]">
                {leadEvent.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{leadEvent.locationLabel}</p>
              <span className="mt-4 inline-flex rounded-full bg-[#ecfdf5] px-3 py-1 text-xs font-black text-[#0f766e]">
                {leadEvent.dateLabel}
              </span>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductDiscovery({ products }: Readonly<{ products: MarketplaceHomeProduct[] }>) {
  return (
    <section>
      <SectionHeader
        action={{ href: "/products", isEnabled: false, label: "Browse products" }}
        eyebrow="Product discovery"
        subtitle="Large image cards, verified supplier signals, and brokered inquiry CTAs for serious sourcing."
        title="Premium supplier products"
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {products.slice(1, 5).map((item, index) => (
          <ProductCard item={item} key={item.id} priority={index < 2} />
        ))}
      </div>
    </section>
  );
}

function RequestAndEventBoard({
  events,
  requests,
}: Readonly<{
  events: MarketplaceHomeEvent[];
  requests: MarketplaceHomeRequest[];
}>) {
  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
      <div className="min-w-0 rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_22px_80px_rgb(15_23_42/0.08)]">
        <SectionHeader
          eyebrow="RFQ desk"
          subtitle="Demand cards keep buyer identity protected while preserving sourcing context."
          title="Buyer product requests"
        />
        <div className="grid gap-3">
          {requests.slice(0, 4).map((item) => (
            <article className="grid min-h-[104px] grid-cols-[72px_minmax(0,1fr)_auto] gap-4 rounded-[24px] border border-slate-100 bg-[#fbfdff] p-3" key={item.id}>
              <div className="relative overflow-hidden rounded-2xl bg-[#eef5ff]">
                {item.imageUrl ? (
                  <Image alt={item.imageAlt ?? item.title} className="object-cover" fill sizes="72px" src={item.imageUrl} />
                ) : null}
              </div>
              <div>
                <h3 className="line-clamp-1 text-base font-black text-[#07111f]">{item.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">{item.spec}</p>
                <span className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500">
                  {item.quantity}
                </span>
              </div>
              <strong className="h-fit rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-black text-[#2563eb]">
                {item.badge}
              </strong>
            </article>
          ))}
        </div>
      </div>
      <div className="min-w-0 rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_22px_80px_rgb(15_23_42/0.08)]">
        <SectionHeader
          eyebrow="Event calendar"
          subtitle="Trade programs, missions, and service windows that drive marketplace activity."
          title="Events and service timing"
        />
        <div className="grid gap-3">
          {events.slice(0, 3).map((item) => (
            <article className="grid min-h-[116px] grid-cols-[116px_minmax(0,1fr)] gap-4 rounded-[24px] border border-slate-100 bg-[#fbfdff] p-3" key={item.id}>
              <div className="relative overflow-hidden rounded-2xl bg-[#eef5ff]">
                <Image alt={item.imageAlt} className="object-cover" fill sizes="116px" src={item.imageUrl} />
              </div>
              <div>
                <time className="text-xs font-black text-[#0f766e]">{item.dateLabel}</time>
                <h3 className="mt-1 text-base font-black leading-tight text-[#07111f]">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{item.locationLabel}</p>
                <span className="mt-2 inline-flex rounded-full bg-[#ecfdf5] px-3 py-1 text-xs font-black text-[#0f766e]">
                  {item.badge}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function RoleGateways() {
  return (
    <section className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-[0_24px_90px_rgb(15_23_42/0.08)] md:p-8">
      <SectionHeader
        eyebrow="Role gateways"
        subtitle="The public surface should guide every user into a controlled operating path."
        title="Choose the right entry into the trade system"
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {ROLE_PATHWAYS.map((item) => (
          <Link
            className="group rounded-[28px] border border-slate-200 bg-[#f8fafc] p-5 transition hover:-translate-y-1 hover:border-[#2563eb]/30 hover:bg-white hover:shadow-[0_20px_70px_rgb(15_23_42/0.10)]"
            href={item.href}
            key={item.key}
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#07111f] text-sm font-black uppercase text-white">
              {item.label.slice(0, 1)}
            </span>
            <h3 className="mt-5 text-2xl font-black tracking-[-0.055em] text-[#07111f]">{item.label}</h3>
            <p className="mt-3 min-h-[76px] text-[15px] leading-6 text-slate-600">{item.description}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#2563eb]">
              {item.cta}
              <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ExposureBanners({ items }: Readonly<{ items: MarketplaceHomeConfig["adBanners"] }>) {
  return (
    <section className="grid gap-5 lg:grid-cols-2">
      {items.map((item, index) => (
        <article className={`min-w-0 overflow-hidden rounded-[36px] border p-7 shadow-[0_24px_90px_rgb(15_23_42/0.08)] ${index === 0 ? "border-[#bfdbfe] bg-[#eff6ff]" : "border-[#bbf7d0] bg-[#f0fdf4]"}`} key={item.id}>
          <span className={`inline-flex rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${index === 0 ? "text-[#2563eb]" : "text-[#15803d]"}`}>
            Premium exposure
          </span>
          <h2 className="mt-5 max-w-2xl text-[34px] font-black leading-[0.96] tracking-[-0.065em] text-[#07111f] md:text-[46px]">
            {item.title}
          </h2>
          <p className="mt-4 max-w-xl text-[16px] leading-7 text-slate-600">{item.description}</p>
          <ActionLink className="mt-7 inline-flex h-12 w-fit items-center rounded-full bg-[#07111f] px-6 text-sm font-black text-white shadow-[0_16px_34px_rgb(7_17_31/0.20)]" item={item.cta}>
            {item.cta.label}
          </ActionLink>
        </article>
      ))}
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
    <section className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
      <div className="min-w-0 rounded-[36px] border border-slate-200 bg-white p-6 shadow-[0_24px_90px_rgb(15_23_42/0.08)]">
        <SectionHeader
          eyebrow="Innovation gallery"
          subtitle="Visual showcase cards for products, teams, and project-ready concepts."
          title="Innovation showcase"
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {showcases.slice(0, 3).map((item) => (
            <Link className="group" href={item.href} key={item.id}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-[#eef5ff]">
                <Image alt={item.imageAlt} className="object-cover transition duration-500 group-hover:scale-[1.035]" fill sizes="(max-width: 768px) 92vw, 260px" src={item.imageUrl} />
              </div>
              <span className="mt-4 inline-flex rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-black text-[#2563eb]">
                {item.category}
              </span>
              <h3 className="mt-3 line-clamp-2 text-xl font-black tracking-[-0.04em] text-[#07111f]">{item.title}</h3>
              <p className="mt-1 text-sm font-bold text-slate-500">{item.companyName}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="min-w-0 rounded-[36px] border border-slate-200 bg-white p-6 shadow-[0_24px_90px_rgb(15_23_42/0.08)]">
        <SectionHeader subtitle="Masked buyer profiles for protected demand." title="Verified buyers" />
        <div className="grid gap-3">
          {buyers.slice(0, 5).map((item) => (
            <article className="grid min-h-[76px] grid-cols-[44px_minmax(0,1fr)_24px] items-center gap-3 rounded-[24px] border border-slate-100 bg-[#fbfdff] p-3" key={item.id}>
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#eff6ff] text-sm font-black text-[#2563eb]">
                {item.avatarLabel}
              </span>
              <div>
                <h3 className="text-sm font-black text-[#07111f]">{item.companyName}</h3>
                <p className="text-sm text-slate-600">{item.role}</p>
                <span className="text-xs font-bold text-slate-400">{item.country}</span>
              </div>
              <ShieldCheckIcon className="h-5 w-5 text-[#2563eb]" aria-hidden="true" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function LatestProducts({ products }: Readonly<{ products: MarketplaceHomeProduct[] }>) {
  return (
    <section>
      <SectionHeader
        action={{ href: "/products", isEnabled: false, label: "View all products" }}
        eyebrow="Fresh supply"
        subtitle="A consistent grid for new products, supplier trust, and structured inquiry readiness."
        title="Latest marketplace products"
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {products.slice(0, 8).map((item) => (
          <ProductCard item={item} key={item.id} />
        ))}
      </div>
    </section>
  );
}

function KnowledgeFooter({
  announcements,
  faqs,
}: Readonly<{
  announcements: MarketplaceHomeAnnouncement[];
  faqs: MarketplaceHomeFaq[];
}>) {
  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.85fr)]">
      <div className="min-w-0 rounded-[36px] border border-slate-200 bg-white p-6 shadow-[0_24px_90px_rgb(15_23_42/0.08)]">
        <SectionHeader title="Announcements" />
        <div className="grid gap-3">
          {announcements.map((item) => (
            <Link className="grid grid-cols-[76px_minmax(0,1fr)] gap-4 rounded-[24px] border border-slate-100 bg-[#fbfdff] p-3 transition hover:bg-white" href={item.href} key={item.id}>
              <time className="grid min-h-[68px] place-items-center rounded-2xl bg-[#eff6ff] text-center text-xs font-black text-[#2563eb]">
                {item.dateLabel}
              </time>
              <div>
                <span className="text-xs font-black uppercase tracking-[0.08em] text-[#2563eb]">{item.statusLabel}</span>
                <h3 className="mt-1 text-base font-black text-[#07111f]">{item.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="min-w-0 rounded-[36px] border border-slate-200 bg-white p-6 shadow-[0_24px_90px_rgb(15_23_42/0.08)]">
        <SectionHeader title="FAQ" />
        <div className="grid gap-2">
          {faqs.map((item) => (
            <details className="rounded-[24px] border border-slate-100 bg-[#fbfdff] px-4 py-4" key={item.id}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-black tracking-[-0.02em] text-[#07111f] [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <span aria-hidden="true" className="text-xl text-[#2563eb]">+</span>
              </summary>
              <p className="mt-3 text-[15px] leading-6 text-slate-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function MarketplaceFooter() {
  const columns = [
    ["Source", "Premium products", "Supplier directory", "Product showcase", "Events"],
    ["Demand", "RFQ desk", "Buyer privacy", "Admin brokerage", "Agent network"],
    ["Services", "Thailand FDA", "Membership", "Verification", "Exposure"],
    ["Company", "About B2B2G", "Announcements", "Support", "Language"],
  ];

  return (
    <footer className="border-t border-white/10 bg-[#07111f] text-white">
      <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1.7fr_0.9fr]">
          <div>
            <h2 className="text-4xl font-black tracking-[-0.08em]">B2B2G</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/62">
              A brokered B2B trade operating system for verified supply, protected demand, and global service workflows.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-4">
            {columns.map(([title, ...items]) => (
              <nav aria-label={title} key={title}>
                <h3 className="text-sm font-black text-white">{title}</h3>
                <div className="mt-4 grid gap-2">
                  {items.map((item) => (
                    <button className="w-fit text-left text-xs font-bold text-white/55 disabled:cursor-not-allowed" disabled key={item} type="button">
                      {item}
                    </button>
                  ))}
                </div>
              </nav>
            ))}
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-5">
            <h3 className="text-sm font-black">Marketplace memo</h3>
            <p className="mt-3 text-sm leading-6 text-white/62">Supplier exposure, buyer demand, events, and service gateway updates.</p>
            <form className="mt-5 grid gap-2">
              <input className="min-h-11 min-w-0 rounded-full border border-white/15 bg-white/10 px-4 text-sm text-white outline-none placeholder:text-white/38" disabled placeholder="Work email" type="email" />
              <button className="min-h-11 rounded-full bg-white px-4 text-sm font-black text-[#2563eb] disabled:cursor-not-allowed" disabled type="button">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/48">
          © 2026 B2B2G. Buyer contact data is protected by platform policy.
        </div>
      </div>
    </footer>
  );
}

export function MarketplaceHome({ config }: Readonly<{ config: MarketplaceHomeConfig }>) {
  return (
    <div className="overflow-x-hidden bg-[#eef3f9] text-[#07111f]">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-5 pb-16 pt-6 sm:px-8 lg:px-10">
        <HeroCommandCenter config={config} />
        <ProductDiscovery products={config.premiumProducts} />
        <RequestAndEventBoard events={config.events} requests={config.buyerRequests} />
        <RoleGateways />
        <ExposureBanners items={config.adBanners} />
        <ShowcaseAndBuyers buyers={config.verifiedBuyers} showcases={config.showcases} />
        <LatestProducts products={config.latestProducts} />
        <KnowledgeFooter announcements={config.announcements} faqs={config.faqs} />
      </div>
      <MarketplaceFooter />
    </div>
  );
}
