import Link from "next/link";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { Wordmark } from "./wordmark";

const SIZES = {
  sm: { mark: 26, text: "text-xl" },
  md: { mark: 32, text: "text-2xl" },
  lg: { mark: 44, text: "text-4xl" },
} as const;

/**
 * Monogram + wordmark lockup. Links home by default; pass `href={null}` for a
 * static lockup (e.g. inside another link).
 */
export function BrandLogo({
  size = "md",
  variant = "full",
  href = "/",
  className,
}: {
  size?: keyof typeof SIZES;
  variant?: "full" | "mark";
  href?: string | null;
  className?: string;
}) {
  const { mark, text } = SIZES[size];
  const content =
    variant === "mark" ? (
      <Logo size={mark} title="RentNest" />
    ) : (
      <>
        <Logo size={mark} />
        <Wordmark className={text} />
      </>
    );
  const classes = cn("inline-flex items-center gap-2.5 leading-none", className);

  if (href === null) return <span className={classes}>{content}</span>;

  return (
    <Link
      href={href}
      aria-label={variant === "mark" ? "RentNest home" : undefined}
      className={cn(
        classes,
        "rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      {content}
    </Link>
  );
}
