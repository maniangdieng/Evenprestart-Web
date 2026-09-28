import { io, type Socket } from "socket.io-client";

const REALTIME_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/** Ouvre le canal temps réel authentifié (notifications + messagerie support). */
export function createRealtimeSocket(token: string): Socket {
  return io(`${REALTIME_URL}/realtime`, {
    auth: { token },
    transports: ["websocket"],
  });
}
