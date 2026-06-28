import Image from "next/image";
import Link from "next/link";
import { ProductCarousel, ProductTile } from "@/components/public/marketplace-carousel";
import { t } from "@/lib/i18n/translation";
import type { PublicContentDetail, PublicContentItem } from "@/lib/queries/public-content";

type ContentListPageProps = {
  descriptionKey: string;
  emptyKey?: string;
  items: PublicContentItem[];
  titleKey: string;
  variant?: "marketplace" | "notice";
};

type ContentDetailPageProps = {
  content: PublicContentDetail;
};

function ResultToolbar({ count }: Readonly<{ count: number }>) {
  return (
    <p className="type-caption-strong border-b border-calm-hairline pb-4 text-calm-ink-muted-48">
      {count.toLocaleString()} {t("content.resultCount")}
    </p>
  );
}

function NoticeTable({ items }: Readonly<{ items: PublicContentItem[] }>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-calm-hairline bg-white">
      <div className="grid min-w-[640px] grid-cols-[80px_1fr_140px] border-b border-calm-hairline bg-canvas-parchment px-6 py-4 type-caption-strong text-calm-ink-muted-80">
        <span>{t("content.no")}</span>
        <span>{t("content.titleColumn")}</span>
        <span>{t("content.date")}</span>
      </div>
      <div className="min-w-[640px] divide-y divide-calm-hairline">
        {items.map((item, index) => (
          <Link
            className="grid grid-cols-[80px_1fr_140px] px-6 py-5 type-body transition hover:bg-canvas-parchment"
            href={item.href}
            key={item.id}
          >
            <span className="type-caption text-calm-ink-muted-48">
              {items.length - index}
            </span>
            <span className="text-calm-ink">{item.title}</span>
            <span className="type-caption text-calm-ink-muted-48">
              {new Date(item.createdAt).toISOString().slice(0, 10)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function FactItem({
  label,
  value,
}: Readonly<{
  label: string;
  value?: string | null;
}>) {
  return (
    <div className="border-l border-slate-200 pl-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-base font-semibold text-slate-950">
        {value || t("content.notAvailable")}
      </p>
    </div>
  );
}

export function PublicContentListPage({
  descriptionKey,
  emptyKey = "content.empty",
  items,
  titleKey,
  variant = "marketplace",
}: Readonly<ContentListPageProps>) {
  const hasItems = items.length > 0;
  const topItems = items.slice(0, 20);
  const newItems = items.slice().reverse().slice(0, 20);
  const showCarousels = variant === "marketplace" && hasItems;

  return (
    <main className="bg-canvas">
      <section className="bg-canvas-parchment py-16">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
          <nav className="flex items-center gap-2 type-caption text-calm-ink-muted-48">
            <Link className="text-action-blue" href="/">
              {t("brand.name")}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-calm-ink-muted-80">{t(titleKey)}</span>
          </nav>
          <h1 className="type-display-lg mt-6 text-calm-ink">{t(titleKey)}</h1>
          <p className="type-body mt-4 max-w-2xl text-calm-ink-muted-80">
            {t(descriptionKey)}
          </p>
        </div>
      </section>

      {showCarousels ? (
        <section className="bg-canvas py-16">
          <div className="mx-auto max-w-[1440px] space-y-16 px-5 sm:px-8 lg:px-10">
            <ProductCarousel items={topItems} titleKey="content.topPicks" />
            <ProductCarousel items={newItems} titleKey="content.newArrivals" />
          </div>
        </section>
      ) : null}

      <section className={showCarousels ? "bg-canvas-parchment py-16" : "bg-canvas py-16"}>
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
          <ResultToolbar count={items.length} />

          <div className="mt-8">
            {!hasItems ? (
              <p className="rounded-2xl border border-calm-hairline bg-white p-6 type-body text-calm-ink-muted-80">
                {t(emptyKey)}
              </p>
            ) : variant === "notice" ? (
              <div className="overflow-x-auto">
                <NoticeTable items={items} />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item, index) => (
                  <ProductTile item={item} key={item.id} priority={index < 4} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export function PublicContentDetailPage({
  content,
}: Readonly<ContentDetailPageProps>) {
  return (
    <main className="bg-white">
      <section className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_360px] lg:px-10">
          <div>
            <Link
              className="text-sm font-semibold text-blue-200 hover:text-white"
              href={content.backHref}
            >
              {t("content.backToList")}
            </Link>
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-blue-200">
              {t(content.detailTitleKey)}
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl">
              {content.title}
            </h1>
            {content.summary ? (
              <p className="mt-6 max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
                {content.summary}
              </p>
            ) : null}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="btn-primary" href="/login">
                {t("content.signInToConnect")}
              </Link>
              {content.companySlug ? (
                <Link
                  className="btn-secondary border-white/30 bg-white/10 text-white hover:border-white hover:text-white"
                  href={`/companies/${content.companySlug}`}
                >
                  {t("content.viewCompany")}
                </Link>
              ) : null}
            </div>
          </div>

          <aside className="border border-white/15 bg-white p-5 text-slate-950">
            <h2 className="text-lg font-semibold">{t("content.keyDetails")}</h2>
            <div className="mt-5 space-y-5">
              {content.facts.map((fact) => (
                <FactItem
                  key={fact.labelKey}
                  label={t(fact.labelKey)}
                  value={fact.value}
                />
              ))}
            </div>
          </aside>
        </div>
      </section>

      {content.imageUrl ? (
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
            <div className="relative aspect-[16/7] overflow-hidden bg-slate-100">
              <Image
                alt={content.imageAlt ?? content.title}
                className="object-cover"
                fill
                priority
                sizes="100vw"
                src={content.imageUrl}
              />
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-12">
        <div className="mx-auto max-w-4xl px-5 sm:px-8 lg:px-10">
          <h2 className="text-2xl font-semibold text-slate-950">
            {t("content.overview")}
          </h2>
          <p className="mt-5 whitespace-pre-line text-base leading-8 text-slate-700">
            {content.body || content.summary || t("content.empty")}
          </p>
        </div>
      </section>
    </main>
  );
}
