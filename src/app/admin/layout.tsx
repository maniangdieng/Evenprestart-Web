import { redirect } from "next/navigation";
import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { AdminShell } from "@/components/admin/admin-shell";
import { getSession } from "@/lib/session";
import {
  getAdminDashboard,
  getPendingProfiles,
  getAdminUnreadSupportCount,
  getNotifications,
  getUnreadNotificationCount,
} from "@/lib/api";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/connexion");

  if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return (
      <PagePlaceholder
        title="Back-Office"
        description="Cette section est réservée aux administrateurs."
      />
    );
  }

  const [pendingProfiles, dashboard, messagesUnreadCount, initialNotifications, initialUnreadCount] =
    await Promise.all([
      getPendingProfiles(session.accessToken),
      getAdminDashboard(session.accessToken),
      getAdminUnreadSupportCount(session.accessToken),
      getNotifications(session.accessToken),
      getUnreadNotificationCount(session.accessToken),
    ]);

  return (
    <AdminShell
      userName={`${session.user.firstName} ${session.user.lastName}`}
      pendingProfilesCount={pendingProfiles.length}
      messagesUnreadCount={messagesUnreadCount}
      initialNotifications={initialNotifications}
      initialUnreadCount={initialUnreadCount}
    >
      {children}
    </AdminShell>
  );
}
