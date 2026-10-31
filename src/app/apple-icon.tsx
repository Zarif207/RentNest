import { nestIconResponse } from "@/lib/brand-icon";

// Home-screen icon: the egg-in-nest mark on ink (iOS adds its own rounded mask).

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return nestIconResponse(size.width);
}
