"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { requireClinicContext, withClinic } from "@/lib/tenant";
import { roomSchema, roomUpdateSchema } from "@/lib/validations/room";
import { revalidatePath } from "next/cache";

function prismaError(errors: Record<string, string[]>): {
  ok: false;
  errors: Record<string, string[]>;
} {
  return { ok: false, errors } as const;
}

export async function listRooms() {
  await requireRole("rooms:manage");
  const ctx = await requireClinicContext();

  const rooms = await prisma.room.findMany({
    where: { clinicId: ctx.clinicId, deletedAt: null },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  return rooms;
}

export async function createRoom(data: unknown) {
  await requireRole("rooms:manage");
  const ctx = await requireClinicContext();

  const parsed = roomSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  try {
    const room = await prisma.room.create({
      data: withClinic(ctx, {
        name: parsed.data.name,
        order: parsed.data.order,
        isActive:
          parsed.data.isActive === "" ? true : parsed.data.isActive === "on",
      }),
    });

    revalidatePath("/settings/rooms");
    revalidatePath("/waiting-room");
    return { ok: true, room } as const;
  } catch {
    return prismaError({ global: ["Une erreur est survenue."] });
  }
}

export async function updateRoom(id: string, data: unknown) {
  await requireRole("rooms:manage");
  const ctx = await requireClinicContext();

  const parsed = roomUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  try {
    const existing = await prisma.room.findFirst({
      where: { id, clinicId: ctx.clinicId, deletedAt: null },
    });
    if (!existing) return prismaError({ global: ["Salle introuvable."] });

    const normalized: { name?: string; order?: number; isActive?: boolean } =
      {};
    if (parsed.data.name !== undefined) normalized.name = parsed.data.name;
    if (parsed.data.order !== undefined) normalized.order = parsed.data.order;
    if (parsed.data.isActive !== undefined)
      normalized.isActive = parsed.data.isActive === "on";

    const room = await prisma.room.update({
      where: { id },
      data: normalized,
    });

    revalidatePath("/settings/rooms");
    revalidatePath("/waiting-room");
    return { ok: true, room } as const;
  } catch {
    return prismaError({ global: ["Une erreur est survenue."] });
  }
}

export async function deleteRoom(id: string) {
  await requireRole("rooms:manage");
  const ctx = await requireClinicContext();

  try {
    const existing = await prisma.room.findFirst({
      where: { id, clinicId: ctx.clinicId, deletedAt: null },
    });
    if (!existing) return prismaError({ global: ["Salle introuvable."] });

    await prisma.room.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/settings/rooms");
    revalidatePath("/waiting-room");
    return { ok: true } as const;
  } catch {
    return prismaError({ global: ["Une erreur est survenue."] });
  }
}
