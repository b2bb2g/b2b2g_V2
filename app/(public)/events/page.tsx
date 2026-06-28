import type { Metadata } from "next";
import Link from "next/link";
import { EventListSection } from "@/components/public/event-list";
import { t } from "@/lib/i18n/translation";
import { getSampleItems } from "@/lib/sample/public-samples";
import { buildPublicMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPublicMetadata({
  canonicalPath: "/events",
  description: t("content.events.description"),
  title: t("content.events.title"),
});

export default function EventsPage() {
  const items = getSampleItems("events");

  return (
    <main className="bg-canvas">
      <section className="bg-canvas-parchment py-16">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
          <nav className="flex items-center gap-2 type-caption text-calm-ink-muted-48">
            <Link className="text-action-blue" href="/">
              {t("brand.name")}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-calm-ink-muted-80">{t("content.events.title")}</span>
          </nav>
          <h1 className="type-display-lg mt-6 text-calm-ink">{t("content.events.title")}</h1>
          <p className="type-body mt-4 max-w-2xl text-calm-ink-muted-80">
            {t("content.events.description")}
          </p>
        </div>
      </section>

      <section className="bg-canvas py-16">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
          <EventListSection items={items} />
        </div>
      </section>
    </main>
  );
}
