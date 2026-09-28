"use server";

import { getSession } from "@/lib/session";
import { createBooking, type BookingDto, type CreateBookingInput } from "@/lib/api";

export type CreateBookingResult =
  | { status: "success"; booking: BookingDto }
  | { status: "unauthenticated" }
  | { status: "wrong_role" }
  | { status: "error"; message: string };

export async function createBookingAction(
  input: CreateBookingInput,
): Promise<CreateBookingResult> {
  const session = await getSession();
  if (!session) return { status: "unauthenticated" };
  if (session.user.role !== "CLIENT") return { status: "wrong_role" };

  try {
    const booking = await createBooking(session.accessToken, input);
    return { status: "success", booking };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}
