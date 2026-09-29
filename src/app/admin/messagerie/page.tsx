import { getSupportConversationsAction } from "./actions";
import { AdminMessagerie } from "@/components/admin/admin-messagerie";

export default async function AdminMessageriePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const conversations = await getSupportConversationsAction();
  const initialSelectedId =
    typeof params.conversation === "string" ? params.conversation : undefined;

  return (
    // Page « plein écran » (cf. ShellMain) : liste + fil façon messagerie mobile.
    <AdminMessagerie
      key={initialSelectedId}
      initialConversations={conversations}
      initialSelectedId={initialSelectedId}
    />
  );
}
