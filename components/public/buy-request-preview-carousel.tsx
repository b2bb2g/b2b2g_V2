"use client";

import Image from "next/image";
import Link from "next/link";
import type { MouseEvent, PointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { t } from "@/lib/i18n/translation";

type BuyRequestPreviewItem = {
  companyName?: string | null;
  href: string;
  id: string;
  imageAlt?: string | null;
  imageUrl?: string | null;
  meta?: string | null;
  summary?: string | null;
  title: string;
};

export function BuyRequestPreviewCarousel({
  isAuthenticated,
  items,
}: Readonly<{
  isAuthenticated: boolean;
  items: BuyRequestPreviewItem[];
}>) {
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

    if (!track || !isAuthenticated) {
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

  function handleCardClick(event: MouseEvent<HTMLAnchorElement>) {
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
    <div className="buy-request-peek-shell">
      <div className={`buy-request-peek-viewport ${isAuthenticated ? "" : "is-locked"}`}>
        <div
          className={`buy-request-peek-track ${isDragging ? "is-dragging" : ""}`}
          onPointerCancel={handlePointerEnd}
          onPointerDown={handlePointerDown}
          onPointerLeave={handlePointerEnd}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onScroll={updateScrollMetrics}
          ref={trackRef}
        >
          {items.map((item, index) => {
            const card = (
              <article className="buy-request-teaser-card">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[8px] bg-canvas-parchment">
                  {item.imageUrl ? (
                    <Image
                      alt={item.imageAlt ?? item.title}
                      className="object-cover"
                      draggable={false}
                      fill
                      sizes="(min-width: 1280px) 34vw, (min-width: 768px) 36vw, 78vw"
                      src={item.imageUrl}
                    />
                  ) : null}
                  <span className="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1.5 text-[12px] font-semibold text-action-blue shadow-sm">
                    {item.meta ?? t("home.buyRequests.eyebrow")}
                  </span>
                </div>
                <div className="mt-4 flex flex-1 flex-col">
                  <p className="type-caption-strong text-action-blue">
                    {t("home.buyRequests.cardLabel")}
                  </p>
                  <h3 className="type-body-strong mt-1 line-clamp-2 text-calm-ink">
                    {item.title}
                  </h3>
                  <p className="type-caption mt-1 text-calm-ink-muted-48">
                    {item.companyName}
                  </p>
                  <p className="type-caption mt-3 line-clamp-2 text-calm-ink-muted-80">
                    {item.summary}
                  </p>
                  <span className="mt-auto pt-4 type-caption-strong text-action-blue">
                    {t("content.requestQuotation")}
                  </span>
                </div>
              </article>
            );

            return isAuthenticated ? (
              <Link
                className="buy-request-peek-item"
                draggable={false}
                href={item.href}
                key={`${item.id}-${index}`}
                onClick={handleCardClick}
              >
                {card}
              </Link>
            ) : (
              <div
                aria-hidden="true"
                className="buy-request-peek-item"
                key={`${item.id}-${index}`}
              >
                {card}
              </div>
            );
          })}
        </div>
      </div>

      {!isAuthenticated ? (
        <div className="buy-request-lock-panel">
          <p className="type-caption-strong text-action-blue">
            {t("home.buyRequests.lockedEyebrow")}
          </p>
          <h3 className="mt-3 max-w-md text-[28px] font-semibold leading-tight text-calm-ink md:text-[36px]">
            {t("home.buyRequests.lockedTitle")}
          </h3>
          <p className="type-body mt-4 max-w-md text-calm-ink-muted-80">
            {t("home.buyRequests.lockedLead")}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link className="landing-action-pill landing-action-pill-primary" href="/login">
              {t("nav.signIn")}
            </Link>
            <Link className="landing-action-pill bg-white" href="/signup">
              {t("auth.login.createAccount")}
            </Link>
          </div>
        </div>
      ) : null}

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
