"use client";

import { usePathname } from "next/navigation";

/**
 * Zone de contenu des espaces connectés. Sur les pages « plein écran »
 * (messagerie), elle ne défile pas et n'a pas de marges : la page occupe
 * exactement l'espace entre l'en-tête et le menu du bas, comme une appli
 * de messagerie. Ailleurs, contenu centré avec défilement vertical.
 */
export function ShellMain({
  children,
  fullBleedPaths = [],
}: {
  children: React.ReactNode;
  fullBleedPaths?: string[];
}) {
  const pathname = usePathname();
  const fullBleed = fullBleedPaths.some((p) => pathname.startsWith(p));

  if (fullBleed) {
    return <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</main>;
  }

  return (
    <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 pb-8 pt-6 sm:px-6 sm:pt-8">
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </main>
  );
}
