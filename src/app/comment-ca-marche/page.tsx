import {
  Search,
  Send,
  MessagesSquare,
  CreditCard,
  Sparkles,
  UserPlus,
  Images,
  BadgeCheck,
  CalendarCheck,
  Wallet,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/reveal";
import { CtaBand, PageHero } from "@/components/marketing/page-sections";

export const metadata = {
  title: "Comment ça marche — Event Prest'Art",
  description: "Réserver un talent ou être réservé : le parcours pas à pas.",
};

type Step = { icon: LucideIcon; title: string; description: string };

const CLIENT_STEPS: Step[] = [
  {
    icon: Search,
    title: "Trouvez le bon talent",
    description:
      "Filtrez par catégorie, ville ou budget. Consultez les photos, vidéos, formules et avis de chaque profil.",
  },
  {
    icon: Send,
    title: "Envoyez votre demande",
    description:
      "Indiquez la date, le lieu et le type d'événement. L'artiste reçoit votre demande instantanément.",
  },
  {
    icon: MessagesSquare,
    title: "Échangez et validez",
    description:
      "L'artiste accepte ou propose un autre tarif. Discutez des détails via la messagerie intégrée.",
  },
  {
    icon: CreditCard,
    title: "Payez en toute sécurité",
    description:
      "Réglez par Wave, Orange Money ou carte. Votre paiement est protégé par la plateforme.",
  },
  {
    icon: Sparkles,
    title: "Profitez de l'événement",
    description:
      "Le talent assure sa prestation. Laissez ensuite un avis pour aider la communauté.",
  },
];

const ARTIST_STEPS: Step[] = [
  {
    icon: UserPlus,
    title: "Créez votre compte",
    description: "Inscription gratuite : choisissez votre nom de scène, vos catégories et votre tarif.",
  },
  {
    icon: Images,
    title: "Soignez votre vitrine",
    description:
      "Photo de profil, couverture, galerie de photos et vidéos, formules : montrez votre talent.",
  },
  {
    icon: BadgeCheck,
    title: "Faites-vous valider",
    description: "Notre équipe vérifie votre profil puis le publie sur la plateforme.",
  },
  {
    icon: CalendarCheck,
    title: "Recevez des demandes",
    description:
      "Acceptez, refusez ou faites une contre-proposition. Vous restez maître de votre agenda.",
  },
  {
    icon: Wallet,
    title: "Soyez payé",
    description: "Le paiement est sécurisé à la réservation et vous est reversé après la prestation.",
  },
];

function StepList({ steps, accent }: { steps: Step[]; accent: "lime" | "terracotta" }) {
  const accentClasses =
    accent === "lime" ? "bg-navy text-lime" : "bg-terracotta/15 text-terracotta";
  return (
    <div className="relative mt-10 space-y-8 before:absolute before:bottom-6 before:left-6 before:top-6 before:w-px before:bg-navy/10">
      {steps.map((step, i) => (
        <Reveal key={step.title} delay={i * 80}>
          <div className="relative flex gap-5">
            <span
              className={`relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${accentClasses}`}
            >
              <step.icon className="h-5 w-5" />
            </span>
            <div className="pt-1">
              <div className="font-display text-xs font-bold uppercase tracking-wide text-navy/40">
                Étape {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="font-display text-lg font-bold text-navy">{step.title}</h3>
              <p className="mt-1 max-w-md text-sm text-muted">{step.description}</p>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export default function CommentCaMarchePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHero
          badge="Simple & sécurisé"
          title="Comment ça marche ?"
          description="Que vous organisiez un événement ou que vous soyez artiste, Event Prest'Art simplifie chaque étape de la réservation."
        >
          <ButtonLink href="#organisateurs">Je suis organisateur</ButtonLink>
          <ButtonLink
            href="#artistes"
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Je suis artiste
          </ButtonLink>
        </PageHero>

        <div className="mx-auto grid max-w-6xl gap-16 px-6 py-16 md:py-24 lg:grid-cols-2">
          <section id="organisateurs" className="scroll-mt-28">
            <Badge tone="lime">Organisateurs</Badge>
            <h2 className="mt-4 font-display text-3xl font-bold text-navy">
              Réservez le talent idéal
            </h2>
            <StepList steps={CLIENT_STEPS} accent="lime" />
            <ButtonLink href="/recherche" className="mt-10">
              Parcourir les talents
            </ButtonLink>
          </section>

          <section
            id="artistes"
            className="scroll-mt-28 rounded-3xl bg-cream-deep p-6 sm:p-8 lg:-my-8 lg:py-8"
          >
            <Badge tone="terracotta">Artistes & techniciens</Badge>
            <h2 className="mt-4 font-display text-3xl font-bold text-navy">
              Développez votre activité
            </h2>
            <StepList steps={ARTIST_STEPS} accent="terracotta" />
            <ButtonLink href="/inscription-artiste" className="mt-10">
              Devenir artiste
            </ButtonLink>
          </section>
        </div>

        <section className="bg-navy px-6 py-16 text-white">
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Profils vérifiés",
                text: "Chaque talent est contrôlé par notre équipe avant publication.",
              },
              {
                icon: CreditCard,
                title: "Paiement protégé",
                text: "Wave, Orange Money ou carte : l'argent n'est reversé qu'après la prestation.",
              },
              {
                icon: MessagesSquare,
                title: "Support réactif",
                text: "Une question ? Notre équipe vous répond directement depuis le chat.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <item.icon className="h-6 w-6 flex-shrink-0 text-lime" />
                <div>
                  <h3 className="font-display font-bold">{item.title}</h3>
                  <p className="mt-1 text-sm text-white/60">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
