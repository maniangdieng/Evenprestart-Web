"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiFetch } from "./api";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, type SessionUser } from "./session";
import { setSessionCookies, type TokenPair } from "./session-cookies";

/**
 * Résultat d'une action d'authentification. En production, Next.js masque le
 * message de toute erreur *levée* par une Server Action (« An error occurred
 * in the Server Components render ») : on renvoie donc l'erreur au lieu de la
 * lever, pour que l'utilisateur voie le vrai motif (identifiants invalides,
 * serveur injoignable…).
 */
export type AuthActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function toResult<T>(run: () => Promise<T>): Promise<AuthActionResult<T>> {
  try {
    return { ok: true, data: await run() };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Une erreur inattendue est survenue.",
    };
  }
}

export async function loginAction(
  email: string,
  password: string,
): Promise<AuthActionResult<{ role: SessionUser["role"] }>> {
  return toResult(async () => {
    const tokens = await apiFetch<TokenPair>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    await setSessionCookies(tokens);
    const user = await apiFetch<SessionUser>("/users/me", {
      accessToken: tokens.accessToken,
    });
    return { role: user.role };
  });
}

type RegisterResponse = TokenPair | { requiresVerification: true; email: string };

export async function registerAction(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: SessionUser["role"];
}): Promise<
  AuthActionResult<
    | { status: "verified"; role: SessionUser["role"] }
    | { status: "pending_verification"; email: string }
  >
> {
  return toResult(async () => {
    const result = await apiFetch<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });

    if ("requiresVerification" in result) {
      return { status: "pending_verification" as const, email: result.email };
    }

    await setSessionCookies(result);
    return { status: "verified" as const, role: input.role ?? "CLIENT" };
  });
}

export async function verifyOtpAction(
  email: string,
  code: string,
): Promise<AuthActionResult<{ role: SessionUser["role"] }>> {
  return toResult(async () => {
    const tokens = await apiFetch<TokenPair>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });
    await setSessionCookies(tokens);
    const user = await apiFetch<SessionUser>("/users/me", {
      accessToken: tokens.accessToken,
    });
    return { role: user.role };
  });
}

export async function resendOtpAction(email: string): Promise<AuthActionResult<null>> {
  return toResult(async () => {
    await apiFetch("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return null;
  });
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  if (refreshToken) {
    await apiFetch("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
  }
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  redirect("/");
}
