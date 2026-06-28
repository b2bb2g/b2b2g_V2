import type { Metadata } from "next";
import Link from "next/link";
import { ProductTile } from "@/components/public/marketplace-carousel";
import { t } from "@/lib/i18n/translation";
import { getPublicContentList, type PublicContentItem } from "@/lib/queries/public-content";
import { buildPublicMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPublicMetadata({
  canonicalPath: "/buy-sell",
  description: t("buySell.description"),
  title: t("nav.buySell"),
});

function BuySellSection({
  descriptionKey,
  eyebrowKey,
  href,
  items,
  titleKey,
}: Readonly<{
  descriptionKey: string;
  eyebrowKey: string;
  href: string;
  items: PublicContentItem[];
  titleKey: string;
}>) {
  const previewItems = items.slice(0, 8);

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="type-caption-strong text-action-blue">{t(eyebrowKey)}</p>
          <h2 className="type-display-md mt-2 text-calm-ink">{t(titleKey)}</h2>
          <p className="type-body mt-2 max-w-2xl text-calm-ink-muted-80">
            {t(descriptionKey)}
          </p>
        </div>
        <Link className="pill-secondary shrink-0" href={href}>
          {t("home.viewAll")}
        </Link>
      </div>

      {previewItems.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {previewItems.map((item, index) => (
            <ProductTile item={item} key={item.id} priority={index < 4} />
          ))}
        </div>
      ) : (
        <p className="mt-8 rounded-2xl border border-calm-hairline bg-white p-6 type-body text-calm-ink-muted-80">
          {t("content.empty")}
        </p>
      )}
    </div>
  );
}

export default async function BuySellPage() {
  const [sellProductItems, buyRequestItems] = await Promise.all([
    getPublicContentList("sell-products"),
    getPublicContentList("buy-requests"),
  ]);

  return (
    <main className="bg-canvas">
      <section className="bg-canvas-parchment py-16">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
          <nav className="flex items-center gap-2 type-caption text-calm-ink-muted-48">
            <Link className="text-action-blue" href="/">
              {t("brand.name")}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-calm-ink-muted-80">{t("nav.buySell")}</span>
          </nav>
          <h1 className="type-display-lg mt-6 text-calm-ink">{t("nav.buySell")}</h1>
          <p className="type-body mt-4 max-w-2xl text-calm-ink-muted-80">
            {t("buySell.description")}
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link className="pill-primary" href="/buy-sell/sell-products">
              {t("buySell.sellProductsCta")}
            </Link>
            <Link className="pill-secondary" href="/buy-sell/buy-requests">
              {t("buySell.buyRequestsCta")}
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-canvas py-16">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
          <BuySellSection
            descriptionKey="content.sellProducts.description"
            eyebrowKey="buySell.sellProducts.eyebrow"
            href="/buy-sell/sell-products"
            items={sellProductItems}
            titleKey="content.sellProducts.title"
          />
        </div>
      </section>

      <section className="bg-canvas-parchment py-16">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
          <BuySellSection
            descriptionKey="content.buyRequests.description"
            eyebrowKey="buySell.buyRequests.eyebrow"
            href="/buy-sell/buy-requests"
            items={buyRequestItems}
            titleKey="content.buyRequests.title"
          />
        </div>
      </section>
    </main>
  );
}
