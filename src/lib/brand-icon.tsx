import { ImageResponse } from "next/og";

const INK = "#12100e";
const CHAMPAGNE = "#c2a878";

/**
 * The favicon/app-icon version of the mark. The full mark turns into a blob
 * at 32 px, so this one is simplified: two birds (a round body and a small
 * round head each, with a beak and tail so they don't read as a face) facing
 * an egg, sitting in a bold nest bowl of two thick curves. All champagne, no
 * eyes, no thin strokes; an ink edge on the curves keeps the bowl and rim
 * apart from the birds. The viewBox is shifted down to center the drawing.
 */
const ICON_MARK = {
  viewBox: "0 4 60 48",
  bodies: [
    { cx: 15, cy: 24, rx: 8.5, ry: 7 },
    { cx: 45, cy: 24, rx: 8.5, ry: 7 },
  ],
  heads: [
    { cx: 21.5, cy: 15, r: 4.4 },
    { cx: 38.5, cy: 15, r: 4.4 },
  ],
  /** Beaks and tails, left bird then right. */
  points: ["M25 13.5 L29 15.3 L25.1 16.9Z", "M35 13.5 L31 15.3 L34.9 16.9Z", "M8 22 L1 17 L2.5 25Z", "M52 22 L59 17 L57.5 25Z"],
  egg: { cx: 30, cy: 25.5, rx: 4.4, ry: 5.8 },
  /** Bowl and rim. */
  nest: ["M4 27 C 6 48, 54 48, 56 27", "M7 30 C 20 37.5, 40 37.5, 53 30"],
} as const;

const NEST_WIDTH = 4.6;

/** The simplified mark in champagne on an ink rounded square, as a PNG. */
export function nestIconResponse(px: number) {
  const { bodies, heads, points, egg, nest } = ICON_MARK;
  const markWidth = Math.round(px * 0.8);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: INK,
          borderRadius: Math.round(px * 0.22),
        }}
      >
        <svg width={markWidth} height={Math.round((markWidth * 48) / 60)} viewBox={ICON_MARK.viewBox}>
          <g fill={CHAMPAGNE}>
            {bodies.map((body) => (
              <ellipse key={body.cx} {...body} />
            ))}
            {heads.map((head) => (
              <circle key={head.cx} {...head} />
            ))}
            {points.map((d) => (
              <path key={d} d={d} />
            ))}
            <ellipse {...egg} />
          </g>
          {nest.map((d) => (
            <g key={d} fill="none" strokeLinecap="round">
              <path d={d} stroke={INK} strokeWidth={NEST_WIDTH + 3} />
              <path d={d} stroke={CHAMPAGNE} strokeWidth={NEST_WIDTH} />
            </g>
          ))}
        </svg>
      </div>
    ),
    { width: px, height: px },
  );
}
