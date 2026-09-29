"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import {
  cancelMyBooking,
  changeMyPassword,
  createReview,
  setFavorite,
  updateMe,
  uploadUserAvatar,
} from "@/lib/api";

/**
 * Les erreurs sont renvoyées (et non levées) : en production, Next.js masque
 * le message de toute erreur levée par une Server Action.
 */
export type ClientActionResult = { ok: true } | { ok: false; error: string };

async function withClientSession(
  run: (accessToken: string) => Promise<unknown>,
  pathsToRefresh: string[],
): Promise<ClientActionResult> {
  const session = await getSession();
  if (!session || session.user.role !== "CLIENT") {
    return { ok: false, error: "Session expirée, reconnectez-vous." };
  }
  try {
    await run(session.accessToken);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Une erreur inattendue est survenue.",
    };
  }
  pathsToRefresh.forEach((path) => revalidatePath(path));
  return { ok: true };
}

export async function cancelBookingAction(
  bookingId: string,
  reason: string,
): Promise<ClientActionResult> {
  return withClientSession(
    (token) => cancelMyBooking(token, bookingId, reason.trim() || undefined),
    ["/client", "/client/reservations"],
  );
}

export async function reviewBookingAction(
  bookingId: string,
  rating: number,
  comment: string,
): Promise<ClientActionResult> {
  return withClientSession(
    (token) => createReview(token, { bookingId, rating, comment: comment.trim() || undefined }),
    ["/client", "/client/reservations"],
  );
}

export async function toggleFavoriteAction(
  talentProfileId: string,
  favorite: boolean,
): Promise<ClientActionResult> {
  return withClientSession(
    (token) => setFavorite(token, talentProfileId, favorite),
    ["/client", "/client/favoris", `/talents/${talentProfileId}`],
  );
}

export async function updateProfileAction(input: {
  firstName: string;
  lastName: string;
  phone: string;
}): Promise<ClientActionResult> {
  return withClientSession(
    (token) =>
      updateMe(token, {
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        phone: input.phone.trim(),
      }),
    ["/client", "/client/parametres"],
  );
}

export async function changePasswordAction(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<ClientActionResult> {
  return withClientSession((token) => changeMyPassword(token, input), []);
}

/** Même contrat que l'uploader d'avatar de l'espace artiste. */
export async function uploadClientAvatarAction(
  formData: FormData,
): Promise<{ avatarUrl: string | null }> {
  const session = await getSession();
  if (!session || session.user.role !== "CLIENT") {
    throw new Error("Session expirée, reconnectez-vous.");
  }
  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("Fichier manquant.");
  }
  const result = await uploadUserAvatar(session.accessToken, file);
  revalidatePath("/client");
  revalidatePath("/client/parametres");
  return result;
}
