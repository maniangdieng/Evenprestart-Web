"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import type { ReviewDto } from "@/lib/api";

const SORTS = [
  { key: "recent", label: "Récent" },
  { key: "top", label: "Le Plus Haut" },
  { key: "low", label: "Le Plus Bas" },
] as const;

type SortKey = (typeof SORTS)[number]["key"];

export function ReviewsView({ reviews }: { reviews: ReviewDto[] }) {
  const [sort, setSort] = useState<SortKey>("recent");

  const sorted = useMemo(() => {
    const arr = [...reviews];
    if (sort === "recent") {
      arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === "top") {
      arr.sort((a, b) => b.rating - a.rating);
    } else {
      arr.sort((a, b) => a.rating - b.rating);
    }
    return arr;
  }, [reviews, sort]);

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const maxCount = Math.max(1, ...distribution.map((d) => d.count));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
      <div>
        <div className="mb-4 inline-flex rounded-xl border border-navy/10 bg-white p-1 shadow-sm">
          {SORTS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSort(s.key)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                sort === s.key ? "bg-navy text-lime" : "text-navy/60 hover:bg-navy/5"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {sorted.length === 0 ? (
          <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Star className="h-8 w-8 text-navy/20" />
              <p className="text-sm text-muted">Aucun avis pour le moment.</p>
              <p className="max-w-xs text-xs text-muted/70">
                Les avis apparaîtront ici après vos premières prestations terminées.
              </p>
            </div>
          </section>
        ) : (
          <div className="space-y-3">
            {sorted.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-navy">
                    {review.author.firstName} {review.author.lastName}
                  </span>
                  <span className="flex items-center gap-0.5 text-gold">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </span>
                </div>
                {review.comment && (
                  <p className="mt-2 text-sm leading-relaxed text-navy/70">{review.comment}</p>
                )}
                <p className="mt-2 text-xs text-muted/70">
                  {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <aside className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
        <h4 className="font-display text-sm font-bold text-navy">Distribution des notes</h4>
        <div className="mt-4 space-y-2.5">
          {distribution.map((d) => (
            <div key={d.star} className="flex items-center gap-2 text-xs">
              <span className="flex w-4 items-center gap-0.5 font-semibold text-navy/70">
                {d.star}
              </span>
              <Star className="h-3 w-3 flex-shrink-0 fill-gold text-gold" />
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-navy/5">
                <div
                  className="h-full rounded-full bg-gold"
                  style={{ width: `${(d.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-4 flex-shrink-0 text-right font-semibold text-navy">
                {d.count}
              </span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
