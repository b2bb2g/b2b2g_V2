import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailPage } from "@/components/public/products/product-catalog-page";
import {
  getStaticMarketplaceProduct,
  getStaticMarketplaceProducts,
} from "@/lib/products/static-products";
import { buildPublicMetadata } from "@/lib/seo/metadata";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getStaticMarketplaceProducts().map((product) => ({
    id: product.id,
  }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getStaticMarketplaceProduct(id);

  return buildPublicMetadata({
    canonicalPath: `/products/${id}`,
    description: product?.description,
    title: product ? `${product.title} | B2B2G Products` : "Product | B2B2G",
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getStaticMarketplaceProduct(id);

  if (!product) {
    notFound();
  }

  const relatedProducts = getStaticMarketplaceProducts().filter((item) => item.id !== product.id);

  return <ProductDetailPage product={product} relatedProducts={relatedProducts} />;
}
