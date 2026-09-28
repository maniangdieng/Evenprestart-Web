import Link from "next/link";
import { ArrowLeft, CircleCheck, Star } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export function AuthShell({
  eyebrow,
  headline,
  description,
  bullets,
  children,
}: {
  eyebrow: string;
  headline: string;
  description: string;
  bullets: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-cream">
      {/* Brand panel — hidden below lg, this is the "world-class SaaS" half */}
      <aside className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-navy px-12 py-10 text-white lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(520px_420px_at_15%_0%,rgba(199,226,63,0.18),transparent_60%),radial-gradient(480px_460px_at_100%_100%,rgba(224,138,76,0.16),transparent_60%)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        <div className="relative">
          <Link href="/" className="flex items-center gap-3">
            <Logo />
            <span className="font-display text-base font-bold tracking-tight">PREST&apos;ART</span>
          </Link>

          <div className="mt-16 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-lime">
            <Star className="h-3 w-3 fill-current" /> {eyebrow}
          </div>
          <h1 className="mt-5 max-w-sm font-display text-3xl font-bold leading-tight tracking-tight">
            {headline}
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">{description}</p>

          <ul className="mt-8 space-y-3">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2.5 text-sm text-white/80">
                <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-lime" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Form panel */}
      <div className="relative flex flex-1 flex-col">
        <div className="flex items-center justify-between px-6 py-6 sm:px-10">
          <Link href="/" className="flex items-center gap-2.5 lg:hidden">
            <Logo size={28} />
            <span className="font-display text-sm font-bold tracking-tight text-navy">
              PREST&apos;ART
            </span>
          </Link>
          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-navy/50 transition-colors hover:text-navy"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Retour à l&apos;accueil
          </Link>
        </div>

        <main className="flex flex-1 items-center justify-center px-6 pb-16 pt-4 sm:px-10">
          <div className="w-full max-w-sm">{children}</div>
        </main>
      </div>
    </div>
  );
}
