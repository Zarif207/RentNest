"use client";

import { useEffect, useRef, useState } from "react";
import Image from "@/components/shared/photo";
import { cn } from "@/lib/utils";

/**
 * The founder's signature (white strokes on transparent). Light mode inverts
 * it to dark ink. It "writes itself" left to right the first time it scrolls
 * into view; under reduced motion it's simply shown.
 */
export function Signature({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [written, setWritten] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setWritten(true);
        observer.disconnect();
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    // Observe the unclipped wrapper: a fully clipped element counts as
    // invisible, so it would never trigger (or even lazy-load its image).
    <div ref={ref} className={cn("w-40 sm:w-55", className)}>
      <div
        className={cn(
          // Clipped only when motion is allowed, so reduced motion and no-JS
          // both show it in full.
          "motion-safe:transition-[clip-path] motion-safe:duration-1400 motion-safe:ease-in-out",
          written ? "[clip-path:inset(0_0_0_0)]" : "motion-safe:[clip-path:inset(0_100%_0_0)]",
        )}
      >
        <Image
          src="/brand/signature.png"
          alt="Signature of Zarif Hasan"
          // The file's own size (cropped to the strokes), so no layout shift.
          width={692}
          height={618}
          loading="eager"
          sizes="(min-width: 640px) 220px, 160px"
          className="h-auto w-full invert dark:invert-0"
        />
      </div>
    </div>
  );
}
