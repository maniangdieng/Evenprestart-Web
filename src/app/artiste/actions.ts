"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import {
  createTalentProfile,
  updateTalentProfile,
  uploadTalentMedia,
  uploadTalentCoverImage,
  deleteTalentMedia,
  uploadUserAvatar,
} from "@/lib/api";

function parseProfileInput(formData: FormData) {
  const basePriceFromRaw = formData.get("basePriceFrom");
  return {
    stageName: String(formData.get("stageName") ?? "").trim(),
    bio: String(formData.get("bio") ?? "").trim() || undefined,
    location: String(formData.get("location") ?? "").trim() || undefined,
    basePriceFrom:
      basePriceFromRaw && String(basePriceFromRaw).trim() !== ""
        ? Number(basePriceFromRaw)
        : undefined,
    categoryIds: formData.getAll("categoryIds").map(String),
  };
}

export async function createProfileAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.user.role !== "ARTIST") redirect("/connexion");

  try {
    await createTalentProfile(session.accessToken, parseProfileInput(formData));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue.";
    redirect(`/artiste?error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/artiste");
  redirect("/artiste");
}

export async function updateProfileAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.user.role !== "ARTIST") redirect("/connexion");

  try {
    await updateTalentProfile(session.accessToken, parseProfileInput(formData));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue.";
    redirect(`/artiste/parametres?error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/artiste");
  revalidatePath("/artiste/parametres");
  redirect("/artiste/parametres?success=1");
}

export async function uploadMediaAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.user.role !== "ARTIST") redirect("/connexion");

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("Fichier manquant.");
  }

  const media = await uploadTalentMedia(session.accessToken, file);
  revalidatePath("/artiste");
  revalidatePath("/");
  return media;
}

export async function deleteMediaAction(mediaId: string) {
  const session = await getSession();
  if (!session || session.user.role !== "ARTIST") redirect("/connexion");

  await deleteTalentMedia(session.accessToken, mediaId);
  revalidatePath("/artiste");
  revalidatePath("/");
}

export async function uploadAvatarAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.user.role !== "ARTIST") redirect("/connexion");

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("Fichier manquant.");
  }

  const result = await uploadUserAvatar(session.accessToken, file);
  revalidatePath("/artiste");
  revalidatePath("/artiste/parametres");
  return result;
}

export async function uploadCoverImageAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.user.role !== "ARTIST") redirect("/connexion");

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("Fichier manquant.");
  }

  const profile = await uploadTalentCoverImage(session.accessToken, file);
  revalidatePath("/artiste");
  revalidatePath("/artiste/parametres");
  revalidatePath("/");
  return { coverImageUrl: profile.coverImageUrl };
}
