import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getMySupportConversation } from "@/lib/api";
import { SupportChatThread } from "@/components/support/support-chat-thread";

export default async function ClientMessagesPage() {
  const session = await getSession();
  if (!session || session.user.role !== "CLIENT") redirect("/connexion");

  const conversation = await getMySupportConversation(session.accessToken);

  // Même rendu « plein écran » que la messagerie de l'espace artiste.
  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-1 flex-col md:border-x md:border-navy/10 md:shadow-sm">
      <SupportChatThread initialConversation={conversation} header={{ backHref: "/client" }} />
    </div>
  );
}
