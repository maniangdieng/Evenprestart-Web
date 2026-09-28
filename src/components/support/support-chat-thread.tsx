"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, CheckCheck, Headset, SendHorizontal } from "lucide-react";
import type { Socket } from "socket.io-client";
import type { ConversationDto, ConversationMessageDto } from "@/lib/api";
import { createRealtimeSocket } from "@/lib/realtime";
import { getRealtimeTokenAction } from "@/lib/realtime-actions";
import { sendSupportMessageAction } from "@/lib/support-actions";

interface SupportMessageEvent {
  conversationId: string;
  message: ConversationMessageDto;
}

/** Fond façon WhatsApp : beige clair parsemé de petits motifs. */
const CHAT_BACKGROUND: React.CSSProperties = {
  backgroundColor: "#efeae2",
  backgroundImage:
    "radial-gradient(circle at 20% 20%, rgba(11,16,34,0.05) 1.5px, transparent 2px)," +
    "radial-gradient(circle at 70% 60%, rgba(11,16,34,0.04) 1.5px, transparent 2px)," +
    "radial-gradient(circle at 40% 85%, rgba(199,226,63,0.10) 2px, transparent 2.5px)",
  backgroundSize: "36px 36px, 48px 48px, 60px 60px",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function dayLabel(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (date.toDateString() === yesterday.toDateString()) return "Hier";
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function SupportChatThread({
  initialConversation,
  header,
}: {
  initialConversation: ConversationDto | null;
  /** En-tête façon WhatsApp (page Messagerie). Absent dans la bulle de support. */
  header?: { backHref?: string };
}) {
  const [messages, setMessages] = useState<ConversationMessageDto[]>(
    initialConversation?.messages ?? [],
  );
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    getRealtimeTokenAction().then((token) => {
      if (!token || cancelled) return;
      const socket = createRealtimeSocket(token);
      socket.on("support:message", ({ message }: SupportMessageEvent) => {
        setMessages((prev) =>
          prev.some((m) => m.id === message.id) ? prev : [...prev, message],
        );
      });
      socketRef.current = socket;
    });
    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    setContent("");
    try {
      const result = await sendSupportMessageAction(trimmed);
      if (result.status === "success") {
        setMessages((prev) =>
          prev.some((m) => m.id === result.message.id) ? prev : [...prev, result.message],
        );
      } else if (result.status === "unauthenticated") {
        setError("Votre session a expiré, reconnectez-vous pour continuer la conversation.");
        setContent(trimmed);
      } else {
        setError(result.message);
        setContent(trimmed);
      }
    } catch {
      setError("Impossible d'envoyer le message, réessayez.");
      setContent(trimmed);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {header && (
        <div className="flex flex-shrink-0 items-center gap-3 bg-navy px-3 py-2.5 text-white">
          {header.backHref && (
            <Link
              href={header.backHref}
              aria-label="Retour"
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/10 md:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          )}
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-lime text-navy">
            <Headset className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="truncate font-display text-sm font-bold">Équipe PREST&apos;ART</div>
            <div className="truncate text-xs text-white/60">Support · répond en général sous 24h</div>
          </div>
        </div>
      )}

      {/* overflow-x-hidden : sans lui, un long mot ou un lien rendait la zone
          déplaçable de gauche à droite (overflow-y:auto implique overflow-x:auto). */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-3 py-3"
        style={CHAT_BACKGROUND}
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="rounded-lg bg-[#fff5c4] px-3 py-2 text-xs text-navy/70 shadow-sm">
              🔒 Posez votre question à notre équipe, nous vous répondons dès que possible.
            </span>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((message, i) => {
              const mine = !message.isAdminReply;
              const newDay =
                i === 0 ||
                new Date(messages[i - 1].createdAt).toDateString() !==
                  new Date(message.createdAt).toDateString();
              const firstOfGroup =
                newDay || messages[i - 1].isAdminReply !== message.isAdminReply;
              return (
                <Fragment key={message.id}>
                  {newDay && (
                    <div className="flex justify-center py-2">
                      <span className="rounded-lg bg-white/90 px-3 py-1 text-[11px] font-medium text-navy/60 shadow-sm">
                        {dayLabel(message.createdAt)}
                      </span>
                    </div>
                  )}
                  <div className={`flex ${mine ? "justify-end" : "justify-start"} ${firstOfGroup ? "pt-1.5" : ""}`}>
                    <div
                      className={`relative max-w-[82%] rounded-lg px-2.5 pb-1.5 pt-1.5 text-sm text-ink shadow-sm sm:max-w-[65%] ${
                        mine ? "bg-[#d9fdd3]" : "bg-white"
                      } ${firstOfGroup ? (mine ? "rounded-tr-none" : "rounded-tl-none") : ""}`}
                    >
                      {/* Pointe de la bulle, sur le premier message d'une série. */}
                      {firstOfGroup && (
                        <span
                          aria-hidden
                          className={`absolute top-0 h-3 w-2.5 ${
                            mine
                              ? "-right-2 bg-[#d9fdd3] [clip-path:polygon(0_0,100%_0,0_100%)]"
                              : "-left-2 bg-white [clip-path:polygon(0_0,100%_0,100%_100%)]"
                          }`}
                        />
                      )}
                      <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">
                        {message.content}
                        {/* Réserve la place de l'heure sur la dernière ligne. */}
                        <span className="inline-block w-14" aria-hidden />
                      </p>
                      <span className="absolute bottom-1 right-2 flex items-center gap-0.5 text-[10px] text-navy/45">
                        {formatTime(message.createdAt)}
                        {mine &&
                          (message.readAt ? (
                            <CheckCheck className="h-3.5 w-3.5 text-sky-500" aria-label="Lu" />
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

      {error && (
        <p className="flex-shrink-0 bg-danger/10 px-3 py-2 text-xs text-danger">{error}</p>
      )}

      <form
        onSubmit={handleSend}
        className="flex flex-shrink-0 items-center gap-2 bg-[#f0f2f5] px-2 py-2"
      >
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Écrire un message"
          className="min-w-0 flex-1 rounded-full bg-white px-4 py-2.5 text-sm text-ink outline-none placeholder:text-navy/40"
        />
        <button
          type="submit"
          disabled={sending || !content.trim()}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-navy text-lime transition-opacity disabled:opacity-40"
          aria-label="Envoyer"
        >
          <SendHorizontal className="h-4.5 w-4.5" />
        </button>
      </form>
    </div>
  );
}
