import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Star,
  CircleCheck,
  MapPin,
  Wallet,
  Calendar,
  ArrowRight,
  CalendarClock,
  Headset,
  Images,
  Settings,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AvatarUploader } from "@/components/artist/avatar-uploader";
import { CoverImageUploader } from "@/components/artist/cover-image-uploader";
import { getSession } from "@/lib/session";
import {
  getMyTalentProfile,
  getCategories,
  getMyBookings,
  getMyUnreadSupportCount,
  type BookingDto,
} from "@/lib/api";
import { getCategoryIcon } from "@/lib/category-icons";
import { timeAgo } from "@/lib/time-ago";
import { createProfileAction, uploadAvatarAction, uploadCoverImageAction } from "./actions";

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

const ACTIVITY_LABELS: Record<string, string> = {
  PENDING: "Nouvelle demande de réservation",
  ACCEPTED: "Demande acceptée",
  COUNTER_OFFERED: "Contre-proposition envoyée",
  CONFIRMED: "Prestation confirmée par Event Prest'Art",
  PAID: "Prestation réglée",
  COMPLETED: "Prestation terminée",
  CANCELLED: "Réservation annulée",
  DISPUTED: "Litige ouvert",
  REFUNDED: "Remboursement effectué",
};

export default async function ArtisteDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();
  if (!session) redirect("/connexion");
  if (session.user.role !== "ARTIST") redirect("/");

  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;

  const [profile, categories, bookings] = await Promise.all([
    getMyTalentProfile(session.accessToken),
    getCategories(),
    getMyBookings(session.accessToken, "artist"),
  ]);

  if (!profile) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <h1 className="font-display text-2xl font-bold text-navy">
          Bienvenue {session.user.firstName}
        </h1>
        <p className="mt-1 text-muted">
          Créez votre profil talent : une fois validé, l&apos;équipe Event Prest&apos;Art pourra vous proposer des prestations.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-danger/10 p-4 text-sm text-danger">{error}</p>
        )}

        <section className="mt-6 rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
          <form action={createProfileAction} className="space-y-4">
            <label className="block text-sm font-semibold text-navy">
              Nom de scène
              <input
                name="stageName"
                required
                className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-lime"
              />
            </label>
            <label className="block text-sm font-semibold text-navy">
              Bio
              <textarea
                name="bio"
                rows={3}
                className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-lime"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-semibold text-navy">
                Localisation
                <input
                  name="location"
                  placeholder="Dakar"
                  className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-lime"
                />
              </label>
              <label className="block text-sm font-semibold text-navy">
                Tarif de départ (F CFA)
                <input
                  type="number"
                  min={0}
                  name="basePriceFrom"
                  className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-lime"
                />
              </label>
            </div>
            <div>
              <span className="block text-sm font-semibold text-navy">Catégories</span>
              <div className="mt-2 flex flex-wrap gap-3">
                {categories.map((category) => {
                  const CategoryIcon = getCategoryIcon(category.slug);
                  return (
                    <label
                      key={category.id}
                      className="flex items-center gap-2 rounded-lg border border-navy/15 px-3 py-2 text-sm text-navy/80"
                    >
                      <input
                        type="checkbox"
                        name="categoryIds"
                        value={category.id}
                        className="accent-lime"
                      />
                      <CategoryIcon className="h-3.5 w-3.5" />
                      {category.name}
                    </label>
                  );
                })}
              </div>
            </div>
            <Button type="submit" className="w-full">
              Créer mon profil
            </Button>
          </form>
        </section>
      </div>
    );
  }

  const categoryTones = ["lime", "terracotta", "gold", "navy"] as const;
  const primaryCategory = profile.categories[0]?.category.name;
  const recentBookings = bookings.slice(0, 3);

  const now = new Date();
  const upcoming = bookings
    .filter(
      (b) =>
        ["CONFIRMED", "PAID"].includes(b.status) &&
        new Date(b.eventDate) >= now,
    )
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    .slice(0, 4);

  const recentActivity = [...bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const completedCount = bookings.filter((b) => b.status === "COMPLETED").length;

  const monthLabels: string[] = [];
  const monthCounts: number[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(d.toLocaleDateString("fr-FR", { month: "short" }));
    monthCounts.push(
      bookings.filter((b) => {
        const bd = new Date(b.eventDate);
        return bd.getFullYear() === d.getFullYear() && bd.getMonth() === d.getMonth();
      }).length,
    );
  }
  const maxMonthCount = Math.max(1, ...monthCounts);
  const supportUnreadCount = await getMyUnreadSupportCount(session.accessToken);

  const shortcuts = [
    {
      href: "/artiste/messages",
      label: "Écrire à Event Prest'Art",
      icon: Headset,
      badge: supportUnreadCount > 0 ? supportUnreadCount : undefined,
    },
    { href: "/artiste/galerie", label: "Galerie médias", icon: Images },
    { href: "/artiste/parametres", label: "Paramètres du profil", icon: Settings },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {error && (
        <p className="rounded-lg bg-danger/10 p-4 text-sm text-danger">{error}</p>
      )}

      {/* PROFILE HERO */}
      <div className="overflow-hidden rounded-3xl border border-navy/10 bg-white shadow-lg shadow-navy/5">
        <div className="relative h-32 overflow-hidden bg-gradient-to-br from-navy-light to-navy sm:h-48">
          <CoverImageUploader action={uploadCoverImageAction} coverImageUrl={profile.coverImageUrl} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent" />
        </div>
        <div className="px-6 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div
                className={`rounded-3xl shadow-lg ${
                  profile.isVerified
                    ? "ring-4 ring-lime/70 ring-offset-4 ring-offset-white"
                    : "ring-4 ring-white ring-offset-0"
                }`}
              >
                <AvatarUploader
                  action={uploadAvatarAction}
                  avatarUrl={session.user.avatarUrl}
                  fallbackLabel={profile.stageName[0]?.toUpperCase() ?? "?"}
                  size={96}
                />
              </div>
              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-xl font-bold text-navy sm:text-2xl">
                    {profile.stageName}
                  </h1>
                  {profile.isVerified && (
                    <span
                      title="Profil vérifié"
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-lime text-navy"
                    >
                      <CircleCheck className="h-4 w-4" strokeWidth={2.5} />
                    </span>
                  )}
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm text-muted">
                  {primaryCategory && <span>{primaryCategory}</span>}
                  {profile.location && (
                    <span className="inline-flex items-center gap-0.5">
                      {primaryCategory && "·"} <MapPin className="h-3.5 w-3.5" />
                      {profile.location}
                    </span>
                  )}
                </p>
                <div className="mt-2">
                  {profile.isPublished ? (
                    <Badge tone="lime">En ligne</Badge>
                  ) : (
                    <Badge tone="gold">En attente de validation</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* STATS STRIP */}
          <div className="mt-6 grid grid-cols-4 divide-x divide-navy/10 border-t border-navy/10 pt-5 text-center">
            <div className="flex flex-col items-center gap-1">
              <span className="inline-flex items-center gap-1 font-display text-lg font-bold text-navy">
                <Star className="h-4 w-4 fill-gold text-gold" />
                {Number(profile.ratingAverage).toFixed(1)}
              </span>
              <span className="text-xs text-muted">note</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-display text-lg font-bold text-navy">
                {profile.ratingCount}
              </span>
              <span className="text-xs text-muted">avis</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-display text-lg font-bold text-navy">
                {profile.media.length}
              </span>
              <span className="text-xs text-muted">médias</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-display text-lg font-bold text-navy">
                {bookings.length}
              </span>
              <span className="text-xs text-muted">réservations</span>
            </div>
          </div>

          {profile.basePriceFrom && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-3 py-1.5 text-xs font-semibold text-navy">
                <Wallet className="h-3.5 w-3.5" />
                À partir de {Number(profile.basePriceFrom).toLocaleString("fr-FR")} F
              </span>
            </div>
          )}

          {!profile.isPublished && (
            <p className="mt-4 rounded-lg bg-terracotta/10 px-3 py-2 text-xs text-terracotta">
              Votre profil n&apos;est pas encore visible publiquement — il sera publié dès sa
              validation par notre équipe.
            </p>
          )}
        </div>
      </div>

      {/* QUICK LINKS */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {shortcuts.map((shortcut) => (
          <Link
            key={shortcut.href}
            href={shortcut.href}
            className="group flex items-center gap-3 rounded-2xl border border-navy/10 bg-white p-4 shadow-sm transition-colors hover:border-lime/60"
          >
            <span className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-navy/5 text-navy transition-colors group-hover:bg-lime/15">
              <shortcut.icon className="h-4.5 w-4.5" />
              {typeof shortcut.badge === "number" && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-terracotta px-1 text-[10px] font-bold text-white">
                  {shortcut.badge}
                </span>
              )}
            </span>
            <span className="min-w-0 flex-1 text-sm font-semibold text-navy">
              {shortcut.label}
            </span>
            <ArrowRight className="h-4 w-4 flex-shrink-0 text-navy/20 transition-transform group-hover:translate-x-0.5 group-hover:text-navy/50" />
          </Link>
        ))}
      </div>

      {/* DASHBOARD OVERVIEW */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* KEY STATS */}
        <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
          <h3 className="font-display text-lg font-bold text-navy">Statistiques clés</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-navy/[0.03] p-3">
              <div className="flex items-center gap-1 font-display text-xl font-bold text-navy">
                <Star className="h-4 w-4 fill-gold text-gold" />
                {Number(profile.ratingAverage).toFixed(1)}
              </div>
              <p className="text-xs text-muted">Note moyenne</p>
            </div>
            <div className="rounded-xl bg-navy/[0.03] p-3">
              <div className="font-display text-xl font-bold text-navy">{bookings.length}</div>
              <p className="text-xs text-muted">Réservations</p>
            </div>
            <div className="rounded-xl bg-navy/[0.03] p-3">
              <div className="font-display text-xl font-bold text-navy">
                {completedCount}
              </div>
              <p className="text-xs text-muted">Prestations réalisées</p>
            </div>
            <div className="rounded-xl bg-navy/[0.03] p-3">
              <div className="font-display text-xl font-bold text-navy">
                {profile.media.length}
              </div>
              <p className="text-xs text-muted">Médias publiés</p>
            </div>
          </div>
          <div className="mt-5 flex items-end gap-2 border-t border-navy/10 pt-4">
            {monthCounts.map((c, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t-md bg-lime"
                  style={{ height: `${Math.max(6, (c / maxMonthCount) * 48)}px` }}
                />
                <span className="text-[10px] capitalize text-muted">{monthLabels[i]}</span>
              </div>
            ))}
          </div>
        </section>

        {/* UPCOMING BOOKINGS */}
        <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
          <h3 className="font-display text-lg font-bold text-navy">Prochaines prestations</h3>
          {upcoming.length === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-2 py-4 text-center">
              <CalendarClock className="h-7 w-7 text-navy/20" />
              <p className="text-sm text-muted">Aucune prestation à venir.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {upcoming.map((booking) => (
                <div key={booking.id} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-navy text-lime">
                    <span className="text-[9px] font-bold uppercase leading-none">
                      {new Date(booking.eventDate).toLocaleDateString("fr-FR", { month: "short" })}
                    </span>
                    <span className="text-sm font-bold leading-tight">
                      {new Date(booking.eventDate).getDate()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-navy">
                      {booking.servicePackage?.name ?? "Prestation Event Prest'Art"}
                    </p>
                    <p className="truncate text-xs text-muted">{booking.location}</p>
                  </div>
                  <Badge tone={STATUS_TONES[booking.status]}>
                    {STATUS_LABELS[booking.status] ?? booking.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* RECENT ACTIVITY */}
        <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
          <h3 className="font-display text-lg font-bold text-navy">Activité récente</h3>
          {recentActivity.length === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-2 py-4 text-center">
              <CalendarClock className="h-7 w-7 text-navy/20" />
              <p className="text-sm text-muted">Aucune activité pour le moment.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-3.5">
              {recentActivity.map((booking) => (
                <div key={booking.id} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-lime" />
                  <div className="min-w-0">
                    <p className="text-sm text-navy">
                      {ACTIVITY_LABELS[booking.status] ?? booking.status}
                    </p>
                    <p className="text-xs text-muted">{timeAgo(booking.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* RECENT BOOKINGS */}
      <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-navy">Prestations récentes</h3>
          <Link
            href="/artiste/reservations"
            className="inline-flex items-center gap-1 text-xs font-semibold text-navy/60 transition-colors hover:text-navy"
          >
            Voir tout <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="mt-4 flex flex-col items-center gap-2 py-6 text-center">
            <CalendarClock className="h-7 w-7 text-navy/20" />
            <p className="text-sm text-muted">Aucune prestation confirmée pour le moment.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-navy/10 px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-navy/5 text-navy">
                    <MapPin className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <div className="font-semibold text-navy">{booking.location}</div>
                    <div className="inline-flex items-center gap-1 text-xs text-muted">
                      <Calendar className="h-3 w-3" />
                      {new Date(booking.eventDate).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                </div>
                <Badge tone={STATUS_TONES[booking.status]}>
                  {STATUS_LABELS[booking.status] ?? booking.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ABOUT */}
      <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
        <h3 className="font-display text-lg font-bold text-navy">À propos</h3>
        <p className="mt-3 text-sm leading-relaxed text-navy/70">
          {profile.bio || (
            <span className="italic text-muted">
              Aucune biographie pour l&apos;instant — ajoutez-en une dans les paramètres du
              profil.
            </span>
          )}
        </p>

        {profile.categories.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {profile.categories.map(({ category }, i) => {
              const CategoryIcon = getCategoryIcon(category.slug);
              return (
                <span
                  key={category.id}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    {
                      lime: "bg-lime/15 text-lime-dark",
                      terracotta: "bg-terracotta/15 text-terracotta",
                      gold: "bg-gold/20 text-gold",
                      navy: "bg-navy text-lime",
                    }[categoryTones[i % categoryTones.length]]
                  }`}
                >
                  <CategoryIcon className="h-3.5 w-3.5" />
                  {category.name}
                </span>
              );
            })}
          </div>
        )}
      </section>

      {profile.packages.length > 0 && (
        <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
          <h3 className="font-display text-lg font-bold text-navy">Formules</h3>
          <div className="mt-3 space-y-2">
            {profile.packages.map((pkg) => (
              <div
                key={pkg.id}
                className="flex items-center justify-between rounded-xl border border-navy/10 px-4 py-3 text-sm transition-colors hover:border-navy/20"
              >
                <span className="font-semibold text-navy">{pkg.name}</span>
                <span className="font-display font-bold text-navy">
                  {Number(pkg.price).toLocaleString("fr-FR")} F
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
