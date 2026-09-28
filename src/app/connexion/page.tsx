import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "./login-form";

export default function ConnexionPage() {
  return (
    <AuthShell
      eyebrow="340+ talents vérifiés au Sénégal"
      headline="Votre prochain événement commence ici."
      description="Accédez à vos réservations, échangez avec les artistes et suivez vos paiements en toute sécurité."
      bullets={[
        "Paiement Wave & Orange Money sécurisé",
        "Contrat automatique généré à chaque réservation",
        "Support réactif 7j/7",
      ]}
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
