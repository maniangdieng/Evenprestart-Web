import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Reveal } from "@/components/marketing/reveal";
import { CtaBand, PageHero } from "@/components/marketing/page-sections";
import { ButtonLink } from "@/components/ui/button";
import { getCategories, searchTalents, toTalentCardData, type TalentProfileDto } from "@/lib/api";
import { getCategoryIcon } from "@/lib/category-icons";

export const metadata = {
  title: "Catégories — Event Prest'Art",
  description: "Musique, danse, animation, technique : trouvez le bon prestataire par catégorie.",
};

const TONES = [
  { icon: "bg-lime/15 text-lime-dark", hover: "hover:border-lime/70" },
  { icon: "bg-terracotta/15 text-terracotta", hover: "hover:border-terracotta/60" },
  { icon: "bg-gold/20 text-gold", hover: "hover:border-gold/70" },
  { icon: "bg-navy text-lime", hover: "hover:border-navy/40" },
];

export default async function CategoriesPage() {
  const [categories, talents] = await Promise.all([
    getCategories().catch(() => []),
    searchTalents({ pageSize: 100 })
      .then((r) => r.items)
      .catch((): TalentProfileDto[] => []),
  ]);

  // Nombre de talents et aperçu photo par catégorie, à partir d'une seule requête.
  const statsBySlug = new Map<string, { count: number; images: string[] }>();
  for (const talent of talents) {
    const image = toTalentCardData(talent).imageUrl;
    for (const { category } of talent.categories) {
      const entry = statsBySlug.get(category.slug) ?? { count: 0, images: [] };
      entry.count += 1;
      if (image && entry.images.length < 3) entry.images.push(image);
      statsBySlug.set(category.slug, entry);
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHero
          badge="Nos univers"
          title="Trouvez le talent par catégorie"
          description="Musiciens, DJ, danseurs, animateurs, techniciens… explorez nos univers et trouvez le prestataire qui fera vibrer votre événement."
        >
          <ButtonLink href="/recherche">
            <Search className="h-4 w-4" /> Rechercher un talent
          </ButtonLink>
        </PageHero>

        <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          {categories.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category, i) => {
                const CategoryIcon = getCategoryIcon(category.slug);
                const tone = TONES[i % TONES.length];
                const stats = statsBySlug.get(category.slug);
                const count = stats?.count ?? 0;
                return (
                  <Reveal key={category.id} delay={(i % 3) * 80}>
                    <Link
                      href={`/recherche?categorie=${category.slug}`}
                      className={`group flex h-full flex-col rounded-2xl border border-navy/10 bg-white p-6 shadow-sm shadow-navy/5 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-navy/10 ${tone.hover}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <span
                          className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${tone.icon}`}
                        >
                          <CategoryIcon className="h-6 w-6" />
                        </span>
                        {stats && stats.images.length > 0 && (
                          <div className="flex -space-x-3">
                            {stats.images.map((src) => (
                              <span
                                key={src}
                                className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-white bg-navy/10"
                              >
                                <Image src={src} alt="" fill sizes="36px" className="object-cover" />
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <h2 className="mt-5 font-display text-lg font-bold text-navy">
                        {category.name}
                      </h2>
                      <p className="mt-1.5 flex-1 text-sm text-muted">
                        {category.description ??
                          `Découvrez nos talents en ${category.name.toLowerCase()} pour animer votre événement.`}
                      </p>

                      <div className="mt-5 flex items-center justify-between border-t border-navy/10 pt-4 text-sm">
                        <span className="font-semibold text-navy/60">
                          {count === 0
                            ? "Bientôt disponible"
                            : `${count} talent${count > 1 ? "s" : ""}`}
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-lime-dark">
                          Voir les talents
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-sm text-muted">
              Aucune catégorie disponible pour le moment.
            </p>
          )}

          <Reveal className="mt-12 flex flex-col items-center gap-4 rounded-3xl bg-cream-deep p-8 text-center sm:flex-row sm:text-left">
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-navy text-lime">
              <Sparkles className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <h3 className="font-display text-lg font-bold text-navy">
                Vous ne trouvez pas ce que vous cherchez ?
              </h3>
              <p className="text-sm text-muted">
                Décrivez-nous votre besoin : notre équipe trouve pour vous le talent ou la
                prestation sur mesure.
              </p>
            </div>
            <ButtonLink href="/contact?sujet=recherche">Demande sur mesure</ButtonLink>
          </Reveal>
        </section>

        <CtaBand
          title="Vous êtes artiste ou technicien ?"
          description="Rejoignez Event Prest'Art gratuitement et recevez des demandes de réservation partout au Sénégal."
          primary={{ href: "/inscription-artiste", label: "Devenir artiste" }}
          secondary={{ href: "/comment-ca-marche#artistes", label: "Comment ça marche" }}
        />
      </main>
      <Footer />
    </>
  );
}
