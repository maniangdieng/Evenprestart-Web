"use client";

import { useState } from "react";
import Link from "next/link";
import { GoogleButton } from "@/components/auth/google-button";
import { useSearchParams } from "next/navigation";
import { User, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthField } from "@/components/auth/auth-field";
import { registerAction, resendOtpAction, verifyOtpAction } from "@/lib/auth-actions";
import { getSafeRedirect } from "@/lib/safe-redirect";
import type { SessionUser } from "@/lib/session";

const RESEND_COOLDOWN_SECONDS = 60;

interface RegisterFormProps {
  role: SessionUser["role"];
  title: string;
  subtitle: string;
  defaultRedirect: string;
}

export function RegisterForm({ role, title, subtitle, defaultRedirect }: RegisterFormProps) {
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirect(searchParams.get("next"), defaultRedirect);

  const [step, setStep] = useState<"form" | "otp">("form");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [code, setCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function startResendCooldown() {
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    const id = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { firstName, lastName, email, password } = form;
      const result = await registerAction({ firstName, lastName, email, password, role });
      if (result.status === "pending_verification") {
        setStep("otp");
        startResendCooldown();
      } else {
        window.location.href = redirectTo;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inscription impossible.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError(null);
    try {
      await verifyOtpAction(form.email, code);
      window.location.href = redirectTo;
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Code invalide.");
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleResend() {
    setResendMessage(null);
    try {
      await resendOtpAction(form.email);
      setResendMessage("Un nouveau code vous a été envoyé.");
      startResendCooldown();
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Impossible de renvoyer le code.");
    }
  }

  const stepIndicator = (
    <div className="mb-6 flex items-center gap-2">
      <span className={`h-1.5 flex-1 rounded-full ${step === "form" ? "bg-lime" : "bg-lime/40"}`} />
      <span className={`h-1.5 flex-1 rounded-full ${step === "otp" ? "bg-lime" : "bg-navy/10"}`} />
    </div>
  );

  const loginHref = `/connexion${searchParams.get("next") ? `?next=${encodeURIComponent(searchParams.get("next")!)}` : ""}`;

  if (step === "otp") {
    return (
      <>
        {stepIndicator}
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime/15 text-lime-dark">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-navy">
          Vérifiez votre email
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Entrez le code à 6 chiffres envoyé à{" "}
          <span className="font-semibold text-navy">{form.email}</span>.
        </p>

        <form onSubmit={handleVerify} className="mt-8 space-y-4">
          <label htmlFor="otp-code" className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy">
              Code de vérification
            </span>
            <input
              id="otp-code"
              required
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded-xl border border-navy/12 bg-white px-3.5 py-3 text-center text-lg font-bold tracking-[0.5em] text-navy outline-none transition-all focus:border-lime focus:ring-4 focus:ring-lime/15"
              placeholder="••••••"
            />
          </label>

          {otpError && (
            <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{otpError}</p>
          )}
          {resendMessage && !otpError && (
            <p className="rounded-lg bg-lime/10 px-3 py-2 text-sm text-lime-dark">{resendMessage}</p>
          )}

          <Button type="submit" disabled={otpLoading || code.length !== 6} className="w-full">
            {otpLoading ? "Vérification…" : "Vérifier le code"}
          </Button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="w-full text-center text-sm font-semibold text-lime-dark transition-colors hover:text-navy disabled:cursor-not-allowed disabled:text-muted"
          >
            {resendCooldown > 0
              ? `Renvoyer le code (${resendCooldown}s)`
              : "Renvoyer le code"}
          </button>
        </form>
      </>
    );
  }

  return (
    <>
      {stepIndicator}
      <h1 className="font-display text-2xl font-bold tracking-tight text-navy">{title}</h1>
      <p className="mt-1.5 text-sm text-muted">{subtitle}</p>

      <div className="mt-8">
        <GoogleButton
          role={role === "ARTIST" ? "ARTIST" : "CLIENT"}
          next={searchParams.get("next")}
          label="S'inscrire avec Google"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <AuthField
            label="Prénom"
            icon={User}
            autoComplete="given-name"
            required
            value={form.firstName}
            onChange={update("firstName")}
            placeholder="Awa"
          />
          <AuthField
            label="Nom"
            icon={User}
            autoComplete="family-name"
            required
            value={form.lastName}
            onChange={update("lastName")}
            placeholder="Diop"
          />
        </div>

        <AuthField
          label="Email"
          icon={Mail}
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={update("email")}
          placeholder="vous@exemple.com"
        />

        <AuthField
          label="Mot de passe"
          icon={Lock}
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={form.password}
          onChange={update("password")}
          placeholder="8 caractères minimum"
        />

        <AuthField
          label="Confirmer le mot de passe"
          icon={Lock}
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={form.confirmPassword}
          onChange={update("confirmPassword")}
          placeholder="••••••••"
        />

        {error && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Création…" : "Créer mon compte"}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Déjà un compte ?{" "}
        <Link href={loginHref} className="font-semibold text-lime-dark hover:text-navy">
          Se connecter
        </Link>
      </p>
    </>
  );
}
