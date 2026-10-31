"use client";

import { useRef } from "react";
import Image from "@/components/shared/photo";
import { useMotionOk } from "@/hooks/use-motion";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/** A photo that wipes open from the bottom (clip-path) and settles from a slight zoom. */
export function ImageReveal({
  src,
  alt,
  sizes,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const motionOk = useMotionOk();

  useGSAP(
    () => {
      const el = ref.current;
      if (!motionOk || !el) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 80%", once: true } });
      tl.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "power3.inOut" })
        .fromTo(el.querySelector("img"), { scale: 1.2 }, { scale: 1, duration: 1.6, ease: "power3.out" }, 0);
    },
    { scope: ref, dependencies: [motionOk] },
  );

  return (
    <div ref={ref} className={cn("relative overflow-hidden rounded-3xl bg-muted", className)}>
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}
