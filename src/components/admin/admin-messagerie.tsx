"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, CheckCheck, Headset, Lock, Search } from "lucide-react";
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
import {
  CHAT_BACKGROUND,
  ChatAvatar,
  ChatComposer,
  ChatHeader,
  ChatMessageList,
  formatListTime,
} from "@/components/chat/chat-ui";

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

const ROLE_TONE: Record<string, "lime" | "terracotta" | "gold" | "navy"> = {
  CLIENT: "lime",
  ARTIST: "terracotta",
  ADMIN: "navy",
  SUPER_ADMIN: "navy",
};

type Filter = "all" | "unread" | "closed";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "unread", label: "Non lues" },
  { key: "closed", label: "Clôturées" },
];

export function AdminMessagerie({
  initialConversations,
  initialSelectedId,
}: {
  initialConversations: AdminConversationListItemDto[];
  /** Fil à ouvrir d'emblée (ex. depuis « Écrire à l'artiste » d'une réservation). */
  initialSelectedId?: string;
}) {
  const [conversations, setConversations] = useState(initialConversations);
  // Aucune conversation ouverte par défaut : sur mobile on arrive sur la liste,
  // comme dans une appli de messagerie.
  const [selectedId, setSelectedId] = useState<string | null>(
    initialConversations.some((c) => c.id === initialSelectedId) ? initialSelectedId! : null,
  );
  const [thread, setThread] = useState<AdminConversationDetailDto | null>(null);
  const loadingThread = selectedId !== null && thread?.id !== selectedId;
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
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
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [thread?.id, thread?.messages.length]);

  const visibleConversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...conversations]
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
      .filter((c) => {
        if (filter === "unread" && c.unreadCount === 0) return false;
        if (filter === "closed" && c.status !== "CLOSED") return false;
        if (!q) return true;
        const p = c.participant;
        return `${p.firstName} ${p.lastName} ${p.email}`.toLowerCase().includes(q);
      });
  }, [conversations, search, filter]);

  const unreadTotal = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

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

  function openConversation(id: string) {
    setError(null);
    setContent("");
    setSelectedId(id);
  }

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden bg-white">
      {/* LISTE DES CONVERSATIONS — masquée sur mobile quand un fil est ouvert */}
      <aside
        className={`min-h-0 w-full flex-col border-r border-navy/10 bg-white md:flex md:w-[340px] md:flex-shrink-0 ${
          selectedId ? "hidden" : "flex"
        }`}
      >
        <div className="flex flex-shrink-0 items-center justify-between bg-navy px-4 py-3.5 text-white">
          <h1 className="font-display text-lg font-bold">Messagerie</h1>
          {unreadTotal > 0 && (
            <span className="rounded-full bg-lime px-2 py-0.5 text-xs font-bold text-navy">
              {unreadTotal} non lu{unreadTotal > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="flex-shrink-0 space-y-2 border-b border-navy/10 px-3 py-2.5">
          <label className="flex items-center gap-2 rounded-full bg-cream-deep px-3.5 py-2">
            <Search className="h-4 w-4 flex-shrink-0 text-navy/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une conversation"
              className="min-w-0 flex-1 bg-transparent text-sm text-navy outline-none placeholder:text-navy/40"
            />
          </label>
          <div className="flex gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  filter === f.key
                    ? "bg-lime text-navy"
                    : "bg-cream-deep text-navy/60 hover:text-navy"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          {visibleConversations.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
              <Headset className="h-8 w-8 text-navy/20" />
              <p className="text-sm text-muted">
                {conversations.length === 0
                  ? "Aucun message pour le moment."
                  : "Aucune conversation ne correspond."}
              </p>
            </div>
          ) : (
            visibleConversations.map((conversation) => {
              const p = conversation.participant;
              const name = `${p.firstName} ${p.lastName}`.trim();
              const last = conversation.lastMessage;
              const unread = conversation.unreadCount > 0;
              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => openConversation(conversation.id)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-cream-deep ${
                    selectedId === conversation.id ? "bg-cream-deep" : ""
                  }`}
                >
                  <ChatAvatar name={name} avatarUrl={p.avatarUrl} tone={ROLE_TONE[p.role]} size={48} />
                  <span className="min-w-0 flex-1 border-b border-navy/5 pb-2.5 pt-0.5">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate font-semibold text-navy">{name}</span>
                      <span
                        className={`flex-shrink-0 text-[11px] ${unread ? "font-semibold text-lime-dark" : "text-navy/40"}`}
                      >
                        {formatListTime(conversation.lastMessageAt)}
                      </span>
                    </span>
                    <span className="mt-0.5 flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-1 text-sm text-navy/55">
                        {conversation.status === "CLOSED" && (
                          <Lock className="h-3 w-3 flex-shrink-0" aria-label="Clôturée" />
                        )}
                        {last?.isAdminReply &&
                          (last.readAt ? (
                            <CheckCheck className="h-3.5 w-3.5 flex-shrink-0 text-lime-dark" />
                          ) : (
                            <Check className="h-3.5 w-3.5 flex-shrink-0" />
                          ))}
                        <span className={`truncate ${unread ? "font-semibold text-navy" : ""}`}>
                          {last
                            ? `${last.isAdminReply ? "Vous : " : ""}${last.content}`
                            : ROLE_LABEL[p.role]}
                        </span>
                      </span>
                      {unread && (
                        <span className="flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-lime px-1.5 text-[11px] font-bold text-navy">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* FIL DE DISCUSSION — plein écran sur mobile quand il est ouvert */}
      <section className={`min-h-0 min-w-0 flex-1 flex-col ${selectedId ? "flex" : "hidden md:flex"}`}>
        {!selectedId ? (
          <div
            className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center"
            style={CHAT_BACKGROUND}
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-navy text-lime">
              <Headset className="h-8 w-8" />
            </span>
            <h2 className="font-display text-lg font-bold text-navy">Messagerie PREST&apos;ART</h2>
            <p className="max-w-xs text-sm text-muted">
              Sélectionnez une conversation pour répondre aux clients et aux artistes.
            </p>
          </div>
        ) : !thread || loadingThread ? (
          <div className="flex flex-1 items-center justify-center" style={CHAT_BACKGROUND}>
            <span className="rounded-lg bg-white/90 px-3 py-2 text-xs text-navy/60 shadow-sm">
              Chargement…
            </span>
          </div>
        ) : (
          <>
            <ChatHeader
              onBack={() => setSelectedId(null)}
              title={`${thread.participant.firstName} ${thread.participant.lastName}`}
              subtitle={`${ROLE_LABEL[thread.participant.role] ?? ""} · ${thread.participant.email}`}
              avatar={
                <ChatAvatar
                  name={`${thread.participant.firstName} ${thread.participant.lastName}`}
                  avatarUrl={thread.participant.avatarUrl}
                  tone={ROLE_TONE[thread.participant.role]}
                />
              }
              actions={
                thread.status === "OPEN" ? (
                  <button
                    type="button"
                    onClick={handleClose}
                    className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Clôturer</span>
                  </button>
                ) : (
                  <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/60">
                    <Lock className="h-3 w-3" /> Clôturée
                  </span>
                )
              }
            />

            <ChatMessageList
              messages={thread.messages}
              isMine={(m) => m.isAdminReply}
              scrollRef={scrollRef}
            />

            {error && (
              <p className="flex-shrink-0 bg-danger/10 px-3 py-2 text-xs text-danger">{error}</p>
            )}

            <ChatComposer
              value={content}
              onChange={setContent}
              onSubmit={handleSend}
              sending={sending}
              placeholder="Répondre…"
            />
          </>
        )}
      </section>
    </div>
  );
}
