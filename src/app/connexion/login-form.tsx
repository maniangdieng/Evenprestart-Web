"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthField } from "@/components/auth/auth-field";
import { GoogleButton } from "@/components/auth/google-button";
import { loginAction } from "@/lib/auth-actions";
import { getSafeRedirect } from "@/lib/safe-redirect";

const ROLE_REDIRECT: Record<string, string> = {
  CLIENT: "/client",
  ARTIST: "/artiste",
  ADMIN: "/admin",
  SUPER_ADMIN: "/admin",
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Erreurs renvoyées par le retour Google (/auth/google/callback).
  const [error, setError] = useState<string | null>(searchParams.get("error"));
  const [loading, setLoading] = useState(false);

  // Affiche l'erreur une seule fois puis la retire de l'URL : sinon, un
  // rechargement de /connexion?error=… réaffichait un message périmé.
  useEffect(() => {
    if (!searchParams.has("error")) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("error");
    window.history.replaceState(null, "", url.pathname + url.search);
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await loginAction(email, password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      window.location.href = getSafeRedirect(next, ROLE_REDIRECT[result.data.role] ?? "/");
    } catch {
      // L'appel de l'action lui-même a échoué (réseau, déploiement en cours…).
      setError("Connexion impossible pour le moment. Réessayez dans quelques instants.");
    } finally {
      setLoading(false);
    }
  }

  const signupHref = `/inscription${next ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <>
      <h1 className="font-display text-2xl font-bold tracking-tight text-navy">Connexion</h1>
      <p className="mt-1.5 text-sm text-muted">Accédez à votre espace Prest&apos;Art.</p>

      <div className="mt-8">
        <GoogleButton next={next} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField
          label="Email"
          icon={Mail}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.com"
        />

        <AuthField
          label="Mot de passe"
          icon={Lock}
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        {error && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Connexion…" : "Se connecter"}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Pas encore de compte ?{" "}
        <Link href={signupHref} className="font-semibold text-lime-dark hover:text-navy">
          Créer un compte
        </Link>{" "}
        ·{" "}
        <Link href="/inscription-artiste" className="font-semibold text-lime-dark hover:text-navy">
          Devenir artiste
        </Link>
      </p>
    </>
  );
}
