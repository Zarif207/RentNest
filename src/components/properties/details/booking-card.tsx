import { Mail, Phone } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { RequestToRent } from "@/components/rentals/request-to-rent";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { PropertyWithRelations } from "@/types";

/** Sticky side card: price, stat trio, request button and landlord contact. */
export function BookingCard({ property }: { property: PropertyWithRelations }) {
  const available = property.availabilityStatus === "AVAILABLE";
  const stats = [
    { value: formatNumber(property.bedrooms), label: property.bedrooms === 1 ? "Bed" : "Beds" },
    { value: formatNumber(property.bathrooms), label: property.bathrooms === 1 ? "Bath" : "Baths" },
    { value: formatNumber(property.area), label: "Sq ft" },
  ];

  return (
    <div className="space-y-6 rounded-3xl border bg-card p-6 shadow-xl shadow-black/5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-3xl font-bold tracking-tight italic">
          {formatCurrency(property.rentAmount)}
          <span className="text-base font-normal text-muted-foreground not-italic"> /month</span>
        </p>
        <Badge variant={available ? "active" : "completed"}>
          {available ? "Available" : "Rented"}
        </Badge>
      </div>

      <dl className="grid grid-cols-3 divide-x rounded-2xl bg-surface py-4 text-center">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col-reverse gap-1 px-2">
            <dt className="text-xs tracking-wide text-muted-foreground uppercase">{stat.label}</dt>
            <dd className="text-3xl font-semibold tracking-tight">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <RequestToRent property={property} />

      <div className="space-y-4 border-t pt-6">
        <div className="flex items-center gap-3">
          <UserAvatar name={property.owner.name} className="size-12" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{property.owner.name}</p>
            <p className="text-sm text-muted-foreground">Landlord</p>
          </div>
        </div>
        <ul className="space-y-2 text-sm">
          <li>
            <a
              href={`mailto:${property.owner.email}`}
              className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Mail className="size-4 shrink-0" aria-hidden />
              <span className="truncate">{property.owner.email}</span>
            </a>
          </li>
          {property.owner.phone && (
            <li>
              <a
                href={`tel:${property.owner.phone}`}
                className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <Phone className="size-4 shrink-0" aria-hidden />
                {property.owner.phone}
              </a>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
