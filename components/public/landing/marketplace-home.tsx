import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRightIcon,
  SearchIcon,
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

export type MarketplaceHomeBanner = {
  badge: string;
  cta: CtaLink;
  description: string;
  id: string;
  imageAlt: string;
  imageUrl: string;
  title: string;
};

export type MarketplaceHomeRequest = {
  badge: string;
  id: string;
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
  searchPlaceholder: string;
  banners: MarketplaceHomeBanner[];
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
          <p className="mb-2 text-sm font-semibold text-[#0066cc]">{eyebrow}</p>
        ) : null}
        <h2 className="text-[28px] font-semibold leading-tight tracking-[-0.03em] text-slate-950 sm:text-[36px]">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-[15px] leading-6 text-slate-600 sm:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? (
        <ActionLink
          className="inline-flex h-10 w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-[#0066cc] shadow-sm transition hover:-translate-y-0.5 hover:border-[#0066cc]/30 disabled:cursor-not-allowed disabled:opacity-60"
          item={action}
        >
          {action.label}
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </ActionLink>
      ) : null}
    </div>
  );
}

function MarketplaceSearch({ placeholder }: Readonly<{ placeholder: string }>) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white/90 p-4 shadow-[0_22px_70px_rgb(15_23_42/0.08)] backdrop-blur sm:p-5">
      <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)_150px]">
        <label className="sr-only" htmlFor="marketplace-category">Category</label>
        <select
          className="h-[52px] rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[15px] font-semibold text-slate-700 outline-none"
          defaultValue="all"
          disabled
          id="marketplace-category"
        >
          <option value="all">All Categories</option>
        </select>
        <div className="flex h-[52px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-500">
          <SearchIcon className="h-5 w-5 shrink-0 text-[#0066cc]" aria-hidden="true" />
          <input
            className="min-w-0 flex-1 bg-transparent text-[15px] font-medium outline-none placeholder:text-slate-400"
            disabled
            placeholder={placeholder}
            type="search"
          />
        </div>
        <button
          className="h-[52px] rounded-2xl bg-[#0071e3] px-5 text-[15px] font-semibold text-white shadow-[0_16px_34px_rgb(0_113_227/0.24)] disabled:cursor-not-allowed disabled:opacity-80"
          disabled
          type="button"
        >
          Search
        </button>
      </div>
      <p className="mt-3 text-sm font-medium text-slate-500">
        Search is prepared for products, suppliers, and protected buyer requests.
      </p>
    </section>
  );
}

function BannerCard({ item, priority }: Readonly<{ item: MarketplaceHomeBanner; priority?: boolean }>) {
  return (
    <article className="grid min-h-[250px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_56px_rgb(15_23_42/0.07)] sm:grid-cols-[minmax(0,1fr)_190px]">
      <div className="flex flex-col justify-between p-6">
        <div>
          <span className="inline-flex rounded-full bg-[#eaf4ff] px-3 py-1 text-xs font-bold text-[#0066cc]">
            {item.badge}
          </span>
          <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.03em] text-slate-950">
            {item.title}
          </h2>
          <p className="mt-3 text-[15px] leading-6 text-slate-600">{item.description}</p>
        </div>
        <ActionLink
          className="mt-5 inline-flex h-10 w-fit items-center justify-center rounded-full bg-[#0071e3] px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgb(0_113_227/0.20)] disabled:cursor-not-allowed disabled:opacity-70"
          item={item.cta}
        >
          {item.cta.label}
        </ActionLink>
      </div>
      <div className="relative min-h-[180px] bg-[#eef5ff]">
        <Image
          alt={item.imageAlt}
          className="object-cover"
          fill
          priority={priority}
          sizes="(max-width: 768px) 80vw, 280px"
          src={item.imageUrl}
        />
      </div>
    </article>
  );
}

function ProductCard({ item, priority = false }: Readonly<{ item: MarketplaceHomeProduct; priority?: boolean }>) {
  return (
    <article className="flex min-h-[430px] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_42px_rgb(15_23_42/0.06)] transition hover:-translate-y-1 hover:shadow-[0_26px_70px_rgb(15_23_42/0.10)]">
      <div className="relative min-h-[220px] bg-[#f1f6ff]">
        <Image
          alt={item.imageAlt}
          className="object-cover"
          fill
          priority={priority}
          sizes="(max-width: 768px) 86vw, 280px"
          src={item.imageUrl}
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.04em] text-[#0066cc] backdrop-blur">
          {item.category}
        </span>
        <button
          aria-label={`Save interest for ${item.title}`}
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white/85 text-xl font-semibold text-[#0066cc] backdrop-blur"
          type="button"
        >
          <span aria-hidden="true">♡</span>
        </button>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex min-h-7 items-center justify-between gap-2 text-sm font-semibold text-slate-500">
          <span>{item.supplierName}</span>
          {item.isVerifiedSupplier ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0066cc]">
              <ShieldCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Verified
            </span>
          ) : null}
        </div>
        <h3 className="mt-3 text-xl font-semibold leading-tight tracking-[-0.02em] text-slate-950">
          {item.title}
        </h3>
        <p className="mt-3 min-h-[66px] text-[15px] leading-6 text-slate-600">{item.description}</p>
        <Link
          className="mt-auto inline-flex h-11 items-center justify-center rounded-full bg-[#0071e3] px-5 text-sm font-semibold text-white shadow-[0_14px_28px_rgb(0_113_227/0.20)]"
          href={item.href}
        >
          {item.ctaLabel}
        </Link>
      </div>
    </article>
  );
}

