import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageHero } from "@/components/marketing/page-sections";

export const metadata = {
  title: "Conditions générales — Event Prest'Art",
  description: "Conditions générales d'utilisation et de vente de la plateforme Event Prest'Art.",
};

// Contenu provisoire : à relire et valider juridiquement par l'agence avant la mise en production.
const SECTIONS: { id: string; title: string; paragraphs: string[] }[] = [
  {
    id: "objet",
    title: "1. Objet",
    paragraphs: [
      "Les présentes conditions générales régissent l'utilisation de la plateforme Event Prest'Art, qui met en relation des organisateurs d'événements (« Clients ») avec des artistes et techniciens du spectacle (« Talents »).",
      "En créant un compte ou en utilisant la plateforme, vous acceptez sans réserve les présentes conditions.",
    ],
  },
  {
    id: "comptes",
    title: "2. Création de compte",
    paragraphs: [
      "L'accès aux fonctionnalités de réservation nécessite un compte personnel. L'utilisateur s'engage à fournir des informations exactes et à préserver la confidentialité de ses identifiants.",
      "Les profils de Talents sont soumis à la validation de l'équipe Event Prest'Art avant publication. Event Prest'Art se réserve le droit de refuser, suspendre ou supprimer un profil ne respectant pas les présentes conditions.",
    ],
  },
  {
    id: "reservations",
    title: "3. Réservations",
    paragraphs: [
      "Le Client adresse une demande de réservation au Talent, qui peut l'accepter, la refuser ou formuler une contre-proposition. La réservation devient ferme lorsque les deux parties l'ont confirmée.",
      "Le Talent s'engage à réaliser la prestation convenue à la date, au lieu et dans les conditions définies lors de la réservation.",
    ],
  },
  {
    id: "paiements",
    title: "4. Prix et paiement",
    paragraphs: [
      "Les prix sont exprimés en francs CFA (F CFA), toutes taxes comprises. Le paiement s'effectue sur la plateforme par Wave, Orange Money ou carte bancaire.",
      "Les sommes versées sont conservées par la plateforme puis reversées au Talent après la réalisation de la prestation, déduction faite de la commission de service d'Event Prest'Art.",
    ],
  },
  {
    id: "annulation",
    title: "5. Annulation et remboursement",
    paragraphs: [
      "Les conditions d'annulation applicables sont communiquées au moment de la réservation. En cas d'annulation par le Talent, le Client est intégralement remboursé.",
    ],
  },
  {
    id: "obligations",
    title: "6. Obligations des utilisateurs",
    paragraphs: [
      "Les utilisateurs s'interdisent tout contenu illicite, trompeur ou portant atteinte aux droits de tiers, ainsi que tout contournement de la plateforme pour conclure une réservation initiée sur celle-ci.",
      "Les Talents garantissent détenir les droits sur les photos, vidéos et contenus qu'ils publient.",
    ],
  },
  {
    id: "donnees",
    title: "7. Données personnelles",
    paragraphs: [
      "Event Prest'Art collecte les données strictement nécessaires au fonctionnement du service (identité, coordonnées, historique de réservations, échanges). Elles ne sont jamais revendues à des tiers.",
      "Conformément à la loi sénégalaise n° 2008-12 sur la protection des données à caractère personnel, vous disposez d'un droit d'accès, de rectification et de suppression de vos données, que vous pouvez exercer en écrivant à contact@eventprestart.sn.",
    ],
  },
  {
    id: "responsabilite",
    title: "8. Responsabilité",
    paragraphs: [
      "Event Prest'Art agit en qualité d'intermédiaire. La prestation artistique ou technique relève de la responsabilité du Talent, dans la limite des obligations prévues par la loi.",
    ],
  },
  {
    id: "droit",
    title: "9. Droit applicable",
    paragraphs: [
      "Les présentes conditions sont soumises au droit sénégalais. À défaut de résolution amiable, tout litige relèvera des juridictions compétentes de Dakar.",
    ],
  },
];

export default function CguPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHero
          badge="Informations légales"
          tone="gold"
          title="Conditions générales"
          description="Conditions générales d'utilisation et de vente de la plateforme Event Prest'Art."
        />

        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[240px_1fr]">
          <nav className="hidden lg:block">
            <div className="sticky top-28 space-y-0.5">
              {SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block rounded-lg px-3 py-1.5 text-sm text-navy/60 transition-colors hover:bg-navy/5 hover:text-navy"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </nav>

          <article className="max-w-3xl space-y-10 rounded-3xl border border-navy/10 bg-white p-6 shadow-sm shadow-navy/5 sm:p-10">
            <p className="text-xs text-muted">Dernière mise à jour : septembre 2026</p>
            {SECTIONS.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-28">
                <h2 className="font-display text-lg font-bold text-navy">{section.title}</h2>
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-navy/70">
                  {section.paragraphs.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </section>
            ))}
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
