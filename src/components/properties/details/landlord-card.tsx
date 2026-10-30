import { Mail, Phone } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { PropertyWithRelations } from "@/types";

/** Who lists this home, with direct contact links. */
export function LandlordCard({ owner }: { owner: PropertyWithRelations["owner"] }) {
  const linkClass =
    "inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm transition-colors hover:bg-muted";
  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <UserAvatar name={owner.name} className="size-14" />
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-[0.2em] text-bronze uppercase">Listed by</p>
          <p className="truncate text-lg font-medium tracking-tight">{owner.name}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <a href={`mailto:${owner.email}`} className={linkClass}>
          <Mail className="size-4 shrink-0" aria-hidden />
          <span className="truncate">{owner.email}</span>
        </a>
        {owner.phone && (
          <a href={`tel:${owner.phone}`} className={linkClass}>
            <Phone className="size-4 shrink-0" aria-hidden />
            {owner.phone}
          </a>
        )}
      </div>
    </div>
  );
}
