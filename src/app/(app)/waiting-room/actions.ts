"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { requireClinicContext, withClinic } from "@/lib/tenant";
import {
  checkInSchema,
  entryActionSchema,
  notifyStaffSchema,
  updatePrioritySchema,
} from "@/lib/validations/waiting-room";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { AuditAction } from "@prisma/client";

function prismaError(errors: Record<string, string[]>): {
  ok: false;
  errors: Record<string, string[]>;
} {
  return { ok: false, errors } as const;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function listWaitingRoom(date?: string) {
  await requireRole("waiting_room:read");
  const ctx = await requireClinicContext();

  const baseDate = date ? new Date(date) : new Date();

  const entries = await prisma.waitingRoomEntry.findMany({
    where: {
      clinicId: ctx.clinicId,
      deletedAt: null,
      arrivedAt: { gte: startOfDay(baseDate), lte: endOfDay(baseDate) },
    },
    include: {
      patient: true,
      appointment: true,
      dentist: { select: { id: true, firstName: true, lastName: true } },
      calledBy: { select: { id: true, firstName: true, lastName: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: [
      {
        priority: "asc",
      },
      {
        arrivedAt: "asc",
      },
    ],
  });

  return entries;
}

export async function listActiveWaitingRoom() {
  await requireRole("waiting_room:read");
  const ctx = await requireClinicContext();

  const entries = await prisma.waitingRoomEntry.findMany({
    where: {
      clinicId: ctx.clinicId,
      deletedAt: null,
      status: { in: ["WAITING", "CALLED", "IN_PROGRESS"] },
    },
    include: {
      patient: true,
      appointment: true,
      dentist: { select: { id: true, firstName: true, lastName: true } },
      calledBy: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: [
      {
        priority: "asc",
      },
      {
        arrivedAt: "asc",
      },
    ],
  });

  return entries;
}

export async function checkInPatient(data: unknown) {
  await requireRole("waiting_room:write");
  const ctx = await requireClinicContext();

  const parsed = checkInSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  try {
    // Vérifier que le patient appartient au cabinet
    const patient = await prisma.patient.findFirst({
      where: { id: parsed.data.patientId, clinicId: ctx.clinicId },
    });
    if (!patient) {
      return prismaError({ global: ["Patient introuvable."] });
    }

    const entry = await prisma.waitingRoomEntry.create({
      data: withClinic(ctx, {
        patientId: parsed.data.patientId,
        appointmentId: parsed.data.appointmentId || null,
        dentistId: parsed.data.dentistId || null,
        priority: parsed.data.priority,
        arrivalType: parsed.data.arrivalType,
        notes: parsed.data.notes || null,
        createdById: ctx.userId,
      }),
    });

    await logAudit({
      action: AuditAction.CREATE,
      entityType: "WaitingRoomEntry",
      entityId: entry.id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
      metadata: {
        patientId: entry.patientId,
        status: entry.status,
        priority: entry.priority,
      },
    });

    revalidatePath("/waiting-room");
    revalidatePath("/waiting-room/display");
    return { ok: true, entry } as const;
  } catch {
    return prismaError({
      global: [
        "Une erreur est survenue lors de l'enregistrement de l'arrivée.",
      ],
    });
  }
}

export async function callPatient(entryId: string) {
  await requireRole("waiting_room:write");
  const ctx = await requireClinicContext();

  const parsed = entryActionSchema.safeParse({ entryId });
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  try {
    const entry = await prisma.waitingRoomEntry.updateMany({
      where: {
        id: parsed.data.entryId,
        clinicId: ctx.clinicId,
        deletedAt: null,
      },
      data: {
        status: "CALLED",
        calledAt: new Date(),
        calledById: ctx.userId,
      },
    });

    if (entry.count === 0) {
      return prismaError({ global: ["Entrée introuvable."] });
    }

    await logAudit({
      action: AuditAction.UPDATE,
      entityType: "WaitingRoomEntry",
      entityId: parsed.data.entryId,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
      metadata: { status: "CALLED" },
    });

    revalidatePath("/waiting-room");
    revalidatePath("/waiting-room/display");

    // Notification automatique à l'assistant / secrétaire
    try {
      await notifyStaff({ entryId: parsed.data.entryId, message: "" });
    } catch {
      // La notification ne doit pas bloquer l'appel.
    }

    return { ok: true } as const;
  } catch {
    return prismaError({
      global: ["Une erreur est survenue lors de l'appel du patient."],
    });
  }
}

export async function startConsultation(entryId: string) {
  await requireRole("waiting_room:write");
  const ctx = await requireClinicContext();

  const parsed = entryActionSchema.safeParse({ entryId });
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  try {
    const entry = await prisma.waitingRoomEntry.updateMany({
      where: {
        id: parsed.data.entryId,
        clinicId: ctx.clinicId,
        deletedAt: null,
      },
      data: {
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
    });

    if (entry.count === 0) {
      return prismaError({ global: ["Entrée introuvable."] });
    }

    await logAudit({
      action: AuditAction.UPDATE,
      entityType: "WaitingRoomEntry",
      entityId: parsed.data.entryId,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
      metadata: { status: "IN_PROGRESS" },
    });

    revalidatePath("/waiting-room");
    revalidatePath("/waiting-room/display");
    return { ok: true } as const;
  } catch {
    return prismaError({
      global: ["Une erreur est survenue lors du début de la consultation."],
    });
  }
}

export async function completeVisit(entryId: string) {
  await requireRole("waiting_room:write");
  const ctx = await requireClinicContext();

  const parsed = entryActionSchema.safeParse({ entryId });
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  try {
    const entry = await prisma.waitingRoomEntry.updateMany({
      where: {
        id: parsed.data.entryId,
        clinicId: ctx.clinicId,
        deletedAt: null,
      },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    if (entry.count === 0) {
      return prismaError({ global: ["Entrée introuvable."] });
    }

    await logAudit({
      action: AuditAction.UPDATE,
      entityType: "WaitingRoomEntry",
      entityId: parsed.data.entryId,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
      metadata: { status: "COMPLETED" },
    });

    revalidatePath("/waiting-room");
    revalidatePath("/waiting-room/display");
    return { ok: true } as const;
  } catch {
    return prismaError({
      global: ["Une erreur est survenue lors de la clôture de la visite."],
    });
  }
}

export async function markNoShow(entryId: string) {
  await requireRole("waiting_room:write");
  const ctx = await requireClinicContext();

  const parsed = entryActionSchema.safeParse({ entryId });
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  try {
    const entry = await prisma.waitingRoomEntry.updateMany({
      where: {
        id: parsed.data.entryId,
        clinicId: ctx.clinicId,
        deletedAt: null,
      },
      data: {
        status: "NO_SHOW",
        completedAt: new Date(),
      },
    });

    if (entry.count === 0) {
      return prismaError({ global: ["Entrée introuvable."] });
    }

    await logAudit({
      action: AuditAction.UPDATE,
      entityType: "WaitingRoomEntry",
      entityId: parsed.data.entryId,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
      metadata: { status: "NO_SHOW" },
    });

    revalidatePath("/waiting-room");
    revalidatePath("/waiting-room/display");
    return { ok: true } as const;
  } catch {
    return prismaError({
      global: ["Une erreur est survenue lors du marquage d'absence."],
    });
  }
}

export async function updatePriority(entryId: string, priority: string) {
  await requireRole("waiting_room:write");
  const ctx = await requireClinicContext();

  const parsed = updatePrioritySchema.safeParse({ entryId, priority });
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  try {
    const entry = await prisma.waitingRoomEntry.updateMany({
      where: {
        id: parsed.data.entryId,
        clinicId: ctx.clinicId,
        deletedAt: null,
      },
      data: {
        priority: parsed.data.priority,
      },
    });

    if (entry.count === 0) {
      return prismaError({ global: ["Entrée introuvable."] });
    }

    revalidatePath("/waiting-room");
    revalidatePath("/waiting-room/display");
    return { ok: true } as const;
  } catch {
    return prismaError({
      global: [
        "Une erreur est survenue lors de la mise à jour de la priorité.",
      ],
    });
  }
}

export async function getPatientFile(patientId: string) {
  await requireRole("waiting_room:read");
  const ctx = await requireClinicContext();

  const patient = await prisma.patient.findFirst({
    where: { id: patientId, clinicId: ctx.clinicId, deletedAt: null },
    include: {
      medicalNotes: { orderBy: { createdAt: "desc" }, take: 5 },
      appointments: {
        where: { deletedAt: null },
        orderBy: { startAt: "desc" },
        take: 5,
        include: {
          dentist: { select: { firstName: true, lastName: true } },
        },
      },
      invoices: {
        where: { deletedAt: null, status: { not: "PAID" } },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      prescriptions: {
        orderBy: { issuedAt: "desc" },
        take: 3,
      },
    },
  });

  if (!patient) return null;
  return patient;
}

export async function notifyStaff(data: unknown) {
  await requireRole("waiting_room:write");
  const ctx = await requireClinicContext();

  const parsed = notifyStaffSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  try {
    const entry = await prisma.waitingRoomEntry.findFirst({
      where: {
        id: parsed.data.entryId,
        clinicId: ctx.clinicId,
        deletedAt: null,
      },
      include: {
        patient: { select: { firstName: true, lastName: true } },
        dentist: { select: { firstName: true, lastName: true } },
      },
    });

    if (!entry) {
      return prismaError({ global: ["Entrée introuvable."] });
    }

    const caller = await prisma.user.findUnique({
      where: { id: ctx.userId },
      select: { firstName: true, lastName: true, role: true },
    });

    const targetUsers = await prisma.user.findMany({
      where: {
        clinicId: ctx.clinicId,
        role: { in: ["ASSISTANT", "SECRETARY"] },
        isActive: true,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (targetUsers.length === 0) {
      return { ok: true, notified: 0 } as const;
    }

    const title = `Salle d'attente — ${entry.patient.firstName} ${entry.patient.lastName}`;
    const content =
      parsed.data.message ||
      `${caller?.firstName ?? "Un praticien"} ${caller?.lastName ?? ""} demande le patient ${entry.patient.firstName} ${entry.patient.lastName}.`;

    await prisma.notification.createMany({
      data: targetUsers.map((u) =>
        withClinic(ctx, {
          userId: u.id,
          title,
          content,
          link: "/waiting-room",
        }),
      ),
    });

    return { ok: true, notified: targetUsers.length } as const;
  } catch {
    return prismaError({
      global: ["Une erreur est survenue lors de l'envoi de la notification."],
    });
  }
}
