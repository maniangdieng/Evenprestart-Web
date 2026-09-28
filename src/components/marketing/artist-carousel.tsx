"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { TalentCardData } from "@/components/talents/talent-card";
import { getInitials } from "@/lib/initials";

const FALLBACK_GRADIENTS = [
  "linear-gradient(135deg, #c7e23f, #7c9a1f)",
  "linear-gradient(135deg, #e08a4c, #e6b54a)",
  "linear-gradient(135deg, #e6b54a, #e08a4c)",
];

export function ArtistCarousel({ talents }: { talents: TalentCardData[] }) {
  const [active, setActive] = useState(0);
  const n = talents.length;

  useEffect(() => {
    if (n < 2) return;
    const id = setInterval(() => {
      setActive((a) => (a + 1) % n);
    }, 2800);
    return () => clearInterval(id);
  }, [n]);

  if (n === 0) return null;

  // Only the previous/current/next cards are ever visible in the stack, so
  // only mount those — the full talent list can be much larger than 3.
  const visible = Array.from(new Set([(active - 1 + n) % n, active, (active + 1) % n])).map(
    (index) => ({ index, talent: talents[index] }),
  );

  return (
    // --carousel-offset : décalage des cartes latérales, proportionnel à leur largeur.
    <div className="relative h-full w-full [--carousel-offset:78px] lg:[--carousel-offset:112px]">
      {visible.map(({ index: i, talent }) => {
        const signed = ((i - active + 1 + n) % n) - 1; // -1, 0, 1
        const isFront = signed === 0;
        const rotate = signed * 12;
        const scale = isFront ? 1 : 0.86;
        const z = isFront ? 30 : 20 - Math.abs(signed);
        const opacity = isFront ? 1 : 0.7;

        return (
          <Link
            key={talent.id}
            href={`/talents/${talent.id}`}
            aria-label={talent.stageName}
            className="absolute left-1/2 top-1/2 h-72 w-52 overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-navy/30 transition-all duration-700 ease-out lg:h-[26rem] lg:w-72"
            style={{
              transform: `translate(-50%, -50%) translateX(calc(var(--carousel-offset) * ${signed})) rotate(${rotate}deg) scale(${scale})`,
              zIndex: z,
              opacity,
              backgroundImage: talent.imageUrl
                ? undefined
                : FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length],
            }}
            onClick={(e) => {
              if (!isFront) {
                e.preventDefault();
                setActive(i);
              }
            }}
          >
            {talent.imageUrl ? (
              <Image
                src={talent.imageUrl}
                alt={talent.stageName}
                fill
                sizes="(min-width: 1024px) 288px, 208px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center font-display text-4xl font-bold text-white/30">
                {getInitials(talent.stageName)}
              </div>
            )}
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-navy/95 via-navy/10 to-transparent p-4 text-left">
              <div className="font-display text-lg font-bold text-white">{talent.stageName}</div>
              <div className="text-sm text-white/70">{talent.categoryLabel}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
