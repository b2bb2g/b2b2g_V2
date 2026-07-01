import type {
  MarketplaceHomeAnnouncement,
  MarketplaceHomeChannel,
  MarketplaceHomeConfig,
  MarketplaceHomeEvent,
  MarketplaceHomeProduct,
  MarketplaceHomeRequest,
} from "@/components/public/landing/marketplace-home";
import { staticLandingConfig } from "@/lib/landing/static-landing-config";
import { getMarketplaceProducts } from "@/lib/products/marketplace-products";
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

function selectPremiumProducts(products: MarketplaceHomeProduct[]): MarketplaceHomeProduct[] {
  const verifiedProducts = products.filter((product) => product.isVerifiedSupplier);
  const selectedProducts = verifiedProducts.length >= PREMIUM_PRODUCT_LIMIT ? verifiedProducts : products;

  return selectedProducts.slice(0, PREMIUM_PRODUCT_LIMIT);
}

function selectLatestProducts(products: MarketplaceHomeProduct[]): MarketplaceHomeProduct[] {
  return products.slice(0, LATEST_PRODUCT_LIMIT);
}

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
): MarketplaceHomeChannel {
  return {
    ctaLabel: `View ${title}`,
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

export async function getMarketplaceHomeConfig(): Promise<MarketplaceHomeConfig> {
  const [
    products,
    commercialItems,
    industrialItems,
    epcItems,
    sellProductItems,
    buyRequestItems,
  ] = await Promise.all([
    getMarketplaceProducts(),
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
      contentToChannel("home-channel-commercial", "Commercial", "/commercial", commercialItems),
      contentToChannel("home-channel-industrial", "Industrial", "/industrial", industrialItems),
      contentToChannel("home-channel-epc", "EPC", "/epc", epcItems),
      contentToChannel("home-channel-events", "Event", "/events", eventItems),
      contentToChannel("home-channel-buy-sell", "BUY & SELL", "/buy-sell", buySellItems),
      contentToChannel("home-channel-networking", "Networking", "/networking", networkingItems),
      contentToChannel("home-channel-service", "Service", "/service", serviceItems),
    ],
    events: eventItems.slice(0, 3).map(contentToEvent),
    latestProducts: selectLatestProducts(products),
    premiumProducts: selectPremiumProducts(products),
  };
}
