import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

type Tone = "lime" | "terracotta" | "gold" | "navy";

/** En-tête commun des pages de contenu (FAQ, CGU, Comment ça marche…). */
export function PageHero({
  badge,
  tone = "lime",
  title,
  description,
  children,
}: {
  badge: string;
  tone?: Tone;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-navy text-white">
      <div
        aria-hidden
        className="absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-lime/20 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-32 -left-16 -z-10 h-72 w-72 rounded-full bg-terracotta/20 blur-3xl"
      />
      <div className="mx-auto max-w-3xl px-6 py-16 text-center md:py-20">
        <Badge tone={tone}>{badge}</Badge>
        <h1 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-4 max-w-xl text-white/70">{description}</p>
        )}
        {children && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{children}</div>
        )}
      </div>
    </section>
  );
}

/** Bandeau d'appel à l'action placé en bas des pages. */
export function CtaBand({
  title = "Un événement à organiser ?",
  description = "Parlez-nous de votre projet, nous vous aidons à trouver les bons talents et à le mettre en musique.",
  primary = { href: "/recherche", label: "Trouver un talent" },
  secondary = { href: "/contact", label: "Nous contacter" },
}: {
  title?: string;
  description?: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
      <div className="flex flex-col items-center justify-between gap-8 rounded-3xl bg-navy px-8 py-10 text-center text-white md:flex-row md:text-left">
        <div>
          <h2 className="font-display text-2xl font-bold">{title}</h2>
          <p className="mt-2 max-w-md text-white/60">{description}</p>
        </div>
        <div className="flex flex-shrink-0 flex-wrap justify-center gap-3">
          <ButtonLink href={primary.href}>{primary.label}</ButtonLink>
          <ButtonLink
            href={secondary.href}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            {secondary.label}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
