import type { BookingDto } from "@/lib/api";

type Status = BookingDto["status"];
export type StatusTone = "lime" | "gold" | "terracotta" | "navy" | "danger";

/** Statuts vus par le client (ACCEPTED/COUNTER_OFFERED : anciens statuts, traités comme « en cours »). */
export const STATUS_LABELS: Record<Status, string> = {
  PENDING: "Demande en cours",
  ACCEPTED: "Demande en cours",
  COUNTER_OFFERED: "Demande en cours",
  CONFIRMED: "Confirmée",
  PAID: "Payée",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
  DISPUTED: "Litige",
  REFUNDED: "Remboursée",
};

export const STATUS_TONES: Record<Status, StatusTone> = {
  PENDING: "gold",
  ACCEPTED: "gold",
  COUNTER_OFFERED: "gold",
  CONFIRMED: "lime",
  PAID: "navy",
  COMPLETED: "navy",
  CANCELLED: "danger",
  DISPUTED: "danger",
  REFUNDED: "terracotta",
};

/** Explication affichée sous chaque réservation. */
export const STATUS_HINTS: Record<Status, string> = {
  PENDING:
    "L'équipe Event Prest'Art vérifie la disponibilité de l'artiste. Vous serez prévenu(e) par email.",
  ACCEPTED:
    "L'équipe Event Prest'Art vérifie la disponibilité de l'artiste. Vous serez prévenu(e) par email.",
  COUNTER_OFFERED:
    "L'équipe Event Prest'Art finalise votre demande. Vous serez prévenu(e) par email.",
  CONFIRMED: "Réservation confirmée par l'équipe. Un rappel vous sera envoyé la veille.",
  PAID: "Réservation réglée : la prestation est garantie.",
  COMPLETED: "Prestation terminée. Partagez votre avis sur l'artiste !",
  CANCELLED: "Cette réservation a été annulée.",
  DISPUTED: "Un litige est en cours de traitement par l'équipe.",
  REFUNDED: "Cette réservation a été remboursée.",
};

/** Demandes en cours + réservations confirmées : ce qui attend encore le client. */
export const ACTIVE_STATUSES: Status[] = ["PENDING", "ACCEPTED", "COUNTER_OFFERED", "CONFIRMED", "PAID"];

/** Le client peut annuler lui-même tant que ce n'est pas payé (sinon : via l'équipe). */
export const CANCELLABLE_STATUSES: Status[] = ["PENDING", "ACCEPTED", "COUNTER_OFFERED", "CONFIRMED"];

export function formatAmount(amount: string | number) {
  return `${Number(amount).toLocaleString("fr-FR")} F CFA`;
}

export function formatEventDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
