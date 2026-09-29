"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, CalendarClock, MapPin, Music, Star, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ClientBookingDto } from "@/lib/api";
import { cancelBookingAction, reviewBookingAction } from "@/app/client/actions";
import {
  CANCELLABLE_STATUSES,
  STATUS_HINTS,
  STATUS_LABELS,
  STATUS_TONES,
  formatAmount,
  formatEventDate,
} from "./booking-status";

type TabKey = "en-cours" | "confirmees" | "passees";

const TABS: { key: TabKey; label: string; statuses: ClientBookingDto["status"][] }[] = [
  { key: "en-cours", label: "En cours", statuses: ["PENDING", "ACCEPTED", "COUNTER_OFFERED"] },
  { key: "confirmees", label: "Confirmées", statuses: ["CONFIRMED", "PAID"] },
  {
    key: "passees",
    label: "Passées",
    statuses: ["COMPLETED", "CANCELLED", "DISPUTED", "REFUNDED"],
  },
];

export function ClientBookings({
  bookings,
  initialTab = "en-cours",
}: {
  bookings: ClientBookingDto[];
  initialTab?: TabKey;
}) {
  const [tab, setTab] = useState<TabKey>(initialTab);
  const statuses = TABS.find((t) => t.key === tab)!.statuses;
  const filtered = bookings.filter((b) => statuses.includes(b.status));

  return (
    <div>
      <div className="mb-4 inline-flex flex-wrap rounded-xl border border-navy/10 bg-white p-1 shadow-sm">
        {TABS.map((t) => {
          const count = bookings.filter((b) => t.statuses.includes(b.status)).length;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                tab === t.key ? "bg-navy text-lime" : "text-navy/60 hover:bg-navy/5"
              }`}
            >
              {t.label}
              {count > 0 && <span className="ml-1.5 opacity-70">{count}</span>}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-navy/10 bg-white py-12 text-center shadow-sm">
          <CalendarClock className="h-8 w-8 text-navy/20" />
          <p className="text-sm text-muted">Aucune réservation dans cette catégorie.</p>
          <Link
            href="/recherche"
            className="rounded-xl bg-lime px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-lime-dark hover:text-white"
          >
            Trouver un talent
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking }: { booking: ClientBookingDto }) {
  const [panel, setPanel] = useState<"none" | "cancel" | "review">("none");
  const canCancel = CANCELLABLE_STATUSES.includes(booking.status);
  const canReview = booking.status === "COMPLETED" && !booking.review;
  const { talentProfile } = booking;

  return (
    <article className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-5 sm:flex-row">
        <Link
          href={`/talents/${talentProfile.id}`}
          className="relative flex h-20 w-full flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-navy-light to-navy sm:w-28"
        >
          {talentProfile.coverImageUrl ? (
            <Image
              src={talentProfile.coverImageUrl}
              alt={talentProfile.stageName}
              fill
              sizes="112px"
              className="object-cover"
            />
          ) : (
            <Music className="h-6 w-6 text-lime" />
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <Link
                href={`/talents/${talentProfile.id}`}
                className="font-display text-base font-bold text-navy hover:underline"
              >
                {talentProfile.stageName}
              </Link>
              {booking.servicePackage && (
                <p className="text-xs text-muted">Formule : {booking.servicePackage.name}</p>
              )}
            </div>
            <Badge tone={STATUS_TONES[booking.status]}>{STATUS_LABELS[booking.status]}</Badge>
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy/70">
            <span className="inline-flex items-center gap-1 capitalize">
              <Calendar className="h-3.5 w-3.5" />
              {formatEventDate(booking.eventDate)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {booking.location}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
            <p className="max-w-md text-xs text-muted">
              {booking.status === "COMPLETED" && booking.review
                ? "Prestation terminée. Merci pour votre avis !"
                : STATUS_HINTS[booking.status]}
              {booking.status === "CANCELLED" && booking.cancellationReason && (
                <> Motif : {booking.cancellationReason}</>
              )}
            </p>
            <p className="font-display text-lg font-bold text-navy">
              {formatAmount(booking.totalAmount)}
            </p>
          </div>

          {booking.review && (
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-navy/70">
              Votre avis : <Stars value={booking.review.rating} />
            </p>
          )}

          {(canCancel || canReview) && panel === "none" && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-navy/10 pt-3">
              {canReview && (
                <button
                  type="button"
                  onClick={() => setPanel("review")}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-lime px-3.5 py-1.5 text-xs font-bold text-navy transition-colors hover:bg-lime-dark hover:text-white"
                >
                  <Star className="h-3.5 w-3.5" /> Laisser un avis
                </button>
              )}
              {canCancel && (
                <button
                  type="button"
                  onClick={() => setPanel("cancel")}
                  className="rounded-lg border border-navy/15 px-3.5 py-1.5 text-xs font-semibold text-navy/70 transition-colors hover:border-danger/40 hover:text-danger"
                >
                  Annuler la réservation
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {panel === "cancel" && <CancelPanel bookingId={booking.id} onClose={() => setPanel("none")} />}
      {panel === "review" && (
        <ReviewPanel
          bookingId={booking.id}
          stageName={talentProfile.stageName}
          onClose={() => setPanel("none")}
        />
      )}
    </article>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex" aria-label={`${value} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3.5 w-3.5 ${n <= value ? "fill-gold text-gold" : "text-navy/20"}`}
        />
      ))}
    </span>
  );
}

function PanelShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-navy/10 bg-navy/[0.03] p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-sm font-bold text-navy">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-navy/50 hover:bg-navy/5 hover:text-navy"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {children}
    </div>
  );
}

function CancelPanel({ bookingId, onClose }: { bookingId: string; onClose: () => void }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await cancelBookingAction(bookingId, reason);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <PanelShell title="Annuler cette réservation ?" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <p className="text-xs text-muted">
          L&apos;équipe Event Prest&apos;Art sera prévenue. Si l&apos;artiste avait déjà été
          programmé, il sera informé de l&apos;annulation.
        </p>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={1000}
          placeholder="Motif (facultatif)"
          className="w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm outline-none focus:border-lime"
        />
        {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-danger px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
          >
            {pending ? "Annulation…" : "Confirmer l'annulation"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-navy/15 px-4 py-2 text-xs font-semibold text-navy"
          >
            Garder ma réservation
          </button>
        </div>
      </form>
    </PanelShell>
  );
}

function ReviewPanel({
  bookingId,
  stageName,
  onClose,
}: {
  bookingId: string;
  stageName: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Choisissez une note de 1 à 5 étoiles.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await reviewBookingAction(bookingId, rating, comment);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <PanelShell title={`Votre avis sur ${stageName}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
              className="p-0.5"
            >
              <Star
                className={`h-7 w-7 transition-colors ${
                  n <= (hover || rating) ? "fill-gold text-gold" : "text-navy/20"
                }`}
              />
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Racontez votre expérience (facultatif)"
          className="w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm outline-none focus:border-lime"
        />
        {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-lime px-4 py-2 text-xs font-bold text-navy transition-colors hover:bg-lime-dark hover:text-white disabled:opacity-60"
        >
          {pending ? "Envoi…" : "Publier mon avis"}
        </button>
      </form>
    </PanelShell>
  );
}
