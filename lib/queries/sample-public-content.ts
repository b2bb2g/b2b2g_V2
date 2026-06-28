import type { PublicContentDetail } from "@/lib/queries/public-content";
import {
  getSampleItem,
  type SampleMenuKind,
} from "@/lib/sample/public-samples";

type SamplePageConfig = {
  backHref: string;
  detailTitleKey: string;
  listTitleKey: string;
};

const samplePageConfig: Record<
  Extract<SampleMenuKind, "events" | "networking" | "notice" | "service">,
  SamplePageConfig
> = {
  events: {
    backHref: "/events",
    detailTitleKey: "content.events.detailTitle",
    listTitleKey: "content.events.title",
  },
  networking: {
    backHref: "/networking",
    detailTitleKey: "content.networking.detailTitle",
    listTitleKey: "content.networking.title",
  },
  notice: {
    backHref: "/notice",
    detailTitleKey: "content.notice.detailTitle",
    listTitleKey: "content.notice.title",
  },
  service: {
    backHref: "/service",
    detailTitleKey: "content.thailandFda.detailTitle",
    listTitleKey: "content.thailandFda.title",
  },
};

export function getSamplePublicContentDetail(
  kind: keyof typeof samplePageConfig,
  id: string,
): PublicContentDetail | null {
  const sample = getSampleItem(kind, id);

  if (!sample) {
    return null;
  }

  return {
    ...sample,
    ...samplePageConfig[kind],
    facts: [
      { labelKey: "content.fact.company", value: sample.companyName },
      { labelKey: "content.fact.industry", value: sample.meta },
      { labelKey: "content.fact.status", value: "Sample approved" },
    ],
    kind: "commercial",
  };
}
