/** Empêche l'open-redirect : n'accepte qu'un chemin relatif interne au site. */
export function getSafeRedirect(next: string | null | undefined, fallback: string): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}
