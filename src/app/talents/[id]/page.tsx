import Image from "next/image";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, CircleCheck, MapPin, Headset } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicMediaGallery } from "@/components/talent/public-media-gallery";
import { BookingPanel } from "@/components/talent/booking-panel";
import { getTalent, getTalentReviews } from "@/lib/api";

export default async function TalentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const talent = await getTalent(id);
  if (!talent) {
    notFound();
  }

  const reviews = await getTalentReviews(id).catch(() => []);
  const categoryLabel = talent.categories[0]?.category.name ?? "Talent";
  const ratingAverage = Number(talent.ratingAverage);
  const featuredPackage =
    talent.packages.find((pkg) => pkg.isPopular) ?? talent.packages[0];
  const featuredPrice = featuredPackage ? Number(featuredPackage.price) : 0;
  const serviceFee = Math.round(featuredPrice * 0.05);
  const coverImage = talent.media.find((m) => m.kind === "IMAGE");
  const coverImageUrl = talent.coverImageUrl ?? coverImage?.url;
  const galleryMedia = talent.media.filter((m) => m.id !== coverImage?.id);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-navy-light to-navy">
          {coverImageUrl && (
            <Image
              src={coverImageUrl}
              alt={talent.stageName}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          )}
        </div>
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 pb-16 md:grid-cols-[1fr_340px]">
            <div className="-mt-16">
              <div className="flex items-end gap-4">
                <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-3xl border-4 border-cream bg-navy-light">
                  {coverImage && (
                    <Image
                      src={coverImage.url}
                      alt={talent.stageName}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="pb-1">
                  <div className="flex items-center gap-2">
                    <h1 className="font-display text-2xl font-bold text-navy">
                      {talent.stageName}
                    </h1>
                    {talent.isVerified && (
                      <Badge tone="lime">
                        <CircleCheck className="h-3 w-3" /> Vérifié
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-1 text-sm text-muted">
                    {categoryLabel} ·{" "}
                    <span className="inline-flex items-center gap-0.5 font-semibold text-gold">
                      <Star className="h-3.5 w-3.5 fill-current" /> {ratingAverage.toFixed(1)}
                    </span>{" "}
                    ({talent.ratingCount} avis)
                    {talent.location && (
                      <span className="inline-flex items-center gap-0.5">
                        · <MapPin className="h-3.5 w-3.5" /> {talent.location}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <PublicMediaGallery media={galleryMedia} talentName={talent.stageName} />

              {talent.bio && (
                <>
                  <h2 className="mt-8 font-display text-lg font-bold text-navy">À propos</h2>
                  <p className="mt-2 text-sm leading-relaxed text-navy/70">{talent.bio}</p>
                </>
              )}

              {talent.packages.length > 0 && (
                <>
                  <h2 className="mt-8 font-display text-lg font-bold text-navy">Formules</h2>
                  <div className="mt-3 space-y-3">
                    {talent.packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className={`flex items-center justify-between rounded-2xl border px-5 py-4 ${
                          pkg.isPopular ? "border-lime/40 bg-lime/10" : "border-navy/10 bg-white"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2 font-semibold text-navy">
                            {pkg.name}
                            {pkg.isPopular && <Badge tone="lime">POPULAIRE</Badge>}
                          </div>
                          {pkg.description && (
                            <div className="mt-1 text-xs text-muted">{pkg.description}</div>
                          )}
                        </div>
                        <div className="font-display font-bold text-navy">
                          {Number(pkg.price).toLocaleString("fr-FR")} F
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {reviews.length > 0 && (
                <>
                  <h2 className="mt-8 font-display text-lg font-bold text-navy">Avis clients</h2>
                  <div className="mt-3 space-y-3">
                    {reviews.map((review) => (
                      <div key={review.id} className="rounded-2xl border border-navy/10 bg-white p-4">
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="font-semibold text-navy">
                            {review.author.firstName} {review.author.lastName}
                          </span>
                          <span className="flex items-center gap-0.5 text-gold">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="h-3.5 w-3.5 fill-current" />
                            ))}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-navy/70">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div>
              <div className="sticky top-24 rounded-2xl border border-navy/10 bg-white p-6 shadow-lg shadow-navy/5">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-2xl font-bold text-navy">
                    {featuredPrice.toLocaleString("fr-FR")} F
                  </span>
                  <span className="text-xs text-muted">/ prestation</span>
                </div>
                <p className="mt-1 text-xs text-muted">Devis instantané · sans engagement</p>

                <div className="mt-5 space-y-2 rounded-xl border border-navy/10 p-3 text-sm">
                  <div className="flex justify-between text-navy/70">
                    <span>Prestation</span>
                    <span className="text-navy">{featuredPrice.toLocaleString("fr-FR")} F</span>
                  </div>
                  <div className="flex justify-between text-navy/70">
                    <span>Frais de service (5%)</span>
                    <span className="text-navy">{serviceFee.toLocaleString("fr-FR")} F</span>
                  </div>
                  <div className="flex justify-between border-t border-navy/10 pt-2 font-bold text-navy">
                    <span>Total</span>
                    <span>{(featuredPrice + serviceFee).toLocaleString("fr-FR")} F</span>
                  </div>
                </div>

                <Suspense fallback={<Button className="mt-4 w-full">Réserver maintenant</Button>}>
                  <BookingPanel
                    talentId={id}
                    stageName={talent.stageName}
                    packages={talent.packages}
                    basePriceFrom={talent.basePriceFrom ? Number(talent.basePriceFrom) : null}
                  />
                </Suspense>
                {/* Pas de contact direct avec l'artiste : Event Prest'Art est l'unique intermédiaire. */}
                <Link
                  href="/contact"
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-navy/15 px-5 py-2.5 font-display text-sm font-semibold text-navy transition-colors hover:bg-navy/5"
                >
                  <Headset className="h-4 w-4" /> Une question ? Contactez Event Prest&apos;Art
                </Link>
                <p className="mt-3 text-center text-[11px] text-muted">
                  Paiement sécurisé Wave · Orange Money · Stripe
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
