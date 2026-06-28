import type { MetadataRoute } from "next";
import { getAbsoluteUrl } from "@/lib/seo/metadata";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SitemapRow = {
  id: string;
  updated_at: string;
};

type CompanySitemapRow = SitemapRow & {
  slug: string;
};

const staticRoutes: MetadataRoute.Sitemap = [
  { url: getAbsoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
  { url: getAbsoluteUrl("/commercial"), changeFrequency: "daily", priority: 0.9 },
  { url: getAbsoluteUrl("/industrial"), changeFrequency: "daily", priority: 0.8 },
  { url: getAbsoluteUrl("/epc"), changeFrequency: "daily", priority: 0.8 },
  { url: getAbsoluteUrl("/buy-sell"), changeFrequency: "daily", priority: 0.8 },
  { url: getAbsoluteUrl("/service"), changeFrequency: "weekly", priority: 0.7 },
  {
    url: getAbsoluteUrl("/buy-sell/sell-products"),
    changeFrequency: "daily",
    priority: 0.8,
  },
  {
    url: getAbsoluteUrl("/buy-sell/buy-requests"),
    changeFrequency: "daily",
    priority: 0.8,
  },
  { url: getAbsoluteUrl("/privacy"), changeFrequency: "monthly", priority: 0.4 },
  { url: getAbsoluteUrl("/terms"), changeFrequency: "monthly", priority: 0.4 },
  { url: getAbsoluteUrl("/cookies"), changeFrequency: "monthly", priority: 0.4 },
  { url: getAbsoluteUrl("/guide"), changeFrequency: "monthly", priority: 0.5 },
];

function publicRowsToSitemap(
  rows: SitemapRow[],
  pathPrefix: string,
  priority: number,
): MetadataRoute.Sitemap {
  return rows.map((row) => ({
    url: getAbsoluteUrl(`${pathPrefix}/${row.id}`),
    lastModified: new Date(row.updated_at),
    changeFrequency: "weekly",
    priority,
  }));
}

async function getApprovedRows(tableName: string): Promise<SitemapRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from(tableName)
    .select("id,updated_at")
    .eq("approval_status", "approved")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(500);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as SitemapRow[];
}

async function getApprovedCompanies(): Promise<CompanySitemapRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("companies")
    .select("id,slug,updated_at")
    .eq("approval_status", "approved")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(500);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CompanySitemapRow[];
}

async function getSellPosts(): Promise<SitemapRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("buy_sell_posts")
    .select("id,updated_at")
    .eq("post_type", "sell_product")
    .eq("approval_status", "approved")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(500);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as SitemapRow[];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [
    companies,
    products,
    industrialPosts,
    epcPosts,
    sellPosts,
    buyRequests,
  ] = await Promise.all([
    getApprovedCompanies(),
    getApprovedRows("products"),
    getApprovedRows("industrial_posts"),
    getApprovedRows("epc_posts"),
    getSellPosts(),
    getApprovedRows("buy_requests"),
  ]);

  return [
    ...staticRoutes,
    ...companies.map((company) => ({
      url: getAbsoluteUrl(`/companies/${company.slug}`),
      lastModified: new Date(company.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...publicRowsToSitemap(products, "/commercial", 0.8),
    ...publicRowsToSitemap(industrialPosts, "/industrial", 0.7),
    ...publicRowsToSitemap(epcPosts, "/epc", 0.7),
    ...publicRowsToSitemap(sellPosts, "/buy-sell/sell-products", 0.7),
    ...publicRowsToSitemap(buyRequests, "/buy-sell/buy-requests", 0.7),
  ];
}
