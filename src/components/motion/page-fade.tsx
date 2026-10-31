"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

// False until the first page has mounted: the first load paints at once
// (a fade from opacity 0 would push back the LCP), later route changes fade.
let hasMounted = false;

/** Soft CSS fade for pages reached by navigation; none on the first load. */
export function PageFade({ children }: { children: React.ReactNode }) {
  const fade = hasMounted;
  useEffect(() => {
    hasMounted = true;
  }, []);
  return <div className={cn(fade && "animate-in duration-500 ease-out fade-in")}>{children}</div>;
}
