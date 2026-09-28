import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarClock,
  CalendarPlus,
  Calendar,
  MapPin,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/session";
import { getAdminBookings, getAdminUsers, type AdminBookingDto } from "@/lib/api";
import {
  createBookingAction,
  decideBookingAction,
  cancelBookingAction,
  contactUserAction,
} from "../actions";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "À traiter",
  ACCEPTED: "À traiter",
  COUNTER_OFFERED: "À traiter",
  CONFIRMED: "Confirmée",
  PAID: "Payée",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
  DISPUTED: "Litige",
  REFUNDED: "Remboursée",
};

const STATUS_TONES: Record<AdminBookingDto["status"], "lime" | "gold" | "terracotta" | "navy" | "danger"> = {
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

const AWAITING_DECISION: AdminBookingDto["status"][] = ["PENDING", "ACCEPTED", "COUNTER_OFFERED"];

const TABS: { key: string; label: string; status?: AdminBookingDto["status"] }[] = [
  { key: "toutes", label: "Toutes" },
  { key: "attente", label: "À traiter", status: "PENDING" },
  { key: "confirmees", label: "Confirmées", status: "CONFIRMED" },
  { key: "payees", label: "Payées", status: "PAID" },
  { key: "terminees", label: "Terminées", status: "COMPLETED" },
  { key: "annulees", label: "Annulées", status: "CANCELLED" },
];

function formatAmount(amount: string) {
  return `${Number(amount).toLocaleString("fr-FR")} F`;
}

const inputClass =
  "w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-lime";

function ContactBlock({
  label,
  name,
  email,
  phone,
  userId,
  tab,
  contactLabel,
}: {
  label: string;
  name: string;
  email: string;
  phone: string | null;
  userId: string;
  tab: string;
  contactLabel: string;
}) {
  return (
    <div className="rounded-xl bg-navy/[0.03] p-3 text-xs">
      <p className="font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-navy">{name}</p>
      <p className="mt-1 flex items-center gap-1.5 break-all text-navy/70">
        <Mail className="h-3 w-3 flex-shrink-0" /> {email}
      </p>
      {phone && (
        <p className="mt-0.5 flex items-center gap-1.5 text-navy/70">
          <Phone className="h-3 w-3 flex-shrink-0" /> {phone}
        </p>
      )}
      <form action={contactUserAction} className="mt-2">
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="tab" value={tab} />
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-lg border border-navy/15 bg-white px-2.5 py-1.5 font-semibold text-navy transition-colors hover:bg-navy/5"
        >
          <MessageSquare className="h-3 w-3" /> {contactLabel}
        </button>
      </form>
    </div>
  );
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();
  if (!session) redirect("/connexion");

  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;
  const tabKey = typeof params.tab === "string" ? params.tab : "toutes";
  const activeTab = TABS.find((t) => t.key === tabKey) ?? TABS[0];

  const [bookings, clients, artists] = await Promise.all([
    getAdminBookings(session.accessToken, activeTab.status),
    getAdminUsers(session.accessToken, { role: "CLIENT" }),
    getAdminUsers(session.accessToken, { role: "ARTIST" }),
  ]);
  const artistsWithProfile = artists.filter((a) => a.talentProfile);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-2xl font-bold text-navy">Réservations</h1>
      <p className="mt-1 text-muted">
        Les clients adressent leurs demandes à Event Prest&apos;Art. Contactez l&apos;artiste pour
        vérifier sa disponibilité et négocier son cachet, puis confirmez ou refusez la demande :
        client et artiste sont prévenus par email.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-danger/10 p-4 text-sm text-danger">{error}</p>
      )}

      <details className="group mt-6 rounded-2xl border border-navy/10 bg-white [&_summary::-webkit-details-marker]:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5">
          <span className="inline-flex items-center gap-2 font-display text-base font-bold text-navy">
            <CalendarPlus className="h-4 w-4" />
            Créer une réservation
          </span>
          <span className="text-xs font-semibold text-navy/50 group-open:hidden">Ouvrir</span>
        </summary>
        <form
          action={createBookingAction}
          className="grid gap-3 border-t border-navy/10 p-5 sm:grid-cols-2"
        >
          <label className="block text-sm font-semibold text-navy">
            Organisateur
            <select
              name="clientId"
              required
              defaultValue=""
              className="mt-1.5 w-full rounded-xl border border-navy/15 px-3.5 py-2.5 text-sm outline-none focus:border-lime"
            >
              <option value="" disabled>
                Choisir un organisateur…
              </option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.firstName} {client.lastName} · {client.email}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-navy">
            Artiste
            <select
              name="talentProfileId"
              required
              defaultValue=""
              className="mt-1.5 w-full rounded-xl border border-navy/15 px-3.5 py-2.5 text-sm outline-none focus:border-lime"
            >
              <option value="" disabled>
                Choisir un artiste…
              </option>
              {artistsWithProfile.map((artist) => (
                <option key={artist.talentProfile!.id} value={artist.talentProfile!.id}>
                  {artist.talentProfile!.stageName}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-navy">
            Date de l&apos;événement
            <input
              type="date"
              name="eventDate"
              required
              className="mt-1.5 w-full rounded-xl border border-navy/15 px-3.5 py-2.5 text-sm outline-none focus:border-lime"
            />
          </label>
          <label className="block text-sm font-semibold text-navy">
            Lieu
            <input
              name="location"
              required
              placeholder="Dakar"
              className="mt-1.5 w-full rounded-xl border border-navy/15 px-3.5 py-2.5 text-sm outline-none focus:border-lime"
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-xl bg-lime px-5 py-2.5 font-display text-sm font-semibold text-navy shadow-sm shadow-lime/30 hover:bg-lime-dark hover:text-white"
            >
              Créer la réservation
            </button>
            <p className="mt-2 text-xs text-muted">
              Le tarif de départ de l&apos;artiste sert de base. La demande apparaît ensuite dans
              « À traiter » pour être confirmée après accord avec l&apos;artiste.
            </p>
          </div>
        </form>
      </details>

      <div className="mt-6 inline-flex flex-wrap rounded-xl border border-navy/10 bg-white p-1 shadow-sm">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/reservations?tab=${tab.key}`}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              tab.key === activeTab.key ? "bg-navy text-lime" : "text-navy/60 hover:bg-navy/5"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <section className="mt-4 space-y-4">
        {bookings.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-navy/10 bg-white py-10 text-center">
            <CalendarClock className="h-8 w-8 text-navy/20" />
            <p className="text-sm text-muted">Aucune réservation dans cette catégorie.</p>
          </div>
        ) : (
          bookings.map((booking) => {
            const awaitingDecision = AWAITING_DECISION.includes(booking.status);
            const cancellable = booking.status === "CONFIRMED" || booking.status === "PAID";
            return (
              <article
                key={booking.id}
                className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm"
              >
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-base font-bold text-navy">
                      {booking.talentProfile.stageName}
                      {booking.servicePackage && (
                        <span className="font-normal text-navy/60">
                          {" "}
                          · {booking.servicePackage.name}
                        </span>
                      )}
                    </h2>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(booking.eventDate).toLocaleDateString("fr-FR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {booking.location}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge tone={STATUS_TONES[booking.status]}>
                      {STATUS_LABELS[booking.status] ?? booking.status}
                    </Badge>
                    <span className="font-display text-sm font-bold text-navy">
                      {formatAmount(booking.totalAmount)}
                    </span>
                    <span className="text-[11px] text-muted">
                      dont cachet artiste {formatAmount(booking.subtotalAmount)}
                    </span>
                  </div>
                </header>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <ContactBlock
                    label="Client"
                    name={`${booking.client.firstName} ${booking.client.lastName}`}
                    email={booking.client.email}
                    phone={booking.client.phone}
                    userId={booking.client.id}
                    tab={activeTab.key}
                    contactLabel="Écrire au client"
                  />
                  <ContactBlock
                    label="Artiste"
                    name={booking.talentProfile.stageName}
                    email={booking.talentProfile.user.email}
                    phone={booking.talentProfile.user.phone}
                    userId={booking.talentProfile.user.id}
                    tab={activeTab.key}
                    contactLabel="Écrire à l'artiste"
                  />
                </div>

                {awaitingDecision && (
                  <form
                    action={decideBookingAction}
                    className="mt-4 grid gap-3 border-t border-navy/10 pt-4 sm:grid-cols-[180px_1fr]"
                  >
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <input type="hidden" name="tab" value={activeTab.key} />
                    <label className="block text-xs font-semibold text-navy">
                      Cachet négocié (F)
                      <input
                        type="number"
                        name="artistFee"
                        min={0}
                        defaultValue={Number(booking.subtotalAmount)}
                        className={`mt-1 ${inputClass}`}
                      />
                    </label>
                    <label className="block text-xs font-semibold text-navy">
                      Message au client (facultatif)
                      <input
                        name="note"
                        maxLength={1000}
                        placeholder="Précisions, motif du refus…"
                        className={`mt-1 ${inputClass}`}
                      />
                    </label>
                    <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
                      <button
                        type="submit"
                        name="action"
                        value="CONFIRM"
                        className="rounded-lg bg-lime px-4 py-2 text-xs font-bold text-navy transition-colors hover:bg-lime-dark hover:text-white"
                      >
                        Confirmer la réservation
                      </button>
                      <button
                        type="submit"
                        name="action"
                        value="REFUSE"
                        className="rounded-lg border border-navy/15 px-4 py-2 text-xs font-semibold text-navy transition-colors hover:bg-navy/5"
                      >
                        Refuser la demande
                      </button>
                      <span className="text-[11px] text-muted">
                        Les frais de service sont recalculés à partir du cachet.
                      </span>
                    </div>
                  </form>
                )}

                {cancellable && (
                  <details className="mt-4 border-t border-navy/10 pt-3 [&_summary::-webkit-details-marker]:hidden">
                    <summary className="cursor-pointer list-none text-xs font-semibold text-danger">
                      Annuler cette réservation…
                    </summary>
                    <form action={cancelBookingAction} className="mt-2 flex flex-wrap gap-2">
                      <input type="hidden" name="bookingId" value={booking.id} />
                      <input type="hidden" name="tab" value={activeTab.key} />
                      <input
                        name="reason"
                        maxLength={1000}
                        placeholder="Motif communiqué au client et à l'artiste"
                        className={`min-w-0 flex-1 ${inputClass}`}
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-danger px-4 py-2 text-xs font-bold text-white"
                      >
                        Confirmer l&apos;annulation
                      </button>
                    </form>
                  </details>
                )}

                {booking.status === "CANCELLED" && booking.cancellationReason && (
                  <p className="mt-3 text-xs text-muted">Motif : {booking.cancellationReason}</p>
                )}
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
