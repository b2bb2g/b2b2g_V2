"use client";

import Image from "next/image";
import Link from "next/link";
import type { MouseEvent, PointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { t } from "@/lib/i18n/translation";
import type { PublicContentItem } from "@/lib/queries/public-content";

type CarouselItem = Pick<
  PublicContentItem,
  "companyName" | "href" | "id" | "imageAlt" | "imageUrl" | "meta" | "summary" | "title"
>;

type ProductCarouselProps = {
  className?: string;
  href?: string;
  items: CarouselItem[];
  lead?: string;
  titleKey: string;
};

export function ProductTile({
  item,
  onClick,
  priority = false,
}: Readonly<{
  item: CarouselItem;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  priority?: boolean;
}>) {
  return (
    <Link className="block h-full" draggable={false} href={item.href} onClick={onClick}>
      <article className="store-card">
        <div className="relative aspect-square overflow-hidden rounded-[8px] bg-canvas-parchment">
          {item.imageUrl ? (
            <Image
              alt={item.imageAlt ?? item.title}
              className="object-cover"
              draggable={false}
              fill
              priority={priority}
              sizes="(min-width: 1280px) 18vw, (min-width: 768px) 25vw, 50vw"
              src={item.imageUrl}
            />
          ) : (
            <div className="flex h-full items-center justify-center type-caption text-calm-ink-muted-48">
              {t("brand.name")}
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-1 flex-col">
          <p className="type-caption-strong text-action-blue">
            {item.meta ?? t("content.publicMarketplace")}
          </p>
          <h3 className="type-body-strong mt-1 line-clamp-2 text-calm-ink">
            {item.title}
          </h3>
          <p className="type-caption mt-1 text-calm-ink-muted-48">
            {item.companyName ?? t("brand.name")}
          </p>
          <p className="type-caption mt-2 line-clamp-2 text-calm-ink-muted-80">
            {item.summary}
          </p>
          <p className="type-button-utility mt-4 text-action-blue">
            {t("content.requestQuotation")}
          </p>
        </div>
      </article>
    </Link>
  );
}

export function ProductCarousel({
  className = "",
  href,
  items,
  lead,
  titleKey,
}: Readonly<ProductCarouselProps>) {
  const carouselItems = useMemo(() => items.slice(0, 20), [items]);
  const trackRef = useRef<HTMLDivElement>(null);
  const pointerStartXRef = useRef(0);
  const scrollStartLeftRef = useRef(0);
  const didDragRef = useRef(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visibleRatio, setVisibleRatio] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  const updateScrollMetrics = useCallback(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const maxScrollLeft = track.scrollWidth - track.clientWidth;
    const nextProgress = maxScrollLeft > 0 ? track.scrollLeft / maxScrollLeft : 0;
    const nextVisibleRatio = track.scrollWidth > 0 ? track.clientWidth / track.scrollWidth : 1;

    setScrollProgress(Math.max(0, Math.min(nextProgress, 1)));
    setVisibleRatio(Math.max(0.12, Math.min(nextVisibleRatio, 1)));
  }, []);

  function scrollToProgress(progress: number) {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const maxScrollLeft = track.scrollWidth - track.clientWidth;
    const nextProgress = Math.max(0, Math.min(progress, 1));

    track.scrollTo({
      behavior: "smooth",
      left: maxScrollLeft * nextProgress,
    });
    setScrollProgress(nextProgress);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    didDragRef.current = false;
    pointerStartXRef.current = event.clientX;
    scrollStartLeftRef.current = track.scrollLeft;
    setIsDragging(true);
    track.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const track = trackRef.current;

    if (!track || !isDragging) {
      return;
    }

    const deltaX = event.clientX - pointerStartXRef.current;

    if (Math.abs(deltaX) > 4) {
      didDragRef.current = true;
    }

    track.scrollLeft = scrollStartLeftRef.current - deltaX;
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    const track = trackRef.current;

    if (track?.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }

    setIsDragging(false);
    updateScrollMetrics();
  }

  function handleTileClick(event: MouseEvent<HTMLAnchorElement>) {
    if (didDragRef.current) {
      event.preventDefault();
      didDragRef.current = false;
    }
  }

  function handleNavigatorClick(event: MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const nextProgress = (event.clientX - rect.left) / rect.width;
    scrollToProgress(nextProgress);
  }

  useEffect(() => {
    updateScrollMetrics();
    window.addEventListener("resize", updateScrollMetrics);

    return () => {
      window.removeEventListener("resize", updateScrollMetrics);
    };
  }, [updateScrollMetrics]);

  const hasOverflow = visibleRatio < 1;
  const thumbWidth = Math.max(visibleRatio * 100, 18);
  const thumbLeft = scrollProgress * (100 - thumbWidth);

  return (
    <div className={className}>
      <div className="landing-section-header">
        <div className="landing-section-copy">
          <h2 className="landing-section-title mt-0">{t(titleKey)}</h2>
          {lead ? (
            <p className="landing-section-lead">{lead}</p>
          ) : null}
        </div>
        <div className="landing-section-actions">
          {href ? (
            <Link className="landing-action-pill hidden sm:inline-flex" href={href}>
              {t("home.viewAll")}
            </Link>
          ) : null}
        </div>
      </div>

      <div
        className={`scrollbar-hide mt-6 flex gap-5 overflow-x-auto scroll-smooth pb-2 select-none overscroll-x-contain ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onPointerCancel={handlePointerEnd}
        onPointerDown={handlePointerDown}
        onPointerLeave={handlePointerEnd}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onScroll={updateScrollMetrics}
        ref={trackRef}
      >
        {carouselItems.map((item, index) => (
          <div
            className="min-w-[82vw] sm:min-w-[calc((100%_-_20px)/2)] xl:min-w-[calc((100%_-_60px)/4)]"
            key={item.id}
          >
            <ProductTile item={item} onClick={handleTileClick} priority={index === 0} />
          </div>
        ))}
      </div>

      {hasOverflow ? (
        <div className="mt-6 flex justify-center">
          <button
            aria-label={t("content.galleryProgress")}
            className="gallery-progress-track"
            onClick={handleNavigatorClick}
            type="button"
          >
            <span
              className="gallery-progress-thumb"
              style={{
                left: `${thumbLeft}%`,
                width: `${thumbWidth}%`,
              }}
            />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function HomeHero() {
  const heroTiles = [
    {
      imageAlt: "Korean cosmetic product preview",
      imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80",
      label: t("home.hero.tile.beauty"),
    },
    {
      imageAlt: "Korean industrial supply preview",
      imageUrl: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=900&q=80",
      label: t("home.hero.tile.industrial"),
    },
    {
      imageAlt: "Global buyer meeting preview",
      imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80",
      label: t("home.hero.tile.matching"),
    },
  ] as const;

  return (
    <section className="home-hero-shell">
      <div className="home-hero-inner">
        <div className="home-hero-copy">
          <p className="home-hero-badge">{t("home.hero.eyebrow")}</p>
          <h1 className="home-hero-title">
            {t("home.hero.title")}
          </h1>
          <p className="home-hero-lead">
            {t("home.hero.lead")}
          </p>
          <div className="home-hero-actions">
            <Link className="landing-action-pill landing-action-pill-primary" href="/buy-sell/buy-requests">
              {t("home.createBuyRequest")}
            </Link>
            <Link className="landing-action-pill landing-action-pill-on-light" href="/commercial">
              {t("home.exploreSuppliers")}
            </Link>
          </div>
          <div className="home-hero-proof-row" aria-label={t("home.hero.signalPanel")}>
            <span>{t("home.hero.signal.verified")}</span>
            <span>{t("home.hero.signal.products")}</span>
            <span>{t("home.hero.signal.buyers")}</span>
          </div>
        </div>

        <div className="home-hero-visual" aria-label={t("home.hero.mapPanel")}>
          <div className="home-hero-ad-top">
            <span className="home-hero-ad-status">
              <span className="signal-dot" />
              {t("home.hero.commandStatus")}
            </span>
            <span>{t("home.hero.commandPanel")}</span>
          </div>

          <div className="home-hero-ad-board">
            <div className="home-hero-route-line" aria-hidden="true">
              <span className="home-map-korea-pin home-hero-korea-pin">
                <span className="home-map-korea-pulse" />
                <span className="home-map-korea-dot" />
              </span>
              <span className="home-hero-market-pin home-hero-market-pin-a">TH</span>
              <span className="home-hero-market-pin home-hero-market-pin-b">VN</span>
              <span className="home-hero-market-pin home-hero-market-pin-c">UAE</span>
            </div>

            <div className="home-hero-tile-track">
              {heroTiles.map((tile) => (
                <div className="home-hero-image-tile" key={tile.label}>
                  <Image
                    alt={tile.imageAlt}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 54vw, 210px"
                    src={tile.imageUrl}
                  />
                  <span>{tile.label}</span>
                </div>
              ))}
            </div>

            <p className="home-hero-map-lead">
              {t("home.hero.mapLead")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
