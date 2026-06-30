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

const ROLE_PATHWAYS = [
  {
    cta: "Supplier signup",
    description: "Apply, receive approval, and prepare company and product exposure.",
    href: "/signup/supplier",
    key: "supplier",
    label: "Supplier",
  },
  {
    cta: "Agent application",
    description: "Build a protected buyer network and manage assigned relationships.",
    href: "/signup/agent",
    key: "agent",
    label: "Agent",
  },
  {
    cta: "Buyer onboarding",
    description: "Join through invited workflows and submit structured buying demand.",
    href: "/signup/buyer",
    key: "buyer",
    label: "Buyer",
  },
  {
    cta: "Professor invite",
    description: "Prepare program-based onboarding and managed innovation teams.",
    href: "/signup/professor",
    key: "professor",
    label: "Professor",
  },
];

const TRUST_SIGNALS = [
  "Verified supplier exposure",
  "Masked buyer demand",
  "Admin brokerage workflow",
  "Role-based onboarding",
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

function SectionTitle({
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
    <div className="mb-5 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.12em] text-[#0b63ce]">{eyebrow}</p>
        ) : null}
        <h2 className="text-[30px] font-black leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-[44px]">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-3 max-w-2xl text-[16px] leading-7 text-slate-600">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? (
        <ActionLink
          className="inline-flex h-11 w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-bold text-[#0b63ce] shadow-sm transition hover:-translate-y-0.5 hover:border-[#0b63ce]/30 disabled:cursor-not-allowed disabled:opacity-60"
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
  compact = false,
  item,
  priority = false,
}: Readonly<{
  compact?: boolean;
  item: MarketplaceHomeProduct;
  priority?: boolean;
}>) {
  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_60px_rgb(15_23_42/0.07)] transition hover:-translate-y-1 hover:shadow-[0_30px_80px_rgb(15_23_42/0.12)]">
      <div className="relative aspect-square w-full overflow-hidden bg-[#edf5ff]">
        <Image
          alt={item.imageAlt}
          className="object-cover transition duration-500 group-hover:scale-[1.035]"
          fill
          priority={priority}
          sizes={compact ? "(max-width: 768px) 90vw, 330px" : "(max-width: 768px) 90vw, 360px"}
          src={item.imageUrl}
        />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/88 px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#0b63ce] backdrop-blur">
            {item.category}
          </span>
          {item.isVerifiedSupplier ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#063b7a] px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-white">
              <ShieldCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Verified
            </span>
          ) : null}
        </div>
        <button
          aria-label={`Save interest for ${item.title}`}
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/70 bg-white/88 text-lg font-black text-[#0b63ce] backdrop-blur transition hover:bg-white"
          type="button"
        >
          <span aria-hidden="true">♡</span>
        </button>
      </div>
      <div className="flex min-h-[258px] flex-1 flex-col p-5">
        <span className="min-w-0 truncate text-sm font-bold text-slate-500">{item.supplierName}</span>
        <h3 className="mt-3 line-clamp-2 min-h-[58px] text-[21px] font-black leading-tight tracking-[-0.035em] text-slate-950">
          {item.title}
        </h3>
        <p className="mt-3 line-clamp-3 min-h-[72px] text-[15px] leading-6 text-slate-600">{item.description}</p>
        <Link
          className="mt-auto inline-flex h-11 w-full items-center justify-center rounded-full bg-[#0b63ce] px-5 text-sm font-black text-white shadow-[0_16px_34px_rgb(11_99_206/0.22)] transition hover:bg-[#0957b6]"
          href={item.href}
        >
          {item.ctaLabel}
        </Link>
      </div>
    </article>
  );
}

