"use client";

import { useMemo, useState } from "react";
import { EventCard, getEventStatus, type EventStatus } from "@/components/public/event-card";
import { t } from "@/lib/i18n/translation";
import type { PublicContentItem } from "@/lib/queries/public-content";

type FilterValue = "all" | EventStatus;

const filterOrder: FilterValue[] = ["all", "ongoing", "upcoming", "closed"];

const filterLabelKeys: Record<FilterValue, string> = {
  all: "content.events.filter.all",
  closed: "content.events.status.closed",
  ongoing: "content.events.status.ongoing",
  upcoming: "content.events.status.upcoming",
};

const statusRank: Record<EventStatus, number> = {
  ongoing: 0,
  upcoming: 1,
  closed: 2,
};

export function EventListSection({ items }: Readonly<{ items: PublicContentItem[] }>) {
  const [filter, setFilter] = useState<FilterValue>("all");

  const decorated = useMemo(
    () =>
      items
        .map((item) => ({ item, status: getEventStatus(item.createdAt) }))
        .sort((a, b) => {
          const rankDiff = statusRank[a.status] - statusRank[b.status];
          if (rankDiff !== 0) return rankDiff;
          return new Date(a.item.createdAt).getTime() - new Date(b.item.createdAt).getTime();
        }),
    [items],
  );

  const counts = useMemo(() => {
    const base: Record<FilterValue, number> = {
      all: decorated.length,
      closed: 0,
      ongoing: 0,
      upcoming: 0,
    };
    for (const entry of decorated) base[entry.status] += 1;
    return base;
  }, [decorated]);

  const visible =
    filter === "all" ? decorated : decorated.filter((entry) => entry.status === filter);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-calm-hairline pb-5">
        <p className="type-caption-strong text-calm-ink-muted-48">
          {visible.length.toLocaleString()} {t("content.resultCount")}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {filterOrder.map((value) => (
            <button
              className={`calm-chip ${filter === value ? "calm-chip-selected" : ""}`}
              key={value}
              onClick={() => setFilter(value)}
              type="button"
            >
              {t(filterLabelKeys[value])}
              <span className="ml-1.5 text-calm-ink-muted-48">{counts[value]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {visible.length === 0 ? (
          <p className="rounded-2xl border border-calm-hairline bg-white p-6 type-body text-calm-ink-muted-80">
            {t("content.empty")}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {visible.map((entry, index) => (
              <EventCard item={entry.item} key={entry.item.id} priority={index < 2} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
