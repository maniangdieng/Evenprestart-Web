"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import {
  validateTalentProfile,
  createCategory,
  updateCategory,
  deleteCategory,
  updateUserRole,
  updateUserActive,
  createAdminUser,
  createAdminBooking,
  decideAdminBooking,
  cancelAdminBooking,
  openSupportConversationWith,
  type BookingDecisionAction,
  type AdminUserRole,
} from "@/lib/api";

function requireAdminSession() {
  return getSession().then((session) => {
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      redirect("/connexion");
    }
    return session;
  });
}

export async function validateProfileAction(formData: FormData) {
  const session = await requireAdminSession();
  const id = String(formData.get("profileId"));

  try {
    await validateTalentProfile(session.accessToken, id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue.";
    redirect(`/admin/profils?error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/admin");
  revalidatePath("/admin/profils");
  redirect("/admin/profils");
}

export async function createCategoryAction(formData: FormData) {
  const session = await requireAdminSession();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || undefined;

  try {
    await createCategory(session.accessToken, { name, slug, description });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue.";
    redirect(`/admin/categories?error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategoryAction(formData: FormData) {
  const session = await requireAdminSession();
  const id = String(formData.get("categoryId"));
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || undefined;

  try {
    await updateCategory(session.accessToken, id, { name, slug, description });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue.";
    redirect(`/admin/categories?error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategoryAction(formData: FormData) {
  const session = await requireAdminSession();
  const id = String(formData.get("categoryId"));

  try {
    await deleteCategory(session.accessToken, id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue.";
    redirect(`/admin/categories?error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

function redirectBackTo(formData: FormData, fallback: string) {
  const redirectTo = String(formData.get("redirectTo") ?? "").trim();
  return redirectTo || fallback;
}

export async function updateUserRoleAction(formData: FormData) {
  const session = await requireAdminSession();
  const id = String(formData.get("userId"));
  const role = String(formData.get("role")) as AdminUserRole;
  const back = redirectBackTo(formData, "/admin/utilisateurs");

  try {
    await updateUserRole(session.accessToken, id, role);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue.";
    redirect(`${back}${back.includes("?") ? "&" : "?"}error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/admin/utilisateurs");
  redirect(back);
}

export async function createUserAction(formData: FormData) {
  const session = await requireAdminSession();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role")) as AdminUserRole;
  const phone = String(formData.get("phone") ?? "").trim() || undefined;

  try {
    await createAdminUser(session.accessToken, { firstName, lastName, email, password, role, phone });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue.";
    redirect(`/admin/utilisateurs?error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/admin/utilisateurs");
  redirect("/admin/utilisateurs");
}

export async function createBookingAction(formData: FormData) {
  const session = await requireAdminSession();
  const clientId = String(formData.get("clientId"));
  const talentProfileId = String(formData.get("talentProfileId"));
  const eventDate = String(formData.get("eventDate"));
  const location = String(formData.get("location") ?? "").trim();

  try {
    await createAdminBooking(session.accessToken, {
      clientId,
      talentProfileId,
      eventDate,
      location,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue.";
    redirect(`/admin/reservations?error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/admin/reservations");
  redirect("/admin/reservations");
}

/** Onglet de la liste des réservations vers lequel revenir après une action. */
function bookingsBackUrl(formData: FormData) {
  const tab = String(formData.get("tab") ?? "");
  return `/admin/reservations${tab ? `?tab=${encodeURIComponent(tab)}` : ""}`;
}

function withError(url: string, error: unknown) {
  const message = error instanceof Error ? error.message : "Erreur inconnue.";
  return `${url}${url.includes("?") ? "&" : "?"}error=${encodeURIComponent(message)}`;
}

/** Confirmation ou refus d'une demande, après négociation avec l'artiste. */
export async function decideBookingAction(formData: FormData) {
  const session = await requireAdminSession();
  const id = String(formData.get("bookingId"));
  const action = String(formData.get("action")) as BookingDecisionAction;
  const artistFeeRaw = String(formData.get("artistFee") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim() || undefined;
  const back = bookingsBackUrl(formData);

  try {
    await decideAdminBooking(session.accessToken, id, {
      action,
      artistFee: action === "CONFIRM" && artistFeeRaw !== "" ? Number(artistFeeRaw) : undefined,
      note,
    });
  } catch (error) {
    redirect(withError(back, error));
  }
  revalidatePath("/admin/reservations");
  redirect(back);
}

export async function cancelBookingAction(formData: FormData) {
  const session = await requireAdminSession();
  const id = String(formData.get("bookingId"));
  const reason = String(formData.get("reason") ?? "").trim() || undefined;
  const back = bookingsBackUrl(formData);

  try {
    await cancelAdminBooking(session.accessToken, id, reason);
  } catch (error) {
    redirect(withError(back, error));
  }
  revalidatePath("/admin/reservations");
  redirect(back);
}

/** Ouvre le fil de discussion avec le client ou l'artiste d'une réservation. */
export async function contactUserAction(formData: FormData) {
  const session = await requireAdminSession();
  const userId = String(formData.get("userId"));

  let conversationId: string;
  try {
    const conversation = await openSupportConversationWith(session.accessToken, userId);
    conversationId = conversation.id;
  } catch (error) {
    redirect(withError(bookingsBackUrl(formData), error));
  }
  redirect(`/admin/messagerie?conversation=${conversationId}`);
}

export async function updateUserActiveAction(formData: FormData) {
  const session = await requireAdminSession();
  const id = String(formData.get("userId"));
  const isActive = String(formData.get("isActive")) === "true";
  const back = redirectBackTo(formData, "/admin/utilisateurs");

  try {
    await updateUserActive(session.accessToken, id, isActive);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue.";
    redirect(`${back}${back.includes("?") ? "&" : "?"}error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/admin/utilisateurs");
  redirect(back);
}
