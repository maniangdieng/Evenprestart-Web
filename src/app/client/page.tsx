import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  CalendarCheck,
  Clock,
  Headset,
  Heart,
  MapPin,
  Search,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/session";
import { getMyClientBookings, getMyFavoriteIds } from "@/lib/api";
import {
  STATUS_LABELS,
  STATUS_TONES,
  formatAmount,
  formatEventDate,
} from "@/components/client/booking-status";

export default async function ClientDashboardPage() {
  const session = await getSession();
  if (!session || session.user.role !== "CLIENT") redirect("/connexion");

  const [bookings, favoriteIds] = await Promise.all([
    getMyClientBookings(session.accessToken).catch(() => []),
    getMyFavoriteIds(session.accessToken).catch(() => []),
  ]);

  const today = new Date(new Date().toDateString());
  const pending = bookings.filter((b) =>
    ["PENDING", "ACCEPTED", "COUNTER_OFFERED"].includes(b.status),
  );
  const upcoming = bookings
    .filter((b) => ["CONFIRMED", "PAID"].includes(b.status) && new Date(b.eventDate) >= today)
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  const toReview = bookings.filter((b) => b.status === "COMPLETED" && !b.review);
  const next = upcoming[0];
  const recent = bookings.slice(0, 4);

  const stats = [
    { label: "Demandes en cours", value: pending.length, icon: Clock, href: "/client/reservations" },
    { label: "Événements à venir", value: upcoming.length, icon: CalendarCheck, href: "/client/reservations?onglet=confirmees" },
    { label: "Talents favoris", value: favoriteIds.length, icon: Heart, href: "/client/favoris" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">
          Bonjour {session.user.firstName}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Suivez vos demandes, vos événements et vos échanges avec l&apos;équipe Event Prest&apos;Art.
        </p>
      </div>

      {toReview.length > 0 && (
        <Link
          href="/client/reservations?onglet=passees"
          className="flex items-center justify-between gap-3 rounded-2xl border border-gold/30 bg-gold/10 px-5 py-4 text-sm font-semibold text-navy transition-colors hover:bg-gold/15"
        >
          <span className="inline-flex items-center gap-2">
            <Star className="h-4 w-4 fill-gold text-gold" />
            {toReview.length} prestation{toReview.length > 1 ? "s" : ""} terminée
            {toReview.length > 1 ? "s" : ""} : donnez votre avis sur l&apos;artiste.
          </span>
          <ArrowRight className="h-4 w-4 flex-shrink-0" />
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted">{label}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy text-lime">
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-navy">{value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-navy">Prochain événement</h2>
          {next ? (
            <div className="mt-4 rounded-xl bg-navy p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-wider text-lime">
                {STATUS_LABELS[next.status]}
              </p>
              <p className="mt-1 font-display text-xl font-bold">{next.talentProfile.stageName}</p>
              <div className="mt-3 space-y-1 text-sm text-white/80">
                <p className="inline-flex items-center gap-2 capitalize">
                  <Calendar className="h-4 w-4 text-lime" /> {formatEventDate(next.eventDate)}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-lime" /> {next.location}
                </p>
              </div>
              <p className="mt-4 font-display text-lg font-bold text-lime">
                {formatAmount(next.totalAmount)}
              </p>
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center gap-3 rounded-xl bg-navy/[0.03] py-8 text-center">
              <CalendarCheck className="h-8 w-8 text-navy/20" />
              <p className="text-sm text-muted">Aucun événement confirmé pour le moment.</p>
              <Link
                href="/recherche"
                className="rounded-xl bg-lime px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-lime-dark hover:text-white"
              >
                Réserver un talent
              </Link>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-navy">Raccourcis</h2>
          <div className="mt-4 space-y-2">
            {[
              { href: "/recherche", label: "Trouver un talent", icon: Search },
              { href: "/client/messages", label: "Écrire à l'équipe", icon: Headset },
              { href: "/client/favoris", label: "Mes talents favoris", icon: Heart },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-xl border border-navy/10 px-4 py-3 text-sm font-semibold text-navy transition-colors hover:bg-navy/5"
              >
                <Icon className="h-4 w-4 text-lime-dark" />
                <span className="flex-1">{label}</span>
                <ArrowRight className="h-3.5 w-3.5 text-navy/40" />
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-navy">Dernières réservations</h2>
          <Link
            href="/client/reservations"
            className="inline-flex items-center gap-1 text-xs font-semibold text-navy/60 hover:text-navy"
          >
            Tout voir <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            Vous n&apos;avez pas encore fait de demande de réservation.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-navy/5">
            {recent.map((b) => (
              <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="text-sm font-semibold text-navy">{b.talentProfile.stageName}</p>
                  <p className="text-xs text-muted">
                    {new Date(b.eventDate).toLocaleDateString("fr-FR")} · {b.location}
                  </p>
                </div>
                <Badge tone={STATUS_TONES[b.status]}>{STATUS_LABELS[b.status]}</Badge>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
