"use client";

import { Fragment } from "react";
import Link from "next/link";
import { ArrowLeft, Check, CheckCheck, SendHorizontal } from "lucide-react";
import type { ConversationMessageDto } from "@/lib/api";
import { getInitials } from "@/lib/initials";

/**
 * Briques communes des messageries (support artiste/client et Back-Office) :
 * mise en page façon WhatsApp — bulles à pointe, heure, coches, séparateurs de
 * date — aux couleurs de l'app (bleu nuit, lime, crème).
 */

/** Fond crème parsemé de petits motifs bleu nuit / lime. */
export const CHAT_BACKGROUND: React.CSSProperties = {
  backgroundColor: "#f2f0e8",
  backgroundImage:
    "radial-gradient(circle at 20% 20%, rgba(11,16,34,0.06) 1.5px, transparent 2px)," +
    "radial-gradient(circle at 70% 60%, rgba(11,16,34,0.05) 1.5px, transparent 2px)," +
    "radial-gradient(circle at 40% 85%, rgba(124,154,31,0.12) 2px, transparent 2.5px)",
  backgroundSize: "36px 36px, 48px 48px, 60px 60px",
};

export function formatMessageTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

export function formatDayLabel(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(date, today)) return "Aujourd'hui";
  if (isSameDay(date, yesterday)) return "Hier";
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

/** Horodatage de la liste des conversations : heure, « Hier » ou date courte. */
export function formatListTime(iso: string) {
  const date = new Date(iso);
  const label = formatDayLabel(iso);
  if (label === "Aujourd'hui") return formatMessageTime(iso);
  if (label === "Hier") return "Hier";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export function ChatAvatar({
  name,
  avatarUrl,
  tone = "lime",
  size = 40,
  icon,
}: {
  name: string;
  avatarUrl?: string | null;
  tone?: "lime" | "terracotta" | "gold" | "navy";
  size?: number;
  icon?: React.ReactNode;
}) {
  const tones = {
    lime: "bg-lime text-navy",
    terracotta: "bg-terracotta text-white",
    gold: "bg-gold text-navy",
    navy: "bg-navy-light text-lime",
  };
  return (
    <span
      className={`relative flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full font-display text-sm font-bold ${tones[tone]}`}
      style={{ width: size, height: size }}
    >
      {avatarUrl ? (
        // <img> simple : les avatars peuvent venir de Cloudinary ou de Google.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        (icon ?? getInitials(name))
      )}
    </span>
  );
}

export function ChatHeader({
  title,
  subtitle,
  avatar,
  backHref,
  onBack,
  actions,
}: {
  title: string;
  subtitle?: string;
  avatar: React.ReactNode;
  /** Retour (mobile uniquement) : lien… */
  backHref?: string;
  /** …ou action (ex. revenir à la liste des conversations). */
  onBack?: () => void;
  actions?: React.ReactNode;
}) {
  const backClass =
    "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/10 md:hidden";
  return (
    <div className="flex flex-shrink-0 items-center gap-3 bg-navy px-3 py-2.5 text-white">
      {backHref && (
        <Link href={backHref} aria-label="Retour" className={backClass}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
      )}
      {onBack && (
        <button type="button" onClick={onBack} aria-label="Retour" className={backClass}>
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      {avatar}
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-sm font-bold">{title}</div>
        {subtitle && <div className="truncate text-xs text-white/60">{subtitle}</div>}
      </div>
      {actions}
    </div>
  );
}

export function ChatMessageList({
  messages,
  isMine,
  scrollRef,
  empty,
}: {
  messages: ConversationMessageDto[];
  /** Détermine le côté de la bulle : droite (moi) ou gauche (l'autre). */
  isMine: (message: ConversationMessageDto) => boolean;
  scrollRef?: React.Ref<HTMLDivElement>;
  empty?: React.ReactNode;
}) {
  return (
    // overflow-x-hidden : sans lui, un long mot ou un lien rendait la zone
    // déplaçable de gauche à droite (overflow-y:auto implique overflow-x:auto).
    <div
      ref={scrollRef}
      className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-3 py-3 sm:px-6"
      style={CHAT_BACKGROUND}
    >
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center px-6 text-center">
          <span className="rounded-lg bg-white/90 px-3 py-2 text-xs text-navy/60 shadow-sm">
            {empty ?? "Aucun message pour le moment."}
          </span>
        </div>
      ) : (
        <div className="space-y-1">
          {messages.map((message, i) => {
            const mine = isMine(message);
            const previous = messages[i - 1];
            const newDay =
              !previous || !isSameDay(new Date(previous.createdAt), new Date(message.createdAt));
            const firstOfGroup = newDay || isMine(previous) !== mine;
            return (
              <Fragment key={message.id}>
                {newDay && (
                  <div className="flex justify-center py-2">
                    <span className="rounded-lg bg-white/90 px-3 py-1 text-[11px] font-medium text-navy/60 shadow-sm">
                      {formatDayLabel(message.createdAt)}
                    </span>
                  </div>
                )}
                <div
                  className={`flex ${mine ? "justify-end" : "justify-start"} ${firstOfGroup ? "pt-1.5" : ""}`}
                >
                  <div
                    className={`relative max-w-[82%] rounded-lg px-2.5 pb-1.5 pt-1.5 text-sm shadow-sm sm:max-w-[65%] ${
                      mine ? "bg-navy text-white" : "bg-white text-navy"
                    } ${firstOfGroup ? (mine ? "rounded-tr-none" : "rounded-tl-none") : ""}`}
                  >
                    {firstOfGroup && (
                      <span
                        aria-hidden
                        className={`absolute top-0 h-3 w-2.5 ${
                          mine
                            ? "-right-2 bg-navy [clip-path:polygon(0_0,100%_0,0_100%)]"
                            : "-left-2 bg-white [clip-path:polygon(0_0,100%_0,100%_100%)]"
                        }`}
                      />
                    )}
                    <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">
                      {message.content}
                      {/* Réserve la place de l'heure sur la dernière ligne. */}
                      <span className="inline-block w-14" aria-hidden />
                    </p>
                    <span
                      className={`absolute bottom-1 right-2 flex items-center gap-0.5 text-[10px] ${
                        mine ? "text-white/55" : "text-navy/45"
                      }`}
                    >
                      {formatMessageTime(message.createdAt)}
                      {mine &&
                        (message.readAt ? (
                          <CheckCheck className="h-3.5 w-3.5 text-lime" aria-label="Lu" />
                        ) : (
                          <Check className="h-3.5 w-3.5" aria-label="Envoyé" />
                        ))}
                    </span>
                  </div>
                </div>
              </Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  sending,
  placeholder = "Écrire un message",
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  sending: boolean;
  placeholder?: string;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-shrink-0 items-center gap-2 border-t border-navy/10 bg-cream px-2 py-2 sm:px-4"
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-full border border-navy/10 bg-white px-4 py-2.5 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-lime"
      />
      <button
        type="submit"
        disabled={sending || !value.trim()}
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-navy text-lime transition-opacity disabled:opacity-40"
        aria-label="Envoyer"
      >
        <SendHorizontal className="h-4.5 w-4.5" />
      </button>
    </form>
  );
}
