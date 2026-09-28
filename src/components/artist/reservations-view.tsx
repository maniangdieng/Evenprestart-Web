"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Music,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BookingDto } from "@/lib/api";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  ACCEPTED: "Acceptée",
  COUNTER_OFFERED: "Contre-proposition envoyée",
  CONFIRMED: "Confirmée",
  PAID: "Payée",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
  DISPUTED: "Litige",
  REFUNDED: "Remboursée",
};

const STATUS_TONES: Record<BookingDto["status"], "lime" | "gold" | "terracotta" | "navy" | "danger"> = {
  PENDING: "gold",
  ACCEPTED: "lime",
  COUNTER_OFFERED: "terracotta",
  CONFIRMED: "lime",
  PAID: "navy",
  COMPLETED: "navy",
  CANCELLED: "danger",
  DISPUTED: "danger",
  REFUNDED: "terracotta",
};

// L'artiste ne voit que les prestations que l'équipe Event Prest'Art lui a
// confirmées : les demandes, la négociation et le client restent côté équipe.
type TabKey = "avenir" | "passees";

const TABS: { key: TabKey; label: string; statuses: BookingDto["status"][] }[] = [
  { key: "avenir", label: "À venir", statuses: ["CONFIRMED", "PAID"] },
  { key: "passees", label: "Passées", statuses: ["COMPLETED", "DISPUTED", "REFUNDED"] },
];

function formatFee(amount: string) {
  return `${Number(amount).toLocaleString("fr-FR")} F`;
}

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function ReservationsView({ bookings }: { bookings: BookingDto[] }) {
  const [tab, setTab] = useState<TabKey>("avenir");
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const activeStatuses = TABS.find((t) => t.key === tab)!.statuses;
  const filtered = bookings.filter((b) => activeStatuses.includes(b.status));

  const today = new Date();
  const viewMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const startWeekday = (viewMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();

  const bookingsByDay = useMemo(() => {
    const map = new Map<string, BookingDto[]>();
    for (const b of bookings) {
      const key = dayKey(new Date(b.eventDate));
      map.set(key, [...(map.get(key) ?? []), b]);
    }
    return map;
  }, [bookings]);

  const selectedBookings = selectedDay ? bookingsByDay.get(selectedDay) ?? [] : [];

  const cells: (number | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div>
        <div className="mb-4 inline-flex rounded-xl border border-navy/10 bg-white p-1 shadow-sm">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                tab === t.key ? "bg-navy text-lime" : "text-navy/60 hover:bg-navy/5"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <CalendarClock className="h-8 w-8 text-navy/20" />
              <p className="text-sm text-muted">Aucune prestation dans cette catégorie.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-2xl border border-navy/10 p-4 text-sm transition-colors hover:border-navy/20 hover:shadow-sm sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-navy/5 text-navy">
                        <Music className="h-4 w-4" />
                      </span>
                      <div>
                        <div className="font-semibold text-navy">
                          {booking.servicePackage?.name ?? "Prestation Event Prest'Art"}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(booking.eventDate).toLocaleDateString("fr-FR")}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {booking.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <Badge tone={STATUS_TONES[booking.status]}>
                        {STATUS_LABELS[booking.status] ?? booking.status}
                      </Badge>
                      <span className="font-display font-bold text-navy">
                        {formatFee(booking.subtotalAmount)}
                      </span>
                      <span className="text-[10px] text-muted">Votre cachet</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-navy/10 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMonthOffset((m) => m - 1)}
              className="rounded-lg p-1 text-navy/50 transition-colors hover:bg-navy/5 hover:text-navy"
              aria-label="Mois précédent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-display text-sm font-bold capitalize text-navy">
              {viewMonth.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
            </span>
            <button
              type="button"
              onClick={() => setMonthOffset((m) => m + 1)}
              className="rounded-lg p-1 text-navy/50 transition-colors hover:bg-navy/5 hover:text-navy"
              aria-label="Mois suivant"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-muted">
            {WEEKDAYS.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) return <div key={i} />;
              const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
              const key = dayKey(date);
              const hasBooking = bookingsByDay.has(key);
              const isSelected = selectedDay === key;
              const isToday = dayKey(today) === key;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedDay(key)}
                  className={`relative flex aspect-square items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                    isSelected
                      ? "bg-navy text-lime"
                      : isToday
                        ? "bg-lime/15 text-navy"
                        : "text-navy/70 hover:bg-navy/5"
                  }`}
                >
                  {day}
                  {hasBooking && (
                    <span
                      className={`absolute bottom-0.5 h-1 w-1 rounded-full ${
                        isSelected ? "bg-lime" : "bg-terracotta"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
          <h4 className="font-display text-sm font-bold text-navy">Détails de la prestation</h4>
          {selectedBookings.length === 0 ? (
            <p className="mt-3 text-xs text-muted">
              {selectedDay
                ? "Aucune prestation ce jour-là."
                : "Sélectionnez une date dans le calendrier."}
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {selectedBookings.map((b) => (
                <div key={b.id} className="rounded-xl border border-navy/10 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-navy">
                      {b.servicePackage?.name ?? "Prestation"}
                    </span>
                    <Badge tone={STATUS_TONES[b.status]}>
                      {STATUS_LABELS[b.status] ?? b.status}
                    </Badge>
                  </div>
                  <p className="mt-1.5 inline-flex items-center gap-1 text-muted">
                    <MapPin className="h-3 w-3" />
                    {b.location}
                  </p>
                  <p className="mt-1 font-display font-bold text-navy">
                    {formatFee(b.subtotalAmount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
