import { ImageResponse } from "next/og";
import { MARK_PATHS } from "@/components/brand/logo";

// Home-screen icon: champagne monogram on ink (iOS adds its own rounded mask).

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const { roof, letter } = MARK_PATHS;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#12100e",
        }}
      >
        <svg width="132" height="132" viewBox="0 0 48 48" fill="none" stroke="#c2a878" strokeLinecap="round" strokeLinejoin="round">
          <path d={roof.d} strokeWidth={2} />
          <path d={letter.d} strokeWidth={2.75} />
        </svg>
      </div>
    ),
    size,
  );
}
