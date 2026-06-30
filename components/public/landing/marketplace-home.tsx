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

const TRUST_CHIPS = ["Verified suppliers", "Protected buyer identity", "Approved content", "Managed RFQ"];

const FOOTER_GROUPS = [
  ["Marketplace", "Commercial", "Industrial", "EPC", "BUY & SELL"],
  ["Trade Desk", "Buyer requests", "Supplier catalog", "Events", "FDA service"],
  ["Growth", "Premium suppliers", "Verification", "Showcase", "Membership"],
  ["Company", "About", "Announcements", "Support", "Help center"],
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

function Badge({
  children,
  tone = "blue",
}: Readonly<{
  children: ReactNode;
  tone?: "blue" | "ink" | "soft";
}>) {
  const toneClass = {
    blue: "bg-action-blue text-white shadow-[0_10px_24px_rgb(11_99_206/0.24)]",
    ink: "bg-calm-ink text-white shadow-[0_10px_24px_rgb(15_23_42/0.18)]",
    soft: "bg-[#eef5ff] text-action-blue ring-1 ring-action-blue/10",
  }[tone];

  return (
    <span className={`inline-flex min-h-7 items-center gap-1.5 rounded-full px-3 text-[10px] font-semibold uppercase tracking-normal ${toneClass}`}>
      {children}
    </span>
  );
}

function SectionTitle({
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
      <div className="max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-normal text-action-blue">{eyebrow}</p>
        <h2 className="mt-2 text-[30px] font-semibold leading-[1.08] tracking-normal text-calm-ink sm:text-[42px]">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-calm-ink-muted-80">{subtitle}</p>
        ) : null}
      </div>
      {action ? (
        <SafeAction
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-[#d7e5f7] bg-white px-4 text-[13px] font-semibold text-action-blue transition hover:border-action-blue/30 hover:bg-[#eef5ff] disabled:cursor-not-allowed disabled:opacity-60"
          item={action}
        >
          {action.label}
          <ArrowRightIcon aria-hidden="true" className="h-3.5 w-3.5" />
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
    <article className="group relative flex h-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-[22px] border border-[#dbe8f7] bg-white shadow-[0_14px_38px_rgb(15_23_42/0.07)] transition duration-300 hover:-translate-y-1 hover:border-action-blue/35 hover:shadow-[0_26px_70px_rgb(15_23_42/0.13)]">
      <Link
        aria-label={`Open product detail for ${item.title}`}
        className="absolute inset-0 z-10 rounded-[22px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-blue"
        href={item.href}
      />
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f3f7fc]">
        <Image
          alt={item.imageAlt}
          className="object-cover transition duration-700 group-hover:scale-[1.045]"
          fill
          loading={priority ? undefined : "lazy"}
          priority={priority}
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 44vw, 320px"
          src={item.imageUrl}
        />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          {item.isVerifiedSupplier ? (
            <Badge tone="blue">
              <ShieldCheckIcon aria-hidden="true" className="h-3 w-3" />
              Verified
            </Badge>
          ) : (
            <Badge tone="soft">{item.category}</Badge>
          )}
          <button
            aria-label={`Save interest for ${item.title}`}
            className="relative z-20 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/94 text-[18px] text-action-blue shadow-[0_10px_24px_rgb(15_23_42/0.12)] backdrop-blur transition hover:scale-105"
            type="button"
          >
            <span aria-hidden="true">♡</span>
          </button>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <p className="truncate text-[12px] font-semibold text-calm-ink-muted-80">{item.supplierName}</p>
          {item.isVerifiedSupplier ? (
            <span className="shrink-0 rounded-full bg-[#eef5ff] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-normal text-action-blue">
              Premium
            </span>
          ) : null}
        </div>
        <h3 className="mt-2 line-clamp-2 text-[18px] font-semibold leading-[1.16] tracking-normal text-calm-ink">
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-calm-ink-muted-80">{item.description}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-calm-ink-muted-80">
            <ShieldCheckIcon aria-hidden="true" className="h-3.5 w-3.5 text-action-blue" />
            RFQ ready
          </span>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#eef5ff] text-action-blue transition group-hover:translate-x-0.5 group-hover:bg-action-blue group-hover:text-white">
            <ArrowRightIcon aria-hidden="true" className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
}

function HeroProduct({
  item,
}: Readonly<{
  item: MarketplaceHomeProduct;
}>) {
  return (
    <Link className="group grid overflow-hidden rounded-[28px] border border-[#dbe8f7] bg-white shadow-[0_20px_64px_rgb(15_23_42/0.10)] transition hover:-translate-y-1 hover:shadow-[0_32px_90px_rgb(15_23_42/0.16)] lg:grid-cols-[1.05fr_0.95fr]" href={item.href}>
      <div className="relative min-h-[320px] overflow-hidden bg-[#f3f7fc]">
        <Image
          alt={item.imageAlt}
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
          fill
          priority
          sizes="(max-width: 1024px) 92vw, 620px"
          src={item.imageUrl}
        />
        <div className="absolute left-4 top-4">
          <Badge tone="blue">
            <ShieldCheckIcon aria-hidden="true" className="h-3 w-3" />
            Featured
          </Badge>
        </div>
      </div>
      <div className="flex flex-col p-6 lg:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-normal text-action-blue">Supplier product spotlight</p>
        <h2 className="mt-3 text-[34px] font-semibold leading-[1.02] tracking-normal text-calm-ink">{item.title}</h2>
        <p className="mt-3 text-[14px] font-semibold text-calm-ink-muted-80">{item.supplierName}</p>
        <p className="mt-4 line-clamp-3 text-[15px] leading-7 text-calm-ink-muted-80">{item.description}</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          <Badge tone="soft">{item.category}</Badge>
          {item.isVerifiedSupplier ? (
            <Badge tone="ink">
              <ShieldCheckIcon aria-hidden="true" className="h-3 w-3" />
              Verified supplier
            </Badge>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function MarketplaceHero({ products }: Readonly<{ products: MarketplaceHomeProduct[] }>) {
  const feature = products[0];
  const supporting = products.slice(1, 5);

  return (
    <section className="bg-[#f4f8ff] py-7 sm:py-9">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <div className="mb-5 grid gap-4 lg:grid-cols-[0.98fr_auto] lg:items-end">
          <div>
            <Badge tone="blue">Global B2B marketplace</Badge>
            <h1 className="mt-4 max-w-4xl text-[34px] font-semibold leading-[1.04] tracking-normal text-calm-ink sm:text-[54px]">
              Premium B2B products, verified demand, and trade programs in one storefront.
            </h1>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:w-[400px]">
            {TRUST_CHIPS.map((item) => (
              <div className="rounded-2xl bg-white px-4 py-3 text-[12px] font-semibold text-action-blue shadow-[0_10px_28px_rgb(15_23_42/0.05)]" key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.28fr_0.72fr]">
          {feature ? <HeroProduct item={feature} /> : null}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
            {supporting.slice(0, 2).map((item, index) => (
              <ProductCard item={item} key={item.id} priority={index === 0} />
            ))}
          </div>
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
    <section className="bg-white py-16">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <SectionTitle
          action={{ href: "/products", isEnabled: false, label: "Open catalog" }}
          eyebrow="Premium supplier showroom"
          subtitle="A clean B2B product shelf with visible verification marks, protected RFQ flow, and high-intent inquiry actions."
          title="Products presented like a premium commerce catalog."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 8).map((item, index) => (
            <ProductCard item={item} key={item.id} priority={index < 2} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RequestBoard({ requests }: Readonly<{ requests: MarketplaceHomeRequest[] }>) {
  return (
    <article className="rounded-[28px] border border-[#dbe8f7] bg-white p-5 shadow-[0_16px_48px_rgb(15_23_42/0.07)]">
      <SectionTitle eyebrow="Buyer requests" title="Protected RFQ board" />
      <div className="grid gap-3">
        {requests.slice(0, 4).map((item) => (
          <div className="grid min-w-0 grid-cols-[58px_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] bg-[#f4f8ff] p-3" key={item.id}>
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
              <h3 className="truncate text-[15px] font-semibold text-calm-ink">{item.title}</h3>
              <p className="mt-1 line-clamp-1 text-[12px] text-calm-ink-muted-80">{item.spec}</p>
              <p className="mt-1 text-[12px] font-semibold text-calm-ink-muted-48">{item.quantity}</p>
            </div>
            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-action-blue">{item.badge}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-2xl bg-[#eef5ff] px-4 py-3 text-[12px] font-semibold text-calm-ink-muted-80">
        Buyer identity and contact details are protected on public surfaces.
      </p>
    </article>
  );
}

function EventBoard({ events }: Readonly<{ events: MarketplaceHomeEvent[] }>) {
  return (
    <article className="rounded-[28px] border border-[#dbe8f7] bg-white p-5 shadow-[0_16px_48px_rgb(15_23_42/0.07)]">
      <SectionTitle eyebrow="Trade programs" title="Event schedule" />
      <div className="grid gap-3">
        {events.slice(0, 3).map((item) => (
          <Link className="grid min-w-0 grid-cols-[78px_minmax(0,1fr)] gap-3 rounded-[18px] bg-[#f4f8ff] p-3 transition hover:bg-white" href="/events" key={item.id}>
            <div className="relative aspect-square overflow-hidden rounded-[14px] bg-white">
              <Image alt={item.imageAlt} className="object-cover" fill loading="eager" sizes="78px" src={item.imageUrl} />
            </div>
            <div className="min-w-0">
              <time className="text-[12px] font-semibold text-action-blue">{item.dateLabel}</time>
              <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold text-calm-ink">{item.title}</h3>
              <p className="mt-1 truncate text-[12px] text-calm-ink-muted-80">{item.locationLabel}</p>
            </div>
          </Link>
        ))}
      </div>
    </article>
  );
}

function BuyerBoard({ buyers }: Readonly<{ buyers: MarketplaceHomeBuyer[] }>) {
  return (
    <article className="rounded-[28px] border border-[#dbe8f7] bg-white p-5 shadow-[0_16px_48px_rgb(15_23_42/0.07)]">
      <SectionTitle eyebrow="Verified demand" title="Masked buyer network" />
      <div className="grid gap-3">
        {buyers.slice(0, 4).map((item) => (
          <div className="grid min-w-0 grid-cols-[42px_minmax(0,1fr)_20px] items-center gap-3 rounded-[18px] bg-[#f4f8ff] p-3" key={item.id}>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[13px] font-semibold text-action-blue shadow-[0_8px_20px_rgb(15_23_42/0.08)]">{item.avatarLabel}</span>
            <div className="min-w-0">
              <h3 className="truncate text-[14px] font-semibold text-calm-ink">{item.companyName}</h3>
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
    <section className="bg-[#f4f8ff] py-16">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-5 lg:grid-cols-3">
          <RequestBoard requests={requests} />
          <EventBoard events={events} />
          <BuyerBoard buyers={buyers} />
        </div>
      </div>
    </section>
  );
}

function ShowcaseAndAd({
  banners,
  showcases,
}: Readonly<{
  banners: MarketplaceHomeConfig["adBanners"];
  showcases: MarketplaceHomeShowcase[];
}>) {
  const primary = banners[0];

  return (
    <section className="bg-white py-16">
      <div className="mx-auto grid max-w-[1320px] gap-5 px-5 sm:px-8 lg:grid-cols-[1.18fr_0.82fr] lg:px-10">
        <article className="rounded-[28px] border border-[#dbe8f7] bg-white p-5 shadow-[0_16px_48px_rgb(15_23_42/0.07)]">
          <SectionTitle
            action={{ href: "/networking", isEnabled: false, label: "View showcase" }}
            eyebrow="Innovation showcase"
            subtitle="Product concepts, pilot projects, and team-led market stories shown as visual commerce cards."
            title="Proof points for global buyers."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {showcases.slice(0, 3).map((item) => (
              <Link className="group overflow-hidden rounded-[22px] border border-[#dbe8f7] bg-[#f4f8ff] transition hover:-translate-y-1 hover:bg-white" href={item.href} key={item.id}>
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image alt={item.imageAlt} className="object-cover transition duration-700 group-hover:scale-[1.04]" fill loading="eager" sizes="(max-width: 640px) 92vw, 240px" src={item.imageUrl} />
                </div>
                <div className="p-4">
                  <Badge tone="soft">{item.category}</Badge>
                  <h3 className="mt-3 line-clamp-2 text-[17px] font-semibold leading-[1.18] text-calm-ink">{item.title}</h3>
                  <p className="mt-1 truncate text-[12px] text-calm-ink-muted-80">{item.companyName}</p>
                </div>
              </Link>
            ))}
          </div>
        </article>

        <article className="relative overflow-hidden rounded-[28px] bg-[#07111f] p-6 text-white shadow-[0_24px_82px_rgb(15_23_42/0.22)]">
          <div className="absolute bottom-[-90px] right-[-60px] h-56 w-56 rounded-full bg-action-blue/40 blur-3xl" />
          <div className="relative flex h-full flex-col">
            <Badge tone="soft">Premium supplier growth</Badge>
            <h2 className="mt-5 text-[34px] font-semibold leading-[1.04] tracking-normal">{primary?.title ?? "Premium placement for verified global buyers."}</h2>
            <p className="mt-4 text-[15px] leading-7 text-white/72">{primary?.description ?? "Elevate approved products with high-visibility placement and managed inquiry routing."}</p>
            <div className="mt-7 grid gap-3">
              {["Top shelf placement", "Verification mark", "Catalog visibility"].map((item) => (
                <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-[13px] font-semibold text-white/84" key={item}>{item}</div>
              ))}
            </div>
            {primary ? (
              <SafeAction className="relative mt-auto inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-white px-5 text-[13px] font-semibold text-calm-ink transition hover:bg-[#eef5ff] disabled:cursor-not-allowed disabled:opacity-60" item={primary.cta}>
                {primary.cta.label}
                <ArrowRightIcon aria-hidden="true" className="h-3.5 w-3.5" />
              </SafeAction>
            ) : null}
          </div>
        </article>
      </div>
    </section>
  );
}

function LatestProducts({ products }: Readonly<{ products: MarketplaceHomeProduct[] }>) {
  return (
    <section className="bg-[#f4f8ff] py-16">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <SectionTitle
          action={{ href: "/products", isEnabled: false, label: "View all products" }}
          eyebrow="Latest products"
          subtitle="Fresh catalog items displayed with consistent commerce cards and protected inquiry actions."
          title="Newly listed supplier products."
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

function UpdatesAndFaq({
  announcements,
  faqs,
}: Readonly<{
  announcements: MarketplaceHomeAnnouncement[];
  faqs: MarketplaceHomeFaq[];
}>) {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto grid max-w-[1320px] gap-5 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
        <article className="rounded-[28px] border border-[#dbe8f7] bg-white p-5 shadow-[0_16px_48px_rgb(15_23_42/0.07)]">
          <SectionTitle eyebrow="Announcements" title="Marketplace updates." />
          <div className="grid gap-3">
            {announcements.slice(0, 3).map((item) => (
              <Link className="grid min-w-0 grid-cols-[70px_minmax(0,1fr)] gap-3 rounded-[18px] bg-[#f4f8ff] p-3 transition hover:bg-white" href={item.href} key={item.id}>
                <time className="grid min-h-[64px] place-items-center rounded-[14px] bg-white text-center text-[11px] font-semibold text-action-blue">{item.dateLabel}</time>
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-normal text-action-blue">{item.statusLabel}</span>
                  <h3 className="mt-1 line-clamp-1 text-[15px] font-semibold text-calm-ink">{item.title}</h3>
                  <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-calm-ink-muted-80">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-[#dbe8f7] bg-white p-5 shadow-[0_16px_48px_rgb(15_23_42/0.07)]">
          <SectionTitle eyebrow="FAQ" title="Questions before sourcing." />
          <div className="grid gap-3">
            {faqs.slice(0, 4).map((item) => (
              <details className="rounded-[18px] bg-[#f4f8ff] px-4 py-4" key={item.id}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-calm-ink [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <span aria-hidden="true" className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-action-blue">+</span>
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
  return (
    <footer className="bg-[#07111f] text-white">
      <div className="mx-auto max-w-[1320px] px-5 py-12 sm:px-8 lg:px-10">
        <div className="grid gap-9 lg:grid-cols-[1.1fr_1.8fr_0.9fr]">
          <div>
            <h2 className="text-[34px] font-semibold tracking-normal">B2B2G</h2>
            <p className="mt-4 max-w-sm text-[14px] leading-6 text-white/62">
              Global B2B commerce for approved supplier products, protected buyer demand, trade events, and service workflows.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Verified", "Protected", "Approved"].map((item) => (
                <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-normal text-white/78" key={item}>{item}</span>
              ))}
            </div>
          </div>
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {FOOTER_GROUPS.map(([title, ...items]) => (
              <nav aria-label={title} key={title}>
                <h3 className="text-[13px] font-semibold text-white">{title}</h3>
                <div className="mt-4 grid gap-2.5">
                  {items.map((item) => (
                    <button className="w-fit text-left text-[13px] text-white/58 transition disabled:cursor-not-allowed" disabled key={item} type="button">{item}</button>
                  ))}
                </div>
              </nav>
            ))}
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/8 p-5">
            <h3 className="text-[16px] font-semibold">Trade intelligence</h3>
            <p className="mt-2 text-[13px] leading-5 text-white/62">Product, event, and service updates for sourcing teams.</p>
            <form className="mt-5 grid gap-2">
              <input className="min-h-11 min-w-0 rounded-full border border-white/10 bg-white px-4 text-[13px] text-calm-ink outline-none" disabled placeholder="Work email" type="email" />
              <button className="inline-flex min-h-11 items-center justify-center rounded-full bg-action-blue px-4 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled type="button">Subscribe</button>
            </form>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-[12px] text-white/45 md:flex-row md:items-center md:justify-between">
          <span>© 2026 B2B2G. Buyer identity data is protected by platform policy.</span>
          <span>Privacy · Terms · Security</span>
        </div>
      </div>
    </footer>
  );
}

export function MarketplaceHome({ config }: Readonly<{ config: MarketplaceHomeConfig }>) {
  const heroProducts = [...config.premiumProducts, ...config.latestProducts];

  return (
    <div className="marketplace-home-root bg-white text-calm-ink">
      <MarketplaceHero products={heroProducts} />
      <ProductShelf products={config.premiumProducts} />
      <MarketplaceBoards buyers={config.verifiedBuyers} events={config.events} requests={config.buyerRequests} />
      <ShowcaseAndAd banners={config.adBanners} showcases={config.showcases} />
      <LatestProducts products={config.latestProducts} />
      <UpdatesAndFaq announcements={config.announcements} faqs={config.faqs} />
      <MarketplaceFooter />
    </div>
  );
}
