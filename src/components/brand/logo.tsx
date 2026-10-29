import { cn } from "@/lib/utils";

/** SVG paths of the monogram (48×48): thin circle, roof chevron, R. Shared with the icons. */
export const MARK_PATHS = {
  circle: { cx: 24, cy: 24, r: 22.5, strokeWidth: 0.9 },
  roof: { d: "M12.5 19.5 23 11l10.5 8.5", strokeWidth: 1.5 },
  letter: { d: "M17 36V19.5h7a4.25 4.25 0 0 1 0 8.5h-7M22.5 28l8 8", strokeWidth: 2 },
} as const;

/**
 * The RentNest monogram: an R under a gable roof, in a thin circle.
 * Drawn in currentColor so it follows the text color in both themes.
 */
export function Logo({
  size = 32,
  title,
  className,
}: {
  size?: number;
  /** Accessible name; omit when the mark sits next to visible text. */
  title?: string;
  className?: string;
}) {
  const { circle, roof, letter } = MARK_PATHS;

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <circle cx={circle.cx} cy={circle.cy} r={circle.r} strokeWidth={circle.strokeWidth} />
      <path d={roof.d} strokeWidth={roof.strokeWidth} />
      <path d={letter.d} strokeWidth={letter.strokeWidth} />
    </svg>
  );
}
