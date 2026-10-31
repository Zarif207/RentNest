import type { PaginationQuery } from "./api";

// Mirrors the backend's NotificationType enum.
export const NOTIFICATION_TYPES = [
  "LANDLORD_REGISTERED",
  "LANDLORD_APPROVED",
  "LANDLORD_REJECTED",
  "RENTAL_REQUESTED",
  "RENTAL_APPROVED",
  "RENTAL_REJECTED",
  "PAYMENT_RECEIVED",
  "PAYMENT_SUCCESS",
  "RENTAL_COMPLETED",
  "REVIEW_RECEIVED",
  "ACCOUNT_BLOCKED",
  "ACCOUNT_UNBLOCKED",
  "OFFER_RECEIVED",
  "OFFER_ACCEPTED",
  "OFFER_REJECTED",
  "OFFER_COUNTERED",
  "OFFER_WITHDRAWN",
  "DEPOSIT_RECEIVED",
  "DEPOSIT_PAID",
  "SALE_COMPLETED",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/** GET /notifications (named to avoid clashing with the DOM's Notification). */
export type AppNotification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  /** In-app path to open, if any. */
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

export type NotificationQuery = PaginationQuery<"createdAt"> & {
  /** Only unread ones. */
  unread?: boolean;
};
