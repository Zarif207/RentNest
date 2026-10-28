"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  detail: string;
  rating: number;
};

const pad = (value: number) => String(value).padStart(2, "0");

export function Testimonials({ items }: { items: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const current = items[index];

  const go = (step: 1 | -1) => setIndex((value) => (value + step + items.length) % items.length);

  return (
    <div className="rounded-3xl border p-6 sm:p-10">
      <div aria-live="polite" className="min-h-56 sm:min-h-48">
        <AnimatePresence mode="wait" initial={false}>
          <motion.figure
            key={current.id}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="flex gap-1" role="img" aria-label={`Rated ${current.rating} out of 5`}>
              {Array.from({ length: 5 }, (_, star) => (
                <Star
                  key={star}
                  aria-hidden
                  className={cn(
                    "size-5",
                    star < current.rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/40",
                  )}
                />
              ))}
            </div>
            <blockquote className="mt-5 text-xl leading-relaxed font-medium tracking-tight sm:text-2xl">
              “{current.quote}”
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <UserAvatar name={current.name} className="size-11" />
              <div>
                <p className="font-semibold">{current.name}</p>
                <p className="text-sm text-muted-foreground">{current.detail}</p>
              </div>
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center justify-between border-t pt-6">
        <p className="text-sm font-medium tabular-nums">
          {pad(index + 1)}
          <span className="text-muted-foreground">/{pad(items.length)}</span>
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" aria-label="Previous testimonial" onClick={() => go(-1)}>
            <ArrowLeft />
          </Button>
          <Button size="icon" aria-label="Next testimonial" onClick={() => go(1)}>
            <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
