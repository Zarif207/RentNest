import type { AppNotification, NotificationQuery } from "@/types";
import { api } from "./client";

export const notificationsService = {
  /** Newest first; `meta.unreadCount` counts every unread one. */
  getMine: (query?: NotificationQuery) =>
    api.getPaginated<AppNotification>("/notifications", { query }),

  markRead: (id: string) => api.patch<AppNotification>(`/notifications/${encodeURIComponent(id)}/read`),

  markAllRead: () => api.patch<{ updated: number }>("/notifications/read-all"),
};
