"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// The roof-peak navbar's outline (px): a gable rising PEAK above an 80 px
// bar, centered, with straight slopes and rounded outer corners.
const PEAK = 34;
const BAR = 80;
const HALF_BASE = 150;
const RADIUS = 20;
export const ROOF_HEIGHT = PEAK + BAR;

// First render (server and hydration): the bar's max width, so wide screens
// never redraw; narrower ones correct on the first observed size.
const DEFAULT_WIDTH = 1360;

/** The outline as an SVG path for `width`, pulled in by `inset` (half the stroke). */
function roofPath(width: number, inset = 0) {
  const [left, right] = [inset, width - inset];
  const [top, bottom] = [PEAK + inset, ROOF_HEIGHT - inset];
  const center = width / 2;
  const r = RADIUS - inset;
  return [
    `M ${left} ${top + r}`,
    `A ${r} ${r} 0 0 1 ${left + r} ${top}`,
    `L ${center - HALF_BASE} ${top}`,
    `L ${center} ${inset}`,
    `L ${center + HALF_BASE} ${top}`,
    `L ${right - r} ${top}`,
    `A ${r} ${r} 0 0 1 ${right} ${top + r}`,
    `L ${right} ${bottom - r}`,
    `A ${r} ${r} 0 0 1 ${right - r} ${bottom}`,
    `L ${left + r} ${bottom}`,
    `A ${r} ${r} 0 0 1 ${left} ${bottom - r}`,
    "Z",
  ].join(" ");
}

/**
 * The roof-peak bar's surface: one path generated from the measured width,
 * used as the clip-path of the blurred glass (backdrop blur can't follow an
 * SVG fill) and stroked by an SVG on top, so it stays crisp at any width.
 */
export function RoofBar({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(DEFAULT_WIDTH);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    // One redraw per frame however fast the window is resized.
    const observer = new ResizeObserver(([entry]) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setWidth(Math.round(entry.contentRect.width)));
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      <div
        className="absolute inset-0 bg-(--roof-fill) backdrop-blur-[14px] transition-[background-color] duration-500 group-data-scrolled/header:bg-(--roof-fill-solid)"
        style={{ clipPath: `path("${roofPath(width)}")` }}
      />
      <svg width={width} height={ROOF_HEIGHT} className="absolute inset-0 overflow-visible">
        <path
          data-roof-outline
          d={roofPath(width, 0.6)}
          pathLength={1}
          fill="none"
          stroke="var(--roof-stroke)"
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
