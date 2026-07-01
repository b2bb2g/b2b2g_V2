"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { StaticProductGalleryImage } from "@/lib/products/static-products";

type ProductImageGalleryProps = {
  badges: string[];
  images: StaticProductGalleryImage[];
  productTitle: string;
};

export function ProductImageGallery({
  badges,
  images,
  productTitle,
}: Readonly<ProductImageGalleryProps>) {
  const galleryImages = useMemo(() => images.filter((image) => image.imageUrl), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = galleryImages[activeIndex] ?? galleryImages[0];

  if (!activeImage) {
    return null;
  }

  const showPreviousImage = () => {
    setActiveIndex((currentIndex) => (currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1));
  };

  const showNextImage = () => {
    setActiveIndex((currentIndex) => (currentIndex === galleryImages.length - 1 ? 0 : currentIndex + 1));
  };

  return (
    <section className="overflow-hidden rounded-[28px] border border-[#dbe6f2] bg-white shadow-[0_22px_70px_rgba(15,23,42,0.07)]">
      <div className="relative aspect-square overflow-hidden bg-[#f5f8fc]">
        <Image
          alt={activeImage.imageAlt}
          className="object-cover transition duration-500"
          fill
          priority
          sizes="(max-width: 1024px) 92vw, 640px"
          src={activeImage.imageUrl}
          style={{ objectPosition: activeImage.objectPosition ?? "center" }}
        />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#07111f]/50 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span
              className="inline-flex min-h-7 items-center rounded-full bg-[#0066cc] px-2.5 text-[10px] font-black uppercase tracking-[0.1em] text-white shadow-[0_12px_28px_rgba(0,102,204,0.18)]"
              key={badge}
            >
              {badge}
            </span>
          ))}
        </div>
        {galleryImages.length > 1 ? (
          <>
            <button
              aria-label="Show previous product image"
              className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#101828] shadow-[0_14px_34px_rgba(15,23,42,0.16)] transition hover:bg-white"
              onClick={showPreviousImage}
              type="button"
            >
              <span aria-hidden="true" className="text-[24px] leading-none">{"<"}</span>
            </button>
            <button
              aria-label="Show next product image"
              className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#101828] shadow-[0_14px_34px_rgba(15,23,42,0.16)] transition hover:bg-white"
              onClick={showNextImage}
              type="button"
            >
              <span aria-hidden="true" className="text-[24px] leading-none">{">"}</span>
            </button>
          </>
        ) : null}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/70">{activeImage.label}</p>
            <p className="mt-1 truncate text-[15px] font-semibold text-white">{productTitle}</p>
          </div>
          <span className="shrink-0 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-black text-[#0066cc]">
            {activeIndex + 1} / {galleryImages.length}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-[repeat(4,minmax(0,1fr))] gap-2">
          {galleryImages.map((image, index) => (
            <button
              aria-label={`Show ${image.label}`}
              className={`relative aspect-square min-w-0 overflow-hidden rounded-2xl border transition ${
                index === activeIndex ? "border-[#0066cc] ring-2 ring-[#0066cc]" : "border-[#dbe6f2] hover:border-[#93c5fd]"
              }`}
              key={image.id}
              onClick={() => setActiveIndex(index)}
              type="button"
            >
              <Image
                alt={image.imageAlt}
                className="object-cover"
                fill
                sizes="96px"
                src={image.imageUrl}
                style={{ objectPosition: image.objectPosition ?? "center" }}
              />
            </button>
          ))}
        </div>
        <button
          className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-full border border-[#dbe6f2] bg-[#f8fbff] px-4 text-[13px] font-bold text-[#0066cc]"
          disabled
          type="button"
        >
          Enlarge image coming soon
        </button>
      </div>
    </section>
  );
}
