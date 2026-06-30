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

const COMMERCE_CATEGORIES = [
  "Commercial",
  "Industrial",
  "EPC",
  "Events",
  "BUY & SELL",
  "Networking",
  "Service",
];

const METRIC_STRIP = [
  { label: "Supplier lanes", value: "Verified" },
  { label: "Buyer demand", value: "Protected" },
  { label: "Inquiry flow", value: "Brokered" },
  { label: "Service desk", value: "Global" },
];

const SERVICE_LANES = [
  {
    description: "Supplier approval, company setup, product publishing, and premium placement.",
    href: "/signup/supplier",
    label: "Supplier Growth",
  },
  {
    description: "RFQ review, buyer identity protection, and admin-managed inquiry routing.",
    href: "/buy-sell",
    label: "RFQ Brokerage",
  },
  {
    description: "Thailand FDA support, trade events, and market-entry operations.",
    href: "/service",
    label: "Market Services",
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
    <div className="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between">
      <div className="max-w-4xl">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#2563eb]">{eyebrow}</p>
        <h2 className="mt-3 text-[36px] font-black leading-[0.96] tracking-[-0.075em] text-[#101014] md:text-[60px]">
          {title}
        </h2>
        <p className="mt-4 max-w-2xl text-[17px] leading-8 text-[#626267] md:text-[19px]">{subtitle}</p>
      </div>
      {action ? (
        <ActionLink
          className="inline-flex h-12 w-fit items-center gap-2 rounded-full bg-[#0071e3] px-6 text-sm font-black text-white transition hover:bg-[#0068d1] disabled:cursor-not-allowed disabled:opacity-60"
          item={action}
        >
          {action.label}
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </ActionLink>
      ) : null}
    </div>
  );
}

function ProductTile({
  item,
  layout = "card",
  priority = false,
}: Readonly<{
  item: MarketplaceHomeProduct;
  layout?: "card" | "feature";
  priority?: boolean;
}>) {
  const isFeature = layout === "feature";

  return (
    <article
      className={`group flex min-w-0 flex-col overflow-hidden rounded-[34px] bg-white shadow-[0_20px_64px_rgb(15_23_42/0.06)] ring-1 ring-black/[0.04] transition duration-300 hover:-translate-y-1 hover:shadow-[0_32px_92px_rgb(15_23_42/0.11)] ${
        isFeature ? "lg:grid lg:grid-cols-[1.18fr_0.82fr]" : ""
      }`}
    >
      <div className={`relative overflow-hidden bg-[#eef3f8] ${isFeature ? "min-h-[420px] lg:min-h-full" : "aspect-square"}`}>
        <Image
          alt={item.imageAlt}
          className="object-cover transition duration-700 group-hover:scale-[1.035]"
          fill
          priority={priority}
          sizes={isFeature ? "(max-width: 1024px) 92vw, 720px" : "(max-width: 768px) 92vw, 320px"}
          src={item.imageUrl}
        />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#0071e3] backdrop-blur">
            {item.category}
          </span>
          {item.isVerifiedSupplier ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#101014] px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-white">
              <ShieldCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Verified
            </span>
          ) : null}
        </div>
        <button
          aria-label={`Save interest for ${item.title}`}
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-lg font-black text-[#0071e3] backdrop-blur"
          type="button"
        >
          <span aria-hidden="true">♡</span>
        </button>
      </div>
      <div className={`flex flex-1 flex-col ${isFeature ? "p-7 md:p-9" : "min-h-[246px] p-5"}`}>
        <span className="truncate text-sm font-bold text-[#73737a]">{item.supplierName}</span>
        <h3 className={`${isFeature ? "mt-4 text-[38px] md:text-[50px]" : "mt-3 min-h-[56px] text-[21px]"} line-clamp-2 font-black leading-[1.02] tracking-[-0.06em] text-[#101014]`}>
          {item.title}
        </h3>
        <p className={`${isFeature ? "mt-5 text-[17px] leading-8" : "mt-3 min-h-[72px] text-[15px] leading-6"} line-clamp-3 text-[#626267]`}>
          {item.description}
        </p>
        <Link
          className="mt-auto inline-flex h-11 w-full items-center justify-center rounded-full bg-[#0071e3] px-5 text-sm font-black text-white transition hover:bg-[#0068d1]"
          href={item.href}
        >
          {item.ctaLabel}
        </Link>
      </div>
    </article>
  );
}

