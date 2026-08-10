// Gestionnaire simple de connexions Server-Sent Events pour la salle d'attente.
// Limitation : en mode serverless (Vercel), les connexions longues peuvent être
// coupées par la plateforme. Le client gère la reconnexion automatique.

export interface WaitingRoomClient {
  id: string;
  clinicId: string;
  controller: ReadableStreamDefaultController<string>;
}

const clients = new Map<string, WaitingRoomClient>();
let idCounter = 0;

function generateId() {
  idCounter += 1;
  return `${Date.now()}-${idCounter}`;
}

export function addWaitingRoomClient(
  clinicId: string,
  controller: ReadableStreamDefaultController<string>,
): string {
  const id = generateId();
  clients.set(id, { id, clinicId, controller });
  return id;
}

export function removeWaitingRoomClient(id: string) {
  clients.delete(id);
}

export function broadcastWaitingRoomUpdate(clinicId: string) {
  const message = `event: update\ndata: ${JSON.stringify({ clinicId, ts: Date.now() })}\n\n`;
  for (const client of clients.values()) {
    if (client.clinicId === clinicId) {
      try {
        client.controller.enqueue(message);
      } catch {
        // Connexion probablement fermée : on nettoiera au prochain heartbeat.
      }
    }
  }
}

export function getWaitingRoomClientCount(clinicId?: string) {
  if (!clinicId) return clients.size;
  return Array.from(clients.values()).filter((c) => c.clinicId === clinicId)
    .length;
}
