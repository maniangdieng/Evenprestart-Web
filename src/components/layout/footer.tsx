import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "../ui/logo";

const FOOTER_COLUMNS = [
  {
    title: "Plateforme",
    links: [
      { href: "/decouvrir", label: "Découvrir l'agence" },
      { href: "/recherche", label: "Trouver un talent" },
      { href: "/categories", label: "Catégories" },
      { href: "/comment-ca-marche", label: "Comment ça marche" },
    ],
  },
  {
    title: "Artistes",
    links: [
      { href: "/inscription-artiste", label: "Devenir artiste" },
      { href: "/connexion", label: "Espace artiste" },
      { href: "/comment-ca-marche#artistes", label: "Comment être réservé" },
      { href: "/faq#artistes", label: "FAQ artistes" },
    ],
  },
  {
    title: "Aide",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Nous contacter" },
      { href: "/cgu", label: "Conditions générales" },
      { href: "/cgu#donnees", label: "Données personnelles" },
    ],
  },
];

const CONTACT_ITEMS = [
  { icon: Mail, label: "contact@eventprestart.sn" },
  { icon: Phone, label: "+221 77 000 00 00" },
  { icon: MapPin, label: "Dakar, Sénégal" },
];

export function Footer() {
  return (
    <footer className="border-t border-navy/10 bg-navy text-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-3">
              <Logo />
              <span className="font-display text-base font-bold">PREST&apos;ART</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Marketplace de booking &amp; management d&apos;artistes et techniciens du
              spectacle, au Sénégal et pour la diaspora.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-white/70">
              {CONTACT_ITEMS.map((item) => (
                <li key={item.label} className="flex items-center gap-2.5">
                  <item.icon className="h-4 w-4 flex-shrink-0 text-lime" />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title}>
                <h3 className="font-display text-sm font-semibold text-lime">{column.title}</h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-white/65 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Event Prest&apos;Art. Tous droits réservés.</span>
          <div className="flex flex-wrap items-center gap-2">
            Paiement sécurisé :
            <span className="rounded-md bg-white/10 px-2 py-1 font-bold text-white/80">Wave</span>
            <span className="rounded-md bg-white/10 px-2 py-1 font-bold text-[#ff7900]">
              Orange Money
            </span>
            <span className="rounded-md bg-white/10 px-2 py-1 font-bold text-white/80">Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
