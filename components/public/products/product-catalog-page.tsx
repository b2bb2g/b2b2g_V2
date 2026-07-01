import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BadgeIcon,
  DocumentCheckIcon,
  GlobeIcon,
  ShieldCheckIcon,
} from "@/components/public/icons";
import type { StaticMarketplaceProduct } from "@/lib/products/static-products";

type ProductCatalogPageProps = {
  products: StaticMarketplaceProduct[];
};

type ProductDetailPageProps = {
  product: StaticMarketplaceProduct;
  relatedProducts: StaticMarketplaceProduct[];
};

type ProductStat = {
  label: string;
  value: string;
};

type ProductSpec = {
  label: string;
  value: string;
};

function ProductContainer({
  children,
  className = "",
}: Readonly<{
  children: ReactNode;
  className?: string;
}>) {
  return (
    <div className={`mx-auto box-border w-full max-w-[100vw] min-w-0 overflow-hidden px-4 sm:px-6 lg:px-10 2xl:max-w-[1440px] ${className}`}>
      {children}
    </div>
  );
}

function ProductBadge({
  children,
  tone = "blue",
}: Readonly<{
  children: ReactNode;
  tone?: "blue" | "dark" | "light" | "white";
}>) {
  const toneClass = {
    blue: "bg-[#0066cc] text-white",
    dark: "bg-[#08111f] text-white",
    light: "bg-[#edf5ff] text-[#0066cc]",
    white: "bg-white text-[#0066cc] ring-1 ring-[#dbeafe]",
  }[tone];

  return (
    <span className={`inline-flex min-h-7 items-center gap-1.5 rounded-full px-2.5 text-[10px] font-black uppercase tracking-[0.1em] ${toneClass}`}>
      {children}
    </span>
  );
}

