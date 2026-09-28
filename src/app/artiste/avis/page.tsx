import { redirect } from "next/navigation";
import { Star } from "lucide-react";
import { ReviewsView } from "@/components/artist/reviews-view";
import { getSession } from "@/lib/session";
import { getMyTalentProfile, getTalentReviews } from "@/lib/api";

export default async function ArtisteAvisPage() {
  const session = await getSession();
  if (!session) redirect("/connexion");
  if (session.user.role !== "ARTIST") redirect("/");

  const profile = await getMyTalentProfile(session.accessToken);
  if (!profile) redirect("/artiste");

  const reviews = await getTalentReviews(profile.id);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Avis</h1>
          <p className="mt-1 text-sm text-muted">
            Les retours laissés par les organisateurs après vos prestations.
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border border-navy/10 bg-white px-3.5 py-2 shadow-sm">
          <Star className="h-4 w-4 fill-gold text-gold" />
          <span className="font-display font-bold text-navy">
            {Number(profile.ratingAverage).toFixed(1)}
          </span>
          <span className="text-xs text-muted">({profile.ratingCount})</span>
        </div>
      </div>

      <ReviewsView reviews={reviews} />
    </div>
  );
}
