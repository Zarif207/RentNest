"use client";

import { HandCoins } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { PropertyCell } from "@/components/dashboard/property-cell";
import { QueryError } from "@/components/dashboard/query-error";
import { OfferStatusPill } from "@/components/offers/offer-status-pill";
import { OfferStatusTabs, useOfferStatusParam } from "@/components/offers/offer-status-tabs";
import { PaginationNav } from "@/components/shared/pagination-nav";
import { useAdminOffers } from "@/hooks/use-landlord-offers";
import { useUrlParams } from "@/hooks/use-url-params";
import { formatCurrency, formatDate, formatEnumLabel } from "@/lib/format";
import { FINANCING_LABELS, OFFER_STATUS_LABELS } from "@/lib/offers";
import type { Offer } from "@/types";

const PAGE_SIZE = 10;

const columns: DataTableColumn<Offer>[] = [
  {
    key: "property",
    header: "Home",
    cell: (offer) => <PropertyCell property={offer.property} />,
    className: "max-w-64",
    hideOnMobile: true,
  },
  {
    key: "buyer",
    header: "Buyer",
    cell: (offer) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{offer.buyer.name}</p>
        <p className="truncate text-xs text-muted-foreground">{offer.buyer.email}</p>
      </div>
    ),
  },
  {
    key: "amount",
    header: "Asking / offer",
    cell: (offer) => (
      <span>
        <span className="font-semibold">{formatCurrency(offer.agreedAmount ?? offer.offerAmount)}</span>
        <span className="block text-xs text-muted-foreground">
          {offer.agreedAmount ? "agreed" : "offered"} · asking {formatCurrency(offer.property.salePrice)}
        </span>
      </span>
    ),
  },
  { key: "financing", header: "Financing", cell: (offer) => FINANCING_LABELS[offer.financing] },
  { key: "date", header: "Made", cell: (offer) => formatDate(offer.createdAt) },
  {
    key: "status",
    header: "Status",
    cell: (offer) => (
      <span className="inline-flex flex-col items-start gap-1">
        <OfferStatusPill status={offer.status} />
        {offer.payment && (
          <span className="text-xs text-muted-foreground">
            Deposit {formatCurrency(offer.payment.amount)}: {formatEnumLabel(offer.payment.paymentStatus).toLowerCase()}
          </span>
        )}
      </span>
    ),
  },
];

/** Read-only view of every offer on the platform. */
export function AdminOffersView() {
  const { searchParams, pathname } = useUrlParams();
  const status = useOfferStatusParam();
  const page = Number.parseInt(searchParams.get("page") ?? "", 10);
  const offers = useAdminOffers({
    status,
    page: Number.isInteger(page) && page > 0 ? page : 1,
    limit: PAGE_SIZE,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Offers"
        description="Every offer on homes for sale across RentNest. Buyers and owners manage their own; this view is read-only."
      />

      {offers.isError ? (
        <QueryError error={offers.error} onRetry={() => void offers.refetch()} />
      ) : (
        <div className={offers.isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
          <DataTable
            label="All offers"
            toolbar={<OfferStatusTabs />}
            columns={columns}
            rows={offers.data?.data}
            getRowKey={(offer) => offer.id}
            isLoading={offers.isPending}
            mobileTitle={(offer) => <PropertyCell property={offer.property} />}
            empty={{
              icon: HandCoins,
              title: status ? `No ${OFFER_STATUS_LABELS[status].toLowerCase()} offers` : "No offers yet",
              description: status
                ? "Offers with this status will show up here."
                : "Offers from buyers on homes for sale will appear here.",
            }}
          />
        </div>
      )}

      {offers.data && (
        <PaginationNav
          page={offers.data.meta.page}
          totalPages={offers.data.meta.totalPage}
          params={Object.fromEntries(searchParams.entries())}
          pathname={pathname}
        />
      )}
    </div>
  );
}
