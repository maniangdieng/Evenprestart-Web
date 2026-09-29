import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getMe } from "@/lib/api";
import { ClientSettings } from "@/components/client/client-settings";

export default async function ClientParametresPage() {
  const session = await getSession();
  if (!session || session.user.role !== "CLIENT") redirect("/connexion");

  const user = await getMe(session.accessToken);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-navy">Paramètres</h1>
        <p className="mt-1 text-sm text-muted">Votre photo, vos coordonnées et votre mot de passe.</p>
      </div>
      <ClientSettings user={user} />
    </div>
  );
}
