import Link from "next/link";
import { Logo } from "../ui/logo";
import { ButtonLink } from "../ui/button";
import { MobileNav } from "./mobile-nav";
import { getSession } from "@/lib/session";
import { logoutAction } from "@/lib/auth-actions";

const NAV_LINKS = [
  { href: "/decouvrir", label: "Découvrir" },
  { href: "/recherche", label: "Talents" },
  { href: "/contact", label: "Nous contacter" },
];

const SPACE_BY_ROLE: Record<string, { href: string; label: string }> = {
  CLIENT: { href: "/client", label: "Mon espace" },
  ARTIST: { href: "/artiste", label: "Espace Artiste" },
  ADMIN: { href: "/admin", label: "Back-Office" },
  SUPER_ADMIN: { href: "/admin", label: "Back-Office" },
};

export async function Navbar() {
  const session = await getSession();
  const space = session ? SPACE_BY_ROLE[session.user.role] : undefined;

  return (
    <header className="sticky top-0 z-50 border-b border-navy/10 bg-cream/90 backdrop-blur relative">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3">
            <Logo />
            <span className="font-display text-base font-bold tracking-tight text-navy">
              PREST&apos;ART
            </span>
          </Link>
          <nav className="hidden gap-7 text-sm font-medium text-navy/70 md:flex">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-navy">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm sm:gap-4">
          {session ? (
            <>
              {space && (
                <Link
                  href={space.href}
                  className="hidden font-medium text-navy/70 hover:text-navy sm:inline"
                >
                  {space.label}
                </Link>
              )}
              <span className="hidden text-navy/50 lg:inline">
                {session.user.firstName} {session.user.lastName}
              </span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-xl border border-navy/15 px-3 py-2 font-semibold text-navy/70 hover:border-navy/30 hover:text-navy sm:px-4"
                >
                  Déconnexion
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/connexion" className="whitespace-nowrap font-medium text-navy/70 hover:text-navy">
                Connexion
              </Link>
              {/* La visibilité est portée par un conteneur : sur le bouton lui-même,
                  `hidden` entrait en conflit avec son `inline-flex` de base et le
                  bouton restait affiché sur mobile, où il chevauchait « Connexion ». */}
              <span className="hidden sm:inline-flex">
                <ButtonLink href="/inscription-artiste" variant="outline">
                  Devenir artiste
                </ButtonLink>
              </span>
            </>
          )}
          <MobileNav
            links={[
              ...NAV_LINKS,
              ...(space ? [space] : []),
              ...(session ? [] : [{ href: "/inscription-artiste", label: "Devenir artiste" }]),
            ]}
          />
        </div>
      </div>
    </header>
  );
}
