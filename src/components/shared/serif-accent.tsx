import { cn } from "@/lib/utils";

/** The one italic-serif word or phrase in a heading. */
export function SerifAccent({
  className,
  ...props
}: React.ComponentProps<"em">) {
  return (
    <em
      className={cn(
        "font-serif font-normal tracking-normal text-serif-accent italic",
        className,
      )}
      {...props}
    />
  );
}
