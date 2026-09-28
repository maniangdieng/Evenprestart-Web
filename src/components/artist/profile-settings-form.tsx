"use client";

import { useFormStatus } from "react-dom";
import { Loader2, Save } from "lucide-react";
import type { CategoryDto, TalentProfileDto } from "@/lib/api";
import { getCategoryIcon } from "@/lib/category-icons";

interface ProfileSettingsFormProps {
  action: (formData: FormData) => void | Promise<void>;
  profile: TalentProfileDto;
  categories: CategoryDto[];
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-xl bg-lime px-6 py-2.5 font-display text-sm font-semibold text-navy shadow-sm shadow-lime/30 transition-colors hover:bg-lime-dark hover:text-white disabled:pointer-events-none disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Enregistrement…
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          Enregistrer les modifications
        </>
      )}
    </button>
  );
}

export function ProfileSettingsForm({ action, profile, categories }: ProfileSettingsFormProps) {
  return (
    <form action={action} className="space-y-6">
      <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-display text-base font-bold text-navy">Informations personnelles</h2>
        <p className="mt-1 text-sm text-muted">
          Ces informations apparaissent sur votre profil visible par les organisateurs.
        </p>

        <div className="mt-5 space-y-4">
          <label className="block text-sm font-semibold text-navy">
            Nom de scène
            <input
              name="stageName"
              required
              defaultValue={profile.stageName}
              className="mt-1.5 w-full rounded-xl border border-navy/15 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-lime focus:ring-2 focus:ring-lime/20"
            />
          </label>
          <label className="block text-sm font-semibold text-navy">
            Bio
            <textarea
              name="bio"
              rows={4}
              defaultValue={profile.bio ?? ""}
              placeholder="Présentez votre univers artistique en quelques phrases…"
              className="mt-1.5 w-full resize-none rounded-xl border border-navy/15 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-lime focus:ring-2 focus:ring-lime/20"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-display text-base font-bold text-navy">Tarifs et services</h2>
        <p className="mt-1 text-sm text-muted">
          Aidez les organisateurs à estimer votre disponibilité et votre budget.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-navy">
            Localisation
            <input
              name="location"
              defaultValue={profile.location ?? ""}
              placeholder="Dakar"
              className="mt-1.5 w-full rounded-xl border border-navy/15 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-lime focus:ring-2 focus:ring-lime/20"
            />
          </label>
          <label className="block text-sm font-semibold text-navy">
            Tarif de départ (F CFA)
            <input
              type="number"
              min={0}
              name="basePriceFrom"
              defaultValue={profile.basePriceFrom ?? ""}
              className="mt-1.5 w-full rounded-xl border border-navy/15 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-lime focus:ring-2 focus:ring-lime/20"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-display text-base font-bold text-navy">Catégories</h2>
        <p className="mt-1 text-sm text-muted">
          Sélectionnez les catégories qui décrivent le mieux votre prestation.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {categories.map((category) => {
            const CategoryIcon = getCategoryIcon(category.slug);
            return (
              <label
                key={category.id}
                className="group relative flex cursor-pointer items-center gap-2 rounded-xl border border-navy/15 px-3.5 py-2.5 text-sm text-navy/80 transition-colors has-[:checked]:border-lime has-[:checked]:bg-lime/10 has-[:checked]:text-navy"
              >
                <input
                  type="checkbox"
                  name="categoryIds"
                  value={category.id}
                  defaultChecked={profile.categories.some((c) => c.category.id === category.id)}
                  className="accent-lime"
                />
                <span className="flex min-w-0 items-center gap-1.5 truncate">
                  <CategoryIcon className="h-3.5 w-3.5 flex-shrink-0" />
                  {category.name}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <div className="flex justify-end">
        <SaveButton />
      </div>
    </form>
  );
}
