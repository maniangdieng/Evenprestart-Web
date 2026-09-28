import { redirect } from "next/navigation";
import { ReservationsView } from "@/components/artist/reservations-view";
import { getSession } from "@/lib/session";
import { getMyTalentProfile, getMyBookings } from "@/lib/api";

export default async function ArtisteReservationsPage() {
  const session = await getSession();
  if (!session) redirect("/connexion");
  if (session.user.role !== "ARTIST") redirect("/");

  const profile = await getMyTalentProfile(session.accessToken);
  if (!profile) redirect("/artiste");

  const bookings = await getMyBookings(session.accessToken, "artist");

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-navy">Agenda</h1>
        <p className="mt-1 text-sm text-muted">
          Les prestations que l&apos;équipe Event Prest&apos;Art vous a confirmées. Pour toute
          question sur une date, écrivez à l&apos;équipe depuis votre messagerie.
        </p>
      </div>

      <ReservationsView bookings={bookings} />
    </div>
  );
}
