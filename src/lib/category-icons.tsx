import { Mic, PersonStanding, Headphones, Volume2, Drama, Camera, Sparkles, type LucideIcon } from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  musique: Mic,
  danse: PersonStanding,
  dj: Headphones,
  "son-lumiere": Volume2,
  animation: Drama,
  "photo-video": Camera,
};

export const DEFAULT_CATEGORY_ICON: LucideIcon = Sparkles;

export function getCategoryIcon(slug: string): LucideIcon {
  return CATEGORY_ICONS[slug] ?? DEFAULT_CATEGORY_ICON;
}
