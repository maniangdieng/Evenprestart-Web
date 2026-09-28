import Image from "next/image";
import Link from "next/link";
import { Star, CircleCheck } from "lucide-react";
import { Badge } from "../ui/badge";
import { getInitials } from "@/lib/initials";

export interface TalentCardData {
  id: string;
  stageName: string;
  categoryLabel: string;
  location?: string;
  priceFrom: number;
  ratingAverage: number;
  ratingCount: number;
  isVerified?: boolean;
  imageUrl?: string;
}

export function TalentCard({ talent }: { talent: TalentCardData }) {
  return (
    <Link
      href={`/talents/${talent.id}`}
      className="group overflow-hidden rounded-2xl border border-navy/10 bg-white transition-shadow hover:shadow-lg hover:shadow-navy/10"
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-gradient-to-br from-navy-light to-navy">
        {talent.imageUrl ? (
          <>
            {/* Fond flouté : remplit le cadre sans déformer ni rogner la photo principale. */}
            <Image
              src={talent.imageUrl}
              alt=""
              aria-hidden
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="scale-110 object-cover opacity-60 blur-xl"
            />
            <Image
              src={talent.imageUrl}
              alt={talent.stageName}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-3xl font-bold text-white/40">
            {getInitials(talent.stageName)}
          </div>
        )}
        {talent.isVerified && (
          <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-lime px-2.5 py-1 text-[10px] font-bold text-navy">
            <CircleCheck className="h-3 w-3" /> Vérifié
          </span>
        )}
      </div>
      <div className="space-y-2 p-4">
        <div className="font-display text-base font-bold text-navy">
          {talent.stageName}
        </div>
        <div className="text-xs text-muted">
          {talent.categoryLabel}
          {talent.location ? ` · ${talent.location}` : ""}
        </div>
        <div className="flex items-center justify-between pt-1">
          <Badge tone="gold">
            <Star className="h-3 w-3 fill-current" /> {talent.ratingAverage.toFixed(1)}{" "}
            <span className="opacity-70">({talent.ratingCount})</span>
          </Badge>
          <span className="font-display text-sm font-bold text-navy">
            {talent.priceFrom.toLocaleString("fr-FR")} F
          </span>
        </div>
      </div>
    </Link>
  );
}
