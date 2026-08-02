"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { requireClinicContext, withClinic } from "@/lib/tenant";
import {
  appointmentSchema,
  appointmentUpdateSchema,
} from "@/lib/validations/appointment";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { AuditAction } from "@prisma/client";

function prismaError(errors: Record<string, string[]>): {
  ok: false;
  errors: Record<string, string[]>;
} {
  return { ok: false, errors } as const;
}

async function hasConflict(
  clinicId: string,
  dentistId: string,
  startAt: Date,
  endAt: Date,
  excludeId?: string,
): Promise<boolean> {
  const conflict = await prisma.appointment.findFirst({
    where: {
      clinicId,
      dentistId,
      deletedAt: null,
      status: { notIn: ["CANCELLED", "NO_SHOW"] },
      id: excludeId ? { not: excludeId } : undefined,
      AND: [{ startAt: { lt: endAt } }, { endAt: { gt: startAt } }],
    },
  });
  return !!conflict;
}

export async function createAppointment(data: unknown) {
  await requireRole("appointments:write");
  const ctx = await requireClinicContext();

  const parsed = appointmentSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  try {
    const { startAt, endAt, ...rest } = parsed.data;
    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    if (await hasConflict(ctx.clinicId, rest.dentistId, startDate, endDate)) {
      return prismaError({
        global: ["Ce créneau est déjà occupé pour ce dentiste."],
      });
    }

    const appointment = await prisma.appointment.create({
      data: withClinic(ctx, {
        ...rest,
        startAt: startDate,
        endAt: endDate,
        createdById: ctx.userId,
      }),
    });

    await logAudit({
      action: AuditAction.CREATE,
      entityType: "Appointment",
      entityId: appointment.id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
    });

    revalidatePath("/appointments");
    return { ok: true, appointment } as const;
  } catch {
    return prismaError({
      global: ["Une erreur est survenue lors de la création du rendez-vous."],
    });
  }
}

export async function updateAppointment(id: string, data: unknown) {
  await requireRole("appointments:write");
  const ctx = await requireClinicContext();

  const parsed = appointmentUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  try {
    const existing = await prisma.appointment.findFirst({
      where: { id, clinicId: ctx.clinicId, deletedAt: null },
    });
    if (!existing) return prismaError({ global: ["Rendez-vous introuvable."] });

    const startDate = parsed.data.startAt
      ? new Date(parsed.data.startAt)
      : existing.startAt;
    const endDate = parsed.data.endAt
      ? new Date(parsed.data.endAt)
      : existing.endAt;
    const dentistId = parsed.data.dentistId ?? existing.dentistId;

    if (await hasConflict(ctx.clinicId, dentistId, startDate, endDate, id)) {
      return prismaError({
        global: ["Ce créneau est déjà occupé pour ce dentiste."],
      });
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.startAt) updateData.startAt = startDate;
    if (parsed.data.endAt) updateData.endAt = endDate;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
    });

    await logAudit({
      action: AuditAction.UPDATE,
      entityType: "Appointment",
      entityId: id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
    });

    revalidatePath("/appointments");
    return { ok: true, appointment } as const;
  } catch {
    return prismaError({
      global: [
        "Une erreur est survenue lors de la mise à jour du rendez-vous.",
      ],
    });
  }
}

export async function deleteAppointment(id: string) {
  await requireRole("appointments:write");
  const ctx = await requireClinicContext();

  try {
    const existing = await prisma.appointment.findFirst({
      where: { id, clinicId: ctx.clinicId, deletedAt: null },
    });
    if (!existing) return prismaError({ global: ["Rendez-vous introuvable."] });

    await prisma.appointment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await logAudit({
      action: AuditAction.DELETE,
      entityType: "Appointment",
      entityId: id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
    });

    revalidatePath("/appointments");
    return { ok: true } as const;
  } catch {
    return prismaError({
      global: [
        "Une erreur est survenue lors de la suppression du rendez-vous.",
      ],
    });
  }
}

export async function getAppointment(id: string) {
  await requireRole("appointments:read");
  const ctx = await requireClinicContext();

  return prisma.appointment.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
    include: {
      patient: {
        select: { id: true, firstName: true, lastName: true, phone: true },
      },
      dentist: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function listAppointmentsRange(
  startDate: string,
  endDate: string,
) {
  await requireRole("appointments:read");
  const ctx = await requireClinicContext();

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const appointments = await prisma.appointment.findMany({
    where: {
      clinicId: ctx.clinicId,
      deletedAt: null,
      startAt: { gte: start, lte: end },
    },
    orderBy: { startAt: "asc" },
    include: {
      patient: {
        select: { id: true, firstName: true, lastName: true, phone: true },
      },
      dentist: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  return appointments;
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
      patient: {
        select: { id: true, firstName: true, lastName: true, phone: true },
      },
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
