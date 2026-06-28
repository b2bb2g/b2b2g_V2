import type { MetadataRoute } from "next";
import { getAbsoluteUrl, getSiteUrl } from "@/lib/seo/metadata";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl().toString().replace(/\/+$/, "");

  return {
    rules: {
      allow: [
        "/",
        "/commercial",
        "/industrial",
        "/epc",
        "/buy-sell",
        "/companies",
      ],
      disallow: ["/admin", "/dashboard", "/login", "/signup"],
      userAgent: "*",
    },
    sitemap: getAbsoluteUrl("/sitemap.xml"),
    host: siteUrl,
  };
}
