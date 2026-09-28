"use client";

import { useEffect, useRef, useState } from "react";
import { SendHorizontal, Headset } from "lucide-react";
import type { Socket } from "socket.io-client";
import type { ConversationDto, ConversationMessageDto } from "@/lib/api";
import { createRealtimeSocket } from "@/lib/realtime";
import { getRealtimeTokenAction } from "@/lib/realtime-actions";
import { sendSupportMessageAction } from "@/lib/support-actions";
import { timeAgo } from "@/lib/time-ago";

interface SupportMessageEvent {
  conversationId: string;
  message: ConversationMessageDto;
}

export function SupportChatThread({
  initialConversation,
}: {
  initialConversation: ConversationDto | null;
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
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-1 py-2">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy/5 text-navy/40">
              <Headset className="h-6 w-6" />
            </span>
            <p className="max-w-xs text-sm text-muted">
              Posez votre question à notre équipe, nous vous répondons dès que possible.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isAdminReply ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  message.isAdminReply
                    ? "rounded-bl-sm bg-navy/[0.05] text-navy"
                    : "rounded-br-sm bg-navy text-white"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    message.isAdminReply ? "text-navy/40" : "text-white/50"
                  }`}
                >
                  {message.isAdminReply ? "Équipe PREST'ART" : "Vous"} · {timeAgo(message.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {error && (
        <p className="mt-2 rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">{error}</p>
      )}

      <form onSubmit={handleSend} className="mt-3 flex items-center gap-2 border-t border-navy/10 pt-3">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Écrivez votre message…"
          className="flex-1 rounded-xl border border-navy/15 px-3.5 py-2.5 text-sm outline-none focus:border-lime"
        />
        <button
          type="submit"
          disabled={sending || !content.trim()}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-navy text-lime transition-opacity disabled:opacity-40"
          aria-label="Envoyer"
        >
          <SendHorizontal className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
