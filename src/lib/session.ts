import { cookies } from "next/headers";
import { apiFetch } from "./api";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "CLIENT" | "ARTIST" | "ADMIN" | "SUPER_ADMIN";
  avatarUrl: string | null;
}

export interface Session {
  accessToken: string;
  user: SessionUser;
}

/** Lit la session côté serveur (cookie httpOnly) et la valide auprès de l'API. */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) return null;

  try {
    const user = await apiFetch<SessionUser>("/users/me", {
      accessToken,
      cache: "no-store",
    });
    return { accessToken, user };
  } catch {
    return null;
  }
}
