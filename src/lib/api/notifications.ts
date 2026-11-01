import type { AppNotification, NotificationQuery, NotificationSummary } from "@/types";
import { api } from "./client";

export const notificationsService = {
  /** Newest first; `meta.unreadCount` counts every unread one. */
  getMine: (query?: NotificationQuery) =>
    api.getPaginated<AppNotification>("/notifications", { query }),

  markRead: (id: string) => api.patch<AppNotification>(`/notifications/${encodeURIComponent(id)}/read`),

  markAllRead: () => api.patch<{ updated: number }>("/notifications/read-all"),

  /** Unread counts per link, for the dashboard nav badges. */
  getSummary: () => api.get<NotificationSummary>("/notifications/summary"),

  /** Marks unread notifications whose link starts with `linkPrefix` (a /dashboard/ path) as read. */
  markReadByLink: (linkPrefix: string) =>
    api.patch<{ updated: number }>("/notifications/read-by-link", { linkPrefix }),
};
