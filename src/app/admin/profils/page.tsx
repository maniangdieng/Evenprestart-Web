import Link from "next/link";
import { redirect } from "next/navigation";
import { UserCheck } from "lucide-react";
import { getSession } from "@/lib/session";
import { getPendingProfiles } from "@/lib/api";
import { validateProfileAction } from "../actions";

export default async function AdminProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();
  if (!session) redirect("/connexion");

  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;

  const pendingProfiles = await getPendingProfiles(session.accessToken);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-2xl font-bold text-navy">Profils à valider</h1>
      <p className="mt-1 text-muted">
        Approuvez les nouveaux profils artistes avant qu&apos;ils soient visibles publiquement.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-danger/10 p-4 text-sm text-danger">{error}</p>
      )}

      <section className="mt-6 rounded-2xl border border-navy/10 bg-white p-6">
        {pendingProfiles.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <UserCheck className="h-8 w-8 text-navy/20" />
            <p className="text-sm text-muted">Aucun profil en attente.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingProfiles.map((profile) => (
              <div
                key={profile.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy/10 p-4 text-sm"
              >
                <div>
                  <div className="font-semibold text-navy">{profile.stageName}</div>
                  <div className="text-muted">
                    {profile.user.firstName} {profile.user.lastName} · {profile.user.email}
                    {profile.location ? ` · ${profile.location}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/profils/${profile.id}`}
                    className="rounded-lg border border-navy/15 px-3 py-1.5 text-xs font-semibold text-navy hover:bg-navy/5"
                  >
                    Voir le profil
                  </Link>
                  <form action={validateProfileAction}>
                    <input type="hidden" name="profileId" value={profile.id} />
                    <button
                      type="submit"
                      className="rounded-lg bg-lime px-3 py-1.5 text-xs font-bold text-navy hover:bg-lime-dark hover:text-white"
                    >
                      Valider
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
