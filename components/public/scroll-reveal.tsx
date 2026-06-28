"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ElementType, ReactNode } from "react";

type RevealProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  delayMs?: number;
};

export function Reveal({
  as: Tag = "div",
  children,
  className = "",
  delayMs = 0,
}: Readonly<RevealProps>) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -80px 0px", threshold: 0.12 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const style = { "--reveal-delay": `${delayMs}ms` } as CSSProperties;

  return (
    <Tag
      className={`reveal ${isVisible ? "reveal-visible" : ""} ${className}`}
      ref={elementRef}
      style={style}
    >
      {children}
    </Tag>
  );
}
