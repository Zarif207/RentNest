import { cn } from "@/lib/utils";

/**
 * Infinite horizontal loop (pure CSS). The content renders twice and the track
 * slides by -50%; the copy is hidden from screen readers. Under reduced motion
 * it stops and becomes a scrollable row.
 */
export function Marquee({
  children,
  duration = 40,
  reverse = false,
  pauseOnHover = true,
  className,
}: {
  children: React.ReactNode;
  /** Seconds per loop. */
  duration?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden motion-reduce:overflow-x-auto", className)}>
      <div
        className={cn(
          "flex w-max animate-marquee motion-reduce:animate-none",
          pauseOnHover && "hover:paused",
        )}
        style={{ animationDuration: `${duration}s`, animationDirection: reverse ? "reverse" : undefined }}
      >
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden inert>
          {children}
        </div>
      </div>
    </div>
  );
}
