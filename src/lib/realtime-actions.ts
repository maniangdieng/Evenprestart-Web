"use server";

import { getSession } from "./session";

/**
 * Fournit au client le jeton d'accès (déjà en cookie httpOnly côté serveur)
 * uniquement pour ouvrir la connexion Socket.IO — jamais persisté côté
 * navigateur, gardé en mémoire le temps de la session de l'onglet.
 */
export async function getRealtimeTokenAction(): Promise<string | null> {
  const session = await getSession();
  return session?.accessToken ?? null;
}
