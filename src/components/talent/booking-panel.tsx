"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CalendarCheck,
  Lock,
  MapPin,
  Loader2,
  ArrowRight,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BookingDto, ServicePackageDto } from "@/lib/api";
import { createBookingAction } from "@/app/talents/[id]/actions";

type Phase = "closed" | "form" | "submitting" | "auth-required" | "wrong-role" | "success";

interface BookingDraft {
  servicePackageId: string;
  eventDate: string;
  location: string;
}

interface BookingPanelProps {
  talentId: string;
  stageName: string;
  packages: ServicePackageDto[];
  basePriceFrom: number | null;
}

const today = () => new Date().toISOString().slice(0, 10);

export function BookingPanel({ talentId, stageName, packages, basePriceFrom }: BookingPanelProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftKey = `booking-draft-${talentId}`;

  const [phase, setPhase] = useState<Phase>("closed");
  const [form, setForm] = useState<BookingDraft>({
    servicePackageId: packages.find((p) => p.isPopular)?.id ?? packages[0]?.id ?? "",
    eventDate: "",
    location: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBooking, setSuccessBooking] = useState<BookingDto | null>(null);

  useEffect(() => {
    // Restoring a draft from sessionStorage (browser-only) can't happen during
    // the initial render without risking an SSR/hydration mismatch, so this
    // sync has to run post-mount.
    if (searchParams.get("book") !== "1") return;
    const raw = sessionStorage.getItem(draftKey);
    if (raw) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm(JSON.parse(raw));
      } catch {
        // ignore malformed draft
      }
    }
    setPhase("form");
    router.replace(pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedPackage = packages.find((p) => p.id === form.servicePackageId);
  const displayPrice = selectedPackage ? Number(selectedPackage.price) : basePriceFrom ?? 0;
  const nextUrl = `${pathname}?book=1`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.eventDate || !form.location.trim()) return;

    sessionStorage.setItem(draftKey, JSON.stringify(form));
    setPhase("submitting");
    setErrorMessage(null);

    const result = await createBookingAction({
      talentProfileId: talentId,
      servicePackageId: form.servicePackageId || undefined,
      eventDate: new Date(form.eventDate).toISOString(),
      location: form.location.trim(),
    });

    if (result.status === "success") {
      sessionStorage.removeItem(draftKey);
      setSuccessBooking(result.booking);
      setPhase("success");
    } else if (result.status === "unauthenticated") {
      setPhase("auth-required");
    } else if (result.status === "wrong_role") {
      setPhase("wrong-role");
    } else {
      setErrorMessage(result.message);
      setPhase("form");
    }
  }

  if (phase === "closed") {
    return (
      <Button className="mt-4 w-full" onClick={() => setPhase("form")}>
        Réserver maintenant
      </Button>
    );
  }

  if (phase === "success" && successBooking) {
    return (
      <div className="mt-4 rounded-xl border border-lime/40 bg-lime/10 p-4 text-center">
        <CalendarCheck className="mx-auto h-7 w-7 text-lime-dark" />
        <p className="mt-2 text-sm font-semibold text-navy">Demande envoyée à Event Prest&apos;Art !</p>
        <p className="mt-1 text-xs text-navy/60">
          Notre équipe vérifie la disponibilité de {stageName} et vous confirme votre
          réservation par email très rapidement.
        </p>
      </div>
    );
  }

  if (phase === "auth-required") {
    return (
      <div className="mt-4 rounded-xl border border-navy/10 bg-navy/[0.03] p-4 text-center">
        <Lock className="mx-auto h-6 w-6 text-navy/40" />
        <p className="mt-2 text-sm font-semibold text-navy">Créez un compte pour réserver</p>
        <p className="mt-1 text-xs text-navy/60">
          Votre demande sera envoyée dès que vous êtes connecté — rien n&apos;est perdu.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <Link
            href={`/inscription?next=${encodeURIComponent(nextUrl)}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-lime px-5 py-2.5 font-display text-sm font-semibold text-navy hover:bg-lime-dark hover:text-white"
          >
            Créer un compte <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/connexion?next=${encodeURIComponent(nextUrl)}`}
            className="inline-flex items-center justify-center rounded-xl border border-navy/15 px-5 py-2.5 font-display text-sm font-semibold text-navy hover:bg-white"
          >
            J&apos;ai déjà un compte
          </Link>
        </div>
      </div>
    );
  }

  if (phase === "wrong-role") {
    return (
      <div className="mt-4 rounded-xl border border-terracotta/30 bg-terracotta/10 p-4 text-center">
        <TriangleAlert className="mx-auto h-6 w-6 text-terracotta" />
        <p className="mt-2 text-sm font-semibold text-navy">
          Seul un compte client peut réserver un talent.
        </p>
        <button
          type="button"
          onClick={() => setPhase("closed")}
          className="mt-3 text-xs font-semibold text-navy/60 hover:text-navy"
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 border-t border-navy/10 pt-4">
      {packages.length > 0 && (
        <div>
          <span className="mb-1.5 block text-xs font-semibold text-navy">Formule</span>
          <select
            value={form.servicePackageId}
            onChange={(e) => setForm((f) => ({ ...f, servicePackageId: e.target.value }))}
            className="w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-lime"
          >
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.name} — {Number(pkg.price).toLocaleString("fr-FR")} F
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <span className="mb-1.5 block text-xs font-semibold text-navy">Date de l&apos;événement</span>
        <input
          type="date"
          required
          min={today()}
          value={form.eventDate}
          onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
          className="w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-lime"
        />
      </div>

      <div>
        <span className="mb-1.5 block text-xs font-semibold text-navy">Lieu</span>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-navy/35" />
          <input
            type="text"
            required
            placeholder="Dakar, Almadies…"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            className="w-full rounded-lg border border-navy/15 py-2 pl-8 pr-3 text-sm outline-none focus:border-lime"
          />
        </div>
      </div>

      {displayPrice > 0 && (
        <p className="text-xs text-muted">
          À partir de{" "}
          <span className="font-semibold text-navy">
            {displayPrice.toLocaleString("fr-FR")} F
          </span>{" "}
          — tarif final confirmé par l&apos;équipe Event Prest&apos;Art.
        </p>
      )}

      {errorMessage && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">{errorMessage}</p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setPhase("closed")}
          className="rounded-xl border border-navy/15 px-4 py-2.5 text-sm font-semibold text-navy/60 hover:bg-navy/5"
        >
          Annuler
        </button>
        <Button type="submit" disabled={phase === "submitting"} className="flex-1">
          {phase === "submitting" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Envoyer la demande"
          )}
        </Button>
      </div>
    </form>
  );
}
