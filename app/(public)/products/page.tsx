import type { Metadata } from "next";
import { ProductCatalogPage } from "@/components/public/products/product-catalog-page";
import { getMarketplaceProducts } from "@/lib/products/marketplace-products";
import { buildPublicMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPublicMetadata({
  canonicalPath: "/products",
  description:
    "Browse approved B2B supplier products prepared for managed global sourcing without public pricing or Buyer PII exposure.",
  title: "Products | B2B2G",
});

export default async function ProductsPage() {
  const products = await getMarketplaceProducts();

  return <ProductCatalogPage products={products} />;
}
