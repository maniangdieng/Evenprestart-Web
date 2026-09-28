import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import {
  getMyTalentProfile,
  getMyBookings,
  getMyUnreadSupportCount,
  getNotifications,
  getUnreadNotificationCount,
} from "@/lib/api";
import { ArtistShell } from "@/components/artist/artist-shell";

export default async function ArtisteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/connexion");
  if (session.user.role !== "ARTIST") redirect("/");

  const profile = await getMyTalentProfile(session.accessToken);
  const [
    upcomingCount,
    supportUnreadCount,
    initialNotifications,
    initialUnreadCount,
  ] = await Promise.all([
    profile
      ? getMyBookings(session.accessToken, "artist").then(
          // Prestations confirmées par l'équipe et encore à venir.
          (bookings) =>
            bookings.filter(
              (b) =>
                ["CONFIRMED", "PAID"].includes(b.status) &&
                new Date(b.eventDate) >= new Date(new Date().toDateString()),
            ).length,
        )
      : Promise.resolve(0),
    getMyUnreadSupportCount(session.accessToken),
    getNotifications(session.accessToken),
    getUnreadNotificationCount(session.accessToken),
  ]);

  return (
    <ArtistShell
      userName={`${session.user.firstName} ${session.user.lastName}`}
      hasProfile={!!profile}
      upcomingCount={upcomingCount}
      supportUnreadCount={supportUnreadCount}
      initialNotifications={initialNotifications}
      initialUnreadCount={initialUnreadCount}
    >
      {children}
    </ArtistShell>
  );
}
