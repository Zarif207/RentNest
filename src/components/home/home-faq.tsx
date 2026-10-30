"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type FaqItem = { question: string; answer: string };

/** One-open-at-a-time accordion; panels animate their height with grid rows. */
export function HomeFaq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <ul className="divide-y divide-border border-y border-border">
      {items.map((item, index) => {
        const expanded = open === index;
        const buttonId = `${baseId}-q${index}`;
        const panelId = `${baseId}-a${index}`;
        return (
          <li key={item.question}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen(expanded ? null : index)}
                className="group flex w-full items-center justify-between gap-6 py-6 text-left text-lg font-medium tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:text-xl"
              >
                {item.question}
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full border border-border transition-[transform,background-color,color] duration-300",
                    expanded ? "rotate-45 bg-foreground text-background" : "group-hover:bg-muted",
                  )}
                >
                  <Plus className="size-4" aria-hidden />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden" inert={!expanded}>
                <p className="max-w-2xl pb-6 text-muted-foreground">{item.answer}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
