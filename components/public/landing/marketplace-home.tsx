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
    <div className="mb-6 flex min-w-0 flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0 max-w-2xl">
        <p className="type-caption-strong text-action-blue">{eyebrow}</p>
        <h2 className="type-heading-lg mt-2 text-calm-ink">{title}</h2>
        {subtitle ? (
          <p className="type-body mt-3 text-calm-ink-muted-80">{subtitle}</p>
        ) : null}
      </div>
      {action ? (
        <SafeAction
          className="pill-secondary min-h-11 shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
          item={action}
        >
          {action.label}
          <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
        </SafeAction>
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
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_18px_60px_rgb(15_23_42/0.06)] transition duration-300 hover:-translate-y-1 hover:border-action-blue/25 hover:shadow-[0_28px_80px_rgb(15_23_42/0.12)]">
      <div className="relative bg-gradient-to-b from-slate-50 to-white p-4">
        <div className="relative aspect-square overflow-hidden rounded-[24px] bg-[#f3f7fb]">
          <Image
            alt={item.imageAlt}
            className="object-cover transition duration-700 group-hover:scale-[1.04]"
            fill
            loading={priority ? undefined : "eager"}
            priority={priority}
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 42vw, 320px"
            src={item.imageUrl}
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3">
            <span className="max-w-[70%] truncate rounded-full border border-white/80 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-action-blue backdrop-blur">
              {item.category}
            </span>
            <button
              aria-label={`Save interest for ${item.title}`}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/70 bg-white/90 text-[18px] text-action-blue backdrop-blur transition hover:border-action-blue/40 hover:bg-white"
              type="button"
            >
              <span aria-hidden="true">♡</span>
            </button>
          </div>
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3">
            {item.isVerifiedSupplier ? (
              <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-calm-ink px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.07em] text-white shadow-[0_10px_24px_rgb(15_23_42/0.18)]">
                <ShieldCheckIcon aria-hidden="true" className="h-3.5 w-3.5" />
                Verified
              </span>
            ) : (
              <span className="inline-flex min-h-8 items-center rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.07em] text-calm-ink-muted-80 backdrop-blur">
                Catalog
              </span>
            )}
            <span className="rounded-full bg-action-blue px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.07em] text-white shadow-[0_10px_24px_rgb(0_102_204/0.22)]">
              RFQ Ready
            </span>
          </div>
        </div>
      </div>
      <div className="flex min-h-[260px] flex-1 flex-col px-5 pb-5 pt-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-[13px] font-semibold text-calm-ink-muted-80">{item.supplierName}</p>
          {item.isVerifiedSupplier ? (
            <ShieldCheckIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-action-blue" />
          ) : null}
        </div>
        <h3 className="mt-3 line-clamp-2 min-h-[58px] text-[24px] font-semibold leading-[1.12] tracking-[-0.02em] text-calm-ink">
          {item.title}
        </h3>
        <p className="mt-3 line-clamp-3 min-h-[66px] text-[15px] leading-[1.45] text-calm-ink-muted-80">
          {item.description}
        </p>
        <div className="mt-auto grid gap-3 pt-6">
          <div className="flex items-center justify-between rounded-full bg-canvas-parchment px-4 py-2 text-[12px] font-semibold text-calm-ink-muted-80">
            <span>Protected RFQ</span>
            <span>Brokered inquiry</span>
          </div>
          <Link className="pill-primary min-h-12 w-full text-[15px]" href={item.href}>
            {item.ctaLabel}
            <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function RequestList({ requests }: Readonly<{ requests: MarketplaceHomeRequest[] }>) {
  return (
    <article className="rounded-2xl border border-calm-hairline bg-white p-6">
      <p className="type-caption-strong text-action-blue">Buyer demand</p>
      <h3 className="type-heading-sm mt-2 text-calm-ink">Protected RFQ signals</h3>
      <div className="mt-5 grid gap-3">
        {requests.slice(0, 3).map((item) => (
          <div className="grid min-w-0 grid-cols-[58px_minmax(0,1fr)_auto] gap-3 rounded-xl bg-canvas-parchment p-3" key={item.id}>
            <div className="relative aspect-square overflow-hidden rounded-lg bg-white">
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
              <h4 className="truncate type-caption-strong text-calm-ink">{item.title}</h4>
              <p className="type-fine-print mt-1 line-clamp-1 text-calm-ink-muted-80">{item.spec}</p>
              <p className="type-fine-print mt-1 font-semibold text-calm-ink-muted-48">{item.quantity}</p>
            </div>
            <span className="h-fit rounded-full bg-white px-2.5 py-1 type-fine-print font-semibold text-action-blue">
              {item.badge}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

function EventList({ events }: Readonly<{ events: MarketplaceHomeEvent[] }>) {
  return (
    <article className="rounded-2xl border border-calm-hairline bg-white p-6">
      <p className="type-caption-strong text-action-blue">Programs</p>
      <h3 className="type-heading-sm mt-2 text-calm-ink">Events and service windows</h3>
      <div className="mt-5 grid gap-3">
        {events.slice(0, 3).map((item) => (
          <Link className="grid min-w-0 grid-cols-[72px_minmax(0,1fr)] gap-3 rounded-xl bg-canvas-parchment p-3 transition hover:bg-white" href="/events" key={item.id}>
            <div className="relative aspect-square overflow-hidden rounded-lg bg-white">
              <Image alt={item.imageAlt} className="object-cover" fill loading="eager" sizes="72px" src={item.imageUrl} />
            </div>
            <div className="min-w-0">
              <time className="type-fine-print font-semibold text-action-blue">{item.dateLabel}</time>
              <h4 className="type-caption-strong mt-1 line-clamp-2 text-calm-ink">{item.title}</h4>
              <p className="type-fine-print mt-1 truncate text-calm-ink-muted-80">{item.locationLabel}</p>
            </div>
          </Link>
        ))}
      </div>
    </article>
  );
}

function MarketplaceWorkspace({ config }: Readonly<{ config: MarketplaceHomeConfig }>) {
  const heroProducts = [...config.premiumProducts, ...config.latestProducts].slice(0, 6);

  return (
    <section className="bg-[#f6f8fb] pb-14 pt-8 sm:pt-10">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-action-blue">
              Premium marketplace
            </p>
            <h1 className="mt-2 max-w-3xl text-[42px] font-semibold leading-[1.02] tracking-[-0.04em] text-calm-ink sm:text-[56px]">
              Product discovery, built like a modern commerce shelf.
            </h1>
          </div>
          <p className="max-w-md text-[16px] leading-7 text-calm-ink-muted-80">
            Verified supplier products are presented first. Inquiry actions stay brokered and buyer identity remains protected.
          </p>
        </div>

        <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {heroProducts.map((item, index) => (
              <ProductCard item={item} key={item.id} priority={index < 3} />
            ))}
          </div>

          <aside className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            <RequestList requests={config.buyerRequests} />
            <EventList events={config.events} />
          </aside>
        </div>
      </div>
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
    <section className="border-y border-calm-hairline bg-white py-12">
      <div className="mx-auto grid max-w-[1180px] gap-6 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-10">
        <article>
          <SectionHeader
            eyebrow="Innovation showcase"
            subtitle="Image-led product concepts and project stories for global exposure."
            title="Showcase paths stay product-led."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {showcases.slice(0, 3).map((item) => (
              <Link className="group min-w-0" href={item.href} key={item.id}>
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-canvas-parchment">
                  <Image
                    alt={item.imageAlt}
                    className="object-cover transition duration-700 group-hover:scale-[1.025]"
                    fill
                    loading="eager"
                    sizes="(max-width: 640px) 92vw, 260px"
                    src={item.imageUrl}
                  />
                </div>
                <span className="mt-3 inline-flex rounded-full bg-status-info-bg px-3 py-1 type-fine-print font-semibold text-action-blue">
                  {item.category}
                </span>
                <h3 className="type-body-strong mt-2 line-clamp-2 text-calm-ink">{item.title}</h3>
                <p className="type-caption mt-1 truncate text-calm-ink-muted-80">{item.companyName}</p>
              </Link>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-calm-hairline bg-white p-6">
          <p className="type-caption-strong text-action-blue">Verified buyers</p>
          <h2 className="type-heading-sm mt-2 text-calm-ink">Masked demand proof</h2>
          <p className="type-caption mt-3 text-calm-ink-muted-80">
            Public buyer proof shows demand category, role, and country only.
          </p>
          <div className="mt-5 grid gap-3">
            {buyers.slice(0, 4).map((item) => (
              <div className="grid min-w-0 grid-cols-[46px_minmax(0,1fr)_22px] items-center gap-3 rounded-xl bg-canvas-parchment p-3" key={item.id}>
                <span className="grid h-11 w-11 place-items-center rounded-full border border-calm-hairline bg-white type-body-strong text-action-blue">
                  {item.avatarLabel}
                </span>
                <div className="min-w-0">
                  <h3 className="truncate type-caption-strong text-calm-ink">{item.companyName}</h3>
                  <p className="truncate type-caption text-calm-ink-muted-80">{item.role}</p>
                  <span className="type-fine-print font-semibold text-calm-ink-muted-48">{item.country}</span>
                </div>
                <ShieldCheckIcon aria-hidden="true" className="h-5 w-5 text-action-blue" />
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function LatestProducts({ products }: Readonly<{ products: MarketplaceHomeProduct[] }>) {
  return (
    <section className="bg-canvas py-14">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-10">
        <SectionHeader
          action={{ href: "/products", isEnabled: false, label: "View all products" }}
          eyebrow="Latest products"
          subtitle="A clean two-row product grid prepared for approval-state data and exposure ranking later."
          title="New supply, clearly presented."
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

function SupplierExposure({ banners }: Readonly<{ banners: MarketplaceHomeConfig["adBanners"] }>) {
  const primary = banners[0];

  return (
    <section className="bg-canvas-parchment py-12">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-10">
        <article className="rounded-2xl border border-action-blue/15 bg-white p-6 sm:p-8">
          <p className="type-caption-strong text-action-blue">Premium supplier exposure</p>
          <h2 className="type-heading-lg mt-3 max-w-3xl text-calm-ink">{primary.title}</h2>
          <p className="type-body mt-3 max-w-2xl text-calm-ink-muted-80">{primary.description}</p>
          <SafeAction className="pill-primary mt-6" item={primary.cta}>
            {primary.cta.label}
          </SafeAction>
        </article>
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
    <section className="bg-canvas py-14">
      <div className="mx-auto grid max-w-[1180px] gap-6 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
        <article className="rounded-2xl border border-calm-hairline bg-white p-6">
          <SectionHeader
            eyebrow="Updates"
            subtitle="Operational notices, event windows, and supplier program changes."
            title="Announcements"
          />
          <div className="grid gap-3">
            {announcements.slice(0, 3).map((item) => (
              <Link className="grid min-w-0 grid-cols-[76px_minmax(0,1fr)] gap-4 rounded-xl bg-canvas-parchment p-3 transition hover:bg-white" href={item.href} key={item.id}>
                <time className="grid min-h-[72px] place-items-center rounded-lg bg-white text-center type-caption-strong text-action-blue">
                  {item.dateLabel}
                </time>
                <div className="min-w-0">
                  <span className="type-fine-print font-semibold text-action-blue">{item.statusLabel}</span>
                  <h3 className="type-body-strong mt-1 line-clamp-1 text-calm-ink">{item.title}</h3>
                  <p className="type-caption mt-1 line-clamp-2 text-calm-ink-muted-80">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-calm-hairline bg-white p-6">
          <SectionHeader
            eyebrow="FAQ"
            subtitle="Short answers for marketplace decisions."
            title="Common questions"
          />
          <div className="grid gap-3">
            {faqs.slice(0, 4).map((item) => (
              <details className="rounded-xl bg-canvas-parchment px-4 py-4" key={item.id}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 type-body-strong text-calm-ink [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <span aria-hidden="true" className="text-xl text-action-blue">+</span>
                </summary>
                <p className="type-caption mt-3 text-calm-ink-muted-80">{item.answer}</p>
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
    ["Programs", "Supplier growth", "RFQ brokerage", "Events", "FDA service"],
    ["Network", "Agents", "Verified buyers", "Innovation showcase", "Membership"],
    ["Company", "About", "Announcements", "Support", "Help center"],
  ];

  return (
    <footer className="border-t border-calm-hairline bg-canvas-parchment text-calm-ink">
      <div className="mx-auto max-w-[1180px] px-5 py-12 sm:px-8 lg:px-10">
        <div className="grid min-w-0 gap-10 lg:grid-cols-[1fr_1.6fr_0.9fr]">
          <div>
            <h2 className="text-[30px] font-semibold tracking-[-0.03em] text-calm-ink">B2B2G</h2>
            <p className="type-caption mt-4 max-w-sm text-calm-ink-muted-80">
              A global B2B marketplace for verified supplier supply, protected buyer demand, events, and service workflows.
            </p>
          </div>
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map(([title, ...items]) => (
              <nav aria-label={title} key={title}>
                <h3 className="type-caption-strong text-calm-ink">{title}</h3>
                <div className="mt-3 grid gap-2">
                  {items.map((item) => (
                    <button className="w-fit text-left type-caption text-calm-ink-muted-80 disabled:cursor-not-allowed" disabled key={item} type="button">
                      {item}
                    </button>
                  ))}
                </div>
              </nav>
            ))}
          </div>
          <div className="rounded-2xl border border-calm-hairline bg-white p-5">
            <h3 className="type-body-strong text-calm-ink">Trade brief</h3>
            <p className="type-caption mt-2 text-calm-ink-muted-80">
              Product, event, and service updates for marketplace teams.
            </p>
            <form className="mt-5 grid gap-2">
              <input className="min-h-11 min-w-0 rounded-full border border-calm-hairline bg-white px-4 type-caption outline-none" disabled placeholder="Work email" type="email" />
              <button className="pill-primary disabled:cursor-not-allowed disabled:opacity-60" disabled type="button">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-calm-hairline pt-6 type-fine-print text-calm-ink-muted-48 md:flex-row md:items-center md:justify-between">
          <span>© 2026 B2B2G. Buyer identity data is protected by platform policy.</span>
          <span>Privacy · Terms</span>
        </div>
      </div>
    </footer>
  );
}

export function MarketplaceHome({ config }: Readonly<{ config: MarketplaceHomeConfig }>) {
  return (
    <div className="marketplace-home-root bg-canvas text-calm-ink">
      <MarketplaceWorkspace config={config} />
      <ShowcaseAndBuyers buyers={config.verifiedBuyers} showcases={config.showcases} />
      <SupplierExposure banners={config.adBanners} />
      <LatestProducts products={config.latestProducts} />
      <UpdatesAndFaq announcements={config.announcements} faqs={config.faqs} />
      <MarketplaceFooter />
    </div>
  );
}
