import type {
  MarketplaceHomeAnnouncement,
  MarketplaceHomeChannel,
  MarketplaceHomeConfig,
  MarketplaceHomeEvent,
  MarketplaceHomeProduct,
  MarketplaceHomeRequest,
} from "@/components/public/landing/marketplace-home";
import { staticLandingConfig } from "@/lib/landing/static-landing-config";
import {
  getPublicContentList,
  type PublicContentItem,
  type PublicContentKind,
} from "@/lib/queries/public-content";
import {
  getSampleItems,
  type SampleContentItem,
  type SampleMenuKind,
} from "@/lib/sample/public-samples";

const PREMIUM_PRODUCT_LIMIT = 4;
const LATEST_PRODUCT_LIMIT = 8;
const CHANNEL_ITEM_LIMIT = 3;

const FALLBACK_IMAGE =
  staticLandingConfig.marketplaceHome.latestProducts[0]?.imageUrl ??
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=80";

const dateLabelFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
});

function safeText(value: null | string | undefined, fallback: string): string {
  return value && value.trim().length > 0 ? value : fallback;
}

function imageAltFor(item: Pick<PublicContentItem, "imageAlt" | "title">): string {
  return safeText(item.imageAlt, item.title);
}

function imageUrlFor(item: Pick<PublicContentItem, "imageUrl">): string {
  return safeText(item.imageUrl, FALLBACK_IMAGE);
}

function formatDateLabel(createdAt: string): string {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "Now";
  }

  return dateLabelFormatter.format(date);
}

function sampleToPublicItem(item: SampleContentItem): PublicContentItem {
  return {
    companyName: item.companyName,
    companySlug: item.companySlug,
    createdAt: item.createdAt,
    href: item.href,
    id: item.id,
    imageAlt: item.imageAlt,
    imageUrl: item.imageUrl,
    meta: item.meta,
    summary: item.summary,
    title: item.title,
    venue: item.venue,
  };
}

async function safePublicContentList(
  kind: PublicContentKind,
  fallbackKind: SampleMenuKind = kind,
): Promise<PublicContentItem[]> {
  try {
    return await getPublicContentList(kind);
  } catch {
    return getSampleItems(fallbackKind).map(sampleToPublicItem);
  }
}

function sampleContentList(kind: SampleMenuKind): PublicContentItem[] {
  return getSampleItems(kind).map(sampleToPublicItem);
}

function contentToChannel(
  id: string,
  title: string,
  href: string,
  items: PublicContentItem[],
  description: string,
  statusLabel: string,
): MarketplaceHomeChannel {
  return {
    ctaLabel: `View ${title}`,
    description,
    href,
    id,
    items: items.slice(0, CHANNEL_ITEM_LIMIT).map((item) => ({
      href: item.href,
      id: item.id,
      imageAlt: imageAltFor(item),
      imageUrl: imageUrlFor(item),
      meta: safeText(item.meta, title),
      summary: safeText(item.summary, "Approved marketplace content prepared for public discovery."),
      title: item.title,
    })),
    statusLabel,
    title,
  };
}

function contentToRequest(item: PublicContentItem): MarketplaceHomeRequest {
  return {
    badge: "RFQ",
    href: item.href,
    id: item.id,
    imageAlt: imageAltFor(item),
    imageUrl: imageUrlFor(item),
    quantity: safeText(item.meta, "Quantity protected"),
    spec: safeText(item.summary, "Protected buyer request with managed marketplace handling."),
    title: item.title,
  };
}

function contentToEvent(item: PublicContentItem): MarketplaceHomeEvent {
  return {
    badge: safeText(item.meta, "Event"),
    dateLabel: formatDateLabel(item.createdAt),
    href: item.href,
    id: item.id,
    imageAlt: imageAltFor(item),
    imageUrl: imageUrlFor(item),
    locationLabel: safeText(item.venue, safeText(item.meta, "Marketplace program")),
    title: item.title,
  };
}

function contentToAnnouncement(item: PublicContentItem): MarketplaceHomeAnnouncement {
  return {
    dateLabel: formatDateLabel(item.createdAt),
    description: safeText(item.summary, "Marketplace operating notice for approved public content."),
    href: item.href,
    id: item.id,
    statusLabel: safeText(item.meta, "Notice"),
    title: item.title,
  };
}

function contentToProduct(
  item: PublicContentItem,
  category: string,
  isVerifiedSupplier = true,
): MarketplaceHomeProduct {
  return {
    category: safeText(item.meta, category),
    description: safeText(item.summary, "Approved marketplace listing prepared for protected sourcing."),
    href: item.href,
    id: `${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${item.id}`,
    imageAlt: imageAltFor(item),
    imageUrl: imageUrlFor(item),
    isVerifiedSupplier,
    supplierName: safeText(item.companyName, category),
    title: item.title,
  };
}

