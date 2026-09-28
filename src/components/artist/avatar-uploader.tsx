"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

interface AvatarUploaderProps {
  action: (formData: FormData) => Promise<{ avatarUrl: string | null }>;
  avatarUrl: string | null;
  fallbackLabel: string;
  size?: number;
}

export function AvatarUploader({
  action,
  avatarUrl,
  fallbackLabel,
  size = 112,
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(avatarUrl);
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
    if (file.size > MAX_AVATAR_SIZE) {
      setError("Image trop volumineuse — maximum 5 Mo.");
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
        setPreview(result.avatarUrl);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Échec de l'envoi.");
        setPreview(avatarUrl);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    });
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label="Changer la photo de profil"
        className="group relative block h-full w-full overflow-hidden rounded-3xl bg-navy-light"
      >
        {preview ? (
          <Image src={preview} alt="" fill sizes={`${size}px`} className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-2xl font-bold text-lime">
            {fallbackLabel}
          </div>
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-navy/0 text-white opacity-0 transition-all duration-200 group-hover:bg-navy/60 group-hover:opacity-100">
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Camera className="h-5 w-5" />
              <span className="text-[10px] font-semibold">Changer</span>
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
        <p className="absolute left-1/2 top-full mt-2 w-max max-w-[200px] -translate-x-1/2 rounded-lg bg-danger/10 px-2.5 py-1.5 text-center text-[11px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
