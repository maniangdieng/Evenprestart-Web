import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";
import { GOOGLE_STATE_COOKIE } from "@/lib/google-oauth";
import { getSafeRedirect } from "@/lib/safe-redirect";
import type { SessionUser } from "@/lib/session";
import { setSessionCookies, type TokenPair } from "@/lib/session-cookies";

const ROLE_REDIRECT: Record<string, string> = {
  ARTIST: "/artiste",
  ADMIN: "/admin",
  SUPER_ADMIN: "/admin",
};

/** Retour de Google : vérifie le `state`, fait échanger le code par l'API, ouvre la session. */
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const saved = cookieStore.get(GOOGLE_STATE_COOKIE)?.value;
  cookieStore.delete({ name: GOOGLE_STATE_COOKIE, path: "/auth/google" });

  const fail = (message: string) => {
    const url = new URL("/connexion", request.url);
    url.searchParams.set("error", message);
    return NextResponse.redirect(url);
  };

  const params = request.nextUrl.searchParams;
  // L'utilisateur a fermé ou refusé l'écran de consentement Google.
  if (params.get("error")) return fail("Connexion Google annulée.");

  let expected: { state: string; role: "CLIENT" | "ARTIST"; next: string } | null = null;
  try {
    expected = saved ? JSON.parse(saved) : null;
  } catch {
    expected = null;
  }
  const code = params.get("code");
  if (!code || !expected || params.get("state") !== expected.state) {
    return fail("Session de connexion Google expirée, veuillez réessayer.");
  }

  try {
    const tokens = await apiFetch<TokenPair>("/auth/google", {
      method: "POST",
      body: JSON.stringify({
        code,
        redirectUri: new URL("/auth/google/callback", request.url).toString(),
        role: expected.role,
      }),
    });
    await setSessionCookies(tokens);
    const user = await apiFetch<SessionUser>("/users/me", { accessToken: tokens.accessToken });
    const destination = getSafeRedirect(expected.next, ROLE_REDIRECT[user.role] ?? "/");
    return NextResponse.redirect(new URL(destination, request.url));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Connexion Google impossible.");
  }
}
