import Link from "next/link";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ArtistSidebar } from "@/components/artist/artist-sidebar";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { logoutAction } from "@/lib/auth-actions";
import type { NotificationDto } from "@/lib/api";

interface ArtistShellProps {
  children: React.ReactNode;
  userName: string;
  hasProfile: boolean;
  upcomingCount: number;
  supportUnreadCount: number;
  initialNotifications: NotificationDto[];
  initialUnreadCount: number;
}

export function ArtistShell({
  children,
  userName,
  hasProfile,
  upcomingCount,
  supportUnreadCount,
  initialNotifications,
  initialUnreadCount,
}: ArtistShellProps) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-cream-deep">
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
            <span className="hidden text-sm font-medium text-navy/60 sm:inline">
              {userName}
            </span>
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

      {hasProfile ? (
        <div className="flex min-h-0 w-full flex-1">
          <ArtistSidebar
            upcomingCount={upcomingCount}
            supportUnreadCount={supportUnreadCount}
          />
          <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-24 pt-6 sm:px-6 sm:pt-8 md:pb-8">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
      ) : (
        <main className="flex-1 overflow-y-auto">{children}</main>
      )}
    </div>
  );
}
