import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getMySupportConversation } from "@/lib/api";
import { SupportChatThread } from "@/components/support/support-chat-thread";

export default async function ArtisteMessagesPage() {
  const session = await getSession();
  if (!session) redirect("/connexion");
  if (session.user.role !== "ARTIST") redirect("/");

  const conversation = await getMySupportConversation(session.accessToken);

  // Page « plein écran » (cf. ShellMain) : le chat occupe toute la hauteur
  // disponible ; sur ordinateur il garde un format colonne, façon téléphone.
  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-1 flex-col md:border-x md:border-navy/10 md:shadow-sm">
      <SupportChatThread initialConversation={conversation} header={{ backHref: "/artiste" }} />
    </div>
  );
}
