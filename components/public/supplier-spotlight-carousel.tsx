"use client";

import Image from "next/image";
import Link from "next/link";
import type { MouseEvent, PointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

type SupplierSpotlightItem = {
  companyName?: string | null;
  href: string;
  id: string;
  imageAlt?: string | null;
  imageUrl?: string | null;
  summary?: string | null;
  title: string;
};

export function SupplierSpotlightCarousel({
  items,
}: Readonly<{
  items: SupplierSpotlightItem[];
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

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
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

  const thumbWidth = Math.max(visibleRatio * 100, 18);
  const thumbLeft = scrollProgress * (100 - thumbWidth);

  return (
    <div className="supplier-peek-shell mt-8">
      <div
        className={`supplier-peek-track ${isDragging ? "is-dragging" : ""}`}
        onPointerCancel={handlePointerEnd}
        onPointerDown={handlePointerDown}
        onPointerLeave={handlePointerEnd}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onScroll={updateScrollMetrics}
        ref={trackRef}
      >
        {items.map((item) => (
          <Link
            className="supplier-peek-item group"
            draggable={false}
            href={item.href}
            key={item.id}
            onClick={handleClick}
          >
            <article className="supplier-peek-card">
              <span className="relative block h-[230px] overflow-hidden rounded-[14px] bg-black md:h-[250px]">
                {item.imageUrl ? (
                  <Image
                    alt={item.imageAlt ?? item.title}
                    className="object-cover"
                    draggable={false}
                    fill
                    sizes="(min-width: 1280px) 30vw, (min-width: 768px) 46vw, 78vw"
                    src={item.imageUrl}
                  />
                ) : null}
              </span>
              <span className="mt-4 block truncate text-[12px] font-semibold text-white/52">
                {item.companyName}
              </span>
              <span className="mt-1 block line-clamp-2 text-[22px] font-semibold leading-tight text-white">
                {item.title}
              </span>
              <span className="mt-3 block line-clamp-2 text-[15px] leading-6 text-white/60">
                {item.summary}
              </span>
            </article>
          </Link>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          aria-label="Supplier spotlight gallery progress"
          className="supplier-progress-track"
          onClick={handleNavigatorClick}
          type="button"
        >
          <span
            className="supplier-progress-thumb"
            style={{
              left: `${thumbLeft}%`,
              width: `${thumbWidth}%`,
            }}
          />
        </button>
      </div>
    </div>
  );
}
