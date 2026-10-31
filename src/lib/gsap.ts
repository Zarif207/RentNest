"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register once; import gsap, ScrollTrigger and useGSAP from here, never directly.
// useGSAP reverts every tween and ScrollTrigger it created on unmount.
gsap.registerPlugin(ScrollTrigger, useGSAP);

// Phones defer rendering far sections (data-defer-render in globals.css), so
// the page grows as they first render; re-measure the triggers when it does.
if (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  new ResizeObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(() => ScrollTrigger.refresh(), 200);
  }).observe(document.body);
}

export { gsap, ScrollTrigger, useGSAP };
