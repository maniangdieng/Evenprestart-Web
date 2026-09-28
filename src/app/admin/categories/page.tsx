import { redirect } from "next/navigation";
import { Tags, Trash2, Pencil } from "lucide-react";
import { getSession } from "@/lib/session";
import { getCategories } from "@/lib/api";
import { getCategoryIcon } from "@/lib/category-icons";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "../actions";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();
  if (!session) redirect("/connexion");

  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;

  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-2xl font-bold text-navy">Catégories</h1>
      <p className="mt-1 text-muted">
        Les catégories de talents affichées sur le site et proposées aux artistes.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-danger/10 p-4 text-sm text-danger">{error}</p>
      )}

      <section className="mt-6 rounded-2xl border border-navy/10 bg-white p-6">
        <h2 className="font-display text-base font-bold text-navy">Nouvelle catégorie</h2>
        <form action={createCategoryAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-navy">
            Nom
            <input
              name="name"
              required
              placeholder="DJ"
              className="mt-1.5 w-full rounded-xl border border-navy/15 px-3.5 py-2.5 text-sm outline-none focus:border-lime"
            />
          </label>
          <label className="block text-sm font-semibold text-navy">
            Slug
            <input
              name="slug"
              required
              placeholder="dj"
              className="mt-1.5 w-full rounded-xl border border-navy/15 px-3.5 py-2.5 text-sm outline-none focus:border-lime"
            />
          </label>
          <label className="block text-sm font-semibold text-navy sm:col-span-2">
            Description
            <input
              name="description"
              placeholder="Description courte…"
              className="mt-1.5 w-full rounded-xl border border-navy/15 px-3.5 py-2.5 text-sm outline-none focus:border-lime"
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-xl bg-lime px-5 py-2.5 font-display text-sm font-semibold text-navy shadow-sm shadow-lime/30 hover:bg-lime-dark hover:text-white"
            >
              Ajouter
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6 rounded-2xl border border-navy/10 bg-white p-6">
        <h2 className="font-display text-base font-bold text-navy">
          Catégories existantes ({categories.length})
        </h2>
        {categories.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Tags className="h-8 w-8 text-navy/20" />
            <p className="text-sm text-muted">Aucune catégorie pour le moment.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {categories.map((category) => {
              const CategoryIcon = getCategoryIcon(category.slug);
              return (
              <details
                key={category.id}
                className="group rounded-xl border border-navy/10 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm">
                  <span className="flex items-center gap-2 font-semibold text-navy">
                    <CategoryIcon className="h-4 w-4 text-navy/60" />
                    {category.name}
                    <span className="font-normal text-muted">/{category.slug}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-navy/50 group-open:hidden">
                    <Pencil className="h-3.5 w-3.5" />
                    Modifier
                  </span>
                </summary>

                <div className="border-t border-navy/10 p-4">
                  <form action={updateCategoryAction} className="grid gap-3 sm:grid-cols-2">
                    <input type="hidden" name="categoryId" value={category.id} />
                    <label className="block text-xs font-semibold text-navy">
                      Nom
                      <input
                        name="name"
                        required
                        defaultValue={category.name}
                        className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-lime"
                      />
                    </label>
                    <label className="block text-xs font-semibold text-navy">
                      Slug
                      <input
                        name="slug"
                        required
                        defaultValue={category.slug}
                        className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-lime"
                      />
                    </label>
                    <label className="block text-xs font-semibold text-navy sm:col-span-2">
                      Description
                      <input
                        name="description"
                        defaultValue={category.description ?? ""}
                        className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-lime"
                      />
                    </label>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <button
                        type="submit"
                        className="rounded-lg bg-lime px-3.5 py-1.5 text-xs font-bold text-navy hover:bg-lime-dark hover:text-white"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </form>

                  <form action={deleteCategoryAction} className="mt-2">
                    <input type="hidden" name="categoryId" value={category.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-danger/20 px-3.5 py-1.5 text-xs font-semibold text-danger hover:bg-danger/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Supprimer la catégorie
                    </button>
                  </form>
                </div>
              </details>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
