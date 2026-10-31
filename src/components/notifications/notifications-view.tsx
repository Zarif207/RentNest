"use client";

import { BellOff, CheckCheck } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { QueryError } from "@/components/dashboard/query-error";
import { NotificationItem } from "@/components/notifications/notification-item";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationNav } from "@/components/shared/pagination-nav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMarkAllNotificationsRead, useNotifications } from "@/hooks/use-notifications";
import { useUrlParams } from "@/hooks/use-url-params";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 15;

/** /dashboard/<role>/notifications: every notification, All / Unread, paginated. */
export function NotificationsView() {
  const { searchParams, pathname, setParams } = useUrlParams();
  const unreadOnly = searchParams.get("filter") === "unread";
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "", 10) || 1);
  const notifications = useNotifications({ page, limit: PAGE_SIZE, ...(unreadOnly && { unread: true }) });
  const markAll = useMarkAllNotificationsRead();
  const unread = notifications.data?.meta.unreadCount ?? 0;
  const list = notifications.data?.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Requests, payments, approvals and account updates, newest first."
        actions={
          <Button variant="outline" disabled={unread === 0 || markAll.isPending} onClick={() => markAll.mutate()}>
            <CheckCheck data-icon="inline-start" /> Mark all as read
          </Button>
        }
      />

      <Tabs value={unreadOnly ? "unread" : "all"} onValueChange={(value) => setParams({ filter: value === "unread" ? "unread" : null })}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unread > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1.5 text-[11px] font-semibold text-gold-foreground">
                {formatNumber(unread)}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {notifications.isError ? (
        <QueryError error={notifications.error} onRetry={() => void notifications.refetch()} />
      ) : !list ? (
        <div className="space-y-2 rounded-3xl border border-border bg-card p-3" aria-busy="true">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title={unreadOnly ? "No unread notifications" : "No notifications yet"}
          description={
            unreadOnly
              ? "You've read everything. Older notifications are under All."
              : "Requests, payments and approvals will show up here as they happen."
          }
          action={
            unreadOnly && (
              <Button variant="outline" onClick={() => setParams({ filter: null })}>
                Show all
              </Button>
            )
          }
          className="bg-card"
        />
      ) : (
        <ul
          className={cn(
            "space-y-0.5 rounded-3xl border border-border bg-card p-2",
            notifications.isPlaceholderData && "opacity-60 transition-opacity",
          )}
        >
          {list.map((notification) => (
            <li key={notification.id}>
              <NotificationItem notification={notification} />
            </li>
          ))}
        </ul>
      )}

      {notifications.data && (
        <PaginationNav
          page={notifications.data.meta.page}
          totalPages={notifications.data.meta.totalPage}
          params={Object.fromEntries(searchParams.entries())}
          pathname={pathname}
        />
      )}
    </div>
  );
}
