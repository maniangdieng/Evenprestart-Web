import { ButtonHTMLAttributes } from "react";
import Link from "next/link";

type Variant = "primary" | "outline" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-lime text-navy hover:bg-lime-dark hover:text-white shadow-sm shadow-lime/30",
  outline: "border border-navy/15 text-navy hover:bg-navy/5",
  ghost: "text-navy hover:bg-navy/5",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-display font-semibold text-sm transition-colors disabled:opacity-50 disabled:pointer-events-none";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`${BASE} ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}

interface ButtonLinkProps {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
}: ButtonLinkProps) {
  return (
    <Link href={href} className={`${BASE} ${VARIANT_CLASSES[variant]} ${className}`}>
      {children}
    </Link>
  );
}
