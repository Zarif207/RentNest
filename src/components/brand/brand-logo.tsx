import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The "egg in nest" mark (60 × 46): a champagne/bronze egg resting in a nest
 * of twigs. Shared with the favicon, app icon, OG image and intro.
 */
export const NEST_MARK = {
  viewBox: "0 0 60 46",
  egg: { cx: 30, cy: 15, rx: 9, ry: 12 },
  twigs: [
    "M4 20 C 5 42, 55 42, 56 20",
    "M7 25 C 20 33, 40 30, 54 24",
    "M6 23 C 22 31, 38 36, 52 31",
    "M12 33 C 24 27, 40 28, 50 35",
    "M15 22 C 26 36, 36 37, 47 35",
  ],
} as const;

/**
 * The mark as inline SVG: twigs in currentColor, the egg in `--logo-accent`
 * (bronze on light, champagne on dark), so it follows the theme. Sized in em
 * so it scales with the text next to it.
 */
export function NestMark({
  className,
  twigWidth = 2,
  eggClassName,
}: {
  className?: string;
  twigWidth?: number;
  eggClassName?: string;
}) {
  const { egg, twigs } = NEST_MARK;
  return (
    <svg viewBox={NEST_MARK.viewBox} aria-hidden className={cn("h-[1.15em] w-[1.5em] shrink-0", className)}>
      <ellipse {...egg} fill="var(--logo-accent)" className={eggClassName} />
      <g fill="none" stroke="currentColor" strokeWidth={twigWidth} strokeLinecap="round">
        {twigs.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}

/**
 * "RENT" + mark + "NEST" on one line in Jost 500 caps. The font size and
 * `--logo-tracking` come from the caller (default 0.22em); the mark sits on
 * the baseline (nudged down 0.06em) with the egg rising toward the cap
 * height. The intro passes classes to animate the egg and the letters.
 */
export function LogoLockup({
  className,
  eggClassName,
  lettersClassName,
}: {
  className?: string;
  eggClassName?: string;
  lettersClassName?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline font-wordmark leading-none font-medium tracking-[var(--logo-tracking)] uppercase",
        className,
      )}
    >
      <span className={lettersClassName}>Rent</span>
      <NestMark className="relative top-[0.06em] mx-[0.1em]" eggClassName={eggClassName} />
      {/* Cancel the trailing letter-spacing so the lockup is optically centered. */}
      <span className={cn("-mr-[var(--logo-tracking)]", lettersClassName)}>Nest</span>
    </span>
  );
}

// Navbar and dashboard bar (compact), footer/auth/payment/404, and large.
const SIZES = {
  sm: { fontSize: "15px", tracking: "0.18em" },
  md: { fontSize: "22px", tracking: "0.22em" },
  lg: { fontSize: "28px", tracking: "0.22em" },
} as const;

// Stacked: the mark (its width is 1.5× `markSize`) over a small, widely
// tracked "RENTNEST". md is the navbar's roof peak (a 60 × 46 mark), sm the
// mobile bar.
const STACKED_SIZES = {
  sm: { markSize: "24px", fontSize: "10px", tracking: "0.45em", gap: "gap-1" },
  md: { markSize: "40px", fontSize: "13px", tracking: "0.55em", gap: "gap-3" },
  lg: { markSize: "52px", fontSize: "16px", tracking: "0.55em", gap: "gap-3.5" },
} as const;

/** The mark above "RENTNEST". */
function StackedLockup({ size }: { size: keyof typeof STACKED_SIZES }) {
  const { gap } = STACKED_SIZES[size];
  return (
    <span className={cn("flex flex-col items-center", gap)}>
      <NestMark className="text-(length:--logo-mark-size)" />
      <span className="-mr-[var(--logo-tracking)] font-wordmark leading-none font-medium tracking-[var(--logo-tracking)] uppercase">
        RentNest
      </span>
    </span>
  );
}

/**
 * The RentNest logo. `full` is the wordmark with the mark inside it; `mark`
 * is the egg in nest alone (a little larger, so it holds its own); `stacked`
 * is the mark above a small "RENTNEST" (the navbar). Links to `href` (home by
 * default); pass `href={null}` for a static logo.
 *
 * Under 400 px the compact size drops its tracking to 0.12em so the navbar
 * pill keeps room for its buttons.
 */
export function BrandLogo({
  size = "md",
  variant = "full",
  href = "/",
  className,
}: {
  size?: keyof typeof SIZES;
  variant?: "full" | "mark" | "stacked";
  href?: string | null;
  className?: string;
}) {
  const stacked = STACKED_SIZES[size];
  const { fontSize, tracking } = variant === "stacked" ? stacked : SIZES[size];
  const style = {
    fontSize,
    "--logo-tracking": tracking,
    ...(variant === "stacked" && { "--logo-mark-size": stacked.markSize }),
  } as React.CSSProperties;
  const content =
    variant === "mark" ? (
      <NestMark className="text-[1.5em]" />
    ) : variant === "stacked" ? (
      <StackedLockup size={size} />
    ) : (
      <LogoLockup className={cn(size === "sm" && "max-[399px]:[--logo-tracking:0.12em]")} />
    );
  const classes = cn("inline-flex items-center leading-none", className);

  if (href === null) {
    return (
      <span role="img" aria-label="RentNest" className={classes} style={style}>
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label="RentNest home"
      className={cn(
        classes,
        "rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
      style={style}
    >
      {content}
    </Link>
  );
}
