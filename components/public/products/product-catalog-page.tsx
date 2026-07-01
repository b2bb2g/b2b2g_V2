import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRightIcon,
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

function ProductContainer({
  children,
  className = "",
}: Readonly<{
  children: ReactNode;
  className?: string;
}>) {
  return (
    <div className={`mx-auto box-border w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 ${className}`}>
      {children}
    </div>
  );
}

function ProductBadge({
  children,
  tone = "blue",
}: Readonly<{
  children: ReactNode;
  tone?: "blue" | "dark" | "light";
}>) {
  const toneClass = {
    blue: "bg-[#0066cc] text-white",
    dark: "bg-[#08111f] text-white",
    light: "bg-[#edf5ff] text-[#0066cc]",
  }[tone];

  return (
    <span className={`inline-flex min-h-7 items-center gap-1.5 rounded-full px-2.5 text-[10px] font-black uppercase tracking-[0.1em] ${toneClass}`}>
      {children}
    </span>
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
      className="group flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-[#dbe6f2] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.045)] transition duration-300 hover:-translate-y-1 hover:border-[#93c5fd] hover:shadow-[0_26px_70px_rgba(15,23,42,0.1)]"
      href={product.detailHref}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#eef4fb]">
        <Image
          alt={product.imageAlt}
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
          fill
          priority={priority}
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 44vw, 320px"
          src={product.imageUrl}
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#07111f]/42 to-transparent" />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          {product.isVerifiedSupplier ? (
            <ProductBadge>
              <ShieldCheckIcon aria-hidden="true" className="h-3.5 w-3.5" />
              Verified
            </ProductBadge>
          ) : (
            <ProductBadge tone="light">{product.category}</ProductBadge>
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
        <h2 className="mt-2 line-clamp-2 min-h-[40px] text-[18px] font-semibold leading-[1.12] tracking-[-0.02em] text-[#1d1d1f]">
          {product.title}
        </h2>
        <p className="mt-2 line-clamp-2 min-h-[38px] text-[13px] leading-5 text-[#667085]">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f8fc] px-2.5 py-1.5 text-[11px] font-bold text-[#667085]">
            <ShieldCheckIcon aria-hidden="true" className="h-3.5 w-3.5 text-[#0066cc]" />
            Managed inquiry
          </span>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#edf5ff] text-[#0066cc] transition group-hover:bg-[#0066cc] group-hover:text-white">
            <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ProductCatalogPage({ products }: Readonly<ProductCatalogPageProps>) {
  const premiumCount = products.filter((product) => product.isVerifiedSupplier).length;
  const categoryCount = new Set(products.map((product) => product.category)).size;

  return (
    <main className="bg-[#f5f8fc] text-[#1d1d1f]">
      <section className="border-b border-[#dbe6f2] bg-white">
        <ProductContainer className="py-10 sm:py-14">
          <nav className="flex items-center gap-2 text-[12px] font-bold text-[#667085]">
            <Link className="text-[#0066cc]" href="/">B2B2G</Link>
            <span aria-hidden="true">/</span>
            <span>Products</span>
          </nav>
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <div>
              <ProductBadge>Product catalog</ProductBadge>
              <h1 className="mt-4 max-w-4xl text-[40px] font-semibold leading-[1.02] tracking-[-0.055em] text-[#101828] sm:text-[64px]">
                Approved supplier products for managed global sourcing.
              </h1>
              <p className="mt-5 max-w-2xl text-[15px] leading-7 text-[#667085]">
                Browse product cards prepared for protected inquiry routing. Pricing, buyer identity, and private contact data are not exposed on public surfaces.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-[22px] border border-[#d7e4f5] bg-[#f5f8fc] p-2">
              {[
                [String(products.length), "Products"],
                [String(premiumCount), "Verified"],
                [String(categoryCount), "Categories"],
              ].map(([value, label]) => (
                <div className="rounded-[18px] bg-white px-3 py-4 text-center" key={label}>
                  <p className="text-[24px] font-semibold leading-none text-[#0066cc]">{value}</p>
                  <p className="mt-2 text-[10px] font-black uppercase tracking-[0.08em] text-[#667085]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </ProductContainer>
      </section>

      <section className="py-10 sm:py-14">
        <ProductContainer>
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0066cc]">Marketplace catalog</p>
              <h2 className="mt-2 text-[30px] font-semibold leading-[1.05] tracking-[-0.04em] sm:text-[42px]">
                Product cards
              </h2>
            </div>
            <p className="max-w-xl text-[13px] leading-6 text-[#667085]">
              Explore supplier products prepared for a managed inquiry experience. Advanced search, saved interests, and RFQ submission will open in the next marketplace step.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 lg:grid-cols-4 xl:gap-5">
            {products.map((product, index) => (
              <ProductCatalogCard key={product.id} product={product} priority={index < 4} />
            ))}
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
  return (
    <main className="bg-[#f5f8fc] text-[#1d1d1f]">
      <section className="bg-white">
        <ProductContainer className="py-8 sm:py-12">
          <nav className="flex items-center gap-2 text-[12px] font-bold text-[#667085]">
            <Link className="text-[#0066cc]" href="/">B2B2G</Link>
            <span aria-hidden="true">/</span>
            <Link className="text-[#0066cc]" href="/products">Products</Link>
            <span aria-hidden="true">/</span>
            <span className="truncate">{product.title}</span>
          </nav>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
            <div className="overflow-hidden rounded-[30px] border border-[#dbe6f2] bg-[#eef4fb] shadow-[0_26px_80px_rgba(15,23,42,0.08)]">
              <div className="relative aspect-[4/3]">
                <Image
                  alt={product.imageAlt}
                  className="object-cover"
                  fill
                  priority
                  sizes="(max-width: 1024px) 92vw, 640px"
                  src={product.imageUrl}
                />
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#07111f]/48 to-transparent" />
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

            <article className="rounded-[30px] border border-[#dbe6f2] bg-white p-5 shadow-[0_26px_80px_rgba(15,23,42,0.06)] sm:p-7">
              <ProductBadge tone="light">Managed inquiry product</ProductBadge>
              <h1 className="mt-5 text-[42px] font-semibold leading-[1.02] tracking-[-0.055em] text-[#101828] sm:text-[64px]">
                {product.title}
              </h1>
              <p className="mt-4 text-[16px] font-bold text-[#667085]">{product.supplierName}</p>
              <p className="mt-5 max-w-2xl text-[16px] leading-8 text-[#596170]">{product.description}</p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[
                  ["Pricing", "Hidden"],
                  ["Buyer data", "Protected"],
                  ["Inquiry", "Managed"],
                ].map(([label, value]) => (
                  <div className="rounded-[18px] border border-[#dbe6f2] bg-[#f5f8fc] p-4" key={label}>
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#0066cc]">{label}</p>
                    <p className="mt-2 text-[15px] font-semibold text-[#1d1d1f]">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-7 rounded-[22px] border border-[#dbe6f2] bg-[#f8fbff] p-5">
                <div className="flex items-start gap-3">
                  <ShieldCheckIcon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#0066cc]" />
                  <div>
                    <h2 className="text-[17px] font-semibold text-[#1d1d1f]">Protected B2B workflow</h2>
                    <p className="mt-2 text-[13px] leading-6 text-[#667085]">
                      Product inquiry submission will be connected to the admin-reviewed RFQ workflow. Buyer identity and contact details stay protected from this page.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#0066cc] px-5 text-[14px] font-bold text-white opacity-60" disabled type="button">
                  Managed inquiry coming soon
                </button>
                <Link className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#dbe6f2] bg-white px-5 text-[14px] font-bold text-[#0066cc] transition hover:border-[#93c5fd]" href="/signup/supplier">
                  Supplier registration
                </Link>
              </div>
            </article>
          </div>
        </ProductContainer>
      </section>

      <section className="py-10 sm:py-14">
        <ProductContainer>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0066cc]">Related products</p>
              <h2 className="mt-2 text-[30px] font-semibold leading-[1.05] tracking-[-0.04em]">More approved listings</h2>
            </div>
            <Link className="hidden min-h-10 items-center gap-2 rounded-full border border-[#dbe6f2] bg-white px-4 text-[13px] font-bold text-[#0066cc] sm:inline-flex" href="/products">
              View catalog
              <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
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
