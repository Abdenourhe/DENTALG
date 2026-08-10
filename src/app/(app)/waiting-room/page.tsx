import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { requireClinicContext } from "@/lib/tenant";
import { listWaitingRoom } from "./actions";
import WaitingRoomBoard from "./WaitingRoomBoard";

export default async function WaitingRoomPage() {
  await requireRole("waiting_room:read");
  const ctx = await requireClinicContext();

  const [entries, patients, dentists, rooms] = await Promise.all([
    listWaitingRoom(),
    prisma.patient.findMany({
      where: { clinicId: ctx.clinicId, deletedAt: null, isActive: true },
      orderBy: { lastName: "asc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        arabicName: true,
        number: true,
      },
    }),
    prisma.user.findMany({
      where: {
        clinicId: ctx.clinicId,
        deletedAt: null,
        isActive: true,
        role: { in: ["DENTIST", "OWNER"] },
      },
      orderBy: { lastName: "asc" },
      select: { id: true, firstName: true, lastName: true },
    }),
    prisma.room.findMany({
      where: {
        clinicId: ctx.clinicId,
        deletedAt: null,
        isActive: true,
      },
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <WaitingRoomBoard
        initialEntries={entries}
        patients={patients}
        dentists={dentists}
        rooms={rooms}
      />
    </div>
  );
}
