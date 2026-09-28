"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";

const MAX_COVER_SIZE = 10 * 1024 * 1024;

interface CoverImageUploaderProps {
  action: (formData: FormData) => Promise<{ coverImageUrl: string | null }>;
  coverImageUrl: string | null;
}

/** Absolutely-fills its nearest `relative` ancestor — designed to sit behind a
 * profile-hero gradient overlay, LinkedIn-style. */
export function CoverImageUploader({ action, coverImageUrl }: CoverImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(coverImageUrl);
  const [error, setError] = useState<string | null>(null);
  const [uploading, startUpload] = useTransition();

  function handleFile(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Formats acceptés : image uniquement.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    if (file.size > MAX_COVER_SIZE) {
      setError("Image trop volumineuse — maximum 10 Mo.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    const formData = new FormData();
    formData.set("file", file);
    startUpload(async () => {
      try {
        const result = await action(formData);
        setPreview(result.coverImageUrl);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Échec de l'envoi.");
        setPreview(coverImageUrl);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    });
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label="Changer la photo de couverture"
        className="group absolute inset-0 block h-full w-full"
      >
        {preview ? (
          <Image src={preview} alt="" fill sizes="800px" className="object-cover" priority />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(600px 300px at 20% 0%, rgba(199,226,63,0.18), transparent 60%), radial-gradient(500px 300px at 90% 100%, rgba(224,138,76,0.16), transparent 60%)",
            }}
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-navy/0 text-white opacity-0 transition-all duration-200 group-hover:bg-navy/50 group-hover:opacity-100">
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Camera className="h-5 w-5" />
              <span className="text-xs font-semibold">Changer la couverture</span>
            </>
          )}
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files)}
      />
      {error && (
        <p className="absolute left-3 top-3 z-10 max-w-[80%] rounded-lg bg-danger px-2.5 py-1.5 text-xs text-white shadow">
          {error}
        </p>
      )}
    </>
  );
}
