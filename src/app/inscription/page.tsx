import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export default function InscriptionPage() {
  return (
    <AuthShell
      eyebrow="340+ talents vérifiés au Sénégal"
      headline="Créez votre compte pour réserver en toute confiance."
      description="Un compte gratuit suffit pour envoyer une demande, suivre votre réservation et échanger avec l'artiste."
      bullets={[
        "Devis instantané et paiement sécurisé",
        "Contrat automatique généré à chaque réservation",
        "Support réactif 7j/7",
      ]}
    >
      <Suspense fallback={null}>
        <RegisterForm
          role="CLIENT"
          title="Créer mon compte"
          subtitle="Quelques informations suffisent pour commencer."
          defaultRedirect="/"
        />
      </Suspense>
    </AuthShell>
  );
}
