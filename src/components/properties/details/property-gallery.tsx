"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, House } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type PropertyGalleryProps = {
  images: string[];
  title: string;
};

/** Main photo, thumbnail strip and a full-screen lightbox (← → to browse). */
export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const count = images.length;

  if (count === 0) {
    return (
      <div className="grid aspect-16/9 place-items-center rounded-3xl bg-muted text-muted-foreground">
        <House className="size-12" aria-hidden />
        <span className="sr-only">No photos available</span>
      </div>
    );
  }

  const go = (step: 1 | -1) => setActive((index) => (index + step + count) % count);

  const onLightboxKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") go(1);
    if (event.key === "ArrowLeft") go(-1);
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block aspect-16/9 w-full overflow-hidden rounded-3xl bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:aspect-21/9"
        aria-label={`Open photo ${active + 1} of ${count} full screen`}
      >
        <Image
          src={images[active]}
          alt={`${title}, photo ${active + 1}`}
          fill
          preload={active === 0}
          sizes="(min-width: 1280px) 1216px, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <span className="absolute right-4 bottom-4 inline-flex items-center gap-2 rounded-full bg-background/90 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur">
          <Expand className="size-4" aria-hidden />
          {count > 1 ? `View all ${count} photos` : "View photo"}
        </span>
      </button>

      {count > 1 && (
        <ul className="flex gap-3 overflow-x-auto pb-1" aria-label="Photos">
          {images.map((image, index) => (
            <li key={image} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === active}
                className={cn(
                  "relative block h-16 w-24 overflow-hidden rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:h-20 sm:w-28",
                  index === active ? "ring-2 ring-foreground" : "opacity-70 hover:opacity-100",
                )}
              >
                <Image src={image} alt="" fill sizes="112px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-[calc(100%-1rem)] gap-0 overflow-hidden bg-black p-0 text-white ring-0 sm:max-w-5xl"
          onKeyDown={onLightboxKeyDown}
        >
          <DialogTitle className="sr-only">{title} photos</DialogTitle>
          <DialogDescription className="sr-only">
            Use the left and right arrow keys to browse photos.
          </DialogDescription>
          <div className="relative aspect-4/3 sm:aspect-16/10">
            <Image
              src={images[active]}
              alt={`${title}, photo ${active + 1} of ${count}`}
              fill
              sizes="(min-width: 1024px) 1024px, 100vw"
              className="object-contain"
            />
          </div>
          {count > 1 && (
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <Button variant="secondary" size="icon" onClick={() => go(-1)} aria-label="Previous photo">
                <ChevronLeft />
              </Button>
              <p className="text-sm tabular-nums" aria-live="polite">
                {active + 1} / {count}
              </p>
              <Button variant="secondary" size="icon" onClick={() => go(1)} aria-label="Next photo">
                <ChevronRight />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
