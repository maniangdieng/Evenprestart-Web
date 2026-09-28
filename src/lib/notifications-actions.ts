"use server";

import { getSession } from "./session";
import { markNotificationRead, markAllNotificationsRead } from "./api";

export async function markNotificationReadAction(id: string): Promise<void> {
  const session = await getSession();
  if (!session) return;
  try {
    await markNotificationRead(session.accessToken, id);
  } catch {
    // best-effort — the optimistic UI update already reflects "read"
  }
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const session = await getSession();
  if (!session) return;
  try {
    await markAllNotificationsRead(session.accessToken);
  } catch {
    // best-effort — the optimistic UI update already reflects "read"
  }
}
