import { ImageResponse } from "next/og";
import { NEST_MARK } from "@/components/brand/brand-logo";

const INK = "#12100e";
const IVORY = "#f2eee7";
const CHAMPAGNE = "#c2a878";

/**
 * The egg-in-nest mark on an ink rounded square, as a PNG: champagne egg,
 * ivory twigs. Small sizes get thicker twigs so they don't disappear.
 */
export function nestIconResponse(px: number) {
  const { egg, twigs } = NEST_MARK;
  const markWidth = Math.round(px * 0.74);
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
        <svg width={markWidth} height={Math.round((markWidth * 46) / 60)} viewBox={NEST_MARK.viewBox}>
          <ellipse cx={egg.cx} cy={egg.cy} rx={egg.rx} ry={egg.ry} fill={CHAMPAGNE} />
          <g fill="none" stroke={IVORY} strokeWidth={px <= 48 ? 3.4 : 2.6} strokeLinecap="round">
            {twigs.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
        </svg>
      </div>
    ),
    { width: px, height: px },
  );
}
