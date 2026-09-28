import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Racine fixée sur ce dossier : sinon Turbopack remonte jusqu'au premier
  // package-lock.json trouvé (ex. un lockfile égaré dans C:\Users\<user>) et
  // surveille/indexe tout le profil utilisateur — cache de plusieurs Go,
  // serveur saturé et chunks JS tronqués ("Unexpected end of input").
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  // Polling du watcher (Turbopack) activé seulement si demandé — cf.
  // docker-compose.yml : dans Docker sous WSL, les événements fichiers de
  // Windows n'arrivent pas au conteneur.
  ...(process.env.WATCH_POLL_INTERVAL_MS && {
    watchOptions: { pollIntervalMs: Number(process.env.WATCH_POLL_INTERVAL_MS) },
  }),
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
