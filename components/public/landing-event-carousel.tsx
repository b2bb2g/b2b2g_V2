"use client";

import Image from "next/image";
import Link from "next/link";
import {
  eventStatusLabelKeys,
  getEventStatus,
  type EventStatus,
} from "@/components/public/event-card";
import { ArrowRightIcon, MapPinIcon } from "@/components/public/icons";
import { t } from "@/lib/i18n/translation";
import type { PublicContentItem } from "@/lib/queries/public-content";

type LandingEventItem = Pick<
  PublicContentItem,
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

const statusRank: Record<EventStatus, number> = {
  ongoing: 0,
  upcoming: 1,
  closed: 2,
};

const statusDotClasses: Record<EventStatus, string> = {
  closed: "bg-white/48",
  ongoing: "animate-pulse bg-action-blue",
  upcoming: "border-2 border-action-blue bg-white",
};

const statusTextClasses: Record<EventStatus, string> = {
  closed: "text-white/58",
  ongoing: "text-sky-link",
  upcoming: "text-sky-link",
};

function formatEventDay(value: string): string {
  return new Date(value).toLocaleDateString("en-US", { day: "numeric", timeZone: "UTC" });
}

function formatEventMonth(value: string): string {
  return new Date(value)
    .toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })
    .toUpperCase();
}

function EventDateBadge({
  compact = false,
  value,
}: Readonly<{
  compact?: boolean;
  value: string;
}>) {
  return (
    <span className="flex w-14 shrink-0 flex-col items-center rounded-2xl bg-white/94 py-2 shadow-sm">
      <span className="type-caption-strong leading-none text-action-blue">
        {formatEventMonth(value)}
      </span>
      <span className={`${compact ? "text-[18px]" : "type-tagline"} leading-none text-calm-ink`}>
        {formatEventDay(value)}
      </span>
    </span>
  );
}

function EventStatusPill({ status }: Readonly<{ status: EventStatus }>) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
      <span className={`h-2.5 w-2.5 rounded-full ${statusDotClasses[status]}`} />
      <span className={`type-caption-strong ${statusTextClasses[status]}`}>
        {t(eventStatusLabelKeys[status])}
      </span>
    </span>
  );
}

function ScheduleEventCard({ item }: Readonly<{ item: LandingEventItem }>) {
  const status = getEventStatus(item.createdAt);

  return (
    <Link className="landing-event-schedule-card group" href={item.href}>
      <EventDateBadge compact value={item.createdAt} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${statusDotClasses[status]}`} />
          <span className={`type-caption-strong ${statusTextClasses[status]}`}>
            {t(eventStatusLabelKeys[status])}
          </span>
        </span>
        <span className="mt-2 block line-clamp-2 text-[15px] font-semibold leading-tight text-white">
          {item.title}
        </span>
        {item.venue ? (
          <span className="mt-2 flex min-w-0 items-center gap-1.5 type-caption text-white/56">
            <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{item.venue}</span>
          </span>
        ) : null}
      </span>
      <span className="landing-event-schedule-arrow" aria-hidden="true">
        <ArrowRightIcon className="h-4 w-4" />
      </span>
    </Link>
  );
}

export function LandingEventCarousel({ items }: Readonly<{ items: LandingEventItem[] }>) {
  const selected = items
    .slice(0, 8)
    .map((item) => ({ item, status: getEventStatus(item.createdAt) }))
    .sort((a, b) => {
      const rankDiff = statusRank[a.status] - statusRank[b.status];
      if (rankDiff !== 0) return rankDiff;
      return new Date(a.item.createdAt).getTime() - new Date(b.item.createdAt).getTime();
    })
    .slice(0, 4);

  const featured = selected[0]?.item;
  const featuredStatus = selected[0]?.status;
  const secondary = selected.slice(1).map((entry) => entry.item);

  if (!featured || !featuredStatus) {
    return null;
  }

  return (
    <div className="landing-event-showcase mt-8">
      <Link className="landing-event-feature group" href={featured.href}>
        <span className="absolute inset-0">
          {featured.imageUrl ? (
            <Image
              alt={featured.imageAlt ?? featured.title}
              className="object-cover transition duration-700 group-hover:scale-[1.03]"
              draggable={false}
              fill
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              src={featured.imageUrl}
            />
          ) : null}
        </span>
        <span className="absolute inset-0 bg-gradient-to-r from-black/78 via-black/42 to-black/8" />
        <span className="relative z-10 flex min-h-[460px] flex-col justify-between p-6 sm:p-8 lg:p-10">
          <span className="flex items-start justify-between gap-5">
            <span>
              <span className="inline-flex rounded-full bg-white/12 px-3 py-1.5 type-caption-strong text-white/82 backdrop-blur">
                {featured.meta ?? t("content.events.title")}
              </span>
              <span className="mt-4 block">
                <EventStatusPill status={featuredStatus} />
              </span>
            </span>
            <EventDateBadge value={featured.createdAt} />
          </span>

          <span className="block max-w-2xl">
            <span className="block text-[34px] font-semibold leading-tight text-white md:text-[48px]">
              {featured.title}
            </span>
            <span className="mt-4 block max-w-xl text-[16px] leading-7 text-white/70">
              {featured.summary}
            </span>
            <span className="mt-7 flex flex-wrap items-center gap-4">
              {featured.venue ? (
                <span className="flex min-w-0 items-center gap-2 type-caption-strong text-white/72">
                  <MapPinIcon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{featured.venue}</span>
                </span>
              ) : null}
              <span className="landing-action-pill bg-white text-calm-ink group-hover:bg-white/88">
                {t("content.viewDetails")}
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </span>
          </span>
        </span>
      </Link>

      <div className="landing-event-panel">
        <div>
          <p className="type-caption-strong text-sky-link">{t("home.events.selectedLabel")}</p>
          <h3 className="mt-2 text-[28px] font-semibold leading-tight text-white">
            {t("home.events.panelTitle")}
          </h3>
          <p className="type-caption mt-3 text-white/58">{t("home.events.panelLead")}</p>
        </div>

        <div className="mt-6 grid gap-3">
          {secondary.map((item) => (
            <ScheduleEventCard item={item} key={item.id} />
          ))}
        </div>
      </div>
    </div>
  );
}
