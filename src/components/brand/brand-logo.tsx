import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The "two birds and an egg" mark (viewBox 60 × 48): two birds facing each
 * other over an egg, in a nest of twigs. The birds and egg take the accent,
 * the eyes and wing shade the surface colour behind the logo, the nest
 * currentColor. Shared with the OG images and the intro; the favicon and app
 * icons use a simplified version (lib/brand-icon).
 */
export const NEST_MARK = {
  viewBox: "0 -2 60 48",
  /** One bird facing right; the right-hand bird mirrors it. */
  bird: {
    tail: "M-7 1 L-18 -5 L-16 3 Z",
    body: { cx: 0, cy: 2, rx: 9.5, ry: 7.5 },
    head: { cx: 7, cy: -5, r: 5.2 },
    beak: "M11.4 -6.4 L17 -4.4 L11.6 -2.6 Z",
    eye: { cx: 8.6, cy: -6.2, r: 1.05 },
    wing: "M-4 2 C -1 -1, 4 0, 6 4 C 2 7, -3 6, -4 2Z",
  },
  birds: ["translate(15 19) scale(.85) rotate(-5)", "translate(45 19) scale(-.85 .85) rotate(5)"],
  egg: { cx: 30, cy: 21, rx: 4.2, ry: 5.4 },
  twigs: [
    "M4 20 C 5 42, 55 42, 56 20",
    "M7 25 C 20 33, 40 30, 54 24",
    "M6 23 C 22 31, 38 36, 52 31",
    "M12 33 C 24 27, 40 28, 50 35",
    "M15 22 C 26 36, 36 37, 47 35",
  ],
} as const;

/**
 * The mark's shapes, for an <svg viewBox={NEST_MARK.viewBox}>. Colours are
 * passed in so the OG images (no CSS variables there) can use the same paths.
 * A plain function, not a component: the OG renderer only accepts SVG
 * elements inside <svg>, so it's called as `nestMarkShapes({...})`.
 */
export function nestMarkShapes({
  accent,
  eye,
  nest,
  twigWidth = 2,
  eggClassName,
}: {
  accent: string;
  eye: string;
  nest: string;
  twigWidth?: number;
  eggClassName?: string;
}) {
  const { bird, birds, egg, twigs } = NEST_MARK;
  return (
    <g>
      {birds.map((transform) => (
        <g key={transform} transform={transform}>
          <g fill={accent}>
            <path d={bird.tail} />
            <ellipse {...bird.body} />
            <circle {...bird.head} />
            <path d={bird.beak} />
          </g>
          <circle {...bird.eye} fill={eye} />
          <path d={bird.wing} fill={eye} opacity={0.28} />
        </g>
      ))}
      <ellipse {...egg} fill={accent} className={eggClassName} />
      <g fill="none" stroke={nest} strokeWidth={twigWidth} strokeLinecap="round">
        {twigs.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </g>
  );
}

/**
 * The mark as inline SVG: nest in currentColor, birds and egg in
 * `--logo-accent` (bronze on light, champagne on dark), eyes in `--logo-eye`
 * (the surface behind the logo), so it follows the theme. Sized in em so it
 * scales with the text next to it.
 */
export function NestMark({ className }: { className?: string }) {
  return (
    <svg viewBox={NEST_MARK.viewBox} aria-hidden className={cn("h-[1.5em] w-[1.9em] shrink-0", className)}>
      {nestMarkShapes({ accent: "var(--logo-accent)", eye: "var(--logo-eye)", nest: "currentColor", eggClassName: "logo-egg" })}
    </svg>
  );
}

/**
 * "RENT" + mark + "NEST" on one line in Jost 500 caps. The font size and
 * `--logo-tracking` come from the caller (default 0.22em). The mark's top
 * quarter is empty, so it's pulled up out of the line box (-mt) and nudged
 * down (top) until the nest sits on the baseline and the birds' heads reach
 * just above the cap height. The intro passes classes to animate the mark
 * and the letters.
 */
export function LogoLockup({
  className,
  markClassName,
  lettersClassName,
}: {
  className?: string;
  markClassName?: string;
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
      <NestMark className={cn("relative top-[0.27em] mx-[0.1em] -mt-[0.5em]", markClassName)} />
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

// Stacked: the mark (1.9 × 1.5 `markSize`) over a small, widely tracked
// "RENTNEST". md is the navbar's roof peak (a 61 × 48 mark), sm the mobile bar.
const STACKED_SIZES = {
  sm: { markSize: "21px", fontSize: "10px", tracking: "0.45em", gap: "gap-0.5" },
  md: { markSize: "32px", fontSize: "13px", tracking: "0.55em", gap: "gap-2" },
  lg: { markSize: "41px", fontSize: "16px", tracking: "0.55em", gap: "gap-2.5" },
} as const;

/** The mark above "RENTNEST". */
function StackedLockup({ size }: { size: keyof typeof STACKED_SIZES }) {
  const { gap } = STACKED_SIZES[size];
  return (
    <span className={cn("flex flex-col items-center", gap)}>
      {/* -mt trims part of the mark's empty top quarter. */}
      <NestMark className="-mt-[0.15em] text-(length:--logo-mark-size)" />
      <span className="-mr-[var(--logo-tracking)] font-wordmark leading-none font-medium tracking-[var(--logo-tracking)] uppercase">
        RentNest
      </span>
    </span>
  );
}

/**
 * The RentNest logo. `full` is the wordmark with the mark inside it; `mark`
 * is the birds and egg in the nest alone (a little larger, so it holds its own); `stacked`
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
      <NestMark className="text-[1.2em]" />
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
