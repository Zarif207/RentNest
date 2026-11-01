"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { QueryError } from "@/components/dashboard/query-error";
import { NotificationItem } from "@/components/notifications/notification-item";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  notificationsPath,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationFeed,
} from "@/hooks/use-notifications";
import { queryKeys } from "@/lib/query-keys";
import type { AppNotification, UserRole } from "@/types";

// More than this at once (e.g. after a long time away) gets one summary toast.
const MAX_TOASTS = 2;

/**
 * Toasts notifications that arrive while the page is open. The first load
 * only records what's already there, so a reload never replays old ones.
 */
function useArrivalToasts(notifications: AppNotification[] | undefined, role: UserRole) {
  const router = useRouter();
  const queryClient = useQueryClient();
  // mutate is stable, so the effect doesn't re-run on every render.
  const { mutate: markRead } = useMarkNotificationRead();
  const seen = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!notifications) return;
    if (!seen.current) {
      seen.current = new Set(notifications.map((notification) => notification.id));
      return;
    }
    const fresh = notifications.filter((notification) => !seen.current?.has(notification.id) && !notification.isRead);
    notifications.forEach((notification) => seen.current?.add(notification.id));
    if (fresh.length === 0) return;
    // New arrivals change the per-section counts behind the nav badges.
    void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.summary });

    if (fresh.length > MAX_TOASTS) {
      toast(`${fresh.length} new notifications`, {
        action: { label: "View all", onClick: () => router.push(notificationsPath(role)) },
      });
      return;
    }
    for (const notification of fresh) {
      const link = notification.link;
      toast(notification.title, {
        description: notification.message,
        action: {
          label: link ? "View" : "Mark read",
          onClick: () => {
            markRead(notification.id);
            if (link) router.push(link);
          },
        },
      });
    }
  }, [notifications, role, router, markRead, queryClient]);
}

/** Bell with the unread count; the dropdown lists the latest notifications. */
export function NotificationsMenu({ role }: { role: UserRole }) {
  const [open, setOpen] = useState(false);
  const feed = useNotificationFeed();
  const markAll = useMarkAllNotificationsRead();
  const notifications = feed.data?.data;
  const unread = feed.data?.meta.unreadCount ?? 0;
  useArrivalToasts(notifications, role);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        className="relative grid size-10 place-items-center rounded-full bg-foreground/5 outline-none transition-colors hover:bg-foreground/10 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Bell className="size-4.5" aria-hidden />
        {unread > 0 && (
          <span className="absolute top-1 right-1 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[10px] font-semibold text-gold-foreground">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(24rem,calc(100vw-1.5rem))] rounded-3xl p-0">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <p className="font-medium">
            Notifications
            {unread > 0 && <span className="ml-2 text-sm font-normal text-muted-foreground">{unread} unread</span>}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="-mr-2"
            disabled={unread === 0 || markAll.isPending}
            onClick={() => markAll.mutate()}
          >
            <CheckCheck data-icon="inline-start" /> Mark all as read
          </Button>
        </div>

        {feed.isError ? (
          <div className="p-4">
            <QueryError error={feed.error} onRetry={() => void feed.refetch()} />
          </div>
        ) : !notifications ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <BellOff className="size-6 text-muted-foreground" aria-hidden />
            <p className="text-sm font-medium">You&apos;re all caught up</p>
            <p className="text-sm text-muted-foreground">Requests, payments and approvals will show up here.</p>
          </div>
        ) : (
          <ul data-lenis-prevent className="max-h-[min(26rem,60svh)] space-y-0.5 overflow-y-auto overscroll-contain p-2">
            {notifications.map((notification) => (
              <li key={notification.id}>
                <NotificationItem notification={notification} onOpen={() => setOpen(false)} />
              </li>
            ))}
          </ul>
        )}

        <div className="border-t border-border p-2">
          <Button asChild variant="ghost" className="w-full">
            <Link href={notificationsPath(role)} onClick={() => setOpen(false)}>
              View all notifications
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
