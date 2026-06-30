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

const MARKET_FILTERS = [
  "Commercial",
  "Industrial",
  "EPC",
  "Events",
  "BUY & SELL",
  "Networking",
  "Service",
];

const PLATFORM_PILLARS = [
  { label: "Verified supply", value: "Approved lanes" },
  { label: "Protected demand", value: "Masked RFQ" },
  { label: "Brokered workflow", value: "Admin routed" },
  { label: "Service layer", value: "FDA and events" },
];

const OPERATING_LANES = [
  {
    description: "Approval-first onboarding for suppliers, company setup, product publishing, and premium visibility.",
    href: "/signup/supplier",
    label: "Supplier operating lane",
  },
  {
    description: "Structured sourcing demand with masked buyer identity and platform-managed inquiry routing.",
    href: "/buy-sell",
    label: "RFQ and demand lane",
  },
  {
    description: "Events, Thailand FDA, market support, and network programs for cross-border commerce.",
    href: "/service",
    label: "Trade service lane",
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

function SectionHeading({
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
    <div className="mb-7 flex flex-col gap-5 md:mb-9 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#2563eb]">{eyebrow}</p>
        <h2 className="mt-3 break-words text-[30px] font-black leading-[1.04] tracking-[-0.035em] text-[#0a1020] md:text-[54px] md:tracking-[-0.045em]">
          {title}
        </h2>
        <p className="mt-4 text-[16px] leading-7 text-[#667085] md:text-[18px]">{subtitle}</p>
      </div>
      {action ? (
        <ActionLink
          className="inline-flex h-11 w-fit items-center gap-2 rounded-full border border-[#d9e2ef] bg-white px-5 text-sm font-black text-[#2563eb] shadow-[0_10px_30px_rgb(15_23_42/0.06)] transition hover:-translate-y-0.5 hover:border-[#2563eb]/30 disabled:cursor-not-allowed disabled:opacity-60"
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
  item,
  priority = false,
}: Readonly<{
  item: MarketplaceHomeProduct;
  priority?: boolean;
}>) {
  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-[26px] border border-[#e4ebf5] bg-white shadow-[0_18px_58px_rgb(15_23_42/0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_rgb(15_23_42/0.11)]">
      <div className="relative aspect-square overflow-hidden bg-[#eef3f8]">
        <Image
          alt={item.imageAlt}
          className="object-cover transition duration-700 group-hover:scale-[1.035]"
          fill
          priority={priority}
          sizes="(max-width: 768px) 92vw, (max-width: 1200px) 42vw, 310px"
          src={item.imageUrl}
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/92 px-3 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#2563eb] backdrop-blur">
            {item.category}
          </span>
          {item.isVerifiedSupplier ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#0a1020] px-3 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-white">
              <ShieldCheckIcon className="h-3 w-3" aria-hidden="true" />
              Verified
            </span>
          ) : null}
        </div>
        <button
          aria-label={`Save interest for ${item.title}`}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/92 text-base font-black text-[#2563eb] backdrop-blur"
          type="button"
        >
          <span aria-hidden="true">♡</span>
        </button>
      </div>
      <div className="flex min-h-[226px] flex-1 flex-col p-4">
        <span className="truncate text-xs font-bold text-[#667085]">{item.supplierName}</span>
        <h3 className="mt-2 line-clamp-2 min-h-[50px] text-[19px] font-black leading-tight tracking-[-0.025em] text-[#0a1020]">
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-3 min-h-[66px] text-[14px] leading-6 text-[#667085]">{item.description}</p>
        <Link
          className="mt-auto inline-flex h-10 w-full items-center justify-center rounded-full bg-[#2563eb] px-4 text-xs font-black text-white transition hover:bg-[#1d4ed8]"
          href={item.href}
        >
          {item.ctaLabel}
        </Link>
      </div>
    </article>
  );
}

function HeroProductStage({ config }: Readonly<{ config: MarketplaceHomeConfig }>) {
  const leadProduct = config.premiumProducts[0];
  const heroProducts = config.premiumProducts.slice(1, 4);
  const leadRequest = config.buyerRequests[0];

  return (
    <section className="relative min-w-0 overflow-hidden rounded-[34px] bg-[#08111f] px-5 py-6 text-white shadow-[0_32px_110px_rgb(8_17_31/0.24)] md:px-8 md:py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgb(37_99_235/0.32),transparent_32%),radial-gradient(circle_at_82%_16%,rgb(20_184_166/0.20),transparent_34%)]" />
      <div className="relative grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(640px,1.08fr)]">
        <div className="flex flex-col justify-between gap-8 py-2 md:py-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#93c5fd]">Next generation B2B commerce</p>
            <h1 className="mt-5 max-w-2xl break-words text-[34px] font-black leading-[1.02] tracking-[-0.035em] text-white md:text-[72px] md:leading-[0.98] md:tracking-[-0.045em]">
              <span className="block">Verified B2B trade</span>
              <span className="block">starts here.</span>
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-8 text-white/68 md:text-[19px]">
              Discover approved products, masked buyer requests, trade programs, and service workflows without exposing sensitive buyer data.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {PLATFORM_PILLARS.map((item) => (
              <div className="rounded-[22px] border border-white/10 bg-white/[0.07] p-4 backdrop-blur" key={item.label}>
                <strong className="block text-[18px] font-black tracking-[-0.02em] text-white">{item.value}</strong>
                <span className="mt-1 block text-sm font-bold text-white/54">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
          <article className="overflow-hidden rounded-[28px] border border-white/12 bg-white text-[#0a1020] shadow-[0_28px_80px_rgb(0_0_0/0.26)]">
            <div className="relative aspect-[1.25/1] bg-[#eef3f8]">
              <Image
                alt={leadProduct.imageAlt}
                className="object-cover"
                fill
                priority
                sizes="(max-width: 1024px) 92vw, 520px"
                src={leadProduct.imageUrl}
              />
              <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#2563eb] backdrop-blur">
                Featured supplier
              </div>
            </div>
            <div className="p-5">
              <p className="text-xs font-bold text-[#667085]">{leadProduct.supplierName}</p>
              <h2 className="mt-2 text-[26px] font-black tracking-[-0.035em]">{leadProduct.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#667085]">{leadProduct.description}</p>
              <Link className="mt-4 inline-flex h-10 items-center rounded-full bg-[#2563eb] px-5 text-xs font-black text-white" href={leadProduct.href}>
                Inquire Now
              </Link>
            </div>
          </article>

          <div className="grid gap-4">
            {heroProducts.slice(0, 2).map((item, index) => (
              <article className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 rounded-[24px] border border-white/12 bg-white/[0.09] p-3 backdrop-blur" key={item.id}>
                <div className="relative min-h-[92px] overflow-hidden rounded-[18px] bg-white/10">
                  <Image alt={item.imageAlt} className="object-cover" fill priority={index === 0} sizes="92px" src={item.imageUrl} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#93c5fd]">{item.category}</p>
                  <h3 className="mt-1 line-clamp-2 text-base font-black leading-tight text-white">{item.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/56">{item.supplierName}</p>
                </div>
              </article>
            ))}
            <article className="rounded-[24px] border border-white/12 bg-white/[0.09] p-4 backdrop-blur">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#93c5fd]">Protected RFQ</p>
              <h3 className="mt-2 text-xl font-black tracking-[-0.03em] text-white">{leadRequest.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/58">{leadRequest.spec}</p>
              <span className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-black text-[#93c5fd]">{leadRequest.quantity}</span>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryRail() {
  return (
    <section className="rounded-[28px] border border-[#e4ebf5] bg-white p-3 shadow-[0_18px_58px_rgb(15_23_42/0.05)]">
      <div className="flex min-w-0 gap-2 overflow-x-auto">
        {MARKET_FILTERS.map((item) => (
          <span className="whitespace-nowrap rounded-full bg-[#f6f8fb] px-5 py-3 text-sm font-black text-[#344054]" key={item}>
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

function SupplierShowroom({ products }: Readonly<{ products: MarketplaceHomeProduct[] }>) {
  return (
    <section>
      <SectionHeading
        action={{ href: "/products", isEnabled: false, label: "Explore catalog" }}
        eyebrow="Supplier showroom"
        subtitle="Large product imagery, supplier identity, verification status, and a single inquiry CTA keep the catalog clean and conversion-focused."
        title="Featured products for serious sourcing."
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {products.slice(1, 5).map((item, index) => (
          <ProductCard item={item} key={item.id} priority={index < 2} />
        ))}
      </div>
    </section>
  );
}

function DemandEventBoard({
  events,
  requests,
}: Readonly<{
  events: MarketplaceHomeEvent[];
  requests: MarketplaceHomeRequest[];
}>) {
  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="rounded-[30px] border border-[#e4ebf5] bg-white p-6 shadow-[0_18px_58px_rgb(15_23_42/0.05)]">
        <SectionHeading
          eyebrow="Buyer demand"
          subtitle="Public RFQs show product intent while buyer identity remains hidden by platform policy."
          title="RFQ signals with privacy built in."
        />
        <div className="grid gap-3">
          {requests.slice(0, 4).map((item) => (
            <article className="grid grid-cols-[70px_minmax(0,1fr)_auto] gap-4 rounded-[22px] bg-[#f7f9fc] p-3" key={item.id}>
              <div className="relative overflow-hidden rounded-2xl bg-[#eef3f8]">
                {item.imageUrl ? <Image alt={item.imageAlt ?? item.title} className="object-cover" fill sizes="70px" src={item.imageUrl} /> : null}
              </div>
              <div className="min-w-0">
                <h3 className="line-clamp-1 text-base font-black text-[#0a1020]">{item.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#667085]">{item.spec}</p>
                <p className="mt-2 text-xs font-bold text-[#667085]">{item.quantity}</p>
              </div>
              <strong className="h-fit rounded-full bg-white px-3 py-1 text-xs font-black text-[#2563eb]">{item.badge}</strong>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-[30px] border border-[#e4ebf5] bg-white p-6 shadow-[0_18px_58px_rgb(15_23_42/0.05)]">
        <SectionHeading
          eyebrow="Programs"
          subtitle="Trade events and service windows create demand, supplier exposure, and cross-border momentum."
          title="Market activity, clearly scheduled."
        />
        <div className="grid gap-3">
          {events.slice(0, 3).map((item) => (
            <article className="grid grid-cols-[112px_minmax(0,1fr)] gap-4 rounded-[22px] bg-[#f7f9fc] p-3" key={item.id}>
              <div className="relative min-h-[108px] overflow-hidden rounded-2xl bg-[#eef3f8]">
                <Image alt={item.imageAlt} className="object-cover" fill sizes="112px" src={item.imageUrl} />
              </div>
              <div className="min-w-0">
                <time className="text-xs font-black uppercase tracking-[0.12em] text-[#0f766e]">{item.dateLabel}</time>
                <h3 className="mt-2 line-clamp-2 text-base font-black leading-tight text-[#0a1020]">{item.title}</h3>
                <p className="mt-1 text-sm text-[#667085]">{item.locationLabel}</p>
                <span className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-[#0f766e]">{item.badge}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function OperatingLanes() {
  return (
    <section className="rounded-[34px] border border-[#1d2939] bg-[#0b1220] p-6 text-white shadow-[0_24px_80px_rgb(15_23_42/0.16)] md:p-8">
      <div className="mb-7 max-w-3xl md:mb-9">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#93c5fd]">Operating model</p>
        <h2 className="mt-3 text-[34px] font-black leading-[1.02] tracking-[-0.045em] text-white md:text-[54px]">
          Designed for controlled B2B commerce.
        </h2>
        <p className="mt-4 text-[16px] leading-7 text-white/58 md:text-[18px]">
          The platform is structured around approval, brokerage, and role boundaries instead of uncontrolled marketplace messaging.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {OPERATING_LANES.map((item) => (
          <Link className="group rounded-[24px] border border-white/10 bg-white/[0.06] p-5 transition hover:-translate-y-1 hover:bg-white/[0.1]" href={item.href} key={item.label}>
            <h3 className="text-2xl font-black tracking-[-0.03em] text-white">{item.label}</h3>
            <p className="mt-3 min-h-[90px] text-sm leading-6 text-white/58">{item.description}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-xs font-black text-[#93c5fd]">
              View pathway
              <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ShowcaseBuyers({
  buyers,
  showcases,
}: Readonly<{
  buyers: MarketplaceHomeBuyer[];
  showcases: MarketplaceHomeShowcase[];
}>) {
  return (
    <section className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.34fr)_minmax(360px,0.66fr)]">
      <div className="rounded-[30px] border border-[#e4ebf5] bg-white p-6 shadow-[0_18px_58px_rgb(15_23_42/0.05)]">
        <SectionHeading
          eyebrow="Innovation showcase"
          subtitle="A premium visual space for product concepts, projects, and partner-led market stories."
          title="Future products, presented with focus."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {showcases.slice(0, 3).map((item) => (
            <Link className="group min-w-0" href={item.href} key={item.id}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-[#eef3f8]">
                <Image alt={item.imageAlt} className="object-cover transition duration-700 group-hover:scale-[1.035]" fill sizes="(max-width: 768px) 92vw, 260px" src={item.imageUrl} />
              </div>
              <span className="mt-4 inline-flex rounded-full bg-[#eaf2ff] px-3 py-1 text-xs font-black text-[#2563eb]">{item.category}</span>
              <h3 className="mt-3 line-clamp-2 text-xl font-black tracking-[-0.025em] text-[#0a1020]">{item.title}</h3>
              <p className="mt-1 text-sm font-bold text-[#667085]">{item.companyName}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-[30px] border border-[#e4ebf5] bg-white p-6 shadow-[0_18px_58px_rgb(15_23_42/0.05)]">
        <SectionHeading
          eyebrow="Buyer network"
          subtitle="Demand proof is visible. Private identity data is not."
          title="Verified buyers"
        />
        <div className="grid gap-3">
          {buyers.slice(0, 5).map((item) => (
            <article className="grid grid-cols-[46px_minmax(0,1fr)_22px] items-center gap-3 rounded-[22px] bg-[#f7f9fc] p-3" key={item.id}>
              <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-sm font-black text-[#2563eb]">{item.avatarLabel}</span>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-black text-[#0a1020]">{item.companyName}</h3>
                <p className="truncate text-sm text-[#667085]">{item.role}</p>
                <span className="text-xs font-bold text-[#98a2b3]">{item.country}</span>
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
      <SectionHeading
        action={{ href: "/products", isEnabled: false, label: "View all products" }}
        eyebrow="Latest supply"
        subtitle="A consistent product grid that can later connect to approval state, exposure ranking, and supplier membership."
        title="New products with a cleaner rhythm."
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {products.slice(0, 8).map((item) => (
          <ProductCard item={item} key={item.id} />
        ))}
      </div>
    </section>
  );
}

function UpdatesFaq({
  announcements,
  faqs,
}: Readonly<{
  announcements: MarketplaceHomeAnnouncement[];
  faqs: MarketplaceHomeFaq[];
}>) {
  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.86fr)]">
      <div className="rounded-[30px] border border-[#e4ebf5] bg-white p-6 shadow-[0_18px_58px_rgb(15_23_42/0.05)]">
        <SectionHeading
          eyebrow="Updates"
          subtitle="Operational notices, program windows, and marketplace changes."
          title="Announcements"
        />
        <div className="grid gap-3">
          {announcements.slice(0, 3).map((item) => (
            <Link className="grid grid-cols-[80px_minmax(0,1fr)] gap-4 rounded-[22px] bg-[#f7f9fc] p-3 transition hover:bg-[#eef4ff]" href={item.href} key={item.id}>
              <time className="grid min-h-[74px] place-items-center rounded-2xl bg-white text-center text-xs font-black text-[#2563eb]">{item.dateLabel}</time>
              <div className="min-w-0">
                <span className="text-xs font-black uppercase tracking-[0.1em] text-[#2563eb]">{item.statusLabel}</span>
                <h3 className="mt-1 line-clamp-1 text-base font-black text-[#0a1020]">{item.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#667085]">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-[30px] border border-[#e4ebf5] bg-white p-6 shadow-[0_18px_58px_rgb(15_23_42/0.05)]">
        <SectionHeading
          eyebrow="Help"
          subtitle="Short answers for supplier, buyer, and marketplace operators."
          title="FAQ"
        />
        <div className="grid gap-2">
          {faqs.slice(0, 4).map((item) => (
            <details className="rounded-[22px] bg-[#f7f9fc] px-4 py-4" key={item.id}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-black tracking-[-0.01em] text-[#0a1020] [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <span aria-hidden="true" className="text-xl text-[#2563eb]">+</span>
              </summary>
              <p className="mt-3 text-[15px] leading-6 text-[#667085]">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
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
    <footer className="border-t border-[#e4ebf5] bg-white text-[#0a1020]">
      <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.06fr_1.94fr_0.9fr]">
          <div>
            <h2 className="text-[32px] font-black tracking-[-0.06em]">B2B2G</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#667085]">
              A global B2B commerce platform for verified supply, protected demand, events, and service workflows.
            </p>
          </div>
          <div className="grid gap-7 sm:grid-cols-4">
            {columns.map(([title, ...items]) => (
              <nav aria-label={title} key={title}>
                <h3 className="text-xs font-black text-[#0a1020]">{title}</h3>
                <div className="mt-3 grid gap-2">
                  {items.map((item) => (
                    <button className="w-fit text-left text-xs font-semibold text-[#667085] disabled:cursor-not-allowed" disabled key={item} type="button">
                      {item}
                    </button>
                  ))}
                </div>
              </nav>
            ))}
          </div>
          <div className="rounded-[24px] border border-[#e4ebf5] bg-[#f7f9fc] p-5">
            <h3 className="text-sm font-black">Trade brief</h3>
            <p className="mt-2 text-sm leading-6 text-[#667085]">Product, event, and service updates for marketplace teams.</p>
            <form className="mt-5 grid gap-2">
              <input className="min-h-11 min-w-0 rounded-full border border-[#d9e2ef] bg-white px-4 text-sm outline-none" disabled placeholder="Work email" type="email" />
              <button className="min-h-11 rounded-full bg-[#2563eb] px-4 text-sm font-black text-white disabled:cursor-not-allowed" disabled type="button">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-[#e4ebf5] pt-6 text-xs text-[#667085] md:flex-row md:items-center md:justify-between">
          <span>© 2026 B2B2G. Buyer identity data is protected by platform policy.</span>
          <span>Privacy · Terms · Language</span>
        </div>
      </div>
    </footer>
  );
}

export function MarketplaceHome({ config }: Readonly<{ config: MarketplaceHomeConfig }>) {
  return (
    <div className="marketplace-home-root overflow-x-hidden bg-[#f3f6fb] text-[#0a1020]">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-4 pb-16 pt-4 sm:px-6 lg:px-10">
        <HeroProductStage config={config} />
        <CategoryRail />
        <SupplierShowroom products={config.premiumProducts} />
        <DemandEventBoard events={config.events} requests={config.buyerRequests} />
        <OperatingLanes />
        <ShowcaseBuyers buyers={config.verifiedBuyers} showcases={config.showcases} />
        <LatestProducts products={config.latestProducts} />
        <UpdatesFaq announcements={config.announcements} faqs={config.faqs} />
      </div>
      <MarketplaceFooter />
    </div>
  );
}
