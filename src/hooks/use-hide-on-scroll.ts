"use client";

import { useEffect, useState } from "react";

/**
 * True while the user scrolls down past `offset` px; false as soon as they
 * scroll up (or are near the top). Small jitters under `tolerance` are ignored.
 */
export function useHideOnScroll(offset = 160, tolerance = 6) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < tolerance) return;
      setHidden(y > last && y > offset);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [offset, tolerance]);

  return hidden;
}
