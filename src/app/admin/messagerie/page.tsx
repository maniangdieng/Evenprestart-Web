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
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-4 font-display text-xl font-bold text-navy">Messagerie</h1>
      <AdminMessagerie
        key={initialSelectedId}
        initialConversations={conversations}
        initialSelectedId={initialSelectedId}
      />
    </div>
  );
}
