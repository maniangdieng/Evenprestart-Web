"use server";

import { getSession } from "./session";
import {
  getMySupportConversation,
  sendSupportMessage,
  type ConversationDto,
  type ConversationMessageDto,
} from "./api";

export type SendSupportMessageResult =
  | { status: "success"; message: ConversationMessageDto }
  | { status: "unauthenticated" }
  | { status: "error"; message: string };

/** Utilisé côté client (CLIENT) et artiste — fil unique avec l'équipe admin. */
export async function getMySupportConversationAction(): Promise<ConversationDto | null> {
  const session = await getSession();
  if (!session) return null;
  try {
    return await getMySupportConversation(session.accessToken);
  } catch {
    return null;
  }
}

export async function sendSupportMessageAction(
  content: string,
): Promise<SendSupportMessageResult> {
  const session = await getSession();
  if (!session) return { status: "unauthenticated" };
  try {
    const message = await sendSupportMessage(session.accessToken, content);
    return { status: "success", message };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}
