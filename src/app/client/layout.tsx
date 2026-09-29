import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import {
  getMyClientBookings,
  getMyUnreadSupportCount,
  getNotifications,
  getUnreadNotificationCount,
} from "@/lib/api";
import { ClientShell } from "@/components/client/client-shell";
import { ACTIVE_STATUSES } from "@/components/client/booking-status";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/connexion?next=/client");
  if (session.user.role !== "CLIENT") redirect("/");

  const [activeBookingsCount, supportUnreadCount, initialNotifications, initialUnreadCount] =
    await Promise.all([
      // Demandes en cours et réservations confirmées : ce qui attend le client.
      getMyClientBookings(session.accessToken)
        .then((bookings) => bookings.filter((b) => ACTIVE_STATUSES.includes(b.status)).length)
        .catch(() => 0),
      getMyUnreadSupportCount(session.accessToken).catch(() => 0),
      getNotifications(session.accessToken).catch(() => []),
      getUnreadNotificationCount(session.accessToken).catch(() => 0),
    ]);

  return (
    <ClientShell
      userName={`${session.user.firstName} ${session.user.lastName}`}
      activeBookingsCount={activeBookingsCount}
      supportUnreadCount={supportUnreadCount}
      initialNotifications={initialNotifications}
      initialUnreadCount={initialUnreadCount}
    >
      {children}
    </ClientShell>
  );
}
