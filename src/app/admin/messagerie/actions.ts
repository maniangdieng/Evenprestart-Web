"use server";

import { getSession } from "@/lib/session";
import {
  getAdminSupportConversations,
  getAdminSupportConversation,
  replyToSupportConversation,
  closeSupportConversation,
  type AdminConversationListItemDto,
  type AdminConversationDetailDto,
  type ConversationMessageDto,
} from "@/lib/api";

export async function getSupportConversationsAction(): Promise<AdminConversationListItemDto[]> {
  const session = await getSession();
  if (!session) return [];
  try {
    return await getAdminSupportConversations(session.accessToken);
  } catch {
    return [];
  }
}

export async function getSupportConversationThreadAction(
  id: string,
): Promise<AdminConversationDetailDto | null> {
  const session = await getSession();
  if (!session) return null;
  try {
    return await getAdminSupportConversation(session.accessToken, id);
  } catch {
    return null;
  }
}

export type ReplySupportResult =
  | { status: "success"; message: ConversationMessageDto }
  | { status: "error"; message: string };

export async function replySupportAction(
  id: string,
  content: string,
): Promise<ReplySupportResult> {
  const session = await getSession();
  if (!session) return { status: "error", message: "Session expirée, reconnectez-vous." };
  try {
    const message = await replyToSupportConversation(session.accessToken, id, content);
    return { status: "success", message };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

export async function closeSupportConversationAction(id: string): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  try {
    await closeSupportConversation(session.accessToken, id);
    return true;
  } catch {
    return false;
  }
}
