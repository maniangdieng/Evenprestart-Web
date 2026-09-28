import Link from "next/link";
import { ArrowRight, Clock, Headset, Mail, MapPin, Phone } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageHero } from "@/components/marketing/page-sections";
import { Reveal } from "@/components/marketing/reveal";
import { ContactForm } from "./contact-form";

export const metadata = {
  title: "Nous contacter — Event Prest'Art",
  description: "Une question, un projet, un partenariat ? L'équipe Event Prest'Art vous répond sous 24h.",
};

const CONTACT_DETAILS = [
  { icon: Mail, label: "Email", value: "contact@eventprestart.sn", hint: "Réponse sous 24h ouvrées" },
  { icon: Phone, label: "Téléphone / WhatsApp", value: "+221 77 000 00 00", hint: "Du lundi au samedi" },
  { icon: MapPin, label: "Adresse", value: "Dakar, Sénégal", hint: "Rendez-vous sur demande" },
];

const HOURS = [
  { days: "Lundi – Vendredi", hours: "9h – 19h" },
  { days: "Samedi", hours: "10h – 16h" },
  { days: "Dimanche", hours: "Support en ligne uniquement" },
];

const QUICK_FAQ = [
  { question: "Comment réserver un artiste ?", href: "/faq#clients" },
  { question: "Comment devenir artiste sur la plateforme ?", href: "/faq#artistes" },
  { question: "Quels moyens de paiement sont acceptés ?", href: "/faq#paiements" },
];

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const initialSubject = typeof params.sujet === "string" ? params.sujet : undefined;

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHero
          badge="Nous contacter"
          title="Parlons de votre événement"
          description="Une question, un projet, un partenariat ? Écrivez-nous, notre équipe vous répond sous 24h."
        />

        <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div className="space-y-4">
              {CONTACT_DETAILS.map((detail, i) => (
                <Reveal
                  key={detail.label}
                  delay={i * 80}
                  className="flex items-start gap-4 rounded-2xl border border-navy/10 bg-white p-5 shadow-sm shadow-navy/5"
                >
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-lime/15 text-lime-dark">
                    <detail.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wide text-muted">
                      {detail.label}
                    </div>
                    <div className="mt-0.5 font-display font-semibold text-navy">{detail.value}</div>
                    <div className="text-xs text-muted">{detail.hint}</div>
                  </div>
                </Reveal>
              ))}

              <Reveal delay={240} className="rounded-2xl bg-navy p-6 text-white">
                <div className="flex items-center gap-2 font-display font-bold">
                  <Clock className="h-5 w-5 text-lime" /> Horaires
                </div>
                <dl className="mt-4 space-y-2 text-sm">
                  {HOURS.map((h) => (
                    <div
                      key={h.days}
                      className="flex justify-between gap-4 border-b border-white/10 pb-2 last:border-0 last:pb-0"
                    >
                      <dt className="text-white/60">{h.days}</dt>
                      <dd className="text-right font-semibold">{h.hours}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>

              <Reveal
                delay={320}
                className="flex items-start gap-4 rounded-2xl border border-lime/50 bg-lime/10 p-5"
              >
                <Headset className="h-6 w-6 flex-shrink-0 text-lime-dark" />
                <p className="text-sm text-navy/80">
                  <span className="font-semibold text-navy">Besoin d&apos;une réponse rapide ?</span>{" "}
                  Connectez-vous et utilisez la bulle de support en bas à droite pour discuter en
                  direct avec notre équipe.
                </p>
              </Reveal>
            </div>

            <Reveal delay={120}>
              <ContactForm initialSubject={initialSubject} />
            </Reveal>
          </div>
        </section>

        <section className="bg-cream-deep px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center font-display text-2xl font-bold text-navy">
              Vous avez peut-être déjà la réponse
            </h2>
            <div className="mt-8 space-y-3">
              {QUICK_FAQ.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-navy/10 bg-white px-5 py-4 text-sm font-semibold text-navy transition-colors hover:border-lime/60"
                >
                  {item.question}
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-navy/30 transition-transform group-hover:translate-x-1 group-hover:text-lime-dark" />
                </Link>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link href="/faq" className="text-sm font-semibold text-lime-dark hover:underline">
                Voir toute la FAQ
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
