import { redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { getSession } from "@/lib/session";
import { getMySupportConversation } from "@/lib/api";
import { SupportChatThread } from "@/components/support/support-chat-thread";

export default async function ArtisteMessagesPage() {
  const session = await getSession();
  if (!session) redirect("/connexion");
  if (session.user.role !== "ARTIST") redirect("/");

  const conversation = await getMySupportConversation(session.accessToken);

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-3xl flex-col">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy/5 text-navy">
          <MessageCircle className="h-4.5 w-4.5" />
        </span>
        <div>
          <h1 className="font-display text-lg font-bold text-navy">Messagerie support</h1>
          <p className="text-xs text-muted">Échangez directement avec l&apos;équipe PREST&apos;ART.</p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-2xl border border-navy/10 bg-white p-4 shadow-sm">
        <SupportChatThread initialConversation={conversation} />
      </div>
    </div>
  );
}
