import { redirect } from "next/navigation";
import { MediaGallery } from "@/components/artist/media-gallery";
import { getSession } from "@/lib/session";
import { getMyTalentProfile } from "@/lib/api";

export default async function ArtisteGaleriePage() {
  const session = await getSession();
  if (!session) redirect("/connexion");
  if (session.user.role !== "ARTIST") redirect("/");

  const profile = await getMyTalentProfile(session.accessToken);
  if (!profile) redirect("/artiste");

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-navy">Galerie</h1>
        <p className="mt-1 text-sm text-muted">
          Publiez vos meilleures photos et vidéos — un dernier concert, une prestation, un
          extrait live. Elles servent de vitrine sur votre profil public.
        </p>
      </div>
      <MediaGallery media={profile.media} />
    </div>
  );
}
