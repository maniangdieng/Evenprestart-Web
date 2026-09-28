"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Headset, MessageCircle, X } from "lucide-react";
import type { Socket } from "socket.io-client";
import type { ConversationDto } from "@/lib/api";
import { createRealtimeSocket } from "@/lib/realtime";
import { getRealtimeTokenAction } from "@/lib/realtime-actions";
import { SupportChatThread } from "./support-chat-thread";

const AUTH_PAGES = ["/connexion", "/inscription", "/verification"];

export function SupportChatWidget({
  initialConversation,
  isAuthenticated,
}: {
  initialConversation: ConversationDto | null;
  isAuthenticated: boolean;
}) {
  const pathname = usePathname();
  // L'espace artiste a une barre de navigation fixe en bas sur mobile.
  const hasMobileBottomNav = pathname.startsWith("/artiste");
  const [open, setOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Referme le panneau à chaque changement de page : sinon, après le clic sur
  // « Se connecter », il restait ouvert par-dessus le formulaire de connexion.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    getRealtimeTokenAction().then((token) => {
      if (!token || cancelled) return;
      const socket = createRealtimeSocket(token);
      socket.on("support:message", () => setHasUnread((prev) => (open ? prev : true)));
      socketRef.current = socket;
    });
    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  function toggle() {
    setOpen((v) => !v);
    setHasUnread(false);
  }

  // Inutile (et gênant) sur les pages de connexion / inscription.
  if (AUTH_PAGES.some((p) => pathname.startsWith(p))) return null;

  return (
    <div
      className={`fixed right-5 z-50 flex flex-col items-end gap-3 ${
        hasMobileBottomNav ? "bottom-20 md:bottom-5" : "bottom-5"
      }`}
    >
      {open && (
        <div className="flex h-[30rem] max-h-[calc(100dvh-7rem)] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-2xl shadow-navy/20">
          <div className="flex flex-shrink-0 items-center justify-between px-4 py-3">
            <h3 className="font-display text-sm font-bold text-navy">Besoin d&apos;aide ?</h3>
            <button
              type="button"
              onClick={toggle}
              aria-label="Fermer"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-navy/50 hover:bg-navy/5 hover:text-navy"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            {isAuthenticated ? (
              <SupportChatThread initialConversation={initialConversation} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy/5 text-navy">
                  <Headset className="h-6 w-6" />
                </span>
                <p className="text-sm text-navy/70">
                  Connectez-vous pour discuter avec notre équipe support.
                </p>
                <Link
                  href={`/connexion?next=${encodeURIComponent(pathname)}`}
                  className="rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-lime transition-colors hover:bg-navy/90"
                >
                  Se connecter
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={toggle}
        aria-label="Contacter le support"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-navy text-lime shadow-lg shadow-navy/30 transition-transform hover:scale-105"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5.5 w-5.5" />}
        {hasUnread && !open && (
          <span className="absolute right-1 top-1 h-3 w-3 rounded-full border-2 border-white bg-terracotta" />
        )}
      </button>
    </div>
  );
}