function BuyerRequests({ items }: Readonly<{ items: MarketplaceHomeRequest[] }>) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_56px_rgb(15_23_42/0.06)]">
      <SectionTitle
        subtitle="Buyer identity is protected and company details remain masked."
        title="Buyer product requests"
      />
      <div className="grid gap-3">
        {items.map((item) => (
          <article className="grid min-h-[82px] grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-slate-100 py-4 last:border-0" key={item.id}>
            <div>
              <h3 className="text-base font-semibold text-slate-950">{item.title}</h3>
              <p className="mt-1 text-sm leading-5 text-slate-600">{item.spec}</p>
              <span className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                {item.quantity}
              </span>
            </div>
            <strong className="h-fit rounded-full bg-[#eaf4ff] px-3 py-1 text-xs font-bold text-[#0066cc]">
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
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_56px_rgb(15_23_42/0.06)]">
      <SectionTitle subtitle="Curated trade events and marketplace programs." title="Event schedule" />
      <div className="grid gap-4">
        {items.slice(0, 3).map((item) => (
          <article className="grid min-h-[100px] grid-cols-[112px_minmax(0,1fr)] gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0" key={item.id}>
            <div className="relative overflow-hidden rounded-2xl bg-[#eef5ff]">
              <Image alt={item.imageAlt} className="object-cover" fill sizes="112px" src={item.imageUrl} />
            </div>
            <div>
              <time className="text-xs font-bold text-[#0066cc]">{item.dateLabel}</time>
              <h3 className="mt-1 text-base font-semibold leading-tight text-slate-950">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{item.locationLabel}</p>
              <span className="mt-2 inline-flex rounded-full bg-[#eaf4ff] px-3 py-1 text-xs font-bold text-[#0066cc]">
                {item.badge}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AdvertisingRow({ items }: Readonly<{ items: MarketplaceHomeConfig["adBanners"] }>) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {items.map((item) => (
        <article className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-white to-[#eef6ff] p-7 shadow-[0_18px_56px_rgb(15_23_42/0.06)]" key={item.id}>
          <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-[#0066cc] shadow-sm">
            Premium exposure
          </span>
          <h2 className="mt-5 text-[28px] font-semibold leading-tight tracking-[-0.03em] text-slate-950">
            {item.title}
          </h2>
          <p className="mt-3 max-w-xl text-[15px] leading-6 text-slate-600">{item.description}</p>
          <ActionLink className="mt-6 inline-flex h-11 w-fit items-center rounded-full bg-[#0071e3] px-5 text-sm font-semibold text-white" item={item.cta}>
            {item.cta.label}
          </ActionLink>
        </article>
      ))}
    </section>
  );
}

function Showcase({ items }: Readonly<{ items: MarketplaceHomeShowcase[] }>) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_56px_rgb(15_23_42/0.06)]">
      <SectionTitle
        eyebrow="Innovation gallery"
        subtitle="Image-led product and project cards prepared for global exposure."
        title="Innovation Showcase"
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <Link className="group" href={item.href} key={item.id}>
            <div className="relative min-h-[240px] overflow-hidden rounded-[22px] bg-[#eef5ff]">
              <Image alt={item.imageAlt} className="object-cover transition group-hover:scale-[1.03]" fill sizes="(max-width: 768px) 86vw, 260px" src={item.imageUrl} />
            </div>
            <span className="mt-4 inline-flex rounded-full bg-[#eaf4ff] px-3 py-1 text-xs font-bold text-[#0066cc]">
              {item.category}
            </span>
            <h3 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-slate-950">{item.title}</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">{item.companyName}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function VerifiedBuyers({ items }: Readonly<{ items: MarketplaceHomeBuyer[] }>) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_56px_rgb(15_23_42/0.06)]">
      <SectionTitle subtitle="Masked buyer profiles for protected marketplace demand." title="Verified buyers" />
      <div className="grid gap-3">
        {items.map((item) => (
          <article className="grid grid-cols-[44px_minmax(0,1fr)_24px] items-center gap-3 border-b border-slate-100 py-3 last:border-0" key={item.id}>
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[#eaf4ff] text-sm font-bold text-[#0066cc]">
              {item.avatarLabel}
            </span>
            <div>
              <h3 className="text-sm font-semibold text-slate-950">{item.companyName}</h3>
              <p className="text-sm text-slate-600">{item.role}</p>
              <span className="text-xs font-semibold text-slate-400">{item.country}</span>
            </div>
            <ShieldCheckIcon className="h-5 w-5 text-[#0066cc]" aria-hidden="true" />
          </article>
        ))}
      </div>
    </section>
  );
}

function Announcements({ items }: Readonly<{ items: MarketplaceHomeAnnouncement[] }>) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_56px_rgb(15_23_42/0.06)]">
      <SectionTitle title="Announcements" />
      <div className="grid gap-3">
        {items.map((item) => (
          <Link className="grid grid-cols-[72px_minmax(0,1fr)] gap-4 border-b border-slate-100 py-4 last:border-0" href={item.href} key={item.id}>
            <time className="grid min-h-[64px] place-items-center rounded-2xl bg-[#eaf4ff] text-center text-xs font-bold text-[#0066cc]">
              {item.dateLabel}
            </time>
            <div>
              <span className="text-xs font-bold text-[#0066cc]">{item.statusLabel}</span>
              <h3 className="mt-1 text-base font-semibold text-slate-950">{item.title}</h3>
              <p className="mt-1 text-sm leading-5 text-slate-600">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Faq({ items }: Readonly<{ items: MarketplaceHomeFaq[] }>) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_56px_rgb(15_23_42/0.06)]">
      <SectionTitle title="FAQ" />
      <div className="grid gap-2">
        {items.map((item) => (
          <details className="border-b border-slate-100 py-4 last:border-0" key={item.id}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-semibold tracking-[-0.01em] text-slate-950 [&::-webkit-details-marker]:hidden">
              <span>{item.question}</span>
              <span aria-hidden="true" className="text-[#0066cc]">+</span>
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
    ["Company", "About", "Events", "Announcements", "Networking"],
    ["Resources", "Thailand FDA Service", "FAQ", "Support", "Login"],
    ["Support", "Help Center", "Terms", "Privacy", "Language"],
  ];

  return (
    <footer className="bg-[#07111f] text-white">
      <div className="mx-auto grid max-w-[1320px] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1.1fr_1.4fr_0.9fr] lg:px-10">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">B2B2G</h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/64">
            A global B2B2G marketplace for verified suppliers, protected buyer demand, events, services, and premium exposure.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-4">
          {footerGroups.map(([group, ...links]) => (
            <nav aria-label={group} key={group}>
              <h3 className="text-sm font-semibold text-white">{group}</h3>
              <div className="mt-3 grid gap-2">
                {links.map((link) => (
                  <button className="w-fit text-left text-xs font-medium text-white/58 disabled:cursor-not-allowed" disabled key={link} type="button">
                    {link}
                  </button>
                ))}
              </div>
            </nav>
          ))}
        </div>
        <div>
          <h3 className="text-sm font-semibold">Newsletter</h3>
          <p className="mt-3 text-sm leading-6 text-white/60">Marketplace updates and supplier exposure news.</p>
          <form className="mt-4 flex gap-2">
            <input className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/10 px-4 text-sm text-white outline-none placeholder:text-white/38" disabled placeholder="Enter your email" type="email" />
            <button className="rounded-full bg-white px-4 text-sm font-semibold text-[#0066cc] disabled:cursor-not-allowed" disabled type="button">
              Submit
            </button>
          </form>
        </div>
        <div className="border-t border-white/12 pt-5 text-xs text-white/50 lg:col-span-3">
          © 2026 B2B2G. All rights reserved. Buyer contact data is protected by platform policy.
        </div>
      </div>
    </footer>
  );
}

export function MarketplaceHome({ config }: Readonly<{ config: MarketplaceHomeConfig }>) {
  return (
    <div className="bg-[linear-gradient(180deg,#f6fbff_0%,#ffffff_32%,#f6f8fb_100%)]">
      <div className="mx-auto grid max-w-[1320px] gap-8 px-5 pb-16 pt-6 sm:px-8 lg:px-10">
        <MarketplaceSearch placeholder={config.searchPlaceholder} />
        <section className="grid gap-4 lg:grid-cols-3">
          {config.banners.map((item, index) => (
            <BannerCard item={item} key={item.id} priority={index === 0} />
          ))}
        </section>
        <section>
          <SectionTitle
            action={{ href: "/suppliers", isEnabled: false, label: "View all suppliers" }}
            eyebrow="Premium marketplace"
            subtitle="High-visibility supplier placements with protected inquiry flow."
            title="Premium Suppliers' Products"
          />
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
            {config.premiumProducts.map((item, index) => (
              <ProductCard item={item} key={item.id} priority={index < 2} />
            ))}
          </div>
        </section>
        <div className="grid gap-5 lg:grid-cols-2">
          <BuyerRequests items={config.buyerRequests} />
          <EventSchedule items={config.events} />
        </div>
        <AdvertisingRow items={config.adBanners} />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
          <Showcase items={config.showcases} />
          <VerifiedBuyers items={config.verifiedBuyers} />
        </div>
        <section>
          <SectionTitle
            action={{ href: "/products", isEnabled: false, label: "View all products" }}
            eyebrow="New in marketplace"
            subtitle="Fresh product listings prepared for brokered global inquiries."
            title="Latest Products"
          />
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
            {config.latestProducts.map((item) => (
              <ProductCard item={item} key={item.id} />
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
