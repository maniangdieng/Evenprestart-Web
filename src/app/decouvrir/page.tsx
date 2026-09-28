import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Music,
  Briefcase,
  PartyPopper,
  Baby,
  Landmark,
  Gem,
  Target,
  Eye,
  Handshake,
  MapPin,
  Globe,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroBackground } from "@/components/marketing/hero-background";
import { Reveal } from "@/components/marketing/reveal";
import { CtaBand } from "@/components/marketing/page-sections";
import { TalentCard } from "@/components/talents/talent-card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import {
  HOW_IT_WORKS,
  SERVICES,
  SERVICE_TONE_CLASSES,
  STATS,
  WHY_CHOOSE_US,
} from "@/lib/marketing-content";
import { getCategories, searchTalents, toTalentCardData } from "@/lib/api";
import { getCategoryIcon } from "@/lib/category-icons";
import { getHeroMedia } from "@/lib/hero-media";

export const metadata = {
  title: "Découvrir l'agence — Event Prest'Art",
  description:
    "Agence de booking et de management d'artistes et techniciens du spectacle au Sénégal.",
};

const VALUES = [
  {
    icon: Target,
    title: "Notre mission",
    text: "Rendre la réservation d'artistes et de techniciens simple, rapide et sûre, pour que chaque événement soit une réussite.",
  },
  {
    icon: Eye,
    title: "Notre vision",
    text: "Devenir la référence du spectacle vivant au Sénégal et offrir aux talents locaux une vitrine à la hauteur de leur art.",
  },
  {
    icon: Handshake,
    title: "Nos engagements",
    text: "Des profils vérifiés, des prix transparents, des paiements protégés et un accompagnement humain à chaque étape.",
  },
];

const EVENT_TYPES = [
  { icon: Gem, title: "Mariages", text: "Griots, orchestres, DJ et animateurs pour une célébration inoubliable." },
  { icon: Briefcase, title: "Entreprises", text: "Séminaires, galas, lancements de produit et soirées de fin d'année." },
  { icon: Music, title: "Concerts & festivals", text: "Artistes, techniciens son et lumière, régie et matériel scénique." },
  { icon: Baby, title: "Baptêmes & familles", text: "Animations, chants et ambiance pour les grands moments en famille." },
  { icon: PartyPopper, title: "Anniversaires & soirées", text: "DJ, danseurs et humoristes pour faire vibrer vos invités." },
  { icon: Landmark, title: "Événements culturels", text: "Institutions, associations et collectivités : programmation sur mesure." },
];

const CITIES = [
  "Dakar",
  "Thiès",
  "Saint-Louis",
  "Saly & Mbour",
  "Touba",
  "Kaolack",
  "Ziguinchor",
  "Tambacounda",
];

