import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** A listing the admin picked for the hero, shown in one of the house's pieces. */
export type HeroCard = {
  id: string;
  title: string;
  image: string;
  price: string;
  location: string;
};

type Point = readonly [number, number];

// A tangram house, traced from design-refs/house-design-ref, in a 100 × 91
// box: a chimney square, a parallelogram and a big triangle for the roof, and
// four triangles for the walls.
const WIDTH = 100;
const HEIGHT = 91;
const CENTER: Point = [50, 56];

// Pieces in fill order: piece i shows the admin's hero pick i (biggest first);
// without a pick it's glass with its own `shade`, and a few glass pieces
// `pulse`. `z` is depth toward the viewer.
const LAYOUT: { points: readonly Point[]; z: number; shade: number; pulse?: string }[] = [
  // Roof: the big triangle.
  { points: [[26.6, 53.8], [62.7, 16.5], [100, 53.8]], z: 35, shade: 0.12, pulse: "0s" },
  // Walls: the big triangle standing on the floor.
  { points: [[10.6, 91], [49.3, 53.8], [86.8, 91]], z: 40, shade: 0.12 },
  // Walls: the left triangle.
  { points: [[10.6, 53.8], [49.3, 53.8], [10.6, 91]], z: 15, shade: 0.14, pulse: "-2.5s" },
  // Roof: the parallelogram on the left.
  { points: [[25.2, 26.6], [51.5, 26.6], [26.6, 53.8], [0, 53.8]], z: 5, shade: 0.11 },
  // Chimney.
  { points: [[25.2, 0], [51.5, 0], [51.5, 26.6], [25.2, 26.6]], z: -10, shade: 0.16, pulse: "-5s" },
  // Walls: the narrow triangle on the right.
  { points: [[86.8, 53.8], [86.8, 91], [68, 72.4]], z: -5, shade: 0.1 },
  // Walls: the small inverted triangle under the roof.
  { points: [[49.3, 53.8], [86.8, 53.8], [68, 72.4]], z: 20, shade: 0.13 },
];

// Half the gap between pieces, and the hairline drawn just inside each one (px).
const GAP = 1;
const LINE = 1;
const FOCUS_LINE = 3;

const round = (value: number) => Math.round(value * 100) / 100;

/** Unit normal of edge a→b that points into the (convex) piece. */
function inwardNormal(a: Point, b: Point, centroid: Point): Point {
  const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const normal: Point = [-(b[1] - a[1]) / length, (b[0] - a[0]) / length];
  const inward = normal[0] * (centroid[0] - a[0]) + normal[1] * (centroid[1] - a[1]) > 0;
  return inward ? normal : [-normal[0], -normal[1]];
}

/**
 * Turns a convex piece into what the DOM needs: its bounding box (as % of the
 * house), clip-paths in % of that box that are pulled in by fixed pixel
 * amounts (so gaps and hairlines stay crisp at every size), and the direction
 * the piece flies off in.
 */
function buildPiece(points: readonly Point[]) {
  const count = points.length;
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const [minX, minY] = [Math.min(...xs), Math.min(...ys)];
  const [width, height] = [Math.max(...xs) - minX, Math.max(...ys) - minY];
  const centroid: Point = [xs.reduce((a, b) => a + b) / count, ys.reduce((a, b) => a + b) / count];

  // Miter vector per corner: moving it by `miter * d` insets both sides by d.
  const miters = points.map((point, index) => {
    const n1 = inwardNormal(points[(index + count - 1) % count], point, centroid);
    const n2 = inwardNormal(point, points[(index + 1) % count], centroid);
    const k = 1 + n1[0] * n2[0] + n1[1] * n2[1];
    return [(n1[0] + n2[0]) / k, (n1[1] + n2[1]) / k] as const;
  });
  const inset = (px: number) =>
    points.map(([x, y], index) => {
      const left = round(((x - minX) / width) * 100);
      const top = round(((y - minY) / height) * 100);
      return `calc(${left}% + ${round(miters[index][0] * px)}px) calc(${top}% + ${round(miters[index][1] * px)}px)`;
    });
  // An outline between two insets: outer loop, then inner loop, even-odd fill.
  const ring = (outer: number, inner: number) => {
    const [o, i] = [inset(outer), inset(inner)];
    return `polygon(evenodd, ${[...o, o[0], ...i, i[0]].join(", ")})`;
  };

  const away = [centroid[0] - CENTER[0], centroid[1] - CENTER[1]];
  const distance = Math.hypot(away[0], away[1]) || 1;

  return {
    box: {
      left: `${round((minX / WIDTH) * 100)}%`,
      top: `${round((minY / HEIGHT) * 100)}%`,
      width: `${round((width / WIDTH) * 100)}%`,
      height: `${round((height / HEIGHT) * 100)}%`,
    },
    fill: `polygon(${inset(GAP + LINE).join(", ")})`,
    line: ring(GAP, GAP + LINE),
    focusLine: ring(GAP, GAP + FOCUS_LINE),
    direction: [away[0] / distance, away[1] / distance] as const,
  };
}

