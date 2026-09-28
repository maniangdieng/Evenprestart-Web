import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import "./globals.css";
import { getSession } from "@/lib/session";
import { getMySupportConversation } from "@/lib/api";
import { SupportChatWidget } from "@/components/support/support-chat-widget";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "EVENT PREST'ART — Réservez l'artiste parfait",
  description:
    "Marketplace de booking et management d'artistes et techniciens du spectacle au Sénégal.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const role = session?.user.role;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  // Support ouvert aux clients et artistes ; les visiteurs voient l'icône mais
  // sont invités à se connecter. Les admins répondent depuis leur messagerie.
  const canChat = role === "CLIENT" || role === "ARTIST";
  const supportConversation =
    canChat && session ? await getMySupportConversation(session.accessToken).catch(() => null) : null;

  return (
    <html
      lang="fr"
      className={`${spaceGrotesk.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink font-sans">
        {children}
        {!isAdmin && (
          <SupportChatWidget
            initialConversation={supportConversation}
            isAuthenticated={canChat}
          />
        )}
      </body>
    </html>
  );
}
