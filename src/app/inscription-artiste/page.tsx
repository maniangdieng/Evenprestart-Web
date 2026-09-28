import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export default function InscriptionArtistePage() {
  return (
    <AuthShell
      eyebrow="Rejoindre la plateforme"
      headline="Faites vivre votre talent, on s'occupe du reste."
      description="Créez votre profil, fixez vos tarifs et recevez des demandes de réservation vérifiées."
      bullets={[
        "Visibilité auprès de centaines d'organisateurs actifs",
        "Paiements Wave & Orange Money sécurisés et automatiques",
        "Zéro frais caché, zéro paperasse",
      ]}
    >
      <Suspense fallback={null}>
        <RegisterForm
          role="ARTIST"
          title="Devenir artiste"
          subtitle="Créez votre compte pour publier votre profil talent."
          defaultRedirect="/artiste"
        />
      </Suspense>
    </AuthShell>
  );
}
