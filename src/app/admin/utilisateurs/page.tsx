import Link from "next/link";
import { redirect } from "next/navigation";
import { Search, Users, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/session";
import { getAdminUsers, type AdminUserRole } from "@/lib/api";
import { updateUserRoleAction, updateUserActiveAction, createUserAction } from "../actions";

const TABS: { key: string; label: string; role?: AdminUserRole }[] = [
  { key: "tous", label: "Tous" },
  { key: "artistes", label: "Artistes", role: "ARTIST" },
  { key: "organisateurs", label: "Organisateurs", role: "CLIENT" },
];

const ROLE_LABELS: Record<AdminUserRole, string> = {
  CLIENT: "Organisateur",
  ARTIST: "Artiste",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super admin",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();
  if (!session) redirect("/connexion");

  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;
  const tabKey = typeof params.tab === "string" ? params.tab : "tous";
  const search = typeof params.search === "string" ? params.search : "";
  const activeTab = TABS.find((t) => t.key === tabKey) ?? TABS[0];

  const users = await getAdminUsers(session.accessToken, {
    role: activeTab.role,
    search: search || undefined,
  });

  const currentUrl = `/admin/utilisateurs?tab=${activeTab.key}${
    search ? `&search=${encodeURIComponent(search)}` : ""
  }`;

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-2xl font-bold text-navy">
        Répertoire des utilisateurs
      </h1>
      <p className="mt-1 text-muted">
        Gérez les comptes de la plateforme : rôle et statut d&apos;activation.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-danger/10 p-4 text-sm text-danger">{error}</p>
      )}

      <details className="group mt-6 rounded-2xl border border-navy/10 bg-white [&_summary::-webkit-details-marker]:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5">
          <span className="inline-flex items-center gap-2 font-display text-base font-bold text-navy">
            <UserPlus className="h-4 w-4" />
            Ajouter un utilisateur
          </span>
          <span className="text-xs font-semibold text-navy/50 group-open:hidden">Ouvrir</span>
        </summary>
        <form action={createUserAction} className="grid gap-3 border-t border-navy/10 p-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-navy">
            Prénom
            <input
              name="firstName"
              required
              className="mt-1.5 w-full rounded-xl border border-navy/15 px-3.5 py-2.5 text-sm outline-none focus:border-lime"
            />
          </label>
          <label className="block text-sm font-semibold text-navy">
            Nom
            <input
              name="lastName"
              required
              className="mt-1.5 w-full rounded-xl border border-navy/15 px-3.5 py-2.5 text-sm outline-none focus:border-lime"
            />
          </label>
          <label className="block text-sm font-semibold text-navy">
            Email
            <input
              type="email"
              name="email"
              required
              className="mt-1.5 w-full rounded-xl border border-navy/15 px-3.5 py-2.5 text-sm outline-none focus:border-lime"
            />
          </label>
          <label className="block text-sm font-semibold text-navy">
            Téléphone (optionnel)
            <input
              name="phone"
              className="mt-1.5 w-full rounded-xl border border-navy/15 px-3.5 py-2.5 text-sm outline-none focus:border-lime"
            />
          </label>
          <label className="block text-sm font-semibold text-navy">
            Mot de passe
            <input
              type="password"
              name="password"
              required
              minLength={8}
              className="mt-1.5 w-full rounded-xl border border-navy/15 px-3.5 py-2.5 text-sm outline-none focus:border-lime"
            />
          </label>
          <label className="block text-sm font-semibold text-navy">
            Rôle
            <select
              name="role"
              defaultValue="CLIENT"
              className="mt-1.5 w-full rounded-xl border border-navy/15 px-3.5 py-2.5 text-sm outline-none focus:border-lime"
            >
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-xl bg-lime px-5 py-2.5 font-display text-sm font-semibold text-navy shadow-sm shadow-lime/30 hover:bg-lime-dark hover:text-white"
            >
              Créer le compte
            </button>
            <p className="mt-2 text-xs text-muted">
              Le compte est créé directement actif et vérifié — aucun email de confirmation
              n&apos;est envoyé.
            </p>
          </div>
        </form>
      </details>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-navy/10 bg-white p-1 shadow-sm">
          {TABS.map((tab) => (
            <Link
              key={tab.key}
              href={`/admin/utilisateurs?tab=${tab.key}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                tab.key === activeTab.key
                  ? "bg-navy text-lime"
                  : "text-navy/60 hover:bg-navy/5"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <form method="GET" className="relative">
          <input type="hidden" name="tab" value={activeTab.key} />
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-navy/40" />
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Rechercher…"
            className="w-56 rounded-xl border border-navy/15 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-lime"
          />
        </form>
      </div>

      <section className="mt-4 overflow-hidden rounded-2xl border border-navy/10 bg-white">
        {users.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Users className="h-8 w-8 text-navy/20" />
            <p className="text-sm text-muted">Aucun utilisateur trouvé.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-navy/10 bg-navy/[0.02] text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Nom complet</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">E-mail</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-navy/5 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-navy/5 text-xs font-bold text-navy">
                          {user.firstName[0]?.toUpperCase()}
                          {user.lastName[0]?.toUpperCase()}
                        </span>
                        <div>
                          <div className="font-semibold text-navy">
                            {user.firstName} {user.lastName}
                          </div>
                          {user.talentProfile && (
                            <div className="text-xs text-muted">
                              {user.talentProfile.stageName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-navy/70">{ROLE_LABELS[user.role]}</td>
                    <td className="px-4 py-3 text-navy/70">{user.email}</td>
                    <td className="px-4 py-3">
                      {user.isActive ? (
                        <Badge tone="lime">Actif</Badge>
                      ) : (
                        <Badge tone="danger">Inactif</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {user.talentProfile && (
                          <Link
                            href={`/admin/profils/${user.talentProfile.id}`}
                            className="rounded-lg border border-navy/15 px-3 py-1.5 text-xs font-semibold text-navy hover:bg-navy/5"
                          >
                            Voir profil
                          </Link>
                        )}
                        <form action={updateUserRoleAction} className="flex items-center gap-1.5">
                          <input type="hidden" name="userId" value={user.id} />
                          <input type="hidden" name="redirectTo" value={currentUrl} />
                          <select
                            name="role"
                            defaultValue={user.role}
                            className="rounded-lg border border-navy/15 px-2 py-1.5 text-xs outline-none focus:border-lime"
                          >
                            {Object.entries(ROLE_LABELS).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            className="rounded-lg border border-navy/15 px-2.5 py-1.5 text-xs font-semibold text-navy hover:bg-navy/5"
                          >
                            Changer
                          </button>
                        </form>
                        <form action={updateUserActiveAction}>
                          <input type="hidden" name="userId" value={user.id} />
                          <input type="hidden" name="redirectTo" value={currentUrl} />
                          <input
                            type="hidden"
                            name="isActive"
                            value={(!user.isActive).toString()}
                          />
                          <button
                            type="submit"
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                              user.isActive
                                ? "border border-danger/20 text-danger hover:bg-danger/10"
                                : "bg-lime text-navy hover:bg-lime-dark hover:text-white"
                            }`}
                          >
                            {user.isActive ? "Désactiver" : "Activer"}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
