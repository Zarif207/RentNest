import { Counter } from "@/components/motion/counter";
import { Reveal } from "@/components/motion/reveal";
import type { LiveStat } from "@/lib/live-stats";
import { cn } from "@/lib/utils";

/**
 * Real platform numbers from the API. The caller leaves out anything it can't
 * count truthfully, so this renders 2–4 tiles; the first one is the dark accent.
 */
export function LiveStats({ stats }: { stats: LiveStat[] }) {
  if (stats.length === 0) return null;

  return (
    <section aria-label="RentNest in numbers" className="pb-28 sm:pb-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal
          stagger
          className={cn(
            "grid gap-4 sm:grid-cols-2",
            stats.length === 3 && "lg:grid-cols-3",
            stats.length === 4 && "lg:grid-cols-4",
          )}
        >
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={cn(
                "flex min-h-56 flex-col justify-between rounded-3xl border p-7",
                index === 0
                  ? "border-transparent bg-foreground text-background"
                  : "border-border bg-card",
              )}
            >
              <p className="text-6xl font-medium tracking-tighter sm:text-7xl">
                <Counter value={stat.value} />
              </p>
              <div className="space-y-1">
                <p className="font-medium">{stat.label}</p>
                <p className={cn("text-sm", index === 0 ? "text-background/70" : "text-muted-foreground")}>
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
