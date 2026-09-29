import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { getSession } from "@/lib/session";
import { getMyFavorites, toTalentCardData } from "@/lib/api";
import { TalentCard } from "@/components/talents/talent-card";
import { FavoriteButton } from "@/components/client/favorite-button";

export default async function ClientFavoritesPage() {
  const session = await getSession();
  if (!session || session.user.role !== "CLIENT") redirect("/connexion");

  const favorites = await getMyFavorites(session.accessToken);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-navy">Mes talents favoris</h1>
        <p className="mt-1 text-sm text-muted">
          Les artistes que vous avez mis de côté, pour les retrouver et les réserver facilement.
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-navy/10 bg-white py-12 text-center shadow-sm">
          <Heart className="h-8 w-8 text-navy/20" />
          <p className="max-w-sm text-sm text-muted">
            Aucun favori pour le moment. Cliquez sur le cœur d&apos;un profil pour l&apos;ajouter
            ici.
          </p>
          <Link
            href="/recherche"
            className="rounded-xl bg-lime px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-lime-dark hover:text-white"
          >
            Découvrir les talents
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((talent) => (
            <div key={talent.id} className="relative">
              <TalentCard talent={toTalentCardData(talent)} />
              <div className="absolute left-3 top-3">
                <FavoriteButton talentProfileId={talent.id} initialFavorite compact />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
