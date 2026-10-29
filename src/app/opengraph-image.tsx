import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cacheLife } from "next/cache";
import { ImageResponse } from "next/og";
import { MARK_PATHS } from "@/components/brand/logo";

// Default social preview for every page that doesn't set its own image.
// The font files come from node_modules.

export const alt = "RentNest — Find a home worth coming home to";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FONT_DIR = join(process.cwd(), "node_modules/@fontsource/cormorant-garamond/files");

// Cached so the image is prerendered once at build time (Cache Components).
async function loadFonts() {
  "use cache";
  cacheLife("max");
  const [italic, light] = await Promise.all([
    readFile(join(FONT_DIR, "cormorant-garamond-latin-500-italic.woff")),
    readFile(join(FONT_DIR, "cormorant-garamond-latin-300-normal.woff")),
  ]);
  return { italic: new Uint8Array(italic), light: new Uint8Array(light) };
}

export default async function OpengraphImage() {
  const { italic, light } = await loadFonts();
  const { circle, roof, letter } = MARK_PATHS;

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
          gap: 36,
          background: "#12100e",
          color: "#f2eee7",
          fontFamily: "Cormorant",
        }}
      >
        <svg width="168" height="168" viewBox="0 0 48 48" fill="none" stroke="#c2a878" strokeLinecap="round" strokeLinejoin="round">
          <circle cx={circle.cx} cy={circle.cy} r={circle.r} strokeWidth={0.6} />
          <path d={roof.d} strokeWidth={1.2} />
          <path d={letter.d} strokeWidth={1.6} />
        </svg>
        <div style={{ fontSize: 64, fontStyle: "italic", fontWeight: 500, color: "#c2a878" }}>RentNest</div>
        <div style={{ fontSize: 46, fontWeight: 300, letterSpacing: 0.5 }}>Find a home worth coming home to</div>
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
        { name: "Cormorant", data: italic.buffer, style: "italic", weight: 500 },
        { name: "Cormorant", data: light.buffer, style: "normal", weight: 300 },
      ],
    },
  );
}
