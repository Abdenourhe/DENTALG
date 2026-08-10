import { auth } from "@/auth";
import {
  addWaitingRoomClient,
  removeWaitingRoomClient,
} from "@/lib/waiting-room-events";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const clinicId = session?.user?.clinicId;

  if (!clinicId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<string>({
    start(controller) {
      const clientId = addWaitingRoomClient(clinicId, controller);

      // Envoi initial pour confirmer la connexion
      controller.enqueue(
        `event: connected\ndata: ${JSON.stringify({ clinicId })}\n\n`,
      );

      // Heartbeat pour éviter les timeouts de proxy
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(`event: heartbeat\ndata: {}\n\n`);
        } catch {
          clearInterval(heartbeat);
          removeWaitingRoomClient(clientId);
        }
      }, 15000);

      // Nettoyage si le client se déconnecte
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const cleanup = () => {
        clearInterval(heartbeat);
        removeWaitingRoomClient(clientId);
      };
    },
  });

  return new Response(stream as unknown as ReadableStream<Uint8Array>, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
