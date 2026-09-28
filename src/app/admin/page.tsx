import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarClock,
  CircleCheck,
  Headset,
  Percent,
  Star,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/session";
import {
  getAdminBookings,
  getAdminDashboard,
  getAdminUnreadSupportCount,
  getAdminUsers,
  getPendingProfiles,
  type AdminBookingDto,
} from "@/lib/api";

const STATUS_META: Record<
  AdminBookingDto["status"],
  { label: string; tone: "lime" | "gold" | "terracotta" | "navy" | "danger" }
> = {
  PENDING: { label: "En attente", tone: "gold" },
  ACCEPTED: { label: "Acceptée", tone: "lime" },
  COUNTER_OFFERED: { label: "Contre-proposition", tone: "terracotta" },
  CONFIRMED: { label: "Confirmée", tone: "lime" },
  PAID: { label: "Payée", tone: "navy" },
  COMPLETED: { label: "Terminée", tone: "navy" },
  CANCELLED: { label: "Annulée", tone: "danger" },
  DISPUTED: { label: "Contestée", tone: "danger" },
  REFUNDED: { label: "Remboursée", tone: "terracotta" },
};

const formatF = (value: string | number) => `${Number(value).toLocaleString("fr-FR")} F`;

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm shadow-navy/5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}>
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <div className="mt-3 font-display text-2xl font-bold text-navy">{value}</div>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/connexion");

  const [dashboard, bookings, pendingProfiles, users, unreadSupport] = await Promise.all([
    getAdminDashboard(session.accessToken),
    getAdminBookings(session.accessToken).catch((): AdminBookingDto[] => []),
    getPendingProfiles(session.accessToken).catch(() => []),
    getAdminUsers(session.accessToken).catch(() => []),
    getAdminUnreadSupportCount(session.accessToken).catch(() => 0),
  ]);

  const now = new Date();
  const clientsCount = users.filter((u) => u.role === "CLIENT").length;
  const artistsCount = users.filter((u) => u.role === "ARTIST").length;
  const newUsersThisMonth = users.filter((u) => {
    const d = new Date(u.createdAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  const toHandle = bookings.filter((b) => b.status === "PENDING" || b.status === "COUNTER_OFFERED");
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  // Réservations créées sur les 6 derniers mois.
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const count = bookings.filter((b) => {
      const c = new Date(b.createdAt);
      return c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth();
    }).length;
    return {
      key: `${d.getFullYear()}-${d.getMonth()}`,
      short: d.toLocaleDateString("fr-FR", { month: "short" }),
      long: d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
      count,
    };
  });
  const maxMonth = Math.max(1, ...months.map((m) => m.count));

  const statusCounts = (Object.keys(STATUS_META) as AdminBookingDto["status"][])
    .map((status) => ({ status, count: bookings.filter((b) => b.status === status).length }))
    .filter((s) => s.count > 0);

  const tasks = [
    {
      href: "/admin/profils",
      icon: UserCheck,
      label: "Profils à valider",
      count: pendingProfiles.length,
    },
    {
      href: "/admin/reservations",
      icon: CalendarClock,
      label: "Réservations à traiter",
      count: toHandle.length,
    },
    {
      href: "/admin/messagerie",
      icon: Headset,
      label: "Messages support non lus",
      count: unreadSupport,
    },
  ];
  const pendingTaskCount = tasks.reduce((sum, t) => sum + t.count, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* EN-TÊTE */}
      <section className="relative overflow-hidden rounded-3xl bg-navy p-6 text-white sm:p-8">
        <div
          aria-hidden
          className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-lime/20 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm capitalize text-white/60">
              {now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
              Bonjour {session.user.firstName} 👋
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/70">
              {pendingTaskCount > 0
                ? `Vous avez ${pendingTaskCount} élément${pendingTaskCount > 1 ? "s" : ""} en attente de traitement.`
                : "Tout est à jour. Aucune action en attente."}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Clients", value: clientsCount },
              { label: "Artistes", value: artistsCount },
              { label: "Nouveaux ce mois", value: newUsersThisMonth },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/10 px-4 py-3">
                <div className="font-display text-xl font-bold text-lime">{s.value}</div>
                <div className="text-[11px] text-white/60">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KPI */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          icon={Wallet}
          label="Revenu total"
          value={formatF(dashboard.totalRevenue)}
          hint="Réservations payées et terminées"
          accent="bg-lime/15 text-lime-dark"
        />
        <KpiCard
          icon={TrendingUp}
          label="Commissions"
          value={formatF(dashboard.totalCommission)}
          hint="Frais de service perçus"
          accent="bg-gold/20 text-gold"
        />
        <KpiCard
          icon={CalendarClock}
          label="Réservations"
          value={String(dashboard.bookingsCount)}
          hint={`${dashboard.completedCount} terminée${dashboard.completedCount > 1 ? "s" : ""}`}
          accent="bg-navy text-lime"
        />
        <KpiCard
          icon={Percent}
          label="Taux de conversion"
          value={`${dashboard.conversionRate.toFixed(1)} %`}
          hint="Réservations menées à terme"
          accent="bg-terracotta/15 text-terracotta"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* GRAPHIQUE */}
        <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm shadow-navy/5 lg:col-span-2">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg font-bold text-navy">Réservations par mois</h2>
            <span className="text-xs text-muted">6 derniers mois</span>
          </div>
          <div
            className="mt-6 flex h-48 items-end gap-3 border-b border-navy/10"
            role="img"
            aria-label={months.map((m) => `${m.long} : ${m.count}`).join(", ")}
          >
            {months.map((m) => (
              <div key={m.key} className="group relative flex h-full flex-1 flex-col justify-end">
                <span className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-navy px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  <span className="capitalize">{m.long}</span> ·{" "}
                  <strong>
                    {m.count} réservation{m.count > 1 ? "s" : ""}
                  </strong>
                </span>
                <span className="mb-1 text-center text-xs font-semibold text-navy/60">
                  {m.count > 0 ? m.count : ""}
                </span>
                <div
                  className="mx-auto w-full max-w-12 rounded-t-[4px] bg-navy transition-colors group-hover:bg-lime-dark"
                  style={{ height: `${Math.max(m.count > 0 ? 4 : 1, (m.count / maxMonth) * 100)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-3">
            {months.map((m) => (
              <span key={m.key} className="flex-1 text-center text-xs capitalize text-muted">
                {m.short}
              </span>
            ))}
          </div>
        </section>

        {/* À TRAITER */}
        <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm shadow-navy/5">
          <h2 className="font-display text-lg font-bold text-navy">À traiter</h2>
          <div className="mt-4 space-y-2">
            {tasks.map((task) => (
              <Link
                key={task.href}
                href={task.href}
                className="group flex items-center gap-3 rounded-xl border border-navy/10 px-4 py-3 transition-colors hover:border-lime/60 hover:bg-lime/5"
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-navy/5 text-navy">
                  <task.icon className="h-4 w-4" />
                </span>
                <span className="flex-1 text-sm font-semibold text-navy">{task.label}</span>
                {task.count > 0 ? (
                  <span className="rounded-full bg-terracotta px-2 py-0.5 text-xs font-bold text-white">
                    {task.count}
                  </span>
                ) : (
                  <CircleCheck className="h-4 w-4 text-lime-dark" />
                )}
              </Link>
            ))}
          </div>

          {statusCounts.length > 0 && (
            <>
              <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted">
                Réservations par statut
              </h3>
              <ul className="mt-3 space-y-2">
                {statusCounts.map(({ status, count }) => (
                  <li key={status} className="flex items-center justify-between text-sm">
                    <Badge tone={STATUS_META[status].tone}>{STATUS_META[status].label}</Badge>
                    <span className="font-display font-bold text-navy">{count}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* DERNIÈRES RÉSERVATIONS */}
        <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm shadow-navy/5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-navy">Dernières réservations</h2>
            <Link
              href="/admin/reservations"
              className="inline-flex items-center gap-1 text-xs font-semibold text-navy/60 hover:text-navy"
            >
              Tout voir <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <p className="mt-6 text-sm text-muted">Aucune réservation pour le moment.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-navy/10 text-left text-xs uppercase tracking-wide text-muted">
                    <th className="pb-2 font-semibold">Client</th>
                    <th className="pb-2 font-semibold">Talent</th>
                    <th className="pb-2 font-semibold">Date</th>
                    <th className="pb-2 text-right font-semibold">Montant</th>
                    <th className="pb-2 text-right font-semibold">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
                    <tr key={b.id} className="border-b border-navy/5 last:border-0">
                      <td className="py-3 font-semibold text-navy">
                        {b.client.firstName} {b.client.lastName}
                      </td>
                      <td className="py-3 text-navy/70">{b.talentProfile.stageName}</td>
                      <td className="py-3 text-navy/70">
                        {new Date(b.eventDate).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="py-3 text-right font-display font-semibold text-navy">
                        {formatF(b.totalAmount)}
                      </td>
                      <td className="py-3 text-right">
                        <Badge tone={STATUS_META[b.status].tone}>{STATUS_META[b.status].label}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* MEILLEURS TALENTS */}
        <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm shadow-navy/5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-navy">Meilleurs talents</h2>
            <Users className="h-4 w-4 text-navy/30" />
          </div>
          {dashboard.topTalents.length === 0 ? (
            <p className="mt-6 text-sm text-muted">Aucun talent noté pour le moment.</p>
          ) : (
            <ol className="mt-4 space-y-2">
              {dashboard.topTalents.map((talent, i) => (
                <li
                  key={talent.id}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-navy/[0.03]"
                >
                  <span
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg font-display text-xs font-bold ${
                      i === 0 ? "bg-lime text-navy" : "bg-navy/5 text-navy/60"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <Link
                    href={`/talents/${talent.id}`}
                    className="min-w-0 flex-1 truncate text-sm font-semibold text-navy hover:underline"
                  >
                    {talent.stageName}
                  </Link>
                  <span className="inline-flex items-center gap-1 text-xs text-navy/70">
                    <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                    {Number(talent.ratingAverage).toFixed(1)}
                    <span className="text-muted">({talent.ratingCount})</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
