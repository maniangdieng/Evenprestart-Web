import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "./session";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Pose les cookies de session httpOnly. Volontairement hors du fichier
 * "use server" : exportée depuis celui-ci, elle deviendrait une Server Action
 * appelable depuis le navigateur.
 */
export async function setSessionCookies(tokens: TokenPair) {
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";
  cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure,
    maxAge: 60 * 15, // 15 min — aligné sur JWT_ACCESS_EXPIRES_IN
  });
  cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure,
    maxAge: 60 * 60 * 24 * 7, // 7 jours — aligné sur JWT_REFRESH_EXPIRES_IN
  });
}
