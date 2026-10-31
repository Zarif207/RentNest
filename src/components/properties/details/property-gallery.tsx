"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Grid2x2, House } from "lucide-react";
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
  /** What the home is, for alt text: "3-bed house for sale in Austin, TX". */
  summary: string;
};

// Tiles on the right of the bento, by how many there are (up to four).
const SIDE_TILE_SPANS: Record<number, string[]> = {
  1: ["col-span-2 row-span-2"],
  2: ["col-span-2", "col-span-2"],
  3: ["col-span-2", "", ""],
  4: ["", "", "", ""],
};

/**
 * Bento gallery: one large photo and up to four smaller ones (desktop); a
 * single photo with a counter on small screens. Any photo opens the
 * full-screen lightbox at that photo (← → to browse).
 */
export function PropertyGallery({ images, title, summary }: PropertyGalleryProps) {
  const [active, setActive] = useState(0);
  // "Photo 2 of 5 of the 3-bed house for sale in Austin, TX: Sunny bungalow"
  const photoAlt = (index: number) =>
    `Photo ${index + 1} of ${images.length} of the ${summary.charAt(0).toLowerCase()}${summary.slice(1)}: ${title}`;
  const [open, setOpen] = useState(false);
  const count = images.length;

  if (count === 0) {
    return (
      <div className="grid aspect-video place-items-center rounded-3xl bg-muted text-muted-foreground lg:aspect-21/9">
        <House className="size-12" aria-hidden />
        <span className="sr-only">No photos available</span>
      </div>
    );
  }

  const go = (step: 1 | -1) => setActive((index) => (index + step + count) % count);
  const show = (index: number) => {
    setActive(index);
    setOpen(true);
  };

  const onLightboxKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") go(1);
    if (event.key === "ArrowLeft") go(-1);
  };

  const side = images.slice(1, 5);
  const tileClass =
    "group relative block overflow-hidden bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset";
  const imageClass =
    "object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100";

  return (
    <div className="relative">
      <div
        className={cn(
          "grid h-[56svh] min-h-80 gap-2 overflow-hidden rounded-3xl lg:h-[min(70svh,40rem)]",
          side.length > 0 && "lg:grid-cols-4 lg:grid-rows-2",
        )}
      >
        <button
          type="button"
          onClick={() => show(0)}
          className={cn(tileClass, side.length > 0 && "lg:col-span-2 lg:row-span-2")}
          aria-label={`Open photo 1 of ${count} full screen`}
        >
          <Image
            src={images[0]}
            alt={photoAlt(0)}
            fill
            preload
            fetchPriority="high"
            sizes="(min-width: 1024px) 50vw, 100vw"
            className={imageClass}
          />
        </button>
        {side.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => show(index + 1)}
            className={cn(tileClass, "hidden lg:block", SIDE_TILE_SPANS[side.length][index])}
            aria-label={`Open photo ${index + 2} of ${count} full screen`}
          >
            <Image src={image} alt={photoAlt(index + 1)} fill sizes="25vw" className={imageClass} />
          </button>
        ))}
      </div>

      {count > 1 && (
        <Button
          variant="outline"
          onClick={() => show(0)}
          className="absolute right-4 bottom-4 border-transparent bg-background/85 backdrop-blur-md hover:bg-background"
        >
          <Grid2x2 data-icon="inline-start" />
          View all {count} photos
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-[calc(100%-1rem)] gap-0 overflow-hidden bg-[#0c0b0a] p-0 text-white ring-0 sm:max-w-6xl"
          onKeyDown={onLightboxKeyDown}
        >
          <DialogTitle className="sr-only">{title} photos</DialogTitle>
          <DialogDescription className="sr-only">
            Use the left and right arrow keys to browse photos.
          </DialogDescription>
          <div className="relative aspect-4/3 sm:aspect-16/10">
            <Image
              src={images[active]}
              alt={photoAlt(active)}
              fill
              sizes="(min-width: 1024px) 1152px, 100vw"
              className="object-contain"
            />
          </div>
          {count > 1 && (
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => go(-1)}
                aria-label="Previous photo"
                className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <ChevronLeft />
              </Button>
              <p className="text-sm tracking-[0.2em] tabular-nums" aria-live="polite">
                {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </p>
              <Button
                variant="outline"
                size="icon"
                onClick={() => go(1)}
                aria-label="Next photo"
                className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <ChevronRight />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
