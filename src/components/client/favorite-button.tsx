"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleFavoriteAction } from "@/app/client/actions";

/**
 * Ajoute / retire un talent des favoris du client. `compact` : pastille ronde
 * posée sur une carte ; sinon bouton pleine largeur (page profil).
 */
export function FavoriteButton({
  talentProfileId,
  initialFavorite,
  compact = false,
}: {
  talentProfileId: string;
  initialFavorite: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(initialFavorite);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(e: React.MouseEvent) {
    // Sur une carte, le bouton est posé sur un lien : on ne suit pas le lien.
    e.preventDefault();
    e.stopPropagation();
    const next = !favorite;
    setFavorite(next); // mise à jour optimiste
    setError(null);
    startTransition(async () => {
      const result = await toggleFavoriteAction(talentProfileId, next);
      if (!result.ok) {
        setFavorite(!next);
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  const label = favorite ? "Retirer des favoris" : "Ajouter aux favoris";

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-label={label}
        title={error ?? label}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md transition-transform hover:scale-105 disabled:opacity-70"
      >
        <Heart className={`h-4.5 w-4.5 ${favorite ? "fill-danger text-danger" : "text-navy/60"}`} />
      </button>
    );
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-2.5 font-display text-sm font-semibold transition-colors disabled:opacity-70 ${
          favorite
            ? "border-danger/30 bg-danger/5 text-danger"
            : "border-navy/15 text-navy hover:bg-navy/5"
        }`}
      >
        <Heart className={`h-4 w-4 ${favorite ? "fill-danger" : ""}`} />
        {favorite ? "Dans vos favoris" : "Ajouter aux favoris"}
      </button>
      {error && <p className="mt-1 text-center text-[11px] text-danger">{error}</p>}
    </div>
  );
}
