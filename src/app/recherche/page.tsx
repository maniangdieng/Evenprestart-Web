import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { TalentCard } from "@/components/talents/talent-card";
import { searchTalents, toTalentCardData } from "@/lib/api";

const SUBCATEGORIES = ["Mbalax", "Afro-soul", "Jazz / Live band", "Rap / Hip-hop"];

/** Recherche multicritères (cahier des charges 4.A), branchée sur GET /api/talents. */
export default async function RecherchePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const categorie =
    typeof params.categorie === "string" ? params.categorie : undefined;
  const location =
    typeof params.location === "string" && params.location !== ""
      ? params.location
      : undefined;

  const results = await searchTalents({
    categorySlug: categorie,
    location,
    pageSize: 24,
  }).catch(() => ({ items: [], total: 0, page: 1, pageSize: 24 }));
  const talents = results.items.map(toTalentCardData);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid gap-8 md:grid-cols-[220px_1fr]">
            <aside className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-sm font-bold text-navy">Filtres</h2>
                <span className="text-xs font-semibold text-lime-dark">Effacer</span>
              </div>

              <div>
                <div className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">
                  Budget
                </div>
                <div className="h-1.5 rounded-full bg-navy/10">
                  <div className="h-full w-2/3 rounded-full bg-lime" />
                </div>
                <div className="mt-2 flex justify-between text-xs text-muted">
                  <span>100k F</span>
                  <span>650k F</span>
                </div>
              </div>

              <div>
                <div className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">
                  Sous-catégorie
                </div>
                <div className="space-y-2">
                  {SUBCATEGORIES.map((sub) => (
                    <label key={sub} className="flex items-center gap-2 text-sm text-navy/80">
                      <input type="checkbox" className="rounded border-navy/20 accent-lime" />
                      {sub}
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-lime/30 bg-lime/10 px-3 py-3 text-sm font-semibold text-navy">
                Disponible aujourd&apos;hui
              </div>
            </aside>

            <section>
              <p className="mb-4 text-sm text-muted">
                <strong className="text-navy">{results.total} talents</strong>{" "}
                disponibles à Dakar
                {categorie ? ` · ${categorie}` : ""}
              </p>
              {talents.length > 0 ? (
                <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
                  {talents.map((talent) => (
                    <TalentCard key={talent.id} talent={talent} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">
                  Aucun talent ne correspond à ces critères pour le moment.
                </p>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
