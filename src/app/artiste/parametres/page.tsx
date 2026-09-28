import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CircleCheck, CircleAlert, Star, Mail, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProfileSettingsForm } from "@/components/artist/profile-settings-form";
import { getSession } from "@/lib/session";
import { getMyTalentProfile, getCategories } from "@/lib/api";
import { updateProfileAction } from "../actions";

export default async function ArtisteParametresPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();
  if (!session) redirect("/connexion");
  if (session.user.role !== "ARTIST") redirect("/");

  const [profile, categories] = await Promise.all([
    getMyTalentProfile(session.accessToken),
    getCategories(),
  ]);

  if (!profile) redirect("/artiste");

  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;
  const success = params.success === "1";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link
        href="/artiste"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy/60 transition-colors hover:text-navy"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour au tableau de bord
      </Link>

      <div className="mt-4">
        <h1 className="font-display text-2xl font-bold text-navy">
          Paramètres du profil et du compte
        </h1>
        <p className="mt-1 text-sm text-muted">
          Gérez les informations affichées publiquement sur votre profil talent.
        </p>
      </div>

      {success && (
        <p className="mt-6 flex items-center gap-2 rounded-xl bg-lime/10 px-4 py-3 text-sm font-medium text-lime-dark">
          <CircleCheck className="h-4 w-4 flex-shrink-0" />
          Vos modifications ont été enregistrées.
        </p>
      )}
      {error && (
        <p className="mt-6 flex items-center gap-2 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          <CircleAlert className="h-4 w-4 flex-shrink-0" />
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <p className="rounded-xl border border-navy/10 bg-navy/[0.02] px-4 py-3 text-xs text-muted">
            La photo de profil et la couverture se changent directement depuis le{" "}
            <Link href="/artiste" className="font-semibold text-navy underline underline-offset-2">
              tableau de bord
            </Link>{" "}
            — survolez votre couverture ou votre photo en haut de la page.
          </p>

          <ProfileSettingsForm
            action={updateProfileAction}
            profile={profile}
            categories={categories}
          />
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
            <h3 className="font-display text-sm font-bold text-navy">Compte</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-navy/70">
                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{session.user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-navy/70">
                <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" />
                {profile.isVerified ? (
                  <Badge tone="lime">Profil vérifié</Badge>
                ) : (
                  <Badge tone="gold">Non vérifié</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-navy/70">
                <Star className="h-3.5 w-3.5 flex-shrink-0 fill-gold text-gold" />
                {Number(profile.ratingAverage).toFixed(1)} · {profile.ratingCount} avis
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
            <h3 className="font-display text-sm font-bold text-navy">Statut de publication</h3>
            <p className="mt-2 text-xs text-muted">
              {profile.isPublished
                ? "Votre profil est visible publiquement."
                : "Votre profil n'est pas encore publié — il sera visible après validation par notre équipe."}
            </p>
            <div className="mt-3">
              {profile.isPublished ? (
                <Badge tone="lime">En ligne</Badge>
              ) : (
                <Badge tone="gold">En attente de validation</Badge>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
