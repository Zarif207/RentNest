"use client";

import { useState } from "react";
import { Check, CircleCheckBig, Inbox, X } from "lucide-react";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { PropertyCell } from "@/components/dashboard/property-cell";
import { QueryError } from "@/components/dashboard/query-error";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StatusTabs, useStatusParam } from "@/components/dashboard/status-tabs";
import { ApprovalTooltip } from "@/components/landlord/approval";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { useLandlordAccess } from "@/hooks/use-landlord-access";
import {
  useCompleteRental,
  useDecideRequest,
  useLandlordRequests,
} from "@/hooks/use-landlord-requests";
import { formatCurrency, formatDate, formatEnumLabel } from "@/lib/format";
import type { LandlordBooking } from "@/types";

type PendingConfirm = { type: "reject" | "complete"; request: LandlordBooking };

function TenantCell({ tenant }: { tenant: LandlordBooking["tenant"] }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <UserAvatar name={tenant.name} className="size-9" />
      <div className="min-w-0">
        <p className="truncate font-medium">{tenant.name}</p>
        <a href={`mailto:${tenant.email}`} className="block truncate text-xs text-muted-foreground hover:underline">
          {tenant.email}
        </a>
      </div>
    </div>
  );
}

export function LandlordRequestsView() {
  const status = useStatusParam();
  const requests = useLandlordRequests(status);
  const decide = useDecideRequest();
  const complete = useCompleteRental();
  const { canWrite } = useLandlordAccess();
  const [confirm, setConfirm] = useState<PendingConfirm | null>(null);

  // Disable a row's buttons while its own change is in flight.
  const busyId =
    (decide.isPending && decide.variables?.id) || (complete.isPending && complete.variables) || null;

  const columns: DataTableColumn<LandlordBooking>[] = [
    { key: "tenant", header: "Tenant", cell: (request) => <TenantCell tenant={request.tenant} />, hideOnMobile: true },
    {
      key: "property",
      header: "Property",
      cell: (request) => <PropertyCell property={request.property} />,
      className: "max-w-60",
    },
    { key: "moveIn", header: "Move-in", cell: (request) => formatDate(request.moveInDate) },
    {
      key: "lease",
      header: "Lease",
      cell: (request) => `${request.leaseMonths} ${request.leaseMonths === 1 ? "month" : "months"}`,
    },
    {
      key: "total",
      header: "Total",
      cell: (request) => <span className="font-semibold">{formatCurrency(request.totalRent)}</span>,
    },
    { key: "requested", header: "Requested", cell: (request) => formatDate(request.createdAt) },
    { key: "status", header: "Status", cell: (request) => <StatusBadge status={request.bookingStatus} /> },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (request) => {
        const busy = busyId === request.id;
        if (request.bookingStatus === "PENDING") {
          return (
            <ApprovalTooltip className="w-full justify-end">
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  disabled={busy || !canWrite}
                  onClick={() => decide.mutate({ id: request.id, status: "APPROVED" })}
                >
                  <Check data-icon="inline-start" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy || !canWrite}
                  onClick={() => setConfirm({ type: "reject", request })}
                >
                  <X data-icon="inline-start" /> Reject
                </Button>
              </div>
            </ApprovalTooltip>
          );
        }
        if (request.bookingStatus === "ACTIVE") {
          return (
            <ApprovalTooltip className="w-full justify-end">
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy || !canWrite}
                  onClick={() => setConfirm({ type: "complete", request })}
                >
                  <CircleCheckBig data-icon="inline-start" /> Mark completed
                </Button>
              </div>
            </ApprovalTooltip>
          );
        }
        return <span className="block text-right text-sm text-muted-foreground">—</span>;
      },
    },
  ];

  const onConfirm = () => {
    if (!confirm) return;
    // The dialog closes right away; the optimistic update shows the result.
    if (confirm.type === "reject") decide.mutate({ id: confirm.request.id, status: "REJECTED" });
    else complete.mutate(confirm.request.id);
    setConfirm(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rental requests"
        description="Approve or reject new requests, and close out leases when tenants move out."
      />

      {requests.isError ? (
        <QueryError error={requests.error} onRetry={() => void requests.refetch()} />
      ) : (
        <div className={requests.isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
          <DataTable
            label="Rental requests"
            toolbar={<StatusTabs />}
            columns={columns}
            rows={requests.data}
            getRowKey={(request) => request.id}
            isLoading={requests.isPending}
            mobileTitle={(request) => <TenantCell tenant={request.tenant} />}
            empty={{
              icon: Inbox,
              title: status ? `No ${formatEnumLabel(status).toLowerCase()} requests` : "No requests yet",
              description: status
                ? "Requests with this status will show up here."
                : "When tenants request one of your homes, it appears here for you to approve.",
            }}
          />
        </div>
      )}

      <ConfirmDialog
        open={confirm?.type === "reject"}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Reject this request?"
        description={
          <>
            {confirm?.request.tenant.name}&apos;s request for <strong>{confirm?.request.property.title}</strong>{" "}
            will be rejected. They&apos;ll see it in their requests.
          </>
        }
        confirmLabel="Reject request"
        destructive
        onConfirm={onConfirm}
      />
      <ConfirmDialog
        open={confirm?.type === "complete"}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Mark this rental as completed?"
        description={
          <>
            The lease for <strong>{confirm?.request.property.title}</strong> ends now and the home
            becomes available to rent again.
          </>
        }
        confirmLabel="Mark completed"
        onConfirm={onConfirm}
      />
    </div>
  );
}
