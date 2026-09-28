import { existsSync } from "node:fs";
import { join } from "node:path";

const PUBLIC_DIR = join(process.cwd(), "public");

export function getHeroMedia() {
  const videoPath = "/media/hero.mp4";
  const posterPath = "/media/hero-poster.jpg";
  const hasVideo = existsSync(join(PUBLIC_DIR, "media", "hero.mp4"));
  const hasPoster = existsSync(join(PUBLIC_DIR, "media", "hero-poster.jpg"));
  return {
    videoSrc: hasVideo ? videoPath : undefined,
    posterSrc: hasPoster ? posterPath : undefined,
  };
}
