import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getMyClientBookings } from "@/lib/api";
import { ClientBookings } from "@/components/client/client-bookings";

const TABS = ["en-cours", "confirmees", "passees"] as const;

export default async function ClientReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();
  if (!session || session.user.role !== "CLIENT") redirect("/connexion");

  const params = await searchParams;
  const onglet = typeof params.onglet === "string" ? params.onglet : "";
  const initialTab = (TABS as readonly string[]).includes(onglet)
    ? (onglet as (typeof TABS)[number])
    : "en-cours";

  const bookings = await getMyClientBookings(session.accessToken);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-navy">Mes réservations</h1>
        <p className="mt-1 text-sm text-muted">
          Vos demandes sont traitées par l&apos;équipe Event Prest&apos;Art, qui négocie avec
          l&apos;artiste et vous confirme la réservation par email.
        </p>
      </div>
      <ClientBookings key={initialTab} bookings={bookings} initialTab={initialTab} />
    </div>
  );
}
