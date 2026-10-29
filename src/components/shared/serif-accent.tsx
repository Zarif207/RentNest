import { cn } from "@/lib/utils";

/** The one upright-serif accent word or phrase in a heading (never italic). */
export function SerifAccent({
  className,
  ...props
}: React.ComponentProps<"em">) {
  return (
    <em
      className={cn(
        "font-serif font-normal tracking-[-0.01em] text-serif-accent not-italic",
        className,
      )}
      {...props}
    />
  );
}
