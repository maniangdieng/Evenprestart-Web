import Link from "next/link";
import { ChevronDown, Headset } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CtaBand, PageHero } from "@/components/marketing/page-sections";

export const metadata = {
  title: "FAQ — Event Prest'Art",
  description: "Les réponses aux questions fréquentes des organisateurs et des artistes.",
};

const FAQ_SECTIONS: {
  id: string;
  title: string;
  items: { question: string; answer: string }[];
}[] = [
  {
    id: "clients",
    title: "Organisateurs & clients",
    items: [
      {
        question: "Comment réserver un artiste ou un technicien ?",
        answer:
          "Recherchez un talent par catégorie, ville ou budget, ouvrez son profil puis envoyez une demande de réservation en précisant la date, le lieu et votre besoin. L'artiste accepte, refuse ou vous fait une contre-proposition ; dès que vous êtes d'accord, la réservation est confirmée.",
      },
      {
        question: "Dois-je créer un compte pour réserver ?",
        answer:
          "Oui. Un compte gratuit est nécessaire pour envoyer une demande, suivre vos réservations, échanger avec l'artiste et régler en toute sécurité. L'inscription prend moins d'une minute et votre email est vérifié par un code.",
      },
      {
        question: "Les artistes sont-ils vérifiés ?",
        answer:
          "Chaque profil est examiné par notre équipe avant d'être publié. Les talents portant le badge « Vérifié » ont fait l'objet d'un contrôle renforcé de leur identité et de leur expérience.",
      },
      {
        question: "Puis-je discuter avec l'artiste avant de réserver ?",
        answer:
          "Oui, la messagerie intégrée vous permet d'échanger directement avec l'artiste pour préciser le programme, la durée ou les besoins techniques de votre événement.",
      },
    ],
  },
  {
    id: "artistes",
    title: "Artistes & techniciens",
    items: [
      {
        question: "Comment rejoindre Event Prest'Art ?",
        answer:
          "Créez un compte artiste, complétez votre profil (nom de scène, catégories, bio, tarif de départ) et ajoutez des photos ou vidéos de vos prestations. Votre profil est publié après validation par notre équipe.",
      },
      {
        question: "Combien coûte l'inscription ?",
        answer:
          "L'inscription et la création de profil sont gratuites. Vous ne payez rien tant que vous n'êtes pas réservé.",
      },
      {
        question: "Suis-je libre d'accepter ou de refuser une demande ?",
        answer:
          "Absolument. Pour chaque demande, vous pouvez accepter, refuser ou proposer un autre tarif. Vous gardez la main sur votre calendrier et vos cachets.",
      },
      {
        question: "Comment améliorer la visibilité de mon profil ?",
        answer:
          "Ajoutez une photo de profil et une photo de couverture de qualité, une galerie fournie, une bio précise et des formules claires. Les avis laissés par vos clients après chaque prestation renforcent aussi votre classement.",
      },
    ],
  },
  {
    id: "paiements",
    title: "Paiements & annulations",
    items: [
      {
        question: "Quels moyens de paiement sont acceptés ?",
        answer:
          "Vous pouvez payer par Wave, Orange Money ou carte bancaire (Stripe). Le paiement se fait sur la plateforme une fois la réservation confirmée.",
      },
      {
        question: "Quand l'artiste est-il payé ?",
        answer:
          "Le montant est sécurisé par la plateforme au moment du paiement, puis reversé à l'artiste une fois la prestation réalisée. Cela protège à la fois l'organisateur et l'artiste.",
      },
      {
        question: "Puis-je annuler une réservation ?",
        answer:
          "Oui. Les conditions d'annulation et de remboursement dépendent du moment de l'annulation et de la prestation ; elles sont détaillées dans nos conditions générales.",
      },
      {
        question: "Y a-t-il des frais cachés ?",
        answer:
          "Non. Le prix affiché lors de la confirmation est le prix que vous payez.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHero
          badge="Centre d'aide"
          title="Questions fréquentes"
          description="Tout ce qu'il faut savoir pour réserver un talent ou être réservé sur Event Prest'Art."
        />

        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[220px_1fr]">
          <nav className="hidden lg:block">
            <div className="sticky top-28 space-y-1">
              {FAQ_SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block rounded-lg px-3 py-2 text-sm font-semibold text-navy/60 transition-colors hover:bg-navy/5 hover:text-navy"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </nav>

          <div className="space-y-12">
            {FAQ_SECTIONS.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-28">
                <h2 className="font-display text-xl font-bold text-navy">{section.title}</h2>
                <div className="mt-4 space-y-3">
                  {section.items.map((item) => (
                    <details
                      key={item.question}
                      className="group rounded-2xl border border-navy/10 bg-white shadow-sm shadow-navy/5 open:border-lime/60"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-display text-sm font-semibold text-navy [&::-webkit-details-marker]:hidden">
                        {item.question}
                        <ChevronDown className="h-4 w-4 flex-shrink-0 text-navy/40 transition-transform group-open:rotate-180" />
                      </summary>
                      <p className="px-5 pb-5 text-sm leading-relaxed text-muted">{item.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))}

            <div className="flex flex-col items-start gap-4 rounded-2xl border border-navy/10 bg-cream-deep p-6 sm:flex-row sm:items-center">
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-navy text-lime">
                <Headset className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <h3 className="font-display font-bold text-navy">
                  Vous ne trouvez pas votre réponse ?
                </h3>
                <p className="text-sm text-muted">
                  Utilisez la bulle de support en bas à droite ou écrivez-nous.
                </p>
              </div>
              <Link
                href="/contact"
                className="rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-lime transition-colors hover:bg-navy-light"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>

        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
