"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { StatusPill } from "@/components/dashboard/status-badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminRentals } from "@/hooks/use-admin";
import { useLandlordRequests } from "@/hooks/use-landlord-requests";
import { useMyPayments } from "@/hooks/use-payments";
import { useMyRentals } from "@/hooks/use-rentals";
import { formatCurrency, formatDate } from "@/lib/format";
import type { BookingStatus, PaymentStatus, UserRole } from "@/types";

type Notice = {
  id: string;
  text: string;
  date: string;
  status: BookingStatus | PaymentStatus;
  href: string;
};

const LIMIT = 6;

const byNewest = (a: Notice, b: Notice) => b.date.localeCompare(a.date);

// One hook set per role: each list only exists for that role (others get 403).
function useTenantNotices() {
  const rentals = useMyRentals();
  const payments = useMyPayments();
  const notices: Notice[] = [
    ...(rentals.data ?? []).map((rental) => ({
      id: `r-${rental.id}`,
      text: rental.property.title,
      date: rental.updatedAt,
      status: rental.bookingStatus,
      href: "/dashboard/tenant/requests",
    })),
    ...(payments.data ?? []).map((payment) => ({
      id: `p-${payment.id}`,
      text: `Payment of ${formatCurrency(payment.amount)}`,
      date: payment.updatedAt,
      status: payment.paymentStatus,
      href: "/dashboard/tenant/payments",
    })),
  ];
  return {
    notices: notices.sort(byNewest).slice(0, LIMIT),
    // Approved requests are waiting on the tenant to pay.
    actionable: (rentals.data ?? []).filter((rental) => rental.bookingStatus === "APPROVED").length,
    isLoading: rentals.isLoading || payments.isLoading,
  };
}

function useLandlordNotices() {
  const requests = useLandlordRequests();
  const notices = (requests.data ?? []).map((request) => ({
    id: request.id,
    text: `${request.tenant.name} · ${request.property.title}`,
    date: request.updatedAt,
    status: request.bookingStatus,
    href: "/dashboard/landlord/requests",
  }));
  return {
    notices: notices.sort(byNewest).slice(0, LIMIT),
    actionable: (requests.data ?? []).filter((request) => request.bookingStatus === "PENDING").length,
    isLoading: requests.isLoading,
  };
}

function useAdminNotices() {
  const rentals = useAdminRentals({ limit: LIMIT, sortBy: "createdAt", sortOrder: "desc" });
  const notices = (rentals.data?.data ?? []).map((rental) => ({
    id: rental.id,
    text: `${rental.tenant.name} · ${rental.property.title}`,
    date: rental.createdAt,
    status: rental.bookingStatus,
    href: "/dashboard/admin/rentals",
  }));
  return { notices, actionable: 0, isLoading: rentals.isLoading };
}

function NoticeList({ notices, isLoading }: { notices: Notice[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-10 w-full rounded-xl" />
        ))}
      </div>
    );
  }
  if (notices.length === 0) {
    return <p className="p-6 text-center text-sm text-muted-foreground">Nothing new yet.</p>;
  }
  return (
    <ul className="max-h-96 overflow-y-auto p-2">
      {notices.map((notice) => (
        <li key={notice.id}>
          <Link
            href={notice.href}
            className="flex items-center gap-3 rounded-2xl px-3 py-2.5 outline-none transition-colors hover:bg-muted focus-visible:bg-muted"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{notice.text}</p>
              <p className="text-xs text-muted-foreground">{formatDate(notice.date)}</p>
            </div>
            <StatusPill status={notice.status} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Menu({ notices, actionable, isLoading }: ReturnType<typeof useTenantNotices>) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label={actionable > 0 ? `Notifications, ${actionable} need attention` : "Notifications"}
        className="relative grid size-10 place-items-center rounded-full bg-foreground/5 outline-none transition-colors hover:bg-foreground/10 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Bell className="size-4.5" aria-hidden />
        {actionable > 0 && (
          <span className="absolute top-1.5 right-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[10px] font-semibold text-gold-foreground">
            {actionable}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-1.5rem))] rounded-3xl p-0">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="font-medium">Recent activity</p>
          {actionable > 0 && <span className="text-xs text-bronze">{actionable} need attention</span>}
        </div>
        <NoticeList notices={notices} isLoading={isLoading} />
      </PopoverContent>
    </Popover>
  );
}

function TenantMenu() {
  return <Menu {...useTenantNotices()} />;
}
function LandlordMenu() {
  return <Menu {...useLandlordNotices()} />;
}
function AdminMenu() {
  return <Menu {...useAdminNotices()} />;
}

/**
 * Bell with recent request/payment activity from real data for the role.
 * UI only: there's no notifications API, so "unread" is the number of items
 * waiting on you (tenant: approved, unpaid; landlord: pending decisions).
 */
export function NotificationsMenu({ role }: { role: UserRole }) {
  if (role === "TENANT") return <TenantMenu />;
  if (role === "LANDLORD") return <LandlordMenu />;
  return <AdminMenu />;
}
