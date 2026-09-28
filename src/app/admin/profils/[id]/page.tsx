import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, Wallet, Calendar, CircleCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PublicMediaGallery } from "@/components/talent/public-media-gallery";
import { getSession } from "@/lib/session";
import { getAdminProfileDetail } from "@/lib/api";
import { getCategoryIcon } from "@/lib/category-icons";
import { validateProfileAction } from "../../actions";

export default async function AdminProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/connexion");

  const { id } = await params;
  const profile = await getAdminProfileDetail(session.accessToken, id).catch(() => null);
  if (!profile) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/profils"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy/60 transition-colors hover:text-navy"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour aux profils à valider
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-navy">{profile.stageName}</h1>
            {profile.isVerified ? (
              <Badge tone="lime">Vérifié</Badge>
            ) : (
              <Badge tone="gold">En attente de validation</Badge>
            )}
            {profile.isPublished && <Badge tone="navy">Publié</Badge>}
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm text-muted">
            {profile.categories.map(({ category }) => category.name).join(" · ")}
          </p>
        </div>

        {!profile.isVerified && (
          <form action={validateProfileAction}>
            <input type="hidden" name="profileId" value={profile.id} />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-lime px-5 py-2.5 font-display text-sm font-semibold text-navy shadow-sm shadow-lime/30 hover:bg-lime-dark hover:text-white"
            >
              <CircleCheck className="h-4 w-4" />
              Valider ce profil
            </button>
          </form>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
            <h2 className="font-display text-base font-bold text-navy">À propos</h2>
            <p className="mt-2 text-sm leading-relaxed text-navy/70">
              {profile.bio || <span className="italic text-muted">Aucune biographie.</span>}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {profile.location && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-3 py-1.5 text-xs font-semibold text-navy">
                  <MapPin className="h-3.5 w-3.5" />
                  {profile.location}
                </span>
              )}
              {profile.basePriceFrom && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-3 py-1.5 text-xs font-semibold text-navy">
                  <Wallet className="h-3.5 w-3.5" />
                  À partir de {Number(profile.basePriceFrom).toLocaleString("fr-FR")} F
                </span>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
            <h2 className="font-display text-base font-bold text-navy">
              Galerie ({profile.media.length})
            </h2>
            <div className="mt-4">
              <PublicMediaGallery media={profile.media} talentName={profile.stageName} />
            </div>
          </section>

          {profile.packages.length > 0 && (
            <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
              <h2 className="font-display text-base font-bold text-navy">Formules</h2>
              <div className="mt-3 space-y-2">
                {profile.packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="flex items-center justify-between rounded-xl border border-navy/10 px-4 py-3 text-sm"
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

        <aside className="space-y-4">
          <section className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
            <h3 className="font-display text-sm font-bold text-navy">Titulaire du compte</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="font-semibold text-navy">
                {profile.user.firstName} {profile.user.lastName}
              </div>
              <div className="flex items-center gap-2 text-navy/70">
                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{profile.user.email}</span>
              </div>
              {profile.user.phone && (
                <div className="flex items-center gap-2 text-navy/70">
                  <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                  {profile.user.phone}
                </div>
              )}
              <div className="flex items-center gap-2 text-navy/70">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                Inscrit le {new Date(profile.user.createdAt).toLocaleDateString("fr-FR")}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
            <h3 className="font-display text-sm font-bold text-navy">Catégories</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.categories.map(({ category }) => {
                const CategoryIcon = getCategoryIcon(category.slug);
                return (
                  <span
                    key={category.id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-3 py-1.5 text-xs font-semibold text-navy"
                  >
                    <CategoryIcon className="h-3.5 w-3.5" />
                    {category.name}
                  </span>
                );
              })}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
