import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cacheLife } from "next/cache";
import { ImageResponse } from "next/og";
import { NEST_MARK } from "@/components/brand/brand-logo";
import { getPublicProperty } from "@/lib/data/public";
import { formatListingPrice, LISTING_LABELS, listingSummary } from "@/lib/listing";
import { formatLocation } from "@/lib/us-states";
import { isUuid } from "@/lib/utils";

// Share image for one listing: its first photo, the price and the city.

export const alt = "A home listed on RentNest";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FONT_DIR = join(process.cwd(), "node_modules/@fontsource/jost/files");

async function loadFonts() {
  "use cache";
  cacheLife("max");
  const [medium, regular] = await Promise.all([
    readFile(join(FONT_DIR, "jost-latin-500-normal.woff")),
    readFile(join(FONT_DIR, "jost-latin-400-normal.woff")),
  ]);
  return { medium: new Uint8Array(medium), regular: new Uint8Array(regular) };
}

/** A 1200px version for Unsplash photos instead of the multi-MB original. */
function sized(src: string) {
  const url = new URL(src);
  if (url.hostname === "images.unsplash.com") {
    url.searchParams.set("w", "1200");
    url.searchParams.set("q", "75");
    url.searchParams.set("fm", "jpg");
  }
  return url.toString();
}

export default async function PropertyOpengraphImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [property, { medium, regular }] = await Promise.all([
    isUuid(id) ? getPublicProperty(id) : null,
    loadFonts(),
  ]);
  const photo = property?.images[0];
  const price = property ? formatListingPrice(property) : null;
  const { egg, twigs } = NEST_MARK;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#12100e", fontFamily: "Jost" }}>
        {photo && (
          <img src={sized(photo)} alt="" width={1200} height={630} style={{ position: "absolute", inset: 0, objectFit: "cover" }} />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(12,11,10,0.92) 0%, rgba(12,11,10,0.35) 55%, rgba(12,11,10,0.15) 100%)",
          }}
        />
        <div style={{ position: "absolute", top: 48, left: 56, display: "flex", alignItems: "center", gap: 14, color: "#f2eee7" }}>
          <svg width={60} height={46} viewBox={NEST_MARK.viewBox}>
            <ellipse cx={egg.cx} cy={egg.cy} rx={egg.rx} ry={egg.ry} fill="#c2a878" />
            <g fill="none" stroke="#f2eee7" strokeWidth={2.4} strokeLinecap="round">
              {twigs.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
          </svg>
          <span style={{ fontSize: 30, fontWeight: 500, letterSpacing: 7 }}>RENTNEST</span>
        </div>
        {property && price && (
          <div style={{ position: "absolute", left: 56, right: 56, bottom: 52, display: "flex", flexDirection: "column", color: "#f2eee7" }}>
            <span style={{ fontSize: 26, fontWeight: 400, letterSpacing: 6, color: "#c2a878", textTransform: "uppercase" }}>
              {LISTING_LABELS[property.listingType]} · {formatLocation(property.city, property.division)}
            </span>
            <span style={{ marginTop: 14, fontSize: 60, fontWeight: 500, lineHeight: 1.05 }}>{property.title}</span>
            <span style={{ marginTop: 18, fontSize: 40, fontWeight: 500 }}>
              {price.amount}
              {price.suffix && <span style={{ fontWeight: 400, color: "rgba(242,238,231,0.75)" }}>{price.suffix}</span>}
            </span>
            <span style={{ marginTop: 8, fontSize: 24, fontWeight: 400, color: "rgba(242,238,231,0.75)" }}>
              {listingSummary(property)}
            </span>
          </div>
        )}
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
