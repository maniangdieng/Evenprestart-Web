import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { GOOGLE_STATE_COOKIE } from "@/lib/google-oauth";
import { getSafeRedirect } from "@/lib/safe-redirect";

/**
 * Point de départ de « Continuer avec Google » : génère un `state` anti-CSRF,
 * le garde en cookie avec le rôle et la page de retour, puis redirige vers
 * l'écran de consentement Google.
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const loginUrl = new URL("/connexion", request.url);
  if (!clientId) {
    loginUrl.searchParams.set("error", "La connexion Google n'est pas encore configurée.");
    return NextResponse.redirect(loginUrl);
  }

  const role = request.nextUrl.searchParams.get("role") === "ARTIST" ? "ARTIST" : "CLIENT";
  const next = getSafeRedirect(request.nextUrl.searchParams.get("next"), "");
  const state = randomBytes(24).toString("base64url");

  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleUrl.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: new URL("/auth/google/callback", request.url).toString(),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  }).toString();

  const response = NextResponse.redirect(googleUrl);
  response.cookies.set(GOOGLE_STATE_COOKIE, JSON.stringify({ state, role, next }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/auth/google",
    maxAge: 60 * 10,
  });
  return response;
}
