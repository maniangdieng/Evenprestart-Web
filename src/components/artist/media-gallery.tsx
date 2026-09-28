"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ImagePlus, VideoIcon, Trash2, Loader2, Film, Expand } from "lucide-react";
import type { MediaDto } from "@/lib/api";
import { uploadMediaAction, deleteMediaAction } from "@/app/artiste/actions";
import { MediaLightbox } from "@/components/ui/media-lightbox";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

export function MediaGallery({ media }: { media: MediaDto[] }) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState(media);
  const [error, setError] = useState<string | null>(null);
  const [uploading, startUpload] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  function handleFiles(fileList: FileList | null, ref: React.RefObject<HTMLInputElement | null>) {
    const file = fileList?.[0];
    if (!file) return;
    setError(null);

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      setError("Format non supporté — envoyez une image ou une vidéo.");
      if (ref.current) ref.current.value = "";
      return;
    }
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      setError(
        `Fichier trop volumineux — maximum ${Math.round(maxSize / (1024 * 1024))} Mo pour ${
          isVideo ? "une vidéo" : "une image"
        }.`,
      );
      if (ref.current) ref.current.value = "";
      return;
    }

    const formData = new FormData();
    formData.set("file", file);
    startUpload(async () => {
      try {
        const created = await uploadMediaAction(formData);
        setItems((prev) => [...prev, created]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Échec de l'envoi.");
      }
    });
    if (ref.current) ref.current.value = "";
  }

  function handleDelete(id: string) {
    setError(null);
    setDeletingId(id);
    startUpload(async () => {
      try {
        await deleteMediaAction(id);
        setItems((prev) => prev.filter((m) => m.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Échec de la suppression.");
      } finally {
        setDeletingId(null);
      }
    });
  }

  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-navy">Galerie</h3>
          <p className="mt-1 text-sm text-muted">
            Vos meilleures photos et vidéos — elles servent de vitrine sur
            votre profil public et sur la page d&apos;accueil.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-xl border border-navy/15 px-3.5 py-2 text-xs font-semibold text-navy transition-colors hover:bg-navy/5 disabled:opacity-60"
          >
            <ImagePlus className="h-3.5 w-3.5" />
            Ajouter des photos
          </button>
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-xl border border-navy/15 px-3.5 py-2 text-xs font-semibold text-navy transition-colors hover:bg-navy/5 disabled:opacity-60"
          >
            <VideoIcon className="h-3.5 w-3.5" />
            Ajouter une vidéo
          </button>
          <span className="rounded-full bg-navy/5 px-3 py-1.5 text-xs font-semibold text-navy/60">
            {items.length} média{items.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-danger">{error}</p>
      ) : (
        <p className="mt-3 text-xs text-muted/70">
          Images jusqu&apos;à 10 Mo, vidéos jusqu&apos;à 50 Mo.
        </p>
      )}

      {items.length === 0 && (
        <p className="mt-5 text-sm text-muted">
          Votre galerie est vide. Ajoutez vos premières photos pour attirer
          l&apos;attention des organisateurs.
        </p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((item, index) => {
          const isDeleting = deletingId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setLightboxIndex(index)}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-navy/10 bg-navy-light/10 shadow-sm"
            >
              {item.kind === "IMAGE" ? (
                <Image
                  src={item.url}
                  alt=""
                  fill
                  sizes="220px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <video
                  src={item.url}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  muted
                  loop
                  playsInline
                />
              )}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-navy/0 opacity-0 transition-opacity group-hover:bg-navy/30 group-hover:opacity-100">
                <Expand className="h-5 w-5 text-white" />
              </div>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }
                }}
                aria-label="Supprimer"
                className="absolute right-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/90 text-navy opacity-0 shadow-sm transition-all hover:bg-danger hover:text-white group-hover:opacity-100 disabled:opacity-100"
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </span>
              {item.kind === "VIDEO" && (
                <span className="absolute bottom-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-navy/80 text-white">
                  <Film className="h-3 w-3" />
                </span>
              )}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => photoInputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-navy/15 bg-navy/[0.02] text-muted transition-colors hover:border-lime hover:bg-lime/5 hover:text-lime-dark disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <ImagePlus className="h-6 w-6" />
              <span className="text-xs font-semibold">Ajouter</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files, photoInputRef)}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files, videoInputRef)}
      />

      {lightboxIndex !== null && (
        <MediaLightbox
          items={items}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </div>
  );
}
