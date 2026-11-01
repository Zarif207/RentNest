"use client";

import Link from "next/link";
import {
  ArrowLeftRight,
  Ban,
  BadgeCheck,
  Banknote,
  HandCoins,
  House,
  Signature,
  Undo2,
  CircleCheck,
  CircleX,
  CreditCard,
  FilePen,
  FileCheck2,
  FileX2,
  Inbox,
  KeyRound,
  ShieldCheck,
  ShieldX,
  Star,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { useMarkNotificationRead } from "@/hooks/use-notifications";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AppNotification, NotificationType } from "@/types";

/** Icon and tone per type: gold for good news, brick for bad, ink otherwise. */
export const NOTIFICATION_ICONS: Record<NotificationType, { icon: LucideIcon; tone: "good" | "bad" | "neutral" }> = {
  LANDLORD_REGISTERED: { icon: UserPlus, tone: "neutral" },
  LANDLORD_APPROVED: { icon: BadgeCheck, tone: "good" },
  LANDLORD_REJECTED: { icon: ShieldX, tone: "bad" },
  RENTAL_REQUESTED: { icon: Inbox, tone: "neutral" },
  RENTAL_APPROVED: { icon: CircleCheck, tone: "good" },
  RENTAL_REJECTED: { icon: CircleX, tone: "bad" },
  PAYMENT_RECEIVED: { icon: Banknote, tone: "good" },
  PAYMENT_SUCCESS: { icon: CreditCard, tone: "good" },
  RENTAL_COMPLETED: { icon: KeyRound, tone: "neutral" },
  REVIEW_RECEIVED: { icon: Star, tone: "good" },
  ACCOUNT_BLOCKED: { icon: Ban, tone: "bad" },
  ACCOUNT_UNBLOCKED: { icon: ShieldCheck, tone: "good" },
  OFFER_RECEIVED: { icon: HandCoins, tone: "neutral" },
  OFFER_ACCEPTED: { icon: CircleCheck, tone: "good" },
  OFFER_REJECTED: { icon: CircleX, tone: "bad" },
  OFFER_COUNTERED: { icon: ArrowLeftRight, tone: "neutral" },
  OFFER_WITHDRAWN: { icon: Undo2, tone: "neutral" },
  DEPOSIT_RECEIVED: { icon: Banknote, tone: "good" },
  DEPOSIT_PAID: { icon: Signature, tone: "good" },
  SALE_COMPLETED: { icon: House, tone: "good" },
  PROPERTY_SUBMITTED: { icon: FilePen, tone: "neutral" },
  PROPERTY_APPROVED: { icon: FileCheck2, tone: "good" },
  PROPERTY_REJECTED: { icon: FileX2, tone: "bad" },
};

const TONES = {
  good: "bg-gold/15 text-bronze",
  bad: "bg-destructive/10 text-destructive",
  neutral: "bg-foreground/6 text-foreground",
};

/**
 * One notification: icon, title, message, relative time and an unread dot.
 * Opening it marks it read and goes to its link (or just marks it read when
 * it has none).
 */
export function NotificationItem({
  notification,
  onOpen,
  className,
}: {
  notification: AppNotification;
  /** e.g. close the bell's popover. */
  onOpen?: () => void;
  className?: string;
}) {
  const markRead = useMarkNotificationRead();
  const { icon: Icon, tone } = NOTIFICATION_ICONS[notification.type] ?? { icon: Inbox, tone: "neutral" };
  const unread = !notification.isRead;

  const open = () => {
    if (unread) markRead.mutate(notification.id);
    onOpen?.();
  };

  const body = (
    <>
      <span className={cn("mt-0.5 grid size-9 shrink-0 place-items-center rounded-full", TONES[tone])}>
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block text-sm", unread ? "font-semibold" : "font-medium")}>{notification.title}</span>
        <span className="mt-0.5 line-clamp-2 block text-sm text-muted-foreground">{notification.message}</span>
        <time
          dateTime={notification.createdAt}
          title={formatDateTime(notification.createdAt)}
          className="mt-1 block text-xs text-muted-foreground"
        >
          {formatRelativeTime(notification.createdAt)}
        </time>
      </span>
      {unread ? (
        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-gold" aria-label="Unread" />
      ) : (
        <span className="w-2 shrink-0" aria-hidden />
      )}
    </>
  );

  const itemClass = cn(
    "flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left outline-none transition-colors hover:bg-muted focus-visible:bg-muted",
    unread && "bg-gold/6",
    className,
  );

  return notification.link ? (
    <Link href={notification.link} onClick={open} className={itemClass}>
      {body}
    </Link>
  ) : (
    <button type="button" onClick={open} className={itemClass}>
      {body}
    </button>
  );
}
