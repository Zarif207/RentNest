"use client";

import Link from "next/link";
import { House, RotateCcw, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  /** The error boundary's retry(): re-fetches and re-renders the segment. */
  retry: () => void;
  /** An extra, page-specific way out (e.g. "Browse properties"). */
  action?: React.ReactNode;
  className?: string;
};

/** Body of every error.tsx: friendly copy, "Try again" and "Go home". Never shows raw errors. */
export function ErrorState({ icon: Icon, title, description, retry, action, className }: ErrorStateProps) {
  return (
    <div role="alert" className={cn("mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center", className)}>
      <span className="grid size-16 place-items-center rounded-full border border-gold/40 bg-gold/15">
        <Icon className="size-7 text-bronze" aria-hidden />
      </span>
      <h1 className="mt-6 text-4xl font-medium tracking-tighter">{title}</h1>
      <p className="mt-3 text-muted-foreground">{description}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={retry}>
          <RotateCcw data-icon="inline-start" /> Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">
            <House data-icon="inline-start" /> Go home
          </Link>
        </Button>
        {action}
      </div>
    </div>
  );
}
