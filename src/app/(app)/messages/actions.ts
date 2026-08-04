"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function listMyMessages() {
  const session = await auth();
  if (!session?.user?.clinicId) {
    return { ok: false, error: "Non authentifié" } as const;
  }

  const { clinicId, role } = session.user;

  const messages = await prisma.platformMessage.findMany({
    where: {
      OR: [
        { isBroadcast: true },
        { targetClinicId: clinicId },
        { targetClinicId: null, targetRole: null },
      ],
      AND: [
        {
          OR: [{ targetRole: null }, { targetRole: role }],
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return { ok: true, messages } as const;
}

export async function markMessageAsRead(messageId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Non authentifié" } as const;
  }

  await prisma.platformMessage.update({
    where: { id: messageId },
    data: {
      readBy: {
        push: session.user.id,
      },
    },
  });

  revalidatePath("/messages");
  return { ok: true } as const;
}