function selectPremiumProductsFromSubpages({
  commercialItems,
  epcItems,
  industrialItems,
  sellProductItems,
}: Readonly<{
  commercialItems: PublicContentItem[];
  epcItems: PublicContentItem[];
  industrialItems: PublicContentItem[];
  sellProductItems: PublicContentItem[];
}>): MarketplaceHomeProduct[] {
  return [
    ...commercialItems.slice(0, 2).map((item) => contentToProduct(item, "Commercial")),
    ...industrialItems.slice(0, 1).map((item) => contentToProduct(item, "Industrial")),
    ...epcItems.slice(0, 1).map((item) => contentToProduct(item, "EPC")),
    ...sellProductItems.slice(0, 1).map((item) => contentToProduct(item, "BUY & SELL", false)),
  ].slice(0, PREMIUM_PRODUCT_LIMIT);
}

function selectLatestProductsFromSubpages({
  commercialItems,
  epcItems,
  industrialItems,
  sellProductItems,
}: Readonly<{
  commercialItems: PublicContentItem[];
  epcItems: PublicContentItem[];
  industrialItems: PublicContentItem[];
  sellProductItems: PublicContentItem[];
}>): MarketplaceHomeProduct[] {
  return [
    ...commercialItems.slice(0, 3).map((item) => contentToProduct(item, "Commercial")),
    ...industrialItems.slice(0, 2).map((item) => contentToProduct(item, "Industrial")),
    ...epcItems.slice(0, 2).map((item) => contentToProduct(item, "EPC")),
    ...sellProductItems.slice(0, 2).map((item) => contentToProduct(item, "BUY & SELL", false)),
  ].slice(0, LATEST_PRODUCT_LIMIT);
}

export async function getMarketplaceHomeConfig(): Promise<MarketplaceHomeConfig> {
  const [
    commercialItems,
    industrialItems,
    epcItems,
    sellProductItems,
    buyRequestItems,
  ] = await Promise.all([
    safePublicContentList("commercial"),
    safePublicContentList("industrial"),
    safePublicContentList("epc"),
    safePublicContentList("sell-products"),
    safePublicContentList("buy-requests"),
  ]);

  const eventItems = sampleContentList("events");
  const networkingItems = sampleContentList("networking");
  const serviceItems = sampleContentList("service");
  const noticeItems = sampleContentList("notice");
  const buySellItems = [...sellProductItems.slice(0, 2), ...buyRequestItems.slice(0, 1)];

  return {
    ...staticLandingConfig.marketplaceHome,
    announcements: noticeItems.slice(0, 3).map(contentToAnnouncement),
    buyerRequests: buyRequestItems.slice(0, 3).map(contentToRequest),
    channels: [
      contentToChannel(
        "home-channel-commercial",
        "Commercial",
        "/commercial",
        commercialItems,
        "Consumer goods and approved supplier products prepared for global retail and distribution buyers.",
        "Products",
      ),
      contentToChannel(
        "home-channel-industrial",
        "Industrial",
        "/industrial",
        industrialItems,
        "Machinery, plant equipment, automation, and industrial supply listings for factory buyers.",
        "Equipment",
      ),
      contentToChannel(
        "home-channel-epc",
        "EPC",
        "/epc",
        epcItems,
        "Project opportunities and engineering packages for infrastructure, factory, and energy programs.",
        "Projects",
      ),
      contentToChannel(
        "home-channel-events",
        "Event",
        "/events",
        eventItems,
        "Trade programs, buyer matching sessions, and market-entry events curated for members.",
        "Programs",
      ),
      contentToChannel(
        "home-channel-buy-sell",
        "BUY & SELL",
        "/buy-sell",
        buySellItems,
        "Protected RFQ demand and supplier sell-product posts gathered in one commerce lane.",
        "RFQ Board",
      ),
      contentToChannel(
        "home-channel-networking",
        "Networking",
        "/networking",
        networkingItems,
        "Agent, buyer, supplier, professor, and service networks for controlled trade relationships.",
        "Network",
      ),
      contentToChannel(
        "home-channel-service",
        "Service",
        "/service",
        serviceItems,
        "Thailand FDA and market-entry service programs for approved suppliers preparing export workflows.",
        "Service",
      ),
    ],
    events: eventItems.slice(0, 3).map(contentToEvent),
    latestProducts: selectLatestProductsFromSubpages({
      commercialItems,
      epcItems,
      industrialItems,
      sellProductItems,
    }),
    premiumProducts: selectPremiumProductsFromSubpages({
      commercialItems,
      epcItems,
      industrialItems,
      sellProductItems,
    }),
  };
}
