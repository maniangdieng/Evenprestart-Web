"use client";

import { useEffect, useRef, useState } from "react";
import { SendHorizontal, Headset, CheckCheck, User } from "lucide-react";
import type { Socket } from "socket.io-client";
import type {
  AdminConversationListItemDto,
  AdminConversationDetailDto,
  ConversationMessageDto,
} from "@/lib/api";
import { createRealtimeSocket } from "@/lib/realtime";
import { getRealtimeTokenAction } from "@/lib/realtime-actions";
import {
  getSupportConversationThreadAction,
  getSupportConversationsAction,
  replySupportAction,
  closeSupportConversationAction,
} from "@/app/admin/messagerie/actions";
import { timeAgo } from "@/lib/time-ago";

interface SupportMessageEvent {
  conversationId: string;
  message: ConversationMessageDto;
}

const ROLE_LABEL: Record<string, string> = {
  CLIENT: "Client",
  ARTIST: "Artiste",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super admin",
};

export function AdminMessagerie({
  initialConversations,
  initialSelectedId,
}: {
  initialConversations: AdminConversationListItemDto[];
  /** Fil à ouvrir d'emblée (ex. depuis « Écrire à l'artiste » d'une réservation). */
  initialSelectedId?: string;
}) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialConversations.some((c) => c.id === initialSelectedId)
      ? initialSelectedId!
      : (initialConversations[0]?.id ?? null),
  );
  const [thread, setThread] = useState<AdminConversationDetailDto | null>(null);
  const loadingThread = selectedId !== null && thread?.id !== selectedId;
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
      socket.on("support:message", ({ conversationId, message }: SupportMessageEvent) => {
        if (message.isAdminReply) return;
        getSupportConversationsAction().then((list) => !cancelled && setConversations(list));
        setThread((prev) =>
          prev && prev.id === conversationId
            ? { ...prev, messages: [...prev.messages, message] }
            : prev,
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
    if (!selectedId) return;
    let cancelled = false;
    getSupportConversationThreadAction(selectedId).then((data) => {
      if (cancelled) return;
      setThread(data);
      setConversations((prev) =>
        prev.map((c) => (c.id === selectedId ? { ...c, unreadCount: 0 } : c)),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [thread?.messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || !selectedId || sending) return;
    setSending(true);
    setError(null);
    setContent("");
    const result = await replySupportAction(selectedId, trimmed);
    if (result.status === "success") {
      const message = result.message;
      setThread((prev) => (prev ? { ...prev, messages: [...prev.messages, message] } : prev));
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId ? { ...c, lastMessage: message, lastMessageAt: message.createdAt } : c,
        ),
      );
    } else {
      setError(result.message);
      setContent(trimmed);
    }
    setSending(false);
  }

  async function handleClose() {
    if (!selectedId) return;
    const ok = await closeSupportConversationAction(selectedId);
    if (!ok) {
      setError("Impossible de clôturer la conversation, réessayez.");
      return;
    }
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedId ? { ...c, status: "CLOSED" } : c)),
    );
    setThread((prev) => (prev ? { ...prev, status: "CLOSED" } : prev));
  }

  return (
    <div className="grid h-[calc(100vh-9rem)] grid-cols-1 gap-4 md:grid-cols-[300px_1fr]">
      <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white">
        <div className="border-b border-navy/10 px-4 py-3">
          <h2 className="font-display text-sm font-bold text-navy">Conversations</h2>
        </div>
        <div className="h-[calc(100%-3rem)] overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <Headset className="h-7 w-7 text-navy/20" />
              <p className="text-sm text-muted">Aucun message pour le moment.</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => setSelectedId(conversation.id)}
                className={`flex w-full items-start gap-3 border-b border-navy/5 px-4 py-3 text-left transition-colors hover:bg-navy/[0.03] ${
                  selectedId === conversation.id ? "bg-navy/[0.05]" : ""
                }`}
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-navy/5 text-xs font-bold text-navy">
                  {conversation.participant.firstName[0]?.toUpperCase() ?? <User className="h-4 w-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-navy">
                      {conversation.participant.firstName} {conversation.participant.lastName}
                    </span>
                    {conversation.unreadCount > 0 && (
                      <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-terracotta px-1 text-[10px] font-bold text-white">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] font-medium text-navy/40">
                    {ROLE_LABEL[conversation.participant.role] ?? conversation.participant.role}
                  </span>
                  {conversation.lastMessage && (
                    <span className="mt-0.5 line-clamp-1 block text-xs text-navy/60">
                      {conversation.lastMessage.content}
                    </span>
                  )}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white p-4">
        {!thread || loadingThread ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <Headset className="h-8 w-8 text-navy/20" />
            <p className="text-sm text-muted">
              {loadingThread ? "Chargement…" : "Sélectionnez une conversation."}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between border-b border-navy/10 pb-3">
              <div>
                <p className="text-sm font-semibold text-navy">
                  {thread.participant.firstName} {thread.participant.lastName}
                </p>
                <p className="text-xs text-muted">{thread.participant.email}</p>
              </div>
              {thread.status === "OPEN" && (
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex items-center gap-1 rounded-lg border border-navy/15 px-3 py-1.5 text-xs font-semibold text-navy/60 hover:border-navy/30 hover:text-navy"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Clôturer
                </button>
              )}
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-1">
              {thread.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isAdminReply ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                      message.isAdminReply
                        ? "rounded-br-sm bg-navy text-white"
                        : "rounded-bl-sm bg-navy/[0.05] text-navy"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className={`mt-1 text-[10px] ${message.isAdminReply ? "text-white/50" : "text-navy/40"}`}>
                      {timeAgo(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <p className="mt-2 rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">{error}</p>
            )}

            <form onSubmit={handleSend} className="mt-3 flex items-center gap-2 border-t border-navy/10 pt-3">
              <input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Répondre…"
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
          </>
        )}
      </div>
    </div>
  );
}
