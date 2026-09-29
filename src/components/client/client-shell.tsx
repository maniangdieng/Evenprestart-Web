import Link from "next/link";
import { LogOut, Search } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ClientSidebar } from "@/components/client/client-sidebar";
import { ShellMain } from "@/components/layout/shell-main";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { logoutAction } from "@/lib/auth-actions";
import type { NotificationDto } from "@/lib/api";

interface ClientShellProps {
  children: React.ReactNode;
  userName: string;
  activeBookingsCount: number;
  supportUnreadCount: number;
  initialNotifications: NotificationDto[];
  initialUnreadCount: number;
}

/** Cadre de l'espace client : même structure que l'espace artiste. */
export function ClientShell({
  children,
  userName,
  activeBookingsCount,
  supportUnreadCount,
  initialNotifications,
  initialUnreadCount,
}: ClientShellProps) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden overscroll-none bg-cream-deep">
      <header className="z-40 flex-shrink-0 border-b border-navy/10 bg-cream/95 shadow-sm shadow-navy/[0.02] backdrop-blur">
        <div className="flex items-center justify-between px-6 py-4">
          <Link
            href="/"
            aria-label="Retour au site"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <Logo size={32} />
            <span className="font-display text-sm font-bold tracking-tight text-navy">
              PREST&apos;ART
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/recherche"
              className="hidden items-center gap-2 rounded-xl bg-lime px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-lime-dark hover:text-white sm:inline-flex"
            >
              <Search className="h-3.5 w-3.5" />
              Trouver un talent
            </Link>
            <span className="hidden text-sm font-medium text-navy/60 lg:inline">{userName}</span>
            <NotificationBell
              initialNotifications={initialNotifications}
              initialUnreadCount={initialUnreadCount}
            />
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl border border-navy/15 bg-transparent px-4 py-2 text-sm font-semibold text-navy/70 transition-colors hover:border-navy/30 hover:bg-white hover:text-navy"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 w-full flex-1 flex-col md:flex-row">
        <ClientSidebar
          activeBookingsCount={activeBookingsCount}
          supportUnreadCount={supportUnreadCount}
        />
        <ShellMain fullBleedPaths={["/client/messages"]}>{children}</ShellMain>
      </div>
    </div>
  );
}
