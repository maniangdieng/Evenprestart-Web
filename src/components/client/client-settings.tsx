"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, KeyRound, Mail, UserRound } from "lucide-react";
import type { UserProfileDto } from "@/lib/api";
import { getInitials } from "@/lib/initials";
import { AvatarUploader } from "@/components/artist/avatar-uploader";
import {
  changePasswordAction,
  updateProfileAction,
  uploadClientAvatarAction,
} from "@/app/client/actions";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-lime";

function Feedback({ error, success }: { error: string | null; success: string | null }) {
  if (error) return <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>;
  if (success)
    return (
      <p className="inline-flex items-center gap-1.5 rounded-lg bg-lime/15 px-3 py-2 text-sm font-semibold text-lime-dark">
        <CircleCheck className="h-4 w-4" /> {success}
      </p>
    );
  return null;
}

export function ClientSettings({ user }: { user: UserProfileDto }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <section className="h-fit rounded-2xl border border-navy/10 bg-white p-6 text-center shadow-sm">
        <div className="flex justify-center">
          <AvatarUploader
            action={uploadClientAvatarAction}
            avatarUrl={user.avatarUrl}
            fallbackLabel={getInitials(`${user.firstName} ${user.lastName}`)}
            size={96}
          />
        </div>
        <p className="mt-4 font-display text-lg font-bold text-navy">
          {user.firstName} {user.lastName}
        </p>
        <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted">
          <Mail className="h-3.5 w-3.5" /> {user.email}
        </p>
        <p className="mt-3 text-xs text-muted">
          Membre depuis{" "}
          {new Date(user.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
        </p>
      </section>

      <div className="space-y-6">
        <ProfileForm user={user} />
        {user.authProvider === "LOCAL" ? (
          <PasswordForm />
        ) : (
          <section className="rounded-2xl border border-navy/10 bg-white p-6 text-sm text-muted shadow-sm">
            Vous vous connectez avec Google : votre mot de passe se gère depuis votre compte Google.
          </section>
        )}
      </div>
    </div>
  );
}

function ProfileForm({ user }: { user: UserProfileDto }) {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await updateProfileAction(form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess("Informations enregistrées.");
      router.refresh();
    });
  }

  return (
    <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
      <h2 className="inline-flex items-center gap-2 font-display text-lg font-bold text-navy">
        <UserRound className="h-5 w-5 text-lime-dark" /> Informations personnelles
      </h2>
      <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-navy">
          Prénom
          <input
            required
            value={form.firstName}
            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-semibold text-navy">
          Nom
          <input
            required
            value={form.lastName}
            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-semibold text-navy">
          Téléphone
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+221 77 123 45 67"
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-semibold text-navy">
          Email
          <input value={user.email} disabled className={`${inputClass} bg-navy/[0.03] text-navy/60`} />
        </label>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-lime px-5 py-2.5 font-display text-sm font-semibold text-navy transition-colors hover:bg-lime-dark hover:text-white disabled:opacity-60"
          >
            {pending ? "Enregistrement…" : "Enregistrer"}
          </button>
          <Feedback error={error} success={success} />
        </div>
      </form>
    </section>
  );
}

function PasswordForm() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (form.newPassword !== form.confirm) {
      setError("Les deux nouveaux mots de passe ne correspondent pas.");
      return;
    }
    startTransition(async () => {
      const result = await changePasswordAction({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
      setSuccess("Mot de passe modifié. Vos autres appareils devront se reconnecter.");
    });
  }

  return (
    <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
      <h2 className="inline-flex items-center gap-2 font-display text-lg font-bold text-navy">
        <KeyRound className="h-5 w-5 text-lime-dark" /> Mot de passe
      </h2>
      <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-3">
        <label className="block text-sm font-semibold text-navy">
          Mot de passe actuel
          <input
            type="password"
            required
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-semibold text-navy">
          Nouveau mot de passe
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={form.newPassword}
            onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-semibold text-navy">
          Confirmation
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={form.confirm}
            onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
            className={inputClass}
          />
        </label>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-navy px-5 py-2.5 font-display text-sm font-semibold text-lime transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Modification…" : "Changer le mot de passe"}
          </button>
          <Feedback error={error} success={success} />
        </div>
      </form>
    </section>
  );
}
