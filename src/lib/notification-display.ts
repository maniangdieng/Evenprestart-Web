import {
  CalendarClock,
  CheckCircle2,
  XCircle,
  Banknote,
  MessageSquare,
  Star,
  ShieldCheck,
  Scale,
  Bell,
  BellRing,
  type LucideIcon,
} from "lucide-react";
import type { NotificationType } from "./api";

export const NOTIFICATION_ICON: Record<NotificationType, LucideIcon> = {
  BOOKING_REQUEST: CalendarClock,
  BOOKING_ACCEPTED: CheckCircle2,
  BOOKING_REFUSED: XCircle,
  BOOKING_CANCELLED: XCircle,
  COUNTER_OFFER: CalendarClock,
  PAYMENT_RECEIVED: Banknote,
  NEW_MESSAGE: MessageSquare,
  REVIEW_RECEIVED: Star,
  PROFILE_VALIDATED: ShieldCheck,
  DISPUTE_UPDATE: Scale,
  EVENT_REMINDER: BellRing,
  SYSTEM: Bell,
};

export const NOTIFICATION_TONE: Record<NotificationType, "lime" | "terracotta" | "gold" | "navy"> = {
  BOOKING_REQUEST: "gold",
  BOOKING_ACCEPTED: "lime",
  BOOKING_REFUSED: "terracotta",
  BOOKING_CANCELLED: "terracotta",
  COUNTER_OFFER: "gold",
  PAYMENT_RECEIVED: "lime",
  NEW_MESSAGE: "navy",
  REVIEW_RECEIVED: "gold",
  PROFILE_VALIDATED: "lime",
  DISPUTE_UPDATE: "terracotta",
  EVENT_REMINDER: "gold",
  SYSTEM: "navy",
};
