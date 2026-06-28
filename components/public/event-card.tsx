import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, MapPinIcon } from "@/components/public/icons";
import { t } from "@/lib/i18n/translation";
import type { PublicContentItem } from "@/lib/queries/public-content";

type EventCardItem = Pick<
  PublicContentItem,
  | "companyName"
  | "createdAt"
  | "href"
  | "id"
  | "imageAlt"
  | "imageUrl"
  | "meta"
  | "summary"
  | "title"
  | "venue"
>;

export type EventStatus = "closed" | "ongoing" | "upcoming";

export function getEventStatus(value: string): EventStatus {
  const eventDate = new Date(value);
  const now = new Date();
  const eventDay = Date.UTC(
    eventDate.getUTCFullYear(),
    eventDate.getUTCMonth(),
    eventDate.getUTCDate(),
  );
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  if (eventDay < today) return "closed";
  if (eventDay > today) return "upcoming";
  return "ongoing";
}

export const eventStatusLabelKeys: Record<EventStatus, string> = {
  closed: "content.events.status.closed",
  ongoing: "content.events.status.ongoing",
  upcoming: "content.events.status.upcoming",
};

const statusDotClasses: Record<EventStatus, string> = {
  closed: "bg-calm-ink-muted-48",
  ongoing: "animate-pulse bg-action-blue",
  upcoming: "border-2 border-action-blue bg-white",
};

const statusTextClasses: Record<EventStatus, string> = {
  closed: "text-calm-ink-muted-48",
  ongoing: "text-action-blue",
  upcoming: "text-action-blue",
};

function formatEventDay(value: string): string {
  return new Date(value).toLocaleDateString("en-US", { day: "numeric", timeZone: "UTC" });
}

function formatEventMonth(value: string): string {
  return new Date(value)
    .toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })
    .toUpperCase();
}

export function EventCard({
  item,
  priority = false,
}: Readonly<{
  item: EventCardItem;
  priority?: boolean;
}>) {
  const status = getEventStatus(item.createdAt);
  const isClosed = status === "closed";

  return (
    <Link className="group block h-full" href={item.href}>
      <article
        className={`flex h-full flex-col overflow-hidden rounded-[18px] border border-calm-hairline bg-white transition-all duration-300 sm:flex-row ${
          isClosed
            ? "opacity-75 hover:border-calm-ink-muted-48"
            : "hover:-translate-y-0.5 hover:border-action-blue/30 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]"
        }`}
      >
        <div className="relative h-44 w-full shrink-0 overflow-hidden bg-canvas-parchment sm:h-auto sm:w-[38%]">
          {item.imageUrl ? (
            <Image
              alt={item.imageAlt ?? item.title}
              className={`object-cover transition-transform duration-500 group-hover:scale-110 ${
                isClosed ? "grayscale" : ""
              }`}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 280px, (min-width: 640px) 38vw, 100vw"
              src={item.imageUrl}
            />
          ) : (
            <div className="flex h-full items-center justify-center type-caption text-calm-ink-muted-48">
              {t("brand.name")}
            </div>
          )}

          <span className="product-shadow absolute left-3 top-3 inline-flex items-center rounded-full bg-white px-3 py-1 type-caption-strong text-action-blue">
            {item.meta ?? t("content.publicMarketplace")}
          </span>

          <div className="product-shadow absolute right-3 top-3 flex w-12 flex-col items-center rounded-xl bg-white py-1.5">
            <span className="type-caption-strong leading-none text-action-blue">
              {formatEventMonth(item.createdAt)}
            </span>
            <span className="type-tagline leading-none text-calm-ink">
              {formatEventDay(item.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-6">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${statusDotClasses[status]}`} />
            <span className={`type-caption-strong ${statusTextClasses[status]}`}>
              {t(eventStatusLabelKeys[status])}
            </span>
          </div>

          <h3 className="type-body-strong line-clamp-2 min-h-[42px] text-calm-ink transition-colors group-hover:text-action-blue">
            {item.title}
          </h3>
          <p className="type-caption line-clamp-2 min-h-10 text-calm-ink-muted-80">
            {item.summary}
          </p>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-calm-hairline pt-4">
            {item.venue ? (
              <span className="flex min-w-0 items-center gap-1.5 type-caption text-calm-ink-muted-48">
                <MapPinIcon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.venue}</span>
              </span>
            ) : (
              <span />
            )}
            <span className="flex shrink-0 items-center gap-1 type-button-utility text-action-blue">
              {t("content.viewDetails")}
              <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
