"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/api/client";
import { notificationsService } from "@/lib/api/notifications";
import { queryKeys } from "@/lib/query-keys";
import type { AppNotification, NotificationQuery, NotificationSummary, Paginated, UserRole } from "@/types";

/** The bell and the overview "Recent activity" cards share this one query. */
export const FEED_QUERY = { limit: 8 } as const satisfies NotificationQuery;
const POLL_MS = 30_000;

export const notificationsPath = (role: UserRole) => `/dashboard/${role.toLowerCase()}/notifications`;

/**
 * Latest notifications plus the unread count, polled every 30 s while the
 * tab is visible (TanStack pauses intervals in background tabs) and
 * refetched when the tab regains focus.
 */
export function useNotificationFeed() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.notifications.list(FEED_QUERY),
    queryFn: () => notificationsService.getMine(FEED_QUERY),
    enabled: isAuthenticated,
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

/**
 * Unread counts per link, for the badges on the dashboard nav. Polled like
 * the feed; any mutation and any new notification also refetch it.
 */
export function useNotificationSummary() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.notifications.summary,
    queryFn: notificationsService.getSummary,
    enabled: isAuthenticated,
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

/** The full notifications page (All / Unread, paginated). */
export function useNotifications(query: NotificationQuery) {
  return useQuery({
    queryKey: queryKeys.notifications.list(query),
    queryFn: () => notificationsService.getMine(query),
    placeholderData: keepPreviousData,
  });
}

type Snapshot = [readonly unknown[], unknown][];

/** Lowers the summary's counts for notifications that were just read. */
function lowerSummary(
  summary: NotificationSummary,
  read: { link: string | null }[],
  isTargetLink: (link: string) => boolean = () => false,
): NotificationSummary {
  const byLink = new Map(summary.byLink.map(({ link, count }) => [link, count]));
  let unreadTotal = summary.unreadTotal;
  for (const { link } of read) {
    unreadTotal -= 1;
    if (link && byLink.has(link)) byLink.set(link, (byLink.get(link) ?? 0) - 1);
  }
  // Links matched by prefix (read-by-link) drop entirely, even ones not in the loaded lists.
  for (const [link, count] of byLink) {
    if (isTargetLink(link)) {
      unreadTotal -= count;
      byLink.set(link, 0);
    }
  }
  return {
    unreadTotal: Math.max(0, unreadTotal),
    byLink: summary.byLink.flatMap(({ link }) => {
      const count = byLink.get(link) ?? 0;
      return count > 0 ? [{ link, count }] : [];
    }),
  };
}

/**
 * Marks notifications read in every cached list and lowers the unread
 * counts, including the per-section summary behind the nav badges.
 */
async function markReadInCache(
  queryClient: QueryClient,
  isTarget: (notification: AppNotification) => boolean,
  isTargetLink?: (link: string) => boolean,
) {
  const key = queryKeys.notifications.all;
  await queryClient.cancelQueries({ queryKey: key });
  const snapshot: Snapshot = queryClient.getQueriesData({ queryKey: key });

  // Each unread target once, even when it's in several cached lists.
  const read = new Map<string, AppNotification>();
  for (const [, data] of queryClient.getQueriesData<Paginated<AppNotification>>({ queryKey: queryKeys.notifications.lists })) {
    data?.data.forEach((notification) => {
      if (!notification.isRead && isTarget(notification)) read.set(notification.id, notification);
    });
  }
  queryClient.setQueryData<NotificationSummary>(
    queryKeys.notifications.summary,
    (old) => old && lowerSummary(old, isTargetLink ? [] : [...read.values()], isTargetLink),
  );

  queryClient.setQueriesData<Paginated<AppNotification>>({ queryKey: queryKeys.notifications.lists }, (old) => {
    if (!old) return old;
    const changed = old.data.filter((notification) => !notification.isRead && isTarget(notification)).length;
    return {
      ...old,
      data: old.data.map((notification) => (isTarget(notification) ? { ...notification, isRead: true } : notification)),
      meta: { ...old.meta, unreadCount: Math.max(0, (old.meta.unreadCount ?? 0) - changed) },
    };
  });
  return { snapshot };
}

function restore(queryClient: QueryClient, context: { snapshot: Snapshot } | undefined) {
  // Restores the lists and the summary alike.
  context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onMutate: (id) => markReadInCache(queryClient, (notification) => notification.id === id),
    // Quiet on success: the dot disappearing is the feedback.
    onError: (error, _id, context) => {
      restore(queryClient, context);
      toast.error(getErrorMessage(error));
    },
    onSettled: () => void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsService.markAllRead,
    onMutate: async () => {
      const context = await markReadInCache(queryClient, () => true);
      queryClient.setQueryData<NotificationSummary>(queryKeys.notifications.summary, (old) =>
        old && { unreadTotal: 0, byLink: [] },
      );
      return context;
    },
    onSuccess: ({ updated }) =>
      toast.success(updated === 1 ? "1 notification marked as read" : `${updated} notifications marked as read`),
    onError: (error, _input, context) => {
      restore(queryClient, context);
      toast.error(getErrorMessage(error));
    },
    onSettled: () => void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
}

/**
 * Opening a dashboard section reads its notifications: everything whose link
 * starts with the section's path. Quiet: the badge disappearing is the
 * feedback, and a failure just leaves the badge for the next visit.
 */
export function useMarkSectionRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (linkPrefix: string) => notificationsService.markReadByLink(linkPrefix),
    onMutate: (linkPrefix) => {
      const matches = (link: string | null) => link !== null && link.startsWith(linkPrefix);
      return markReadInCache(queryClient, (notification) => matches(notification.link), matches);
    },
    onError: (_error, _prefix, context) => restore(queryClient, context),
    onSettled: () => void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
}
