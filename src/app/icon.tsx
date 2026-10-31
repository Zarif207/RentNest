import { nestIconResponse } from "@/lib/brand-icon";

// Favicon (32) and the large app icon (512): the egg-in-nest mark on ink.

const SIZES = [32, 512] as const;

export function generateImageMetadata() {
  return SIZES.map((px) => ({ id: String(px), size: { width: px, height: px }, contentType: "image/png" }));
}

export default async function Icon({ id }: { id: Promise<string> }) {
  return nestIconResponse(Number(await id));
}
