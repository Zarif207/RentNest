"use client";

import { BellOff } from "lucide-react";
import { BentoCard } from "@/components/dashboard/bento";
import { QueryError } from "@/components/dashboard/query-error";
import { NotificationItem } from "@/components/notifications/notification-item";
import { Skeleton } from "@/components/ui/skeleton";
import { notificationsPath, useNotificationFeed } from "@/hooks/use-notifications";
import type { UserRole } from "@/types";

const COUNT = 6;

/** Overview card: the latest notifications (same polled query as the bell). */
export function RecentActivityCard({ role, className }: { role: UserRole; className?: string }) {
  const feed = useNotificationFeed();
  const list = feed.data?.data.slice(0, COUNT);

  return (
    <BentoCard title="Recent activity" href={notificationsPath(role)} className={className}>
      {feed.isError ? (
        <QueryError error={feed.error} onRetry={() => void feed.refetch()} />
      ) : !list ? (
        <div className="grid gap-2 lg:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <BellOff className="size-4" aria-hidden /> No activity yet. New requests, payments and reviews will show up
          here.
        </p>
      ) : (
        <ul className="grid gap-1 lg:grid-cols-2">
          {list.map((notification) => (
            <li key={notification.id}>
              <NotificationItem notification={notification} />
            </li>
          ))}
        </ul>
      )}
    </BentoCard>
  );
}
