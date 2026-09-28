"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff, Expand } from "lucide-react";
import { MediaLightbox } from "@/components/ui/media-lightbox";
import type { MediaDto } from "@/lib/api";

export function PublicMediaGallery({
  media,
  talentName,
}: {
  media: MediaDto[];
  talentName: string;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const items = media.slice(0, 6);

  if (items.length === 0) {
    return (
      <div className="mt-8 flex h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-navy/15 text-muted">
        <ImageOff className="h-6 w-6" />
        <span className="text-xs">Aucune photo pour le moment</span>
      </div>
    );
  }

  return (
    <>
      <div className="mt-8 grid grid-cols-3 gap-3">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setLightboxIndex(i)}
            className={`group relative overflow-hidden rounded-xl bg-navy-light/40 ${
              i === 0 ? "col-span-2 h-48" : "h-32"
            }`}
          >
            {item.kind === "IMAGE" ? (
              <Image
                src={item.url}
                alt={`${talentName} — photo ${i + 1}`}
                fill
                sizes="(min-width: 768px) 33vw, 50vw"
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
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <MediaLightbox
          items={items}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </>
  );
}
