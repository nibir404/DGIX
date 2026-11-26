"use client";

import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Renders children in a fixed layer attached to `anchor`, outside any `overflow-hidden`
 * parent (e.g. PageHero), so dropdowns are never clipped. Follows the anchor on scroll
 * and resize, flips above it when there isn't room below, and keeps within the viewport.
 */
export function FloatingLayer({
  anchor,
  open,
  children,
  align = "end",
  minWidth = 240,
  gap = 8,
  layerRef,
}: {
  anchor: HTMLElement | null;
  open: boolean;
  children: React.ReactNode;
  align?: "start" | "end";
  minWidth?: number;
  gap?: number;
  layerRef?: React.Ref<HTMLDivElement>;
}) {
  const [pos, setPos] = useState<{ top?: number; bottom?: number; left: number; width: number; maxHeight: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || !anchor) return;
    const place = () => {
      const r = anchor.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const margin = 12;
      const width = Math.min(Math.max(r.width, minWidth), vw - margin * 2);
      let left = align === "end" ? r.right - width : r.left;
      left = Math.max(margin, Math.min(left, vw - margin - width));
      const below = vh - r.bottom - gap - margin;
      const above = r.top - gap - margin;
      if (below >= 220 || below >= above) setPos({ top: r.bottom + gap, left, width, maxHeight: Math.max(160, below) });
      else setPos({ bottom: vh - r.top + gap, left, width, maxHeight: Math.max(160, above) });
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, anchor, align, minWidth, gap]);

  if (!open || !pos || typeof document === "undefined") return null;
  return createPortal(
    <div
      ref={layerRef}
      data-lenis-prevent
      style={{ position: "fixed", top: pos.top, bottom: pos.bottom, left: pos.left, width: pos.width, maxHeight: pos.maxHeight, zIndex: 70 }}
      className="overflow-y-auto overscroll-contain"
    >
      {children}
    </div>,
    document.body,
  );
}
