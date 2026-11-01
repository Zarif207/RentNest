import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Bento primitives for the dashboards (Aurex reference): soft cards on the
// canvas, small round arrow buttons, big serif numbers, pill filters.

/** 12-column bento on desktop, 6 on tablet, 1 on phones. Children set their own spans. */
export function BentoGrid({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-6 lg:grid-cols-12", className)}>{children}</div>;
}

/** Round arrow button in a card's corner (links to the full view). */
export function ArrowButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="grid size-9 shrink-0 place-items-center rounded-full bg-foreground/5 transition-colors outline-none hover:bg-foreground hover:text-background focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <ArrowUpRight className="size-4" aria-hidden />
    </Link>
  );
}

type BentoCardProps = {
  title?: React.ReactNode;
  /** Adds the corner arrow button linking here. */
  href?: string;
  /** The arrow's accessible name when `title` isn't plain text ("Open <title>" otherwise). */
  linkLabel?: string;
  /** Something else for the header's right side (e.g. a FilterPill). */
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

/** Rounded card with a soft inner highlight, an optional title and a corner arrow. */
export function BentoCard({ title, href, linkLabel, action, className, children }: BentoCardProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.6),0_1px_2px_rgb(0_0_0/0.03)] sm:p-6 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]",
        className,
      )}
    >
      {(title || href || action) && (
        <header className="flex items-start justify-between gap-3">
          {title && <h2 className="text-lg font-medium tracking-tight">{title}</h2>}
          <div className="ml-auto flex items-center gap-2">
            {action}
            {href && <ArrowButton href={href} label={linkLabel ?? (typeof title === "string" ? `Open ${title}` : "Open")} />}
          </div>
        </header>
      )}
      {children}
    </section>
  );
}

/**
 * Tiny bar sparkline (the "barcode" in the reference). Bars scale to the
 * largest value; the last few are drawn darker as the "recent" ones.
 */
export function BarSpark({ values, className }: { values: number[]; className?: string }) {
  const max = Math.max(...values, 1);
  return (
    <div aria-hidden className={cn("flex h-12 items-end gap-0.75", className)}>
      {values.map((value, index) => (
        <span
          key={index}
          className={cn(
            "w-0.75 rounded-full",
            index >= values.length - Math.ceil(values.length / 3) ? "bg-foreground" : "bg-foreground/20",
          )}
          style={{ height: `${Math.max((value / max) * 100, 8)}%` }}
        />
      ))}
    </div>
  );
}

type MetricCardProps = {
  label: string;
  value: React.ReactNode;
  /** Small line under the number, e.g. "This month". */
  hint?: string;
  icon?: LucideIcon;
  href?: string;
  /** Optional real series for the bar sparkline. */
  spark?: number[];
  isLoading?: boolean;
  className?: string;
};

/** Big serif number with a label, an optional icon or arrow, and a tiny bar sparkline. */
export function MetricCard({ label, value, hint, icon: Icon, href, spark, isLoading, className }: MetricCardProps) {
  return (
    <BentoCard
      title={<span className="text-base font-normal text-muted-foreground">{label}</span>}
      href={href}
      linkLabel={`Open ${label}`}
      action={
        Icon && !href ? (
          <span className="grid size-9 place-items-center rounded-full bg-foreground/5">
            <Icon className="size-4 text-muted-foreground" aria-hidden />
          </span>
        ) : undefined
      }
      className={cn("justify-between", className)}
    >
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          {isLoading ? (
            <Skeleton className="h-12 w-28" />
          ) : (
            <p className="font-serif text-5xl leading-none lining-nums tabular-nums">{value}</p>
          )}
          {hint && <p className="mt-2 text-sm text-muted-foreground">{hint}</p>}
        </div>
        {spark && spark.length > 1 && !isLoading && <BarSpark values={spark} />}
      </div>
    </BentoCard>
  );
}

type PairSide = { label: string; value: number; display?: React.ReactNode };

/**
 * Two labeled figures sharing one bar, like "Sold / Rented" in the reference:
 * the left share in ink, the right in champagne, any remainder hatched.
 */
export function ProgressPair({
  left,
  right,
  total,
  className,
}: {
  left: PairSide;
  right: PairSide;
  /** Defaults to left + right; larger leaves a hatched remainder. */
  total?: number;
  className?: string;
}) {
  const sum = Math.max(total ?? left.value + right.value, 1);
  const leftPct = (left.value / sum) * 100;
  const rightPct = (right.value / sum) * 100;
  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-2 gap-4">
        {[left, right].map((side, index) => (
          <div key={side.label} className={cn("border-l pl-4", index === 0 ? "border-foreground" : "border-gold")}>
            <p className="text-sm text-muted-foreground">{side.label}</p>
            <p className="mt-1 font-serif text-4xl leading-none lining-nums tabular-nums">{side.display ?? side.value}</p>
          </div>
        ))}
      </div>
      <div
        className="flex h-3 overflow-hidden rounded-full bg-[repeating-linear-gradient(135deg,var(--color-border)_0_2px,transparent_2px_7px)]"
        role="img"
        aria-label={`${left.label} ${left.value}, ${right.label} ${right.value}`}
      >
        <span className="h-full rounded-full bg-foreground" style={{ width: `${leftPct}%` }} />
        <span className="h-full rounded-full bg-gold" style={{ width: `${rightPct}%` }} />
      </div>
    </div>
  );
}

type FilterPillProps = {
  icon?: LucideIcon;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
};

/** Pill-shaped select with a leading icon, for filter rows above tables. */
export function FilterPill({ icon: Icon, label, value, onValueChange, options, className }: FilterPillProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger aria-label={label} className={cn("h-10 gap-2 rounded-full border-border bg-card px-4", className)}>
        {Icon && <Icon className="size-4 text-muted-foreground" aria-hidden />}
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
