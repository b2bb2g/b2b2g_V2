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

const TRADE_SIGNALS = [
  "Verified supplier review",
  "Protected buyer identity",
  "Managed RFQ routing",
  "Admin-approved publishing",
];

function SafeAction({
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

function ProductCard({
  item,
  priority = false,
  variant = "standard",
}: Readonly<{
  item: MarketplaceHomeProduct;
  priority?: boolean;
  variant?: "standard" | "compact";
}>) {
  const imageSize =
    variant === "compact"
      ? "(max-width: 640px) 46vw, (max-width: 1024px) 22vw, 260px"
      : "(max-width: 640px) 92vw, (max-width: 1024px) 42vw, 320px";

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_48px_rgb(15_23_42/0.06)] transition duration-300 hover:-translate-y-1 hover:border-action-blue/30 hover:shadow-[0_24px_68px_rgb(15_23_42/0.12)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f7f9fc]">
        <Image
          alt={item.imageAlt}
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
          fill
          loading={priority ? undefined : "eager"}
          priority={priority}
          sizes={imageSize}
          src={item.imageUrl}
        />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span className="max-w-[72%] truncate rounded-full bg-white/92 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-action-blue backdrop-blur">
            {item.category}
          </span>
          <button
            aria-label={`Save interest for ${item.title}`}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/92 text-[18px] text-action-blue backdrop-blur transition hover:bg-white"
            type="button"
          >
            <span aria-hidden="true">♡</span>
          </button>
        </div>
        {item.isVerifiedSupplier ? (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-calm-ink/88 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white backdrop-blur">
            <ShieldCheckIcon aria-hidden="true" className="h-3 w-3" />
            Verified
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="truncate text-[12px] font-semibold text-calm-ink-muted-80">{item.supplierName}</p>
          {item.isVerifiedSupplier ? (
            <ShieldCheckIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-action-blue" />
          ) : null}
        </div>
        <h3 className="mt-2 line-clamp-2 text-[18px] font-semibold leading-[1.18] tracking-[-0.01em] text-calm-ink">
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-calm-ink-muted-80">
          {item.description}
        </p>
        <div className="mt-auto pt-4">
          <Link className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-action-blue px-4 text-[13px] font-semibold text-white transition hover:bg-action-blue-focus" href={item.href}>
            {item.ctaLabel}
            <ArrowRightIcon aria-hidden="true" className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function SectionIntro({
  action,
  eyebrow,
  title,
}: Readonly<{
  action?: CtaLink;
  eyebrow: string;
  title: string;
}>) {
  return (
    <div className="mb-7 flex min-w-0 flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-action-blue">{eyebrow}</p>
        <h2 className="mt-2 max-w-3xl text-[30px] font-semibold leading-[1.08] tracking-[-0.02em] text-calm-ink sm:text-[38px]">
          {title}
        </h2>
      </div>
      {action ? (
        <SafeAction
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-[13px] font-semibold text-action-blue transition disabled:cursor-not-allowed disabled:opacity-60"
          item={action}
        >
          {action.label}
          <ArrowRightIcon aria-hidden="true" className="h-3.5 w-3.5" />
        </SafeAction>
      ) : null}
    </div>
  );
}

function MarketplaceLead({ products }: Readonly<{ products: MarketplaceHomeProduct[] }>) {
  const leadProducts = products.slice(0, 4);

  return (
    <section className="bg-[#f6f8fb] pb-12 pt-8 sm:pt-10">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <div className="mb-7 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgb(15_23_42/0.06)] sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-action-blue">
                Global B2B commerce
              </p>
              <h1 className="mt-3 text-[34px] font-semibold leading-[1.04] tracking-[-0.03em] text-calm-ink sm:text-[50px]">
                Approved products for serious global sourcing.
              </h1>
            </div>
            <div>
              <p className="max-w-2xl text-[15px] leading-7 text-calm-ink-muted-80">
                B2B2G presents supplier products, buyer demand, trade events, and service programs with protected identity rules and admin-reviewed publishing.
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {TRADE_SIGNALS.map((item) => (
                  <div className="rounded-2xl bg-[#f6f8fb] px-4 py-3 text-[13px] font-semibold text-calm-ink-muted-80" key={item}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {leadProducts.map((item, index) => (
            <ProductCard item={item} key={item.id} priority={index < 2} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductShelf({
  products,
}: Readonly<{
  products: MarketplaceHomeProduct[];
}>) {
  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <SectionIntro
          action={{ href: "/products", isEnabled: false, label: "Browse catalog" }}
          eyebrow="Premium supplier shelf"
          title="Curated product cards with clear inquiry actions."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 8).map((item) => (
            <ProductCard item={item} key={item.id} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RequestBoard({ requests }: Readonly<{ requests: MarketplaceHomeRequest[] }>) {
  return (
    <article className="h-full rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_16px_48px_rgb(15_23_42/0.06)]">
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-action-blue">Buyer requests</p>
      <h3 className="mt-2 text-[28px] font-semibold leading-[1.08] tracking-[-0.02em] text-calm-ink">
        Demand without exposed buyer identity.
      </h3>
      <p className="mt-3 text-[14px] leading-6 text-calm-ink-muted-80">
        Public request cards show product intent only. Contact data is not displayed.
      </p>
      <div className="mt-5 grid gap-3">
        {requests.slice(0, 3).map((item) => (
          <div className="grid min-w-0 grid-cols-[58px_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] bg-[#f6f8fb] p-3" key={item.id}>
            <div className="relative aspect-square overflow-hidden rounded-[14px] bg-white">
              {item.imageUrl ? (
                <Image
                  alt={item.imageAlt ?? item.title}
                  className="object-cover"
                  fill
                  loading="eager"
                  sizes="58px"
                  src={item.imageUrl}
                />
              ) : null}
            </div>
            <div className="min-w-0">
              <h4 className="truncate text-[15px] font-semibold text-calm-ink">{item.title}</h4>
              <p className="mt-1 line-clamp-1 text-[12px] text-calm-ink-muted-80">{item.spec}</p>
              <p className="mt-1 text-[12px] font-semibold text-calm-ink-muted-48">{item.quantity}</p>
            </div>
            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-action-blue">
              {item.badge}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

function EventBoard({ events }: Readonly<{ events: MarketplaceHomeEvent[] }>) {
  return (
    <article className="h-full rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_16px_48px_rgb(15_23_42/0.06)]">
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-action-blue">Event schedule</p>
      <h3 className="mt-2 text-[28px] font-semibold leading-[1.08] tracking-[-0.02em] text-calm-ink">
        Trade programs on the calendar.
      </h3>
      <div className="mt-5 grid gap-3">
        {events.slice(0, 3).map((item) => (
          <Link className="grid min-w-0 grid-cols-[72px_minmax(0,1fr)] gap-3 rounded-[18px] bg-[#f6f8fb] p-3 transition hover:bg-white" href="/events" key={item.id}>
            <div className="relative aspect-square overflow-hidden rounded-[14px] bg-white">
              <Image alt={item.imageAlt} className="object-cover" fill loading="eager" sizes="72px" src={item.imageUrl} />
            </div>
            <div className="min-w-0">
              <time className="text-[12px] font-semibold text-action-blue">{item.dateLabel}</time>
              <h4 className="mt-1 line-clamp-2 text-[15px] font-semibold text-calm-ink">{item.title}</h4>
              <p className="mt-1 truncate text-[12px] text-calm-ink-muted-80">{item.locationLabel}</p>
            </div>
          </Link>
        ))}
      </div>
    </article>
  );
}

function VerifiedBuyerBoard({ buyers }: Readonly<{ buyers: MarketplaceHomeBuyer[] }>) {
  return (
    <article className="h-full rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_16px_48px_rgb(15_23_42/0.06)]">
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-action-blue">Verified buyers</p>
      <h3 className="mt-2 text-[28px] font-semibold leading-[1.08] tracking-[-0.02em] text-calm-ink">
        Masked demand signals.
      </h3>
      <div className="mt-5 grid gap-3">
        {buyers.slice(0, 4).map((item) => (
          <div className="grid min-w-0 grid-cols-[42px_minmax(0,1fr)_20px] items-center gap-3 rounded-[18px] bg-[#f6f8fb] p-3" key={item.id}>
            <span className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-[13px] font-semibold text-action-blue">
              {item.avatarLabel}
            </span>
            <div className="min-w-0">
              <h4 className="truncate text-[14px] font-semibold text-calm-ink">{item.companyName}</h4>
              <p className="truncate text-[12px] text-calm-ink-muted-80">{item.role}</p>
              <span className="text-[11px] font-semibold text-calm-ink-muted-48">{item.country}</span>
            </div>
            <ShieldCheckIcon aria-hidden="true" className="h-5 w-5 text-action-blue" />
          </div>
        ))}
      </div>
    </article>
  );
}

function MarketplaceBoards({
  buyers,
  events,
  requests,
}: Readonly<{
  buyers: MarketplaceHomeBuyer[];
  events: MarketplaceHomeEvent[];
  requests: MarketplaceHomeRequest[];
}>) {
  return (
    <section className="bg-[#f6f8fb] py-14">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <div className="grid items-stretch gap-5 lg:grid-cols-3">
          <RequestBoard requests={requests} />
          <EventBoard events={events} />
          <VerifiedBuyerBoard buyers={buyers} />
        </div>
      </div>
    </section>
  );
}

function ShowcaseAndExposure({
  banners,
  showcases,
}: Readonly<{
  banners: MarketplaceHomeConfig["adBanners"];
  showcases: MarketplaceHomeShowcase[];
}>) {
  const primary = banners[0];

  return (
    <section className="bg-white py-14">
      <div className="mx-auto grid max-w-[1320px] gap-5 px-5 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10">
        <article className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_16px_48px_rgb(15_23_42/0.06)]">
          <SectionIntro
            action={{ href: "/networking", isEnabled: false, label: "View showcase" }}
            eyebrow="Innovation showcase"
            title="Image-led projects and product concepts."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {showcases.slice(0, 3).map((item) => (
              <Link className="group overflow-hidden rounded-[20px] border border-slate-200 bg-[#f6f8fb] transition hover:-translate-y-0.5 hover:bg-white" href={item.href} key={item.id}>
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    alt={item.imageAlt}
                    className="object-cover transition duration-700 group-hover:scale-[1.04]"
                    fill
                    loading="eager"
                    sizes="(max-width: 640px) 92vw, 220px"
                    src={item.imageUrl}
                  />
                </div>
                <div className="p-4">
                  <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-action-blue">
                    {item.category}
                  </span>
                  <h3 className="mt-3 line-clamp-2 text-[17px] font-semibold leading-[1.2] text-calm-ink">
                    {item.title}
                  </h3>
                  <p className="mt-1 truncate text-[12px] text-calm-ink-muted-80">{item.companyName}</p>
                </div>
              </Link>
            ))}
          </div>
        </article>

        <article className="flex min-h-full flex-col justify-between rounded-[26px] bg-calm-ink p-6 text-white shadow-[0_18px_64px_rgb(15_23_42/0.18)]">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/60">
              Supplier exposure
            </p>
            <h2 className="mt-3 text-[32px] font-semibold leading-[1.06] tracking-[-0.025em]">
              {primary?.title ?? "Premium placement for global sourcing teams."}
            </h2>
            <p className="mt-4 text-[14px] leading-6 text-white/72">
              {primary?.description ?? "Present approved products with clear inquiry actions and platform-reviewed visibility."}
            </p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {["Priority shelf", "Verified badge", "Catalog exposure"].map((item) => (
              <div className="rounded-[18px] border border-white/10 bg-white/8 px-4 py-3 text-[13px] font-semibold text-white/84" key={item}>
                {item}
              </div>
            ))}
          </div>
          {primary ? (
            <SafeAction className="mt-6 inline-flex min-h-10 w-fit items-center gap-2 rounded-full bg-white px-4 text-[13px] font-semibold text-calm-ink transition disabled:cursor-not-allowed disabled:opacity-60" item={primary.cta}>
              {primary.cta.label}
              <ArrowRightIcon aria-hidden="true" className="h-3.5 w-3.5" />
            </SafeAction>
          ) : null}
        </article>
      </div>
    </section>
  );
}

function LatestProducts({ products }: Readonly<{ products: MarketplaceHomeProduct[] }>) {
  return (
    <section className="bg-[#f6f8fb] py-14">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <SectionIntro
          action={{ href: "/products", isEnabled: false, label: "View all products" }}
          eyebrow="Latest products"
          title="Fresh product cards for sourcing review."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 8).map((item) => (
            <ProductCard item={item} key={item.id} variant="compact" />
          ))}
        </div>
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
    <section className="bg-white py-14">
      <div className="mx-auto grid max-w-[1320px] gap-5 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
        <article className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_16px_48px_rgb(15_23_42/0.06)]">
          <SectionIntro eyebrow="Announcements" title="Operational updates." />
          <div className="grid gap-3">
            {announcements.slice(0, 3).map((item) => (
              <Link className="grid min-w-0 grid-cols-[68px_minmax(0,1fr)] gap-3 rounded-[18px] bg-[#f6f8fb] p-3 transition hover:bg-white" href={item.href} key={item.id}>
                <time className="grid min-h-[62px] place-items-center rounded-[14px] bg-white text-center text-[11px] font-semibold text-action-blue">
                  {item.dateLabel}
                </time>
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-action-blue">{item.statusLabel}</span>
                  <h3 className="mt-1 line-clamp-1 text-[15px] font-semibold text-calm-ink">{item.title}</h3>
                  <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-calm-ink-muted-80">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </article>

        <article className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_16px_48px_rgb(15_23_42/0.06)]">
          <SectionIntro eyebrow="FAQ" title="Common marketplace questions." />
          <div className="grid gap-3">
            {faqs.slice(0, 4).map((item) => (
              <details className="rounded-[18px] bg-[#f6f8fb] px-4 py-4" key={item.id}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-calm-ink [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <span aria-hidden="true" className="text-lg text-action-blue">+</span>
                </summary>
                <p className="mt-3 text-[13px] leading-6 text-calm-ink-muted-80">{item.answer}</p>
              </details>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function MarketplaceFooter() {
  const columns = [
    ["Marketplace", "Commercial", "Industrial", "EPC", "BUY & SELL"],
    ["Programs", "Supplier growth", "RFQ operations", "Events", "FDA service"],
    ["Network", "Agents", "Verified buyers", "Innovation showcase", "Membership"],
    ["Company", "About", "Announcements", "Support", "Help center"],
  ];

  return (
    <footer className="border-t border-slate-200 bg-[#f6f8fb] text-calm-ink">
      <div className="mx-auto max-w-[1320px] px-5 py-10 sm:px-8 lg:px-10">
        <div className="grid min-w-0 gap-8 lg:grid-cols-[1fr_1.6fr_0.9fr]">
          <div>
            <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-calm-ink">B2B2G</h2>
            <p className="mt-3 max-w-sm text-[13px] leading-6 text-calm-ink-muted-80">
              A global B2B marketplace for approved supplier products, protected buyer demand, trade events, and service workflows.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map(([title, ...items]) => (
              <nav aria-label={title} key={title}>
                <h3 className="text-[13px] font-semibold text-calm-ink">{title}</h3>
                <div className="mt-3 grid gap-2">
                  {items.map((item) => (
                    <button className="w-fit text-left text-[13px] text-calm-ink-muted-80 disabled:cursor-not-allowed" disabled key={item} type="button">
                      {item}
                    </button>
                  ))}
                </div>
              </nav>
            ))}
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-white p-5">
            <h3 className="text-[15px] font-semibold text-calm-ink">Marketplace updates</h3>
            <p className="mt-2 text-[13px] leading-5 text-calm-ink-muted-80">
              Product, event, and service updates for sourcing teams.
            </p>
            <form className="mt-5 grid gap-2">
              <input className="min-h-10 min-w-0 rounded-full border border-slate-200 bg-white px-4 text-[13px] outline-none" disabled placeholder="Work email" type="email" />
              <button className="inline-flex min-h-10 items-center justify-center rounded-full bg-action-blue px-4 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled type="button">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-5 text-[12px] text-calm-ink-muted-48 md:flex-row md:items-center md:justify-between">
          <span>© 2026 B2B2G. Buyer identity data is protected by platform policy.</span>
          <span>Privacy · Terms</span>
        </div>
      </div>
    </footer>
  );
}

export function MarketplaceHome({ config }: Readonly<{ config: MarketplaceHomeConfig }>) {
  const leadProducts = [...config.premiumProducts, ...config.latestProducts];

  return (
    <div className="marketplace-home-root bg-white text-calm-ink">
      <MarketplaceLead products={leadProducts} />
      <ProductShelf products={config.premiumProducts} />
      <MarketplaceBoards buyers={config.verifiedBuyers} events={config.events} requests={config.buyerRequests} />
      <ShowcaseAndExposure banners={config.adBanners} showcases={config.showcases} />
      <LatestProducts products={config.latestProducts} />
      <UpdatesAndFaq announcements={config.announcements} faqs={config.faqs} />
      <MarketplaceFooter />
    </div>
  );
}
