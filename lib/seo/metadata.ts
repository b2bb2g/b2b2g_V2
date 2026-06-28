import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, Json, SeoTargetTable } from "@/types/database";

type FileRow = Pick<
  Database["public"]["Tables"]["files"]["Row"],
  "bucket" | "path" | "visibility"
>;
type SeoMetadataRow = Pick<
  Database["public"]["Tables"]["seo_metadata"]["Row"],
  | "canonical_url"
  | "keywords"
  | "meta_description"
  | "meta_title"
  | "og_image_file_id"
  | "structured_data"
>;

export type PublicSeoMetadata = {
  canonicalUrl: string | null;
  keywords: string[];
  metaDescription: string | null;
  metaTitle: string | null;
  ogImageUrl: string | null;
  structuredData: Json | null;
};

type BuildPublicMetadataInput = {
  canonicalPath: string;
  description?: string | null;
  seo?: PublicSeoMetadata | null;
  title: string;
};

const DEFAULT_SITE_URL = "https://b2bb2g.com";
const DEFAULT_OG_IMAGE_PATH = "/b2bb2g-logo.jpg";
const SITE_NAME = "B2BB2G.COM";

export function getSiteUrl(): URL {
  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;
  const trimmedUrl = rawUrl.trim().replace(/\/+$/, "");
  const normalizedUrl = /^https?:\/\//i.test(trimmedUrl)
    ? trimmedUrl
    : `https://${trimmedUrl}`;

  try {
    const siteUrl = new URL(normalizedUrl);
    if (!["http:", "https:"].includes(siteUrl.protocol)) {
      return new URL(DEFAULT_SITE_URL);
    }

    return siteUrl;
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

export function getAbsoluteUrl(path: string): string {
  return new URL(path, getSiteUrl()).toString();
}

function hasStructuredData(value: Json): boolean {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length > 0,
  );
}

function trimOrNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function uniqueKeywords(values: (string | null | undefined)[]): string[] {
  return [...new Set(values.flatMap((value) => value?.split(",") ?? []))]
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function toPublicImageUrl(file: FileRow | null): string | null {
  if (!file || file.visibility !== "public") {
    return null;
  }

  const publicPath = `/storage/v1/object/public/${file.bucket}/${file.path}`;
  return getAbsoluteUrl(publicPath);
}

export async function getPublicSeoMetadata(
  targetTable: SeoTargetTable,
  targetId: string,
): Promise<PublicSeoMetadata | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("seo_metadata")
    .select(
      "meta_title,meta_description,keywords,canonical_url,structured_data,og_image_file_id",
    )
    .eq("target_table", targetTable)
    .eq("target_id", targetId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  let ogImageUrl: string | null = null;
  const seo = data as SeoMetadataRow;

  if (seo.og_image_file_id) {
    const { data: file, error: fileError } = await supabase
      .from("files")
      .select("bucket,path,visibility")
      .eq("id", seo.og_image_file_id)
      .eq("is_active", true)
      .is("deleted_at", null)
      .maybeSingle();

    if (fileError) {
      throw new Error(fileError.message);
    }

    ogImageUrl = toPublicImageUrl(file);
  }

  return {
    canonicalUrl: trimOrNull(seo.canonical_url),
    keywords: seo.keywords ?? [],
    metaDescription: trimOrNull(seo.meta_description),
    metaTitle: trimOrNull(seo.meta_title),
    ogImageUrl,
    structuredData: hasStructuredData(seo.structured_data)
      ? seo.structured_data
      : null,
  };
}

export function buildPublicMetadata({
  canonicalPath,
  description,
  seo,
  title,
}: BuildPublicMetadataInput): Metadata {
  const resolvedTitle = seo?.metaTitle ?? title;
  const resolvedDescription = seo?.metaDescription ?? trimOrNull(description);
  const canonicalUrl = seo?.canonicalUrl ?? canonicalPath;
  const imageUrl = seo?.ogImageUrl ?? DEFAULT_OG_IMAGE_PATH;
  const image = [{ url: imageUrl, alt: resolvedTitle }];

  return {
    alternates: {
      canonical: canonicalUrl,
    },
    description: resolvedDescription ?? undefined,
    keywords: seo?.keywords?.length
      ? seo.keywords
      : buildKeywordFallback(title, description),
    openGraph: {
      description: resolvedDescription ?? undefined,
      images: image,
      siteName: SITE_NAME,
      title: resolvedTitle,
      type: "website",
      url: canonicalUrl,
    },
    robots: {
      follow: true,
      googleBot: {
        follow: true,
        index: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
      index: true,
    },
    title: resolvedTitle,
    twitter: {
      card: "summary_large_image",
      description: resolvedDescription ?? undefined,
      images: [imageUrl],
      title: resolvedTitle,
    },
  };
}

export function buildCompanyStructuredData(input: {
  country?: string | null;
  description?: string | null;
  industry?: string | null;
  name: string;
  path: string;
  website?: string | null;
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    address: input.country
      ? {
          "@type": "PostalAddress",
          addressCountry: input.country,
        }
      : undefined,
    description: input.description ?? undefined,
    industry: input.industry ?? undefined,
    name: input.name,
    url: input.website ?? getAbsoluteUrl(input.path),
  };
}

export function buildContentStructuredData(input: {
  companyName?: string | null;
  description?: string | null;
  kind: string;
  path: string;
  title: string;
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": input.kind === "commercial" ? "Product" : "Article",
    description: input.description ?? undefined,
    name: input.title,
    provider: input.companyName
      ? {
          "@type": "Organization",
          name: input.companyName,
        }
      : undefined,
    url: getAbsoluteUrl(input.path),
  };
}

export function getStructuredData(
  seo: PublicSeoMetadata | null,
  fallback: Json,
): Json {
  return seo?.structuredData ?? fallback;
}

export function buildKeywordFallback(...values: (string | null | undefined)[]) {
  return uniqueKeywords([SITE_NAME, ...values]);
}