export default async function DecouvrirPage() {
  const heroMedia = getHeroMedia();
  const [categories, featured] = await Promise.all([
    getCategories().catch(() => []),
    searchTalents({ pageSize: 4 }).catch(() => ({ items: [], total: 0, page: 1, pageSize: 4 })),
  ]);
  const featuredTalents = featured.items.slice(0, 4).map(toTalentCardData);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* HERO */}
        <section className="relative isolate flex min-h-[560px] items-center overflow-hidden text-white">
          <HeroBackground videoSrc={heroMedia.videoSrc} posterSrc={heroMedia.posterSrc} />
          <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
            <Badge tone="lime">Agence événementielle · Sénégal</Badge>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Event Prest&apos;Art met en scène vos événements
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-white/70">
              Une agence de booking &amp; de management d&apos;artistes et de techniciens du
              spectacle, qui connecte talents et organisateurs partout au Sénégal.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href="/recherche">Découvrir nos talents</ButtonLink>
              <ButtonLink
                href="/contact"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Nous contacter
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* QUI SOMMES-NOUS */}
        <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <Reveal>
              <Badge tone="terracotta">Qui sommes-nous</Badge>
              <h2 className="mt-4 font-display text-3xl font-bold text-navy">
                L&apos;agence qui relie artistes et organisateurs
              </h2>
              <p className="mt-4 text-muted">
                Event Prest&apos;Art est née d&apos;un constat simple : trouver l&apos;artiste ou le
                technicien fiable, disponible et adapté à son événement prend trop de temps. Nous
                avons construit une plateforme et une équipe pour rendre ce processus simple,
                rapide et sécurisé.
              </p>
              <p className="mt-4 text-muted">
                Du casting à la contractualisation, en passant par le paiement, nous accompagnons
                chaque étape de la réservation — pour les particuliers comme pour les entreprises.
              </p>
            </Reveal>
            <Reveal delay={120} className="grid grid-cols-3 gap-4">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-navy/10 bg-white p-5 text-center shadow-sm shadow-navy/5"
                >
                  <div className="font-display text-2xl font-bold text-lime-dark">{stat.value}</div>
                  <div className="mt-1 text-xs text-muted">{stat.label}</div>
                </div>
              ))}
            </Reveal>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {VALUES.map((value, i) => (
              <Reveal
                key={value.title}
                delay={i * 100}
                className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm shadow-navy/5"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-lime">
                  <value.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-navy">{value.title}</h3>
                <p className="mt-2 text-sm text-muted">{value.text}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CE QUE NOUS FAISONS */}
        <section className="bg-cream-deep px-6 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <Reveal className="mx-auto max-w-xl text-center">
              <Badge tone="gold">Ce que nous faisons</Badge>
              <h2 className="mt-4 font-display text-3xl font-bold text-navy">
                Tout ce qu&apos;il faut pour réussir votre événement
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {SERVICES.map((service, i) => (
                <Reveal
                  key={service.title}
                  delay={i * 80}
                  className="group rounded-2xl border border-navy/10 bg-white p-6 shadow-sm shadow-navy/5 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-navy/10"
                >
                  <span
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${SERVICE_TONE_CLASSES[service.tone]}`}
                  >
                    <service.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold text-navy">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted">{service.description}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* TYPES D'ÉVÉNEMENTS */}
        <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <Reveal className="mx-auto max-w-xl text-center">
            <Badge tone="lime">Pour chaque occasion</Badge>
            <h2 className="mt-4 font-display text-3xl font-bold text-navy">
              Des talents pour tous vos événements
            </h2>
            <p className="mt-3 text-muted">
              Des cérémonies familiales aux grandes scènes, nous trouvons la bonne formule.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {EVENT_TYPES.map((event, i) => (
              <Reveal
                key={event.title}
                delay={(i % 3) * 100}
                className="group flex gap-4 rounded-2xl border border-navy/10 bg-white p-5 transition-colors hover:border-lime/60"
              >
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-lime/15 text-lime-dark transition-colors group-hover:bg-lime group-hover:text-navy">
                  <event.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display font-bold text-navy">{event.title}</h3>
                  <p className="mt-1 text-sm text-muted">{event.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CATÉGORIES */}
        {categories.length > 0 && (
          <section className="bg-navy px-6 py-16 text-white md:py-24">
            <div className="mx-auto max-w-6xl">
              <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <Badge tone="lime">Nos talents</Badge>
                  <h2 className="mt-4 font-display text-3xl font-bold">Explorez par catégorie</h2>
                </div>
                <Link
                  href="/categories"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-lime hover:underline"
                >
                  Toutes les catégories <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Reveal>
              <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {categories.slice(0, 8).map((category) => {
                  const CategoryIcon = getCategoryIcon(category.slug);
                  return (
                    <Link
                      key={category.id}
                      href={`/recherche?categorie=${category.slug}`}
                      className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-lime/50 hover:bg-white/10"
                    >
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-lime/15 text-lime">
                        <CategoryIcon className="h-5 w-5" />
                      </span>
                      <span className="text-sm font-semibold">{category.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* COMMENT ÇA MARCHE */}
        <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <Reveal className="mx-auto max-w-xl text-center">
            <Badge tone="gold">Simple &amp; rapide</Badge>
            <h2 className="mt-4 font-display text-3xl font-bold text-navy">Réservez en 3 étapes</h2>
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {HOW_IT_WORKS.map((item, i) => (
              <Reveal key={item.step} delay={i * 120} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-lime">
                  <item.icon className="h-6 w-6" />
                </div>
                <div className="mt-4 font-display text-xs font-bold uppercase tracking-wide text-lime-dark">
                  Étape {item.step}
                </div>
                <h3 className="mt-1 font-display text-lg font-bold text-navy">{item.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-muted">{item.description}</p>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/comment-ca-marche"
              className="inline-flex items-center gap-1 text-sm font-semibold text-lime-dark hover:underline"
            >
              Voir le parcours en détail <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* TALENTS */}
        {featuredTalents.length > 0 && (
          <section className="bg-cream-deep px-6 py-16 md:py-24">
            <div className="mx-auto max-w-6xl">
              <Reveal className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <Badge tone="terracotta">Ils nous font confiance</Badge>
                  <h2 className="mt-4 font-display text-3xl font-bold text-navy">
                    Quelques-uns de nos talents
                  </h2>
                </div>
                <Link
                  href="/recherche"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-lime-dark hover:underline"
                >
                  Voir tous les talents <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Reveal>
              <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
                {featuredTalents.map((talent) => (
                  <TalentCard key={talent.id} talent={talent} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* POURQUOI NOUS + ZONES */}
        <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="grid gap-12 lg:grid-cols-2">
            <Reveal>
              <Badge tone="lime">Pourquoi Event Prest&apos;Art</Badge>
              <h2 className="mt-4 font-display text-3xl font-bold text-navy">
                Réserver en toute confiance
              </h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {WHY_CHOOSE_US.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-navy/10 bg-white p-5">
                    <item.icon className="h-6 w-6 text-terracotta" />
                    <h3 className="mt-3 font-display text-sm font-bold text-navy">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted">{item.description}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={120} className="rounded-3xl bg-navy p-8 text-white">
              <Badge tone="lime">Zones d&apos;intervention</Badge>
              <h2 className="mt-4 font-display text-2xl font-bold">
                Partout au Sénégal, et au-delà
              </h2>
              <p className="mt-3 text-sm text-white/60">
                Nos talents se déplacent dans tout le pays. Pour la diaspora, nous organisons aussi
                des prestations à l&apos;international sur demande.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {CITIES.map((city) => (
                  <span
                    key={city}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm"
                  >
                    <MapPin className="h-3.5 w-3.5 text-lime" />
                    {city}
                  </span>
                ))}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-lime px-3 py-1.5 text-sm font-semibold text-navy">
                  <Globe className="h-3.5 w-3.5" />
                  Diaspora
                </span>
              </div>
              <div className="mt-8 flex items-center gap-3 rounded-2xl bg-white/5 p-4 text-sm text-white/70">
                <Heart className="h-5 w-5 flex-shrink-0 text-terracotta" />
                Vous êtes artiste ?{" "}
                <Link href="/inscription-artiste" className="font-semibold text-lime hover:underline">
                  Rejoignez-nous gratuitement
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
