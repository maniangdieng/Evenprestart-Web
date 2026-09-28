import {
  Mic,
  Headphones,
  PartyPopper,
  Handshake,
  Speaker,
  Search,
  CalendarCheck,
  Sparkles,
  CreditCard,
  RefreshCcw,
  ShieldCheck,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";

export const SERVICES: {
  icon: LucideIcon;
  title: string;
  description: string;
  tone: string;
}[] = [
  {
    icon: Mic,
    title: "Booking d'artistes",
    description:
      "Musiciens, chanteurs, danseurs, DJ, humoristes… nous sélectionnons et réservons les talents adaptés à votre événement.",
    tone: "lime",
  },
  {
    icon: Headphones,
    title: "Techniciens son & lumière",
    description:
      "Une équipe technique professionnelle pour la sonorisation, l'éclairage et la mise en scène de vos prestations.",
    tone: "terracotta",
  },
  {
    icon: PartyPopper,
    title: "Organisation d'événements",
    description:
      "Mariages, concerts, soirées d'entreprise, événements culturels : nous accompagnons votre projet de A à Z.",
    tone: "gold",
  },
  {
    icon: Handshake,
    title: "Management de talents",
    description:
      "Nous accompagnons aussi les artistes dans la gestion de leur carrière, leur calendrier et leurs cachets.",
    tone: "navy",
  },
  {
    icon: Speaker,
    title: "Location de sonorisation",
    description:
      "Matériel de sonorisation dernière génération à la location, avec ou sans technicien, pour tout type d'événement.",
    tone: "lime",
  },
];

export const SERVICE_TONE_CLASSES: Record<string, string> = {
  lime: "bg-lime/15 text-lime-dark",
  terracotta: "bg-terracotta/15 text-terracotta",
  gold: "bg-gold/20 text-gold",
  navy: "bg-navy text-lime",
};

export const STATS = [
  { value: "340+", label: "Talents vérifiés" },
  { value: "1 200+", label: "Prestations réservées" },
  { value: "10+", label: "Villes couvertes au Sénégal" },
] as const;

export const HOW_IT_WORKS: {
  step: string;
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    step: "01",
    icon: Search,
    title: "Cherchez",
    description: "Parcourez les profils par catégorie, ville ou budget en quelques secondes.",
  },
  {
    step: "02",
    icon: CalendarCheck,
    title: "Réservez",
    description: "Envoyez votre demande : l'équipe Event Prest'Art négocie avec l'artiste et vous confirme la réservation.",
  },
  {
    step: "03",
    icon: Sparkles,
    title: "Profitez",
    description: "L'artiste ou le technicien se présente à l'heure, votre événement prend vie.",
  },
];

export const WHY_CHOOSE_US: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: CreditCard, title: "Sans frais cachés", description: "Le prix affiché est le prix payé." },
  { icon: RefreshCcw, title: "Annulation flexible", description: "Des conditions claires, adaptées à chaque prestation." },
  { icon: ShieldCheck, title: "Talents vérifiés", description: "Identité, expérience et avis contrôlés avant publication." },
  { icon: MessageCircle, title: "Support 7j/7", description: "Une équipe disponible avant, pendant et après l'événement." },
];
