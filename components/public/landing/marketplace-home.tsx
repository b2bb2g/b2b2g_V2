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

const CATEGORY_TABS = ["Commercial", "Industrial", "EPC", "Events", "BUY & SELL", "Networking", "Service"];

const COMMERCE_PROOF = [
  "Verified supplier catalog",
  "Masked buyer requests",
  "Admin-brokered inquiry",
  "Global service desk",
];

const ROLE_ENTRY_POINTS = [
  {
    description: "Apply for supplier approval, then prepare company profile, products, and premium exposure.",
    href: "/signup/supplier",
    label: "Supplier",
    meta: "Company and product growth",
  },
  {
    description: "Submit buyer demand through protected RFQ workflows and agent-supported onboarding.",
    href: "/signup/buyer",
    label: "Buyer",
    meta: "Protected sourcing",
  },
  {
    description: "Build assigned buyer networks and prepare invitation-based buyer onboarding.",
    href: "/signup/agent",
    label: "Agent",
    meta: "Network operation",
  },
  {
    description: "Join invitation-based programs and prepare controlled innovation showcase pathways.",
    href: "/signup/professor",
    label: "Professor",
    meta: "Program operation",
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
  align = "left",
  eyebrow,
  subtitle,
  title,
}: Readonly<{
  action?: CtaLink;
  align?: "center" | "left";
  eyebrow?: string;
  subtitle?: string;
  title: string;
}>) {
  return (
    <div className={`mb-8 ${align === "center" ? "mx-auto max-w-4xl text-center" : "max-w-4xl"}`}>
      {eyebrow ? (
        <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#2563eb]">{eyebrow}</p>
      ) : null}
      <h2 className="mt-3 text-[34px] font-black leading-[0.98] tracking-[-0.065em] text-[#0b1220] md:text-[56px]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 text-[17px] leading-8 text-slate-600 md:text-[19px]">{subtitle}</p>
      ) : null}
      {action ? (
        <ActionLink
          className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-[#2563eb] px-6 text-sm font-black text-white shadow-[0_16px_36px_rgb(37_99_235/0.22)] transition hover:-translate-y-0.5 hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
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
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-[0_18px_60px_rgb(15_23_42/0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_rgb(15_23_42/0.11)]">
      <div className="relative aspect-square overflow-hidden bg-[#f3f7fc]">
        <Image
          alt={item.imageAlt}
          className="object-cover transition duration-700 group-hover:scale-[1.035]"
          fill
          priority={priority}
          sizes="(max-width: 768px) 92vw, (max-width: 1200px) 42vw, 320px"
          src={item.imageUrl}
        />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/92 px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#2563eb] backdrop-blur">
            {item.category}
          </span>
          {item.isVerifiedSupplier ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#0b1220] px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-white">
              <ShieldCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Verified
            </span>
          ) : null}
        </div>
        <button
          aria-label={`Save interest for ${item.title}`}
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/70 bg-white/92 text-lg font-black text-[#2563eb] backdrop-blur"
          type="button"
        >
          <span aria-hidden="true">♡</span>
        </button>
      </div>
      <div className="flex min-h-[244px] flex-1 flex-col p-5">
        <span className="truncate text-sm font-bold text-slate-500">{item.supplierName}</span>
        <h3 className="mt-3 line-clamp-2 min-h-[58px] text-[21px] font-black leading-tight tracking-[-0.04em] text-[#0b1220]">
          {item.title}
        </h3>
        <p className="mt-3 line-clamp-3 min-h-[72px] text-[15px] leading-6 text-slate-600">
          {item.description}
        </p>
        <Link
          className="mt-auto inline-flex h-11 w-full items-center justify-center rounded-full bg-[#2563eb] px-5 text-sm font-black text-white transition hover:bg-[#1d4ed8]"
          href={item.href}
        >
          {item.ctaLabel}
        </Link>
      </div>
    </article>
  );
}

function CommerceLead({ config }: Readonly<{ config: MarketplaceHomeConfig }>) {
  const leadProduct = config.premiumProducts[0];
  const secondProduct = config.premiumProducts[1];
  const leadRequest = config.buyerRequests[0];
  const leadEvent = config.events[0];

  return (
    <section className="grid gap-5 pt-3">
      <div className="mx-auto flex w-fit flex-wrap justify-center gap-2 rounded-full border border-slate-200 bg-white/88 p-1 shadow-[0_18px_60px_rgb(15_23_42/0.06)] backdrop-blur">
        {CATEGORY_TABS.map((item) => (
          <span className="rounded-full px-4 py-2 text-xs font-black text-slate-700" key={item}>
            {item}
          </span>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(420px,0.85fr)]">
        <article className="relative min-h-[620px] overflow-hidden rounded-[42px] border border-slate-200 bg-white shadow-[0_26px_90px_rgb(15_23_42/0.08)]">
          <Image
            alt={leadProduct.imageAlt}
            className="object-cover"
            fill
            priority
            sizes="(max-width: 1024px) 94vw, 760px"
            src={leadProduct.imageUrl}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(255_255_255/0.96),rgb(255_255_255/0.72)_42%,rgb(8_18_32/0.54)_100%)]" />
          <div className="relative flex min-h-[620px] flex-col justify-between p-7 md:p-11">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#2563eb]">B2B commerce, brokered safely</p>
              <h1 className="mt-5 max-w-3xl text-[46px] font-black leading-[0.92] tracking-[-0.085em] text-[#0b1220] md:text-[82px]">
                Global trade, beautifully organized.
              </h1>
              <p className="mt-6 max-w-2xl text-[18px] leading-8 text-slate-700 md:text-[21px]">
                A premium marketplace home for verified products, protected buyer demand, events, and service pathways.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              {COMMERCE_PROOF.map((item) => (
                <div className="rounded-[24px] border border-white/40 bg-white/82 p-4 text-sm font-black text-[#0b1220] shadow-[0_14px_36px_rgb(15_23_42/0.08)] backdrop-blur" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </article>

        <div className="grid gap-5">
          <article className="overflow-hidden rounded-[42px] border border-slate-200 bg-[#f8fbff] shadow-[0_26px_90px_rgb(15_23_42/0.08)]">
            <div className="relative aspect-[1.55/1] bg-[#eef5ff]">
              <Image
                alt={secondProduct.imageAlt}
                className="object-cover"
                fill
                priority
                sizes="(max-width: 1024px) 94vw, 460px"
                src={secondProduct.imageUrl}
              />
            </div>
            <div className="p-6">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#2563eb]">Premium supplier</p>
              <h2 className="mt-3 text-[30px] font-black leading-none tracking-[-0.06em] text-[#0b1220]">
                {secondProduct.title}
              </h2>
              <p className="mt-3 text-[15px] leading-6 text-slate-600">{secondProduct.description}</p>
              <Link className="mt-5 inline-flex h-11 items-center rounded-full bg-[#2563eb] px-5 text-sm font-black text-white" href={secondProduct.href}>
                Inquire Now
              </Link>
            </div>
          </article>

          <div className="grid gap-5 sm:grid-cols-2">
            <article className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgb(15_23_42/0.07)]">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#2563eb]">Protected RFQ</p>
              <h2 className="mt-3 text-[26px] font-black leading-none tracking-[-0.055em] text-[#0b1220]">
                {leadRequest.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{leadRequest.spec}</p>
              <span className="mt-4 inline-flex rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-black text-[#2563eb]">
                {leadRequest.quantity}
              </span>
            </article>
            <article className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgb(15_23_42/0.07)]">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0f766e]">Trade event</p>
              <h2 className="mt-3 text-[26px] font-black leading-none tracking-[-0.055em] text-[#0b1220]">
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

function PremiumProducts({ products }: Readonly<{ products: MarketplaceHomeProduct[] }>) {
  return (
    <section className="rounded-[46px] bg-white px-5 py-10 shadow-[0_26px_90px_rgb(15_23_42/0.07)] md:px-8 md:py-14">
      <SectionHeader
        action={{ href: "/products", isEnabled: false, label: "Browse products" }}
        align="center"
        eyebrow="Premium suppliers"
        subtitle="Product cards use the same information rhythm across the marketplace: image, supplier, trust signal, description, and brokered inquiry CTA."
        title="Products first. Noise last."
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {products.slice(1, 5).map((item, index) => (
          <ProductCard item={item} key={item.id} priority={index < 2} />
        ))}
      </div>
    </section>
  );
}

function RequestEventPanel({
  events,
  requests,
}: Readonly<{
  events: MarketplaceHomeEvent[];
  requests: MarketplaceHomeRequest[];
}>) {
  return (
    <section className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-[42px] border border-slate-200 bg-white p-6 shadow-[0_22px_80px_rgb(15_23_42/0.07)] md:p-8">
        <SectionHeader
          eyebrow="Buyer demand"
          subtitle="RFQ cards expose sourcing context while keeping buyer identity protected."
          title="Buyer product requests"
        />
        <div className="grid gap-3">
          {requests.slice(0, 3).map((item) => (
            <article className="grid grid-cols-[72px_minmax(0,1fr)_auto] gap-4 rounded-[26px] bg-[#f7faff] p-3" key={item.id}>
              <div className="relative overflow-hidden rounded-2xl bg-[#eef5ff]">
                {item.imageUrl ? (
                  <Image alt={item.imageAlt ?? item.title} className="object-cover" fill sizes="72px" src={item.imageUrl} />
                ) : null}
              </div>
              <div className="min-w-0">
                <h3 className="line-clamp-1 text-base font-black text-[#0b1220]">{item.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">{item.spec}</p>
                <p className="mt-2 text-xs font-bold text-slate-500">{item.quantity}</p>
              </div>
              <strong className="h-fit rounded-full bg-white px-3 py-1 text-xs font-black text-[#2563eb]">
                {item.badge}
              </strong>
            </article>
          ))}
        </div>
        <p className="mt-5 rounded-[22px] bg-[#eff6ff] px-4 py-3 text-sm font-bold leading-6 text-[#1d4ed8]">
          Buyer company and contact information stays masked on public surfaces.
        </p>
      </div>

      <div className="rounded-[42px] border border-slate-200 bg-white p-6 shadow-[0_22px_80px_rgb(15_23_42/0.07)] md:p-8">
        <SectionHeader
          eyebrow="Events"
          subtitle="A curated schedule for sourcing, compliance, and global trade programs."
          title="Trade calendar"
        />
        <div className="grid gap-3">
          {events.slice(0, 3).map((item) => (
            <article className="grid grid-cols-[116px_minmax(0,1fr)] gap-4 rounded-[26px] bg-[#f7faff] p-3" key={item.id}>
              <div className="relative min-h-[108px] overflow-hidden rounded-2xl bg-[#eef5ff]">
                <Image alt={item.imageAlt} className="object-cover" fill sizes="116px" src={item.imageUrl} />
              </div>
              <div className="min-w-0">
                <time className="text-xs font-black uppercase tracking-[0.1em] text-[#0f766e]">{item.dateLabel}</time>
                <h3 className="mt-2 line-clamp-2 text-base font-black leading-tight text-[#0b1220]">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{item.locationLabel}</p>
                <span className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-[#0f766e]">
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

function RoleSystem() {
  return (
    <section className="rounded-[46px] bg-[#0b1220] px-5 py-10 text-white shadow-[0_26px_90px_rgb(15_23_42/0.12)] md:px-8 md:py-14">
      <SectionHeader
        align="center"
        eyebrow="Role-based commerce"
        subtitle="Each user enters a controlled path, keeping approval, privacy, and brokerage rules intact."
        title="One marketplace. Separate operating lanes."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {ROLE_ENTRY_POINTS.map((item) => (
          <Link
            className="group rounded-[32px] border border-white/10 bg-white/[0.06] p-6 transition hover:-translate-y-1 hover:bg-white/[0.10]"
            href={item.href}
            key={item.label}
          >
            <span className="text-xs font-black uppercase tracking-[0.16em] text-[#93c5fd]">{item.meta}</span>
            <h3 className="mt-4 text-[30px] font-black tracking-[-0.06em] text-white">{item.label}</h3>
            <p className="mt-3 min-h-[96px] text-[15px] leading-6 text-white/64">{item.description}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#93c5fd]">
              Start path
              <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ExposureStrip({ items }: Readonly<{ items: MarketplaceHomeConfig["adBanners"] }>) {
  return (
    <section className="grid gap-5 lg:grid-cols-2">
      {items.slice(0, 2).map((item, index) => (
        <article
          className={`rounded-[42px] border p-8 shadow-[0_22px_80px_rgb(15_23_42/0.07)] ${
            index === 0 ? "border-[#bfdbfe] bg-[#eff6ff]" : "border-[#bbf7d0] bg-[#f0fdf4]"
          }`}
          key={item.id}
        >
          <p className={`text-xs font-black uppercase tracking-[0.16em] ${index === 0 ? "text-[#2563eb]" : "text-[#15803d]"}`}>
            Premium exposure
          </p>
          <h2 className="mt-4 max-w-2xl text-[36px] font-black leading-[0.98] tracking-[-0.065em] text-[#0b1220] md:text-[54px]">
            {item.title}
          </h2>
          <p className="mt-4 max-w-xl text-[17px] leading-8 text-slate-600">{item.description}</p>
          <ActionLink
            className="mt-7 inline-flex h-12 items-center rounded-full bg-[#0b1220] px-6 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
            item={item.cta}
          >
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
    <section className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.32fr)_minmax(360px,0.68fr)]">
      <div className="rounded-[42px] border border-slate-200 bg-white p-6 shadow-[0_22px_80px_rgb(15_23_42/0.07)] md:p-8">
        <SectionHeader
          eyebrow="Product showcase"
          subtitle="Image-led product and project cards for future marketplace storytelling."
          title="Innovation, ready to be discovered."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {showcases.slice(0, 3).map((item) => (
            <Link className="group min-w-0" href={item.href} key={item.id}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[30px] bg-[#eef5ff]">
                <Image
                  alt={item.imageAlt}
                  className="object-cover transition duration-700 group-hover:scale-[1.035]"
                  fill
                  sizes="(max-width: 768px) 92vw, 260px"
                  src={item.imageUrl}
                />
              </div>
              <span className="mt-4 inline-flex rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-black text-[#2563eb]">
                {item.category}
              </span>
              <h3 className="mt-3 line-clamp-2 text-xl font-black tracking-[-0.04em] text-[#0b1220]">{item.title}</h3>
              <p className="mt-1 text-sm font-bold text-slate-500">{item.companyName}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-[42px] border border-slate-200 bg-white p-6 shadow-[0_22px_80px_rgb(15_23_42/0.07)] md:p-8">
        <SectionHeader
          eyebrow="Buyer network"
          subtitle="Proof of demand without public contact exposure."
          title="Verified buyers"
        />
        <div className="grid gap-3">
          {buyers.slice(0, 4).map((item) => (
            <article className="grid grid-cols-[48px_minmax(0,1fr)_24px] items-center gap-3 rounded-[26px] bg-[#f7faff] p-3" key={item.id}>
              <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-sm font-black text-[#2563eb]">
                {item.avatarLabel}
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-black text-[#0b1220]">{item.companyName}</h3>
                <p className="truncate text-sm text-slate-600">{item.role}</p>
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
        align="center"
        eyebrow="Latest products"
        subtitle="A calmer two-row grid for fresh product discovery with consistent card rhythm."
        title="New supply, presented clearly."
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {products.slice(0, 8).map((item) => (
          <ProductCard item={item} key={item.id} />
        ))}
      </div>
    </section>
  );
}

function KnowledgeSection({
  announcements,
  faqs,
}: Readonly<{
  announcements: MarketplaceHomeAnnouncement[];
  faqs: MarketplaceHomeFaq[];
}>) {
  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.85fr)]">
      <div className="rounded-[42px] border border-slate-200 bg-white p-6 shadow-[0_22px_80px_rgb(15_23_42/0.07)] md:p-8">
        <SectionHeader title="Announcements" />
        <div className="grid gap-3">
          {announcements.slice(0, 3).map((item) => (
            <Link className="grid grid-cols-[78px_minmax(0,1fr)] gap-4 rounded-[26px] bg-[#f7faff] p-3 transition hover:bg-[#eff6ff]" href={item.href} key={item.id}>
              <time className="grid min-h-[74px] place-items-center rounded-2xl bg-white text-center text-xs font-black text-[#2563eb]">
                {item.dateLabel}
              </time>
              <div className="min-w-0">
                <span className="text-xs font-black uppercase tracking-[0.1em] text-[#2563eb]">{item.statusLabel}</span>
                <h3 className="mt-1 line-clamp-1 text-base font-black text-[#0b1220]">{item.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="rounded-[42px] border border-slate-200 bg-white p-6 shadow-[0_22px_80px_rgb(15_23_42/0.07)] md:p-8">
        <SectionHeader title="FAQ" />
        <div className="grid gap-2">
          {faqs.slice(0, 4).map((item) => (
            <details className="rounded-[26px] bg-[#f7faff] px-4 py-4" key={item.id}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-black tracking-[-0.02em] text-[#0b1220] [&::-webkit-details-marker]:hidden">
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
    ["Shop", "Commercial", "Industrial", "EPC", "Latest products"],
    ["Trade", "RFQ Desk", "Buyer protection", "Admin brokerage", "Agent network"],
    ["Services", "Thailand FDA", "Events", "Supplier membership", "Verification"],
    ["Company", "About", "Announcements", "Support", "Language"],
  ];

  return (
    <footer className="bg-[#f5f5f7] text-[#1d1d1f]">
      <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-10">
        <div className="grid gap-10 border-t border-slate-200 pt-10 lg:grid-cols-[1.15fr_1.85fr_0.85fr]">
          <div>
            <h2 className="text-[34px] font-black tracking-[-0.08em]">B2B2G</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
              Global B2B commerce with verified supply, protected demand, and service workflows.
            </p>
          </div>
          <div className="grid gap-7 sm:grid-cols-4">
            {columns.map(([title, ...items]) => (
              <nav aria-label={title} key={title}>
                <h3 className="text-xs font-black text-[#1d1d1f]">{title}</h3>
                <div className="mt-3 grid gap-2">
                  {items.map((item) => (
                    <button className="w-fit text-left text-xs font-semibold text-slate-500 disabled:cursor-not-allowed" disabled key={item} type="button">
                      {item}
                    </button>
                  ))}
                </div>
              </nav>
            ))}
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-black">Marketplace updates</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">Product, event, and service notices for global trade teams.</p>
            <form className="mt-5 grid gap-2">
              <input className="min-h-11 min-w-0 rounded-full border border-slate-200 bg-[#f5f5f7] px-4 text-sm outline-none" disabled placeholder="Work email" type="email" />
              <button className="min-h-11 rounded-full bg-[#2563eb] px-4 text-sm font-black text-white disabled:cursor-not-allowed" disabled type="button">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <span>© 2026 B2B2G. Buyer contact data is protected by platform policy.</span>
          <span>Privacy · Terms · Language</span>
        </div>
      </div>
    </footer>
  );
}

export function MarketplaceHome({ config }: Readonly<{ config: MarketplaceHomeConfig }>) {
  return (
    <div className="overflow-x-hidden bg-[#f5f5f7] text-[#0b1220]">
      <div className="mx-auto grid max-w-[1440px] gap-16 px-4 pb-16 pt-4 sm:px-6 lg:px-10">
        <CommerceLead config={config} />
        <PremiumProducts products={config.premiumProducts} />
        <RequestEventPanel events={config.events} requests={config.buyerRequests} />
        <RoleSystem />
        <ExposureStrip items={config.adBanners} />
        <ShowcaseAndBuyers buyers={config.verifiedBuyers} showcases={config.showcases} />
        <LatestProducts products={config.latestProducts} />
        <KnowledgeSection announcements={config.announcements} faqs={config.faqs} />
      </div>
      <MarketplaceFooter />
    </div>
  );
}