function CommerceHero({ config }: Readonly<{ config: MarketplaceHomeConfig }>) {
  const [leadProduct, secondaryProduct] = config.premiumProducts;
  const leadRequest = config.buyerRequests[0];

  return (
    <section className="grid gap-5 pt-4">
      <div className="mx-auto hidden max-w-full gap-2 rounded-full bg-white/80 p-1 shadow-[0_18px_54px_rgb(15_23_42/0.06)] ring-1 ring-black/[0.05] backdrop-blur md:flex">
        {COMMERCE_CATEGORIES.map((item) => (
          <span className="rounded-full px-4 py-2 text-xs font-black text-[#424248]" key={item}>
            {item}
          </span>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(440px,0.82fr)]">
        <div className="rounded-[42px] bg-white p-5 shadow-[0_26px_90px_rgb(15_23_42/0.07)] ring-1 ring-black/[0.04] md:p-7">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,1.08fr)]">
            <div className="flex flex-col justify-between gap-8 p-2 md:p-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#0071e3]">Global B2B marketplace</p>
                <h1 className="mt-5 text-[48px] font-black leading-[0.9] tracking-[-0.09em] text-[#101014] md:text-[76px]">
                  Source smarter. Trade safer.
                </h1>
                <p className="mt-6 max-w-xl text-[18px] leading-8 text-[#626267] md:text-[21px]">
                  Discover verified suppliers, protected buyer requests, trade events, and service pathways in one premium commerce home.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {METRIC_STRIP.map((item) => (
                  <div className="rounded-[24px] bg-[#f5f5f7] px-4 py-4" key={item.label}>
                    <strong className="block text-[21px] font-black tracking-[-0.05em] text-[#101014]">{item.value}</strong>
                    <span className="mt-1 block text-sm font-bold text-[#73737a]">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative min-h-[520px] overflow-hidden rounded-[34px] bg-[#eef3f8]">
              <Image
                alt={leadProduct.imageAlt}
                className="object-cover"
                fill
                priority
                sizes="(max-width: 1024px) 92vw, 620px"
                src={leadProduct.imageUrl}
              />
              <div className="absolute inset-x-4 bottom-4 rounded-[28px] bg-white/88 p-5 shadow-[0_18px_60px_rgb(15_23_42/0.16)] backdrop-blur">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0071e3]">Featured product</p>
                <h2 className="mt-2 text-[28px] font-black tracking-[-0.06em] text-[#101014]">{leadProduct.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#626267]">{leadProduct.description}</p>
                <Link className="mt-4 inline-flex h-10 items-center rounded-full bg-[#0071e3] px-5 text-sm font-black text-white" href={leadProduct.href}>
                  Inquire Now
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5">
          <ProductTile item={secondaryProduct} priority />
          <article className="rounded-[34px] bg-white p-6 shadow-[0_20px_70px_rgb(15_23_42/0.06)] ring-1 ring-black/[0.04]">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0071e3]">Buyer request</p>
            <h2 className="mt-4 text-[34px] font-black leading-none tracking-[-0.07em] text-[#101014]">{leadRequest.title}</h2>
            <p className="mt-3 text-[15px] leading-6 text-[#626267]">{leadRequest.spec}</p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#eaf3ff] px-3 py-1 text-xs font-black text-[#0071e3]">{leadRequest.badge}</span>
              <span className="rounded-full bg-[#f5f5f7] px-3 py-1 text-xs font-bold text-[#626267]">{leadRequest.quantity}</span>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function FeaturedProducts({ products }: Readonly<{ products: MarketplaceHomeProduct[] }>) {
  return (
    <section>
      <SectionIntro
        action={{ href: "/products", isEnabled: false, label: "Browse catalog" }}
        eyebrow="Supplier catalog"
        subtitle="A curated product shelf designed for B2B buyers who need visual clarity, supplier context, and protected inquiry routing."
        title="Premium supplier showroom."
      />
      <ProductTile item={products[2]} layout="feature" priority />
      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {products.slice(3, 7).map((item) => (
          <ProductTile item={item} key={item.id} />
        ))}
      </div>
    </section>
  );
}

function RequestEventGrid({
  events,
  requests,
}: Readonly<{
  events: MarketplaceHomeEvent[];
  requests: MarketplaceHomeRequest[];
}>) {
  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="rounded-[40px] bg-white p-6 shadow-[0_22px_78px_rgb(15_23_42/0.06)] ring-1 ring-black/[0.04] md:p-8">
        <SectionIntro
          eyebrow="RFQ board"
          subtitle="Buyer requests show sourcing demand without revealing protected identity details."
          title="Buyer demand stays private."
        />
        <div className="grid gap-3">
          {requests.slice(0, 4).map((item) => (
            <article className="grid grid-cols-[72px_minmax(0,1fr)_auto] gap-4 rounded-[26px] bg-[#f5f5f7] p-3" key={item.id}>
              <div className="relative overflow-hidden rounded-2xl bg-[#eef3f8]">
                {item.imageUrl ? (
                  <Image alt={item.imageAlt ?? item.title} className="object-cover" fill sizes="72px" src={item.imageUrl} />
                ) : null}
              </div>
              <div className="min-w-0">
                <h3 className="line-clamp-1 text-base font-black text-[#101014]">{item.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#626267]">{item.spec}</p>
                <p className="mt-2 text-xs font-bold text-[#73737a]">{item.quantity}</p>
              </div>
              <strong className="h-fit rounded-full bg-white px-3 py-1 text-xs font-black text-[#0071e3]">{item.badge}</strong>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-[40px] bg-white p-6 shadow-[0_22px_78px_rgb(15_23_42/0.06)] ring-1 ring-black/[0.04] md:p-8">
        <SectionIntro
          eyebrow="Events"
          subtitle="Trade shows, sourcing missions, and market-entry sessions keep the marketplace active."
          title="Trade programs create momentum."
        />
        <div className="grid gap-3">
          {events.slice(0, 3).map((item) => (
            <article className="grid grid-cols-[118px_minmax(0,1fr)] gap-4 rounded-[26px] bg-[#f5f5f7] p-3" key={item.id}>
              <div className="relative min-h-[112px] overflow-hidden rounded-2xl bg-[#eef3f8]">
                <Image alt={item.imageAlt} className="object-cover" fill sizes="118px" src={item.imageUrl} />
              </div>
              <div className="min-w-0">
                <time className="text-xs font-black uppercase tracking-[0.12em] text-[#0f766e]">{item.dateLabel}</time>
                <h3 className="mt-2 line-clamp-2 text-base font-black leading-tight text-[#101014]">{item.title}</h3>
                <p className="mt-1 text-sm text-[#626267]">{item.locationLabel}</p>
                <span className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-[#0f766e]">{item.badge}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceLanes() {
  return (
    <section className="rounded-[44px] bg-[#101014] px-6 py-10 text-white shadow-[0_26px_90px_rgb(15_23_42/0.14)] md:px-9 md:py-14">
      <SectionIntro
        eyebrow="Operating paths"
        subtitle="The platform is not a free-for-all marketplace. It is structured around approval, brokerage, and role boundaries."
        title="Built for controlled B2B commerce."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {SERVICE_LANES.map((item) => (
          <Link className="group rounded-[32px] bg-white/[0.07] p-6 ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-white/[0.11]" href={item.href} key={item.label}>
            <h3 className="text-[30px] font-black tracking-[-0.065em] text-white">{item.label}</h3>
            <p className="mt-4 min-h-[96px] text-[15px] leading-6 text-white/62">{item.description}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#93c5fd]">
              Open pathway
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
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
      <div className="rounded-[40px] bg-white p-6 shadow-[0_22px_78px_rgb(15_23_42/0.06)] ring-1 ring-black/[0.04] md:p-8">
        <SectionIntro
          eyebrow="Innovation showcase"
          subtitle="A premium shelf for product concepts, projects, and team-led market stories."
          title="Innovation ready for global buyers."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {showcases.slice(0, 3).map((item) => (
            <Link className="group min-w-0" href={item.href} key={item.id}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[30px] bg-[#eef3f8]">
                <Image
                  alt={item.imageAlt}
                  className="object-cover transition duration-700 group-hover:scale-[1.035]"
                  fill
                  sizes="(max-width: 768px) 92vw, 260px"
                  src={item.imageUrl}
                />
              </div>
              <span className="mt-4 inline-flex rounded-full bg-[#eaf3ff] px-3 py-1 text-xs font-black text-[#0071e3]">
                {item.category}
              </span>
              <h3 className="mt-3 line-clamp-2 text-xl font-black tracking-[-0.045em] text-[#101014]">{item.title}</h3>
              <p className="mt-1 text-sm font-bold text-[#73737a]">{item.companyName}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-[40px] bg-white p-6 shadow-[0_22px_78px_rgb(15_23_42/0.06)] ring-1 ring-black/[0.04] md:p-8">
        <SectionIntro
          eyebrow="Buyer network"
          subtitle="Demand proof is visible. Private identity data is not."
          title="Verified buyers"
        />
        <div className="grid gap-3">
          {buyers.slice(0, 5).map((item) => (
            <article className="grid grid-cols-[48px_minmax(0,1fr)_22px] items-center gap-3 rounded-[26px] bg-[#f5f5f7] p-3" key={item.id}>
              <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-sm font-black text-[#0071e3]">{item.avatarLabel}</span>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-black text-[#101014]">{item.companyName}</h3>
                <p className="truncate text-sm text-[#626267]">{item.role}</p>
                <span className="text-xs font-bold text-[#73737a]">{item.country}</span>
              </div>
              <ShieldCheckIcon className="h-5 w-5 text-[#0071e3]" aria-hidden="true" />
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
      <SectionIntro
        action={{ href: "/products", isEnabled: false, label: "View all products" }}
        eyebrow="New arrivals"
        subtitle="A clean commerce grid that can later connect to product ranking, membership exposure, and approval status."
        title="Latest products presented clearly."
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {products.slice(0, 8).map((item) => (
          <ProductTile item={item} key={item.id} />
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
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.86fr)]">
      <div className="rounded-[40px] bg-white p-6 shadow-[0_22px_78px_rgb(15_23_42/0.06)] ring-1 ring-black/[0.04] md:p-8">
        <SectionIntro
          eyebrow="Updates"
          subtitle="Operational notices, event windows, and supplier program changes."
          title="Announcements"
        />
        <div className="grid gap-3">
          {announcements.slice(0, 3).map((item) => (
            <Link className="grid grid-cols-[82px_minmax(0,1fr)] gap-4 rounded-[26px] bg-[#f5f5f7] p-3 transition hover:bg-[#eef3f8]" href={item.href} key={item.id}>
              <time className="grid min-h-[76px] place-items-center rounded-2xl bg-white text-center text-xs font-black text-[#0071e3]">{item.dateLabel}</time>
              <div className="min-w-0">
                <span className="text-xs font-black uppercase tracking-[0.1em] text-[#0071e3]">{item.statusLabel}</span>
                <h3 className="mt-1 line-clamp-1 text-base font-black text-[#101014]">{item.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#626267]">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-[40px] bg-white p-6 shadow-[0_22px_78px_rgb(15_23_42/0.06)] ring-1 ring-black/[0.04] md:p-8">
        <SectionIntro
          eyebrow="Help"
          subtitle="Short answers for the first marketplace decisions."
          title="FAQ"
        />
        <div className="grid gap-2">
          {faqs.slice(0, 4).map((item) => (
            <details className="rounded-[26px] bg-[#f5f5f7] px-4 py-4" key={item.id}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-black tracking-[-0.02em] text-[#101014] [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <span aria-hidden="true" className="text-xl text-[#0071e3]">+</span>
              </summary>
              <p className="mt-3 text-[15px] leading-6 text-[#626267]">{item.answer}</p>
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
    <footer className="bg-[#fbfbfd] text-[#101014]">
      <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-10">
        <div className="grid gap-10 border-t border-black/10 pt-10 lg:grid-cols-[1.08fr_1.92fr_0.9fr]">
          <div>
            <h2 className="text-[34px] font-black tracking-[-0.08em]">B2B2G</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#626267]">
              A global B2B commerce home for verified supply, protected demand, events, and market services.
            </p>
          </div>
          <div className="grid gap-7 sm:grid-cols-4">
            {columns.map(([title, ...items]) => (
              <nav aria-label={title} key={title}>
                <h3 className="text-xs font-black text-[#101014]">{title}</h3>
                <div className="mt-3 grid gap-2">
                  {items.map((item) => (
                    <button className="w-fit text-left text-xs font-semibold text-[#73737a] disabled:cursor-not-allowed" disabled key={item} type="button">
                      {item}
                    </button>
                  ))}
                </div>
              </nav>
            ))}
          </div>
          <div className="rounded-[28px] bg-white p-5 shadow-[0_16px_50px_rgb(15_23_42/0.05)] ring-1 ring-black/[0.04]">
            <h3 className="text-sm font-black">Trade brief</h3>
            <p className="mt-2 text-sm leading-6 text-[#626267]">Product, event, and service updates for marketplace teams.</p>
            <form className="mt-5 grid gap-2">
              <input className="min-h-11 min-w-0 rounded-full border border-black/10 bg-[#f5f5f7] px-4 text-sm outline-none" disabled placeholder="Work email" type="email" />
              <button className="min-h-11 rounded-full bg-[#0071e3] px-4 text-sm font-black text-white disabled:cursor-not-allowed" disabled type="button">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-black/10 pt-6 text-xs text-[#73737a] md:flex-row md:items-center md:justify-between">
          <span>© 2026 B2B2G. Buyer identity data is protected by platform policy.</span>
          <span>Privacy · Terms · Language</span>
        </div>
      </div>
    </footer>
  );
}

export function MarketplaceHome({ config }: Readonly<{ config: MarketplaceHomeConfig }>) {
  return (
    <div className="overflow-x-hidden bg-[#f5f5f7] text-[#101014]">
      <div className="mx-auto grid max-w-[1440px] gap-20 px-4 pb-20 pt-4 sm:px-6 lg:px-10">
        <CommerceHero config={config} />
        <FeaturedProducts products={config.premiumProducts} />
        <RequestEventGrid events={config.events} requests={config.buyerRequests} />
        <ServiceLanes />
        <ShowcaseBuyers buyers={config.verifiedBuyers} showcases={config.showcases} />
        <LatestProducts products={config.latestProducts} />
        <UpdatesAndFaq announcements={config.announcements} faqs={config.faqs} />
      </div>
      <MarketplaceFooter />
    </div>
  );
}
