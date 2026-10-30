import { ShieldCheck } from "lucide-react";
import { RequestToRent } from "@/components/rentals/request-to-rent";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { PropertyWithRelations } from "@/types";

/** Sticky glass panel: price, a serif stat trio and the request button. */
export function BookingCard({ property }: { property: PropertyWithRelations }) {
  const available = property.availabilityStatus === "AVAILABLE";
  const stats = [
    { value: formatNumber(property.bedrooms), label: property.bedrooms === 1 ? "Bed" : "Beds" },
    { value: formatNumber(property.bathrooms), label: property.bathrooms === 1 ? "Bath" : "Baths" },
    { value: formatNumber(property.area), label: "Sq ft" },
  ];

  return (
    <div className="space-y-6 rounded-3xl border border-border bg-card/70 p-6 shadow-2xl shadow-black/5 backdrop-blur-xl dark:shadow-black/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">Monthly rent</p>
          <p className="mt-1 text-4xl font-medium tracking-tighter">
            {formatCurrency(property.rentAmount)}
            <span className="text-base font-normal tracking-normal text-muted-foreground"> /month</span>
          </p>
        </div>
        <Badge variant={available ? "active" : "completed"}>{available ? "Available" : "Rented"}</Badge>
      </div>

      <dl className="grid grid-cols-3 divide-x divide-border border-y border-border py-5 text-center">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col-reverse gap-1 px-2">
            <dt className="text-xs tracking-[0.15em] text-muted-foreground uppercase">{stat.label}</dt>
            <dd className="font-serif text-4xl leading-none lining-nums tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <RequestToRent property={property} />

      <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="size-4 text-bronze" aria-hidden />
        Nothing is charged until the landlord approves and you pay.
      </p>
    </div>
  );
}
