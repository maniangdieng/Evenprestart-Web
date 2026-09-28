import Link from "next/link";
import { Star, CircleCheck, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TalentCard } from "@/components/talents/talent-card";
import { ArtistCarousel } from "@/components/marketing/artist-carousel";
import { Reveal } from "@/components/marketing/reveal";
import { getCategories, searchTalents, toTalentCardData } from "@/lib/api";
import { HOW_IT_WORKS, WHY_CHOOSE_US } from "@/lib/marketing-content";
import { getCategoryIcon } from "@/lib/category-icons";

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    getCategories().catch(() => []),
    searchTalents({ pageSize: 100 }).catch(() => ({ items: [], total: 0, page: 1, pageSize: 100 })),
  ]);
  const featuredTalents = featured.items.map(toTalentCardData);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_420px_at_85%_10%,rgba(199,226,63,0.12),transparent_60%),radial-gradient(600px_500px_at_5%_90%,rgba(224,138,76,0.12),transparent_60%)]" />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-24">
            <div>
              <Badge tone="lime">
                <Star className="h-3 w-3 fill-current" /> 340+ talents vérifiés au Sénégal
              </Badge>
              <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight text-navy md:text-5xl">
                Réservez l&apos;artiste parfait pour{" "}
                <span className="text-lime-dark">chaque</span> moment.
              </h1>
              <p className="mt-5 max-w-md text-muted">
                Musiciens, danseurs, DJ, techniciens son &amp; lumière. Devis
                instantané, paiement Wave &amp; Orange Money sécurisé, contrat
                automatique.
              </p>

              <form
                action="/recherche"
                className="mt-8 flex max-w-xl flex-col gap-2 rounded-2xl border border-navy/10 bg-white p-2 shadow-lg shadow-navy/5 sm:flex-row sm:items-stretch"
              >
                <label className="flex-1 px-3 py-2">
                  <span className="block text-[10px] font-bold uppercase tracking-wide text-muted">
                    Prestation
                  </span>
                  <input
                    name="q"
                    placeholder="Chanteur, DJ, danseurs…"
                    className="w-full bg-transparent text-sm font-semibold text-navy outline-none placeholder:font-normal placeholder:text-muted"
                  />
                </label>
                <div className="hidden w-px bg-navy/10 sm:block" />
                <label className="flex-1 px-3 py-2">
                  <span className="block text-[10px] font-bold uppercase tracking-wide text-muted">
                    Lieu
                  </span>
                  <input
                    name="location"
                    placeholder="Dakar"
                    className="w-full bg-transparent text-sm font-semibold text-navy outline-none placeholder:font-normal placeholder:text-muted"
                  />
                </label>
                <button
                  type="submit"
                  className="rounded-xl bg-lime px-6 py-3 font-display text-sm font-bold text-navy transition-colors hover:bg-lime-dark hover:text-white"
                >
                  Chercher
                </button>
              </form>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <CircleCheck className="h-3.5 w-3.5 text-lime-dark" /> Sans frais cachés
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CircleCheck className="h-3.5 w-3.5 text-lime-dark" /> Annulation flexible
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CircleCheck className="h-3.5 w-3.5 text-lime-dark" /> Support 7j/7
                </span>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {["from-lime to-lime-dark", "from-terracotta to-gold", "from-gold to-terracotta", "from-navy-light to-navy"].map(
                    (g, i) => (
                      <div
                        key={i}
                        className={`h-8 w-8 rounded-full border-2 border-cream bg-gradient-to-br ${g}`}
                      />
                    ),
                  )}
                </div>
                <div className="text-xs text-muted">
                  <span className="font-display font-bold text-navy">4.8/5</span>{" "}
                  sur 620+ avis clients
                </div>
              </div>
            </div>

            <div className="relative flex h-[24rem] items-center justify-center lg:h-[32rem]">
              <ArtistCarousel talents={featuredTalents} />
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        {categories.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 pb-20 pt-4">
            <Reveal className="mb-6 flex items-baseline justify-between">
              <h2 className="font-display text-2xl font-bold text-navy">
                Explorez par catégorie
              </h2>
              <Link
                href="/categories"
                className="inline-flex items-center gap-1 text-sm font-semibold text-lime-dark"
              >
                Toutes les catégories <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Reveal>
            <Reveal className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
              {categories.slice(0, 12).map((category) => {
                const CategoryIcon = getCategoryIcon(category.slug);
                return (
                  <Link
                    key={category.slug}
                    href={`/recherche?categorie=${category.slug}`}
                    className="group flex flex-col items-center gap-3 rounded-2xl border border-navy/10 bg-white px-4 py-6 text-center transition-all hover:-translate-y-1 hover:border-lime hover:shadow-lg hover:shadow-navy/10"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-lime transition-transform group-hover:scale-110">
                      <CategoryIcon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-semibold text-navy">{category.name}</span>
                  </Link>
                );
              })}
            </Reveal>
          </section>
        )}

        {/* COMMENT CA MARCHE */}
        <section className="bg-cream-deep px-6 py-16 md:py-20">
          <div className="mx-auto max-w-6xl">
            <Reveal className="mx-auto max-w-xl text-center">
              <Badge tone="gold">Simple &amp; rapide</Badge>
              <h2 className="mt-4 font-display text-3xl font-bold text-navy">
                Réservez en 3 étapes
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {HOW_IT_WORKS.map((item, i) => (
                <Reveal key={item.step} delay={i * 120} className="group relative text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-lime transition-transform group-hover:scale-110">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="mt-4 font-display text-xs font-bold uppercase tracking-wide text-lime-dark">
                    Étape {item.step}
                  </div>
                  <h3 className="mt-1 font-display text-lg font-bold text-navy">
                    {item.title}
                  </h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm text-muted">
                    {item.description}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED TALENTS */}
        <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <Reveal className="mb-6 flex items-baseline justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-navy">
                Talents en vedette
              </h2>
              <p className="mt-1 text-sm text-muted">
                Sélectionnés pour leur qualité et leur fiabilité.
              </p>
            </div>
            <Link
              href="/recherche"
              className="inline-flex items-center gap-1 text-sm font-semibold text-lime-dark"
            >
              Voir tout <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Reveal>
          {featuredTalents.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredTalents.map((talent) => (
                <TalentCard key={talent.id} talent={talent} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">
              Aucun talent publié pour le moment.
            </p>
          )}
        </section>

        {/* WHY CHOOSE US */}
        <section className="bg-cream-deep px-6 py-16 md:py-20">
          <div className="mx-auto max-w-6xl">
            <Reveal className="mx-auto max-w-xl text-center">
              <Badge tone="terracotta">Pourquoi Event Prest&apos;Art</Badge>
              <h2 className="mt-4 font-display text-3xl font-bold text-navy">
                Réserver en toute confiance
              </h2>
            </Reveal>
            <Reveal className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {WHY_CHOOSE_US.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm shadow-navy/5 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-navy/10"
                >
                  <item.icon className="h-6 w-6 text-terracotta" />
                  <h3 className="mt-3 font-display text-sm font-bold text-navy">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{item.description}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* TRUST BAND */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <Reveal className="flex flex-col items-center justify-between gap-8 rounded-3xl bg-navy px-8 py-10 text-white md:flex-row">
            <div className="flex flex-wrap justify-center gap-10 text-center md:justify-start md:text-left">
              <div>
                <div className="font-display text-3xl font-bold text-lime">340+</div>
                <div className="text-sm text-white/60">Talents vérifiés</div>
              </div>
              <div>
                <div className="font-display text-3xl font-bold">1 200+</div>
                <div className="text-sm text-white/60">Prestations réservées</div>
              </div>
              <div>
                <div className="inline-flex items-center gap-1 font-display text-3xl font-bold">
                  4.8 <Star className="h-5 w-5 fill-lime text-lime" />
                </div>
                <div className="text-sm text-white/60">Note moyenne</div>
              </div>
              <div>
                <div className="font-display text-3xl font-bold">&lt; 4</div>
                <div className="text-sm text-white/60">Clics pour réserver</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/60">
              Paiement par
              <span className="rounded-lg bg-white/10 px-3 py-1.5 font-bold text-white">Wave</span>
              <span className="rounded-lg bg-white/10 px-3 py-1.5 font-bold text-[#ff7900]">Orange Money</span>
              <span className="rounded-lg bg-white/10 px-3 py-1.5 font-bold text-white">Stripe</span>
            </div>
          </Reveal>
        </section>

        {/* DUAL CTA */}
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="grid gap-5 md:grid-cols-2">
            <Reveal className="rounded-3xl border border-navy/10 bg-white p-8 text-center shadow-sm shadow-navy/5 md:text-left">
              <h2 className="font-display text-xl font-bold text-navy">
                Vous organisez un événement ?
              </h2>
              <p className="mt-2 text-sm text-muted">
                Trouvez et réservez le talent parfait en quelques clics.
              </p>
              <ButtonLink href="/recherche" className="mt-6 inline-flex">
                Trouver un talent
              </ButtonLink>
            </Reveal>
            <Reveal
              delay={120}
              className="rounded-3xl bg-navy p-8 text-center text-white shadow-sm shadow-navy/5 md:text-left"
            >
              <h2 className="font-display text-xl font-bold">
                Vous êtes artiste ou technicien ?
              </h2>
              <p className="mt-2 text-sm text-white/60">
                Créez votre profil, gérez votre calendrier et recevez vos
                paiements en toute sécurité.
              </p>
              <ButtonLink href="/inscription-artiste" className="mt-6 inline-flex">
                Rejoindre la plateforme
              </ButtonLink>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
