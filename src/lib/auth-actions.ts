"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiFetch } from "./api";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, type SessionUser } from "./session";
import { setSessionCookies, type TokenPair } from "./session-cookies";

export async function loginAction(
  email: string,
  password: string,
): Promise<{ role: SessionUser["role"] }> {
  const tokens = await apiFetch<TokenPair>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  await setSessionCookies(tokens);
  const user = await apiFetch<SessionUser>("/users/me", {
    accessToken: tokens.accessToken,
  });
  return { role: user.role };
}

type RegisterResponse = TokenPair | { requiresVerification: true; email: string };

export async function registerAction(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: SessionUser["role"];
}): Promise<
  | { status: "verified"; role: SessionUser["role"] }
  | { status: "pending_verification"; email: string }
> {
  const result = await apiFetch<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });

  if ("requiresVerification" in result) {
    return { status: "pending_verification", email: result.email };
  }

  await setSessionCookies(result);
  return { status: "verified", role: input.role ?? "CLIENT" };
}

export async function verifyOtpAction(
  email: string,
  code: string,
): Promise<{ role: SessionUser["role"] }> {
  const tokens = await apiFetch<TokenPair>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
  await setSessionCookies(tokens);
  const user = await apiFetch<SessionUser>("/users/me", {
    accessToken: tokens.accessToken,
  });
  return { role: user.role };
}

export async function resendOtpAction(email: string): Promise<void> {
  await apiFetch("/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
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
