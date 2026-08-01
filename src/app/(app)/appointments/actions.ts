"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { requireClinicContext, withClinic } from "@/lib/tenant";
import { appointmentSchema, appointmentUpdateSchema, waitlistSchema } from "@/lib/validations/appointment";
import { revalidatePath } from "next/cache";

export async function createAppointment(data: unknown) {
  await requireRole("appointments:write");
  const ctx = await requireClinicContext();

  const parsed = appointmentSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  const { startAt, endAt, ...rest } = parsed.data;
  const appointment = await prisma.appointment.create({
    data: withClinic(ctx, {
      ...rest,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      createdById: ctx.userId,
    }),
  });

  revalidatePath("/appointments");
  return { ok: true, appointment } as const;
}

export async function updateAppointment(id: string, data: unknown) {
  await requireRole("appointments:write");
  const ctx = await requireClinicContext();

  const parsed = appointmentUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  const existing = await prisma.appointment.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
  });
  if (!existing) return { ok: false, errors: { global: ["Rendez-vous introuvable."] } } as const;

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.startAt) updateData.startAt = new Date(parsed.data.startAt);
  if (parsed.data.endAt) updateData.endAt = new Date(parsed.data.endAt);

  const appointment = await prisma.appointment.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/appointments");
  return { ok: true, appointment } as const;
}

export async function deleteAppointment(id: string) {
  await requireRole("appointments:write");
  const ctx = await requireClinicContext();

  const existing = await prisma.appointment.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
  });
  if (!existing) return { ok: false, errors: { global: ["Rendez-vous introuvable."] } } as const;

  await prisma.appointment.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/appointments");
  return { ok: true } as const;
}

export async function listAppointments(date?: string) {
  await requireRole("appointments:read");
  const ctx = await requireClinicContext();

  const start = date ? new Date(date) : new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const appointments = await prisma.appointment.findMany({
    where: {
      clinicId: ctx.clinicId,
      deletedAt: null,
      startAt: { gte: start, lt: end },
    },
    orderBy: { startAt: "asc" },
    include: {
      patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
      dentist: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  return appointments;
}

export async function getDentists() {
  await requireRole("appointments:read");
  const ctx = await requireClinicContext();

  return prisma.user.findMany({
    where: {
      clinicId: ctx.clinicId,
      isActive: true,
      deletedAt: null,
      role: { in: ["OWNER", "DENTIST"] },
    },
    select: { id: true, firstName: true, lastName: true },
    orderBy: { lastName: "asc" },
  });
}
