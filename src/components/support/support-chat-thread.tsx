"use client";

import { useEffect, useRef, useState } from "react";
import { Headset } from "lucide-react";
import type { Socket } from "socket.io-client";
import type { ConversationDto, ConversationMessageDto } from "@/lib/api";
import { createRealtimeSocket } from "@/lib/realtime";
import { getRealtimeTokenAction } from "@/lib/realtime-actions";
import { sendSupportMessageAction } from "@/lib/support-actions";
import { ChatAvatar, ChatComposer, ChatHeader, ChatMessageList } from "@/components/chat/chat-ui";

interface SupportMessageEvent {
  conversationId: string;
  message: ConversationMessageDto;
}

export function SupportChatThread({
  initialConversation,
  header,
}: {
  initialConversation: ConversationDto | null;
  /** En-tête (page Messagerie). Absent dans la bulle de support, qui a le sien. */
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
        <ChatHeader
          backHref={header.backHref}
          title="Équipe PREST'ART"
          subtitle="Support · répond en général sous 24h"
          avatar={<ChatAvatar name="Support" icon={<Headset className="h-5 w-5" />} />}
        />
      )}

      <ChatMessageList
        messages={messages}
        isMine={(m) => !m.isAdminReply}
        scrollRef={scrollRef}
        empty="Posez votre question à notre équipe, nous vous répondons dès que possible."
      />

      {error && (
        <p className="flex-shrink-0 bg-danger/10 px-3 py-2 text-xs text-danger">{error}</p>
      )}

      <ChatComposer value={content} onChange={setContent} onSubmit={handleSend} sending={sending} />
    </div>
  );
}
