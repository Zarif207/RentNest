"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/api/client";
import { notificationsService } from "@/lib/api/notifications";
import { queryKeys } from "@/lib/query-keys";
import type { AppNotification, NotificationQuery, Paginated, UserRole } from "@/types";

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

/** The full notifications page (All / Unread, paginated). */
export function useNotifications(query: NotificationQuery) {
  return useQuery({
    queryKey: queryKeys.notifications.list(query),
    queryFn: () => notificationsService.getMine(query),
    placeholderData: keepPreviousData,
  });
}

type Snapshot = [readonly unknown[], Paginated<AppNotification> | undefined][];

/** Marks notifications read in every cached list and lowers the unread counts. */
async function markReadInCache(queryClient: QueryClient, isTarget: (notification: AppNotification) => boolean) {
  const key = queryKeys.notifications.all;
  await queryClient.cancelQueries({ queryKey: key });
  const snapshot: Snapshot = queryClient.getQueriesData({ queryKey: key });
  queryClient.setQueriesData<Paginated<AppNotification>>({ queryKey: key }, (old) => {
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
    onMutate: () => markReadInCache(queryClient, () => true),
    onSuccess: ({ updated }) =>
      toast.success(updated === 1 ? "1 notification marked as read" : `${updated} notifications marked as read`),
    onError: (error, _input, context) => {
      restore(queryClient, context);
      toast.error(getErrorMessage(error));
    },
    onSettled: () => void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
}
