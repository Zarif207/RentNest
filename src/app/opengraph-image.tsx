import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cacheLife } from "next/cache";
import { ImageResponse } from "next/og";
import { NEST_MARK } from "@/components/brand/brand-logo";

// Default social preview for every page that doesn't set its own image.
// The font files come from node_modules.

export const alt = "RentNest — Find a home worth coming home to";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FONT_DIR = join(process.cwd(), "node_modules/@fontsource/jost/files");

// Cached so the image is prerendered once at build time (Cache Components).
async function loadFonts() {
  "use cache";
  cacheLife("max");
  const [medium, regular] = await Promise.all([
    readFile(join(FONT_DIR, "jost-latin-500-normal.woff")),
    readFile(join(FONT_DIR, "jost-latin-400-normal.woff")),
  ]);
  return { medium: new Uint8Array(medium), regular: new Uint8Array(regular) };
}

// The wordmark's size; the mark and spacing follow the logo's em proportions.
const FONT_SIZE = 92;
const TRACKING = 0.22 * FONT_SIZE;

export default async function OpengraphImage() {
  const { medium, regular } = await loadFonts();
  const { egg, twigs } = NEST_MARK;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 44,
          background: "#12100e",
          color: "#f2eee7",
          fontFamily: "Jost",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", fontSize: FONT_SIZE, fontWeight: 500, lineHeight: 1 }}>
          <span style={{ letterSpacing: TRACKING }}>RENT</span>
          <svg
            width={FONT_SIZE * 1.5}
            height={FONT_SIZE * 1.15}
            viewBox={NEST_MARK.viewBox}
            style={{ margin: `0 ${FONT_SIZE * 0.1}px`, position: "relative", top: FONT_SIZE * 0.06 }}
          >
            <ellipse cx={egg.cx} cy={egg.cy} rx={egg.rx} ry={egg.ry} fill="#c2a878" />
            <g fill="none" stroke="#f2eee7" strokeWidth={2} strokeLinecap="round">
              {twigs.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
          </svg>
          {/* No tracking after the last letter, so the lockup stays centered. */}
          <span style={{ letterSpacing: TRACKING, marginRight: -TRACKING }}>NEST</span>
        </div>
        <div style={{ fontSize: 30, fontWeight: 400, letterSpacing: 0.3 * 30, color: "#c2a878" }}>
          Find a home worth coming home to
        </div>
        <div
          style={{
            position: "absolute",
            top: 28,
            right: 28,
            bottom: 28,
            left: 28,
            border: "1px solid rgba(194, 168, 120, 0.35)",
            borderRadius: 28,
          }}
        />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Jost", data: medium.buffer, style: "normal", weight: 500 },
        { name: "Jost", data: regular.buffer, style: "normal", weight: 400 },
      ],
    },
  );
}