function ProductSectionHeader({
  eyebrow,
  title,
  description,
  action,
}: Readonly<{
  action?: ReactNode;
  description?: string;
  eyebrow: string;
  title: string;
}>) {
  return (
    <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0066cc]">{eyebrow}</p>
        <h2 className="mt-2 text-[30px] font-semibold leading-[1.04] tracking-[-0.045em] text-[#101828] sm:text-[44px]">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 max-w-[330px] text-[14px] leading-6 text-[#667085] sm:max-w-2xl">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function ProductCatalogCard({
  product,
  priority = false,
}: Readonly<{
  priority?: boolean;
  product: StaticMarketplaceProduct;
}>) {
  return (
    <Link
      className="group flex min-w-0 flex-col overflow-hidden rounded-[24px] border border-[#dbe6f2] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.045)] transition duration-300 hover:-translate-y-1 hover:border-[#93c5fd] hover:shadow-[0_26px_70px_rgba(15,23,42,0.1)]"
      href={product.detailHref}
    >
      <div className="relative aspect-square overflow-hidden bg-[#eef4fb]">
        <Image
          alt={product.imageAlt}
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
          fill
          priority={priority}
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 44vw, 320px"
          src={product.imageUrl}
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#07111f]/46 to-transparent" />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          {product.isVerifiedSupplier ? (
            <ProductBadge>
              <ShieldCheckIcon aria-hidden="true" className="h-3.5 w-3.5" />
              Verified
            </ProductBadge>
          ) : (
            <ProductBadge tone="white">{product.category}</ProductBadge>
          )}
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-[18px] text-[#0066cc] shadow-[0_10px_22px_rgba(15,23,42,0.12)]">
            <span aria-hidden="true">♡</span>
          </span>
        </div>
        <span className="absolute bottom-3 left-3 rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#344054] shadow-[0_10px_24px_rgba(15,23,42,0.16)]">
          {product.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <p className="truncate text-[12px] font-bold text-[#667085]">{product.supplierName}</p>
          {product.isVerifiedSupplier ? (
            <span className="shrink-0 rounded-full bg-[#edf5ff] px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-[#0066cc] ring-1 ring-[#dbeafe]">
              Premium
            </span>
          ) : null}
        </div>
        <h2 className="mt-2 line-clamp-2 min-h-[42px] text-[19px] font-semibold leading-[1.1] tracking-[-0.025em] text-[#1d1d1f]">
          {product.title}
        </h2>
        <p className="mt-2 line-clamp-2 min-h-[40px] text-[13px] leading-5 text-[#667085]">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f8fc] px-2.5 py-1.5 text-[11px] font-bold text-[#667085]">
            <ShieldCheckIcon aria-hidden="true" className="h-3.5 w-3.5 text-[#0066cc]" />
            RFQ protected
          </span>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#edf5ff] text-[#0066cc] transition group-hover:bg-[#0066cc] group-hover:text-white">
            <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function CatalogLane({
  label,
  value,
  isActive = false,
}: Readonly<{
  isActive?: boolean;
  label: string;
  value: string;
}>) {
  return (
    <button
      className={`flex min-h-12 w-full max-w-full min-w-0 items-center justify-between rounded-2xl px-4 text-left text-[13px] font-bold transition ${
        isActive
          ? "bg-[#0066cc] text-white shadow-[0_14px_32px_rgba(0,102,204,0.22)]"
          : "bg-white text-[#344054] ring-1 ring-[#dbe6f2] hover:ring-[#93c5fd]"
      }`}
      disabled
      type="button"
    >
      <span className="min-w-0 truncate">{label}</span>
      <span className={`${isActive ? "text-white/72" : "text-[#98a2b3]"} hidden sm:inline`}>{value}</span>
    </button>
  );
}

function ProductStats({ stats }: Readonly<{ stats: ProductStat[] }>) {
  return (
    <div className="grid min-w-0 grid-cols-[repeat(2,minmax(0,1fr))] gap-1.5 rounded-[24px] border border-[#d7e4f5] bg-[#f5f8fc] p-2 sm:grid-cols-[repeat(3,minmax(0,1fr))] sm:gap-2">
      {stats.map((item) => (
        <div className="min-w-0 rounded-[18px] bg-white px-2 py-4 text-center sm:px-3" key={item.label}>
          <p className="truncate text-[22px] font-semibold leading-none text-[#0066cc] sm:text-[24px]">{item.value}</p>
          <p className="mt-2 truncate text-[9px] font-black uppercase tracking-[0.06em] text-[#667085] sm:text-[10px] sm:tracking-[0.08em]">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

function DetailInfoCard({
  icon,
  title,
  description,
}: Readonly<{
  description: string;
  icon: ReactNode;
  title: string;
}>) {
  return (
    <div className="rounded-[20px] border border-[#dbe6f2] bg-[#f8fbff] p-4">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#0066cc] shadow-[0_12px_28px_rgba(15,23,42,0.07)]">
        {icon}
      </div>
      <h3 className="mt-4 text-[15px] font-semibold text-[#101828]">{title}</h3>
      <p className="mt-2 text-[12px] leading-5 text-[#667085]">{description}</p>
    </div>
  );
}

function ProductSpecs({ specs }: Readonly<{ specs: ProductSpec[] }>) {
  return (
    <div className="grid gap-2">
      {specs.map((spec) => (
        <div className="flex min-w-0 flex-col gap-1 rounded-2xl bg-[#f5f8fc] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4" key={spec.label}>
          <span className="text-[12px] font-black uppercase tracking-[0.1em] text-[#667085]">{spec.label}</span>
          <span className="min-w-0 text-[13px] font-semibold text-[#1d1d1f] sm:text-right">{spec.value}</span>
        </div>
      ))}
    </div>
  );
}

function getProductSpecs(product: StaticMarketplaceProduct): ProductSpec[] {
  return [
    { label: "Category", value: product.category },
    { label: "Supplier", value: product.supplierName },
    { label: "Verification", value: product.isVerifiedSupplier ? "Verified supplier" : "Pending public verification" },
    { label: "Public price", value: "Not displayed" },
    { label: "Inquiry route", value: "Managed RFQ review" },
  ];
}

export function ProductCatalogPage({ products }: Readonly<ProductCatalogPageProps>) {
  const premiumCount = products.filter((product) => product.isVerifiedSupplier).length;
  const categories = [...new Set(products.map((product) => product.category))];
  const stats = [
    { label: "Products", value: String(products.length) },
    { label: "Verified", value: String(premiumCount) },
    { label: "Categories", value: String(categories.length) },
  ];

  return (
    <main className="w-full max-w-[100vw] min-w-0 overflow-hidden bg-[#f5f8fc] text-[#1d1d1f]">
      <section className="border-b border-[#dbe6f2] bg-white">
        <ProductContainer className="py-10 sm:py-14">
          <nav className="flex items-center gap-2 text-[12px] font-bold text-[#667085]">
            <Link className="text-[#0066cc]" href="/">B2B2G</Link>
            <span aria-hidden="true">/</span>
            <span>Products</span>
          </nav>
          <div className="mt-8 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <div className="min-w-0">
              <ProductBadge>Product catalog</ProductBadge>
              <h1 className="mt-4 max-w-[330px] text-[29px] font-semibold leading-[1.05] tracking-[-0.04em] text-[#101828] sm:max-w-4xl sm:text-[64px]">
                Approved supplier products for managed global sourcing.
              </h1>
              <p className="mt-5 max-w-[330px] text-[15px] leading-7 text-[#667085] sm:max-w-2xl">
                Browse supplier products prepared for protected inquiry routing. Pricing, buyer identity, and private contact data are not exposed on public surfaces.
              </p>
            </div>
            <div className="min-w-0 space-y-3">
              <ProductStats stats={stats} />
              <div className="min-w-0 rounded-[22px] border border-[#dbe6f2] bg-[#f8fbff] p-4">
                <p className="max-w-[320px] text-[12px] font-bold leading-5 text-[#667085] sm:max-w-none">
                  Product data is curated from the current marketplace home configuration. Search, filtering, and saved interests will be connected in a later product sprint.
                </p>
              </div>
            </div>
          </div>
        </ProductContainer>
      </section>

      <section className="py-10 sm:py-14">
        <ProductContainer>
          <ProductSectionHeader
            description="A commerce-first shelf for approved supplier products. Cards open protected product detail pages without exposing price or buyer contact data."
            eyebrow="Marketplace catalog"
            title="Supplier product shelf"
          />
          <div className="grid min-w-0 gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="min-w-0 space-y-3 lg:sticky lg:top-28 lg:self-start">
              <div className="max-w-full overflow-hidden rounded-[24px] border border-[#dbe6f2] bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.035)]">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0066cc]">Catalog lanes</p>
                <div className="mt-4 space-y-2">
                  <CatalogLane isActive label="All approved" value={String(products.length)} />
                  {categories.slice(0, 6).map((category) => (
                    <CatalogLane
                      key={category}
                      label={category}
                      value={String(products.filter((product) => product.category === category).length)}
                    />
                  ))}
                </div>
              </div>
              <div className="rounded-[24px] bg-[#08111f] p-5 text-white shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#9ecbff]">Buyer protection</p>
                <p className="mt-3 text-[20px] font-semibold leading-tight tracking-[-0.025em]">
                  RFQ review keeps discovery controlled.
                </p>
                <p className="mt-3 text-[12px] leading-5 text-white/68">
                  Buyer identity and contact fields stay outside public product pages.
                </p>
              </div>
            </aside>
            <div className="grid min-w-0 grid-cols-1 gap-4 min-[560px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-5">
              {products.map((product, index) => (
                <ProductCatalogCard key={product.id} product={product} priority={index < 4} />
              ))}
            </div>
          </div>
        </ProductContainer>
      </section>
    </main>
  );
}

export function ProductDetailPage({
  product,
  relatedProducts,
}: Readonly<ProductDetailPageProps>) {
  const specs = getProductSpecs(product);

  return (
    <main className="w-full max-w-[100vw] min-w-0 overflow-hidden bg-[#f5f8fc] text-[#1d1d1f]">
      <section className="bg-white">
        <ProductContainer className="py-8 sm:py-12">
          <nav className="flex items-center gap-2 text-[12px] font-bold text-[#667085]">
            <Link className="text-[#0066cc]" href="/">B2B2G</Link>
            <span aria-hidden="true">/</span>
            <Link className="text-[#0066cc]" href="/products">Products</Link>
            <span aria-hidden="true">/</span>
            <span className="truncate">{product.title}</span>
          </nav>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] lg:items-start">
            <div className="overflow-hidden rounded-[30px] border border-[#dbe6f2] bg-[#eef4fb] shadow-[0_26px_80px_rgba(15,23,42,0.08)]">
              <div className="relative aspect-square">
                <Image
                  alt={product.imageAlt}
                  className="object-cover"
                  fill
                  priority
                  sizes="(max-width: 1024px) 92vw, 640px"
                  src={product.imageUrl}
                />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#07111f]/52 to-transparent" />
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  {product.isVerifiedSupplier ? (
                    <ProductBadge>
                      <ShieldCheckIcon aria-hidden="true" className="h-3.5 w-3.5" />
                      Verified supplier
                    </ProductBadge>
                  ) : null}
                  <ProductBadge tone="dark">{product.category}</ProductBadge>
                </div>
              </div>
            </div>

            <article className="min-w-0 overflow-hidden rounded-[30px] border border-[#dbe6f2] bg-white p-5 shadow-[0_26px_80px_rgba(15,23,42,0.06)] sm:p-7">
              <ProductBadge tone="light">Managed RFQ product</ProductBadge>
              <h1 className="mt-5 max-w-[300px] text-[38px] font-semibold leading-[1.02] tracking-[-0.055em] text-[#101828] sm:max-w-none sm:text-[64px]">
                {product.title}
              </h1>
              <p className="mt-4 text-[16px] font-bold text-[#667085]">{product.supplierName}</p>
              <p className="mt-5 max-w-[300px] text-[16px] leading-8 text-[#596170] sm:max-w-2xl">{product.description}</p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <DetailInfoCard
                  description="Public product pages do not display supplier pricing."
                  icon={<BadgeIcon aria-hidden="true" className="h-5 w-5" />}
                  title="Price hidden"
                />
                <DetailInfoCard
                  description="Buyer identity and private contact fields are protected."
                  icon={<ShieldCheckIcon aria-hidden="true" className="h-5 w-5" />}
                  title="Buyer protected"
                />
                <DetailInfoCard
                  description="RFQ submission is prepared for admin-reviewed routing."
                  icon={<DocumentCheckIcon aria-hidden="true" className="h-5 w-5" />}
                  title="Managed RFQ"
                />
              </div>

              <div className="mt-7 grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                <div className="rounded-[22px] border border-[#dbe6f2] bg-[#f8fbff] p-5">
                  <h2 className="text-[17px] font-semibold text-[#1d1d1f]">Product profile</h2>
                  <div className="mt-4">
                    <ProductSpecs specs={specs} />
                  </div>
                </div>
                <div className="rounded-[22px] border border-[#dbe6f2] bg-[#08111f] p-5 text-white">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-[#9ecbff]">
                    <GlobeIcon aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-[18px] font-semibold">Protected sourcing path</h2>
                  <ol className="mt-4 space-y-3 text-[13px] leading-5 text-white/72">
                    <li>1. Buyer reviews approved product information.</li>
                    <li>2. RFQ submission enters managed review.</li>
                    <li>3. Admin workflow controls next-step disclosure.</li>
                  </ol>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#0066cc] px-5 text-[14px] font-bold text-white opacity-60" disabled type="button">
                  Managed RFQ coming soon
                </button>
                <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#dbe6f2] bg-white px-5 text-[14px] font-bold text-[#0066cc] transition hover:border-[#93c5fd]" href="/signup/supplier">
                  Supplier registration
                  <ArrowUpRightIcon aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            </article>
          </div>
        </ProductContainer>
      </section>

      <section className="py-10 sm:py-14">
        <ProductContainer>
          <ProductSectionHeader
            action={(
              <Link className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#dbe6f2] bg-white px-4 text-[13px] font-bold text-[#0066cc]" href="/products">
                View catalog
                <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
              </Link>
            )}
            description="More approved products prepared for the same protected RFQ experience."
            eyebrow="Related products"
            title="More approved listings"
          />
          <div className="grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.slice(0, 4).map((item) => (
              <ProductCatalogCard key={item.id} product={item} />
            ))}
          </div>
        </ProductContainer>
      </section>
    </main>
  );
}
