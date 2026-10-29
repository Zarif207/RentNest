import { cn } from "@/lib/utils";

/** "RentNest" set in Cormorant Garamond italic. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-serif font-medium tracking-[0.01em] italic", className)}>
      RentNest
    </span>
  );
}
