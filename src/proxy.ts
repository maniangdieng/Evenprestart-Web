import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/session";

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

/**
 * Pages d'authentification toujours accessibles, même avec un cookie admin :
 * si la session est refusée par l'API (jeton expiré, révoqué, API
 * redémarrée…), /admin renvoie vers /connexion — rediriger /connexion vers
 * /admin créerait alors une boucle infinie (ERR_TOO_MANY_REDIRECTS).
 */
const AUTH_PATHS = ["/connexion", "/inscription", "/inscription-artiste"];

function decodePayload(token: string): { role?: string; exp?: number } | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

/**
 * Confines admin sessions to /admin — an admin should never see the public
 * site while logged in, only their back-office. Role is read straight off
 * the JWT payload (unverified) purely for this UX redirect; every actual
 * permission check still happens server-side via RolesGuard + getSession().
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return NextResponse.next();

  const payload = decodePayload(token);
  if (!payload?.role || !ADMIN_ROLES.has(payload.role)) return NextResponse.next();

  // Jeton expiré : ce n'est plus une session admin, on nettoie le cookie.
  if (payload.exp && payload.exp * 1000 <= Date.now()) {
    const response = NextResponse.next();
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    return response;
  }

  const { pathname } = request.nextUrl;
  if (AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/admin", request.url));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|admin).*)"],
};
