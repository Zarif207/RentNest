import Link from "next/link";
import { House } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2 rounded-full text-lg font-semibold tracking-tight",
        className,
      )}
    >
      <span className="grid size-8 place-items-center rounded-xl bg-foreground text-background">
        <House className="size-4" aria-hidden />
      </span>
      RentNest
    </Link>
  );
}
