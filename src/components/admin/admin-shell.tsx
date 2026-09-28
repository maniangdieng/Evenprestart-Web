import { LogOut, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { logoutAction } from "@/lib/auth-actions";
import type { NotificationDto } from "@/lib/api";

interface AdminShellProps {
  children: React.ReactNode;
  userName: string;
  pendingProfilesCount: number;
  messagesUnreadCount: number;
  initialNotifications: NotificationDto[];
  initialUnreadCount: number;
}

export function AdminShell({
  children,
  userName,
  pendingProfilesCount,
  messagesUnreadCount,
  initialNotifications,
  initialUnreadCount,
}: AdminShellProps) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-cream-deep">
      <header className="z-40 flex-shrink-0 border-b border-navy/10 bg-navy shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Logo size={32} />
            <span className="font-display text-sm font-bold tracking-tight text-white">
              PREST&apos;ART
            </span>
            <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-lime/15 px-2.5 py-1 text-[11px] font-bold text-lime">
              <ShieldCheck className="h-3 w-3" />
              Back-Office
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-white/70 sm:inline">
              {userName}
            </span>
            <NotificationBell
              initialNotifications={initialNotifications}
              initialUnreadCount={initialUnreadCount}
              variant="dark"
            />
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-transparent px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 w-full flex-1">
        <AdminSidebar
          pendingProfilesCount={pendingProfilesCount}
          messagesUnreadCount={messagesUnreadCount}
        />
        <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-24 pt-6 sm:px-6 sm:pt-8 md:pb-8">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
      </div>
    </div>
  );
}
