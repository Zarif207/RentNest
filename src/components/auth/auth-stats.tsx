import { Building2 } from "lucide-react";
import { getPublicProperties, getPublicPropertyStates, orNull } from "@/lib/data/public";
import { formatNumber } from "@/lib/format";

/** Live listing and state counts for the auth photo panel; nothing when the API is down. */
export async function AuthStats() {
  const [homes, states] = await Promise.all([
    orNull(getPublicProperties({ limit: 1 })),
    orNull(getPublicPropertyStates()),
  ]);
  const total = homes?.meta.total ?? 0;
  if (total === 0 || !states?.length) return null;

  return (
    <p className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm shadow-2xl shadow-black/20 backdrop-blur-xl">
      <span className="grid size-9 place-items-center rounded-full bg-gold text-gold-foreground">
        <Building2 className="size-4" aria-hidden />
      </span>
      <span>
        <span className="block font-semibold">{formatNumber(total)} homes</span>
        <span className="text-white/70">
          across {formatNumber(states.length)} {states.length === 1 ? "state" : "states"}
        </span>
      </span>
    </p>
  );
}
