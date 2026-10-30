import {
  AirVent,
  ArrowUpDown,
  Check,
  ConciergeBell,
  Dumbbell,
  Fence,
  Flower2,
  PawPrint,
  Sofa,
  SquareParking,
  Sunset,
  Trees,
  WashingMachine,
  Waves,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { formatAmenity } from "@/lib/format";

// Amenities are free-text tags; known ones get an icon, the rest a check.
const AMENITY_ICONS: Record<string, LucideIcon> = {
  wifi: Wifi,
  parking: SquareParking,
  "air-conditioning": AirVent,
  furnished: Sofa,
  laundry: WashingMachine,
  elevator: ArrowUpDown,
  lift: ArrowUpDown,
  doorman: ConciergeBell,
  pool: Waves,
  garden: Trees,
  porch: Fence,
  rooftop: Flower2,
  gym: Dumbbell,
  "pet-friendly": PawPrint,
  "ocean-view": Sunset,
  generator: Zap,
};

/** An amenity as an icon tile (for a grid of tiles). */
export function AmenityChip({ amenity }: { amenity: string }) {
  const Icon = AMENITY_ICONS[amenity.toLowerCase()] ?? Check;

  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4">
      <span className="grid size-10 place-items-center rounded-full bg-gold/15 text-bronze">
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="text-sm font-medium">{formatAmenity(amenity)}</span>
    </li>
  );
}