function IntroPanel({ products }: Readonly<{ products: MarketplaceHomeProduct[] }>) {
  const heroProduct = products[0];

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)]">
      <div className="min-w-0 rounded-[34px] border border-slate-200 bg-white p-7 shadow-[0_24px_80px_rgb(15_23_42/0.08)] sm:p-9">
        <p className="text-sm font-black uppercase tracking-[0.14em] text-[#0b63ce]">Global Trade Operating System</p>
        <h1 className="mt-5 max-w-3xl break-words text-[36px] font-black leading-[0.96] tracking-[-0.065em] text-slate-950 sm:text-[62px]">
          Brokered B2B commerce for serious global trade.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          B2B2G connects approved suppliers, masked buyer demand, agent networks, events, FDA services, and innovation showcases in one controlled marketplace.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {TRUST_SIGNALS.map((item) => (
            <div className="rounded-2xl border border-slate-200 bg-[#f8fbff] px-4 py-3 text-sm font-bold text-slate-700" key={item}>
              {item}
            </div>
          ))}
        </div>
      </div>
      <div className="grid min-w-0 gap-5 sm:grid-cols-2">
        <ProductCard item={heroProduct} priority />
        <div className="grid gap-5">
          <div className="min-w-0 rounded-[30px] border border-[#cde2ff] bg-[#0b63ce] p-6 text-white shadow-[0_24px_70px_rgb(11_99_206/0.22)]">
            <p className="text-sm font-black uppercase tracking-[0.14em] text-white/70">Protected RFQ</p>
            <h2 className="mt-4 break-words text-[26px] font-black leading-[1.02] tracking-[-0.05em] sm:text-3xl">
              Buyer demand without exposing buyer contact data.
            </h2>
            <p className="mt-4 text-[15px] leading-6 text-white/78">
              Public cards show demand quality, not private identities.
            </p>
          </div>
          <div className="min-w-0 rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgb(15_23_42/0.07)]">
            <p className="text-sm font-black uppercase tracking-[0.14em] text-[#0b63ce]">Next gates</p>
            <div className="mt-4 grid gap-3 text-sm font-bold text-slate-700">
              <span>Supplier approval</span>
              <span>Company setup</span>
              <span>Product approval</span>
              <span>Brokered inquiry</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BuyerRequests({ items }: Readonly<{ items: MarketplaceHomeRequest[] }>) {
  return (
    <section className="h-full min-w-0 rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgb(15_23_42/0.07)]">
      <SectionTitle
        eyebrow="Buyer demand"
        subtitle="Buyer identity remains masked while demand quality stays scannable."
        title="Product requests"
      />
      <div className="grid gap-3">
        {items.slice(0, 4).map((item) => (
          <article className="grid min-h-[104px] grid-cols-[72px_minmax(0,1fr)_auto] gap-4 rounded-[22px] border border-slate-100 bg-[#fbfdff] p-3" key={item.id}>
            <div className="relative overflow-hidden rounded-2xl bg-[#eef5ff]">
              {item.imageUrl ? (
                <Image alt={item.imageAlt ?? item.title} className="object-cover" fill sizes="72px" src={item.imageUrl} />
              ) : null}
            </div>
            <div>
              <h3 className="line-clamp-1 text-base font-black text-slate-950">{item.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">{item.spec}</p>
              <span className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500">
                {item.quantity}
              </span>
            </div>
            <strong className="h-fit rounded-full bg-[#e9f3ff] px-3 py-1 text-xs font-black text-[#0b63ce]">
              {item.badge}
            </strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function EventSchedule({ items }: Readonly<{ items: MarketplaceHomeEvent[] }>) {
  return (
    <section className="h-full min-w-0 rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgb(15_23_42/0.07)]">
      <SectionTitle eyebrow="Programs" subtitle="Curated event and service entry points." title="Events and services" />
      <div className="grid gap-3">
        {items.slice(0, 3).map((item) => (
          <article className="grid min-h-[110px] grid-cols-[112px_minmax(0,1fr)] gap-4 rounded-[22px] border border-slate-100 bg-[#fbfdff] p-3" key={item.id}>
            <div className="relative overflow-hidden rounded-2xl bg-[#eef5ff]">
              <Image alt={item.imageAlt} className="object-cover" fill sizes="112px" src={item.imageUrl} />
            </div>
            <div>
              <time className="text-xs font-black text-[#0b63ce]">{item.dateLabel}</time>
              <h3 className="mt-1 text-base font-black leading-tight text-slate-950">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{item.locationLabel}</p>
              <span className="mt-2 inline-flex rounded-full bg-[#e9f3ff] px-3 py-1 text-xs font-black text-[#0b63ce]">
                {item.badge}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function RolePathways() {
  return (
    <section className="min-w-0 rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_22px_76px_rgb(15_23_42/0.07)] sm:p-8">
      <SectionTitle
        eyebrow="Role gateways"
        subtitle="Each role has a controlled entry path, approval boundary, and next operating state."
        title="Start from the right marketplace role"
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {ROLE_PATHWAYS.map((item) => (
          <Link
            className="group rounded-[26px] border border-slate-200 bg-[#f8fbff] p-5 transition hover:-translate-y-1 hover:border-[#0b63ce]/30 hover:bg-white hover:shadow-[0_18px_60px_rgb(15_23_42/0.08)]"
            href={item.href}
            key={item.key}
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#0b63ce] text-sm font-black uppercase text-white">
              {item.label.slice(0, 1)}
            </span>
            <h3 className="mt-5 text-2xl font-black tracking-[-0.05em] text-slate-950">{item.label}</h3>
            <p className="mt-3 min-h-[72px] text-[15px] leading-6 text-slate-600">{item.description}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#0b63ce]">
              {item.cta}
              <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function AdvertisingRow({ items }: Readonly<{ items: MarketplaceHomeConfig["adBanners"] }>) {
  return (
    <section className="grid gap-5 lg:grid-cols-2">
      {items.map((item) => (
        <article className="overflow-hidden rounded-[34px] border border-[#cfe3ff] bg-[linear-gradient(135deg,#ffffff_0%,#edf6ff_100%)] p-7 shadow-[0_22px_76px_rgb(15_23_42/0.07)]" key={item.id}>
          <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.1em] text-[#0b63ce] shadow-sm">
            Premium exposure
          </span>
          <h2 className="mt-5 max-w-2xl text-[30px] font-black leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-[40px]">
            {item.title}
          </h2>
          <p className="mt-4 max-w-xl text-[16px] leading-7 text-slate-600">{item.description}</p>
          <ActionLink className="mt-7 inline-flex h-12 w-fit items-center rounded-full bg-[#0b63ce] px-6 text-sm font-black text-white shadow-[0_16px_34px_rgb(11_99_206/0.22)]" item={item.cta}>
            {item.cta.label}
          </ActionLink>
        </article>
      ))}
    </section>
  );
}

function Showcase({ items }: Readonly<{ items: MarketplaceHomeShowcase[] }>) {
  return (
    <section className="h-full min-w-0 rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_22px_76px_rgb(15_23_42/0.07)]">
      <SectionTitle
        eyebrow="Innovation gallery"
        subtitle="Visual project and product cards prepared for global exposure."
        title="Innovation Showcase"
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {items.slice(0, 3).map((item) => (
          <Link className="group" href={item.href} key={item.id}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[26px] bg-[#eef5ff]">
              <Image alt={item.imageAlt} className="object-cover transition duration-500 group-hover:scale-[1.035]" fill sizes="(max-width: 768px) 90vw, 260px" src={item.imageUrl} />
            </div>
            <span className="mt-4 inline-flex rounded-full bg-[#e9f3ff] px-3 py-1 text-xs font-black text-[#0b63ce]">
              {item.category}
            </span>
            <h3 className="mt-3 line-clamp-2 text-xl font-black tracking-[-0.035em] text-slate-950">{item.title}</h3>
            <p className="mt-1 text-sm font-bold text-slate-500">{item.companyName}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function VerifiedBuyers({ items }: Readonly<{ items: MarketplaceHomeBuyer[] }>) {
  return (
    <section className="h-full min-w-0 rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_22px_76px_rgb(15_23_42/0.07)]">
      <SectionTitle subtitle="Masked buyer profiles for protected marketplace demand." title="Verified buyers" />
      <div className="grid gap-3">
        {items.slice(0, 5).map((item) => (
          <article className="grid min-h-[76px] grid-cols-[44px_minmax(0,1fr)_24px] items-center gap-3 rounded-[22px] border border-slate-100 bg-[#fbfdff] p-3" key={item.id}>
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[#e9f3ff] text-sm font-black text-[#0b63ce]">
              {item.avatarLabel}
            </span>
            <div>
              <h3 className="text-sm font-black text-slate-950">{item.companyName}</h3>
              <p className="text-sm text-slate-600">{item.role}</p>
              <span className="text-xs font-bold text-slate-400">{item.country}</span>
            </div>
            <ShieldCheckIcon className="h-5 w-5 text-[#0b63ce]" aria-hidden="true" />
          </article>
        ))}
      </div>
    </section>
  );
}

function Announcements({ items }: Readonly<{ items: MarketplaceHomeAnnouncement[] }>) {
  return (
    <section className="min-w-0 rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_22px_76px_rgb(15_23_42/0.07)]">
      <SectionTitle title="Announcements" />
      <div className="grid gap-3">
        {items.map((item) => (
          <Link className="grid grid-cols-[76px_minmax(0,1fr)] gap-4 rounded-[22px] border border-slate-100 bg-[#fbfdff] p-3 transition hover:bg-white" href={item.href} key={item.id}>
            <time className="grid min-h-[68px] place-items-center rounded-2xl bg-[#e9f3ff] text-center text-xs font-black text-[#0b63ce]">
              {item.dateLabel}
            </time>
            <div>
              <span className="text-xs font-black uppercase tracking-[0.08em] text-[#0b63ce]">{item.statusLabel}</span>
              <h3 className="mt-1 text-base font-black text-slate-950">{item.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Faq({ items }: Readonly<{ items: MarketplaceHomeFaq[] }>) {
  return (
    <section className="min-w-0 rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_22px_76px_rgb(15_23_42/0.07)]">
      <SectionTitle title="FAQ" />
      <div className="grid gap-2">
        {items.map((item) => (
          <details className="rounded-[22px] border border-slate-100 bg-[#fbfdff] px-4 py-4" key={item.id}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-black tracking-[-0.02em] text-slate-950 [&::-webkit-details-marker]:hidden">
              <span>{item.question}</span>
              <span aria-hidden="true" className="text-xl text-[#0b63ce]">+</span>
            </summary>
            <p className="mt-3 text-[15px] leading-6 text-slate-600">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  const footerGroups = [
    ["Marketplace", "Commercial", "Industrial", "EPC", "BUY & SELL"],
    ["Company", "Events", "Announcements", "Networking", "Service"],
    ["Resources", "Thailand FDA Service", "FAQ", "Support", "Login"],
    ["Roles", "Supplier", "Agent", "Buyer", "Professor"],
  ];

  return (
    <footer className="border-t border-slate-200 bg-[#061120] text-white">
      <div className="mx-auto grid max-w-[1380px] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_1.45fr_0.9fr] lg:px-10">
        <div>
          <h2 className="text-3xl font-black tracking-[-0.07em]">B2B2G</h2>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/62">
            Global trade operating system for verified suppliers, protected buyer demand, brokerage workflows, events, and premium exposure.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-4">
          {footerGroups.map(([group, ...links]) => (
            <nav aria-label={group} key={group}>
              <h3 className="text-sm font-black text-white">{group}</h3>
              <div className="mt-4 grid gap-2">
                {links.map((link) => (
                  <button className="w-fit text-left text-xs font-bold text-white/55 disabled:cursor-not-allowed" disabled key={link} type="button">
                    {link}
                  </button>
                ))}
              </div>
            </nav>
          ))}
        </div>
        <div>
          <h3 className="text-sm font-black">Marketplace memo</h3>
          <p className="mt-4 text-sm leading-6 text-white/62">Updates on supplier exposure, buyer demand, events, and service gateways.</p>
          <form className="mt-5 flex gap-2">
            <input className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/10 px-4 text-sm text-white outline-none placeholder:text-white/38" disabled placeholder="Enter your email" type="email" />
            <button className="rounded-full bg-white px-4 text-sm font-black text-[#0b63ce] disabled:cursor-not-allowed" disabled type="button">
              Submit
            </button>
          </form>
        </div>
        <div className="border-t border-white/12 pt-6 text-xs text-white/48 lg:col-span-3">
          © 2026 B2B2G. Buyer contact data is protected by platform policy.
        </div>
      </div>
    </footer>
  );
}

export function MarketplaceHome({ config }: Readonly<{ config: MarketplaceHomeConfig }>) {
  return (
    <div className="overflow-x-hidden bg-[linear-gradient(180deg,#f4f8ff_0%,#ffffff_30%,#f6f8fb_100%)] text-slate-950">
      <div className="mx-auto grid max-w-[1380px] gap-8 px-5 pb-16 pt-7 sm:px-8 lg:px-10">
        <IntroPanel products={config.premiumProducts} />

        <section>
          <SectionTitle
            action={{ href: "/suppliers", isEnabled: false, label: "View all suppliers" }}
            eyebrow="Premium products"
            subtitle="Approved supplier placements with consistent product cards and brokered inquiry readiness."
            title="Supplier products built for global sourcing"
          />
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {config.premiumProducts.slice(1, 5).map((item, index) => (
              <ProductCard item={item} key={item.id} priority={index < 2} />
            ))}
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.92fr)]">
          <BuyerRequests items={config.buyerRequests} />
          <EventSchedule items={config.events} />
        </div>

        <RolePathways />
        <AdvertisingRow items={config.adBanners} />

        <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
          <Showcase items={config.showcases} />
          <VerifiedBuyers items={config.verifiedBuyers} />
        </div>

        <section>
          <SectionTitle
            action={{ href: "/products", isEnabled: false, label: "View all products" }}
            eyebrow="New in marketplace"
            subtitle="Fresh product listings prepared for structured global discovery."
            title="Latest products"
          />
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {config.latestProducts.slice(0, 8).map((item) => (
              <ProductCard compact item={item} key={item.id} />
            ))}
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.85fr)]">
          <Announcements items={config.announcements} />
          <Faq items={config.faqs} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
