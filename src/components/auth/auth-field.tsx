"use client";

import { useId, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: LucideIcon;
}

export function AuthField({ label, icon: Icon, type, className, id, ...props }: AuthFieldProps) {
  const [show, setShow] = useState(false);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const isPassword = type === "password";
  const resolvedType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-navy">
        {label}
      </label>
      <div className="relative flex items-center">
        <Icon className="pointer-events-none absolute left-3.5 h-4 w-4 text-navy/35" />
        <input
          id={inputId}
          type={resolvedType}
          className={`w-full rounded-xl border border-navy/12 bg-white py-2.5 pl-10 text-sm text-navy outline-none transition-all placeholder:text-navy/30 focus:border-lime focus:ring-4 focus:ring-lime/15 ${isPassword ? "pr-10" : "pr-3.5"} ${className ?? ""}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            tabIndex={-1}
            aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            className="absolute right-3 text-navy/35 transition-colors hover:text-navy/60"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