/** Every piece, ready to render; the hero animates them by index. */
export const MOSAIC_FACETS = LAYOUT.map((piece) => ({ ...piece, ...buildPiece(piece.points) }));

type Piece = (typeof MOSAIC_FACETS)[number];

/** A photo cut to the piece's shape; just the picture, the link names the home. */
function PhotoPiece({ piece, card }: { piece: Piece; card: HeroCard }) {
  return (
    <Link
      href={`/properties/${card.id}`}
      aria-label={`${card.title}, ${card.price}, ${card.location}`}
      className="group relative block size-full outline-none transition-transform duration-500 ease-out hover:scale-[1.04] focus-visible:scale-[1.04]"
    >
      <span className="pointer-events-auto absolute inset-0 bg-[#1c1815]" style={{ clipPath: piece.fill }}>
        <Image
          src={card.image}
          alt=""
          fill
          sizes="(min-width: 768px) 200px, 70px"
          className="object-cover transition-[filter] duration-500 group-hover:brightness-110"
        />
      </span>
      <span
        className="pointer-events-auto absolute inset-0 bg-white/60 transition-colors duration-300 group-hover:bg-gold"
        style={{ clipPath: piece.line }}
      />
      <span
        className="absolute inset-0 bg-gold opacity-0 transition-opacity group-focus-visible:opacity-100"
        style={{ clipPath: piece.focusLine }}
      />
    </Link>
  );
}

function GlassPiece({ piece }: { piece: Piece }) {
  return (
    <div className="relative size-full">
      <span className="absolute inset-0 bg-gold/80" style={{ clipPath: piece.line }} />
      <span
        className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent backdrop-blur-lg backdrop-brightness-110"
        style={{ clipPath: piece.fill, backgroundColor: `rgb(255 255 255 / ${piece.shade})` }}
      >
        {piece.pulse && (
          <span
            className="absolute inset-0 bg-gold/25 opacity-0 motion-safe:animate-[facet-pulse_7.5s_ease-in-out_infinite]"
            style={{ animationDelay: piece.pulse }}
          />
        )}
      </span>
    </div>
  );
}

/**
 * The hero's tangram house: seven pieces with hairline gaps. Each shows one
 * of the admin's hero listings as a photo; spares are glass. Purely
 * presentational: the hero drives the tilt, entrance and break-apart through
 * the data attributes.
 */
export function HeroMosaic({ cards, className }: { cards: HeroCard[]; className?: string }) {
  return (
    // Only the clipped shapes take the pointer (pointer-events-auto in
    // PhotoPiece): in 3D, the wrappers' planes and the pieces' overlapping
    // boxes would otherwise swallow clicks meant for pieces further back.
    <div
      data-enter
      className={cn("pointer-events-none relative aspect-[100/91] perspective-[1200px]", className)}
    >
      <div className="size-full transform-3d motion-safe:animate-[hero-bob_7s_ease-in-out_infinite]">
        <ul data-mosaic-tilt aria-label="Featured homes" className="relative size-full transform-3d">
          {MOSAIC_FACETS.map((piece, index) => {
            const card = cards.at(index);
            return (
              <li
                key={index}
                data-facet-fly
                aria-hidden={card ? undefined : true}
                className="absolute"
                style={{ ...piece.box, translate: `0 0 ${piece.z}px` }}
              >
                <div data-facet-enter className="size-full">
                  {card ? <PhotoPiece piece={piece} card={card} /> : <GlassPiece piece={piece} />}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
