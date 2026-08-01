"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { requireClinicContext, withClinic } from "@/lib/tenant";
import {
  patientSchema,
  patientUpdateSchema,
  medicalNoteSchema,
  toothStatusSchema,
} from "@/lib/validations/patient";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { nextNumber } from "@/lib/billing/numbering";
import { logAudit } from "@/lib/audit";
import { AuditAction } from "@prisma/client";

function prismaError(errors: Record<string, string[]>): {
  ok: false;
  errors: Record<string, string[]>;
} {
  return { ok: false, errors } as const;
}

export async function createPatient(data: unknown) {
  await requireRole("patients:write");
  const ctx = await requireClinicContext();

  const parsed = patientSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  try {
    const number = await nextNumber(ctx.clinicId, "PATIENT", { pad: 4 });
    const payload = withClinic(ctx, {
      ...parsed.data,
      number,
      dateOfBirth: parsed.data.dateOfBirth
        ? new Date(parsed.data.dateOfBirth)
        : null,
    });

    const patient = await prisma.patient.create({ data: payload });

    await logAudit({
      action: AuditAction.CREATE,
      entityType: "Patient",
      entityId: patient.id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
    });

    revalidatePath("/patients");
    return { ok: true, patient } as const;
  } catch {
    return prismaError({
      global: ["Une erreur est survenue lors de la création du patient."],
    });
  }
}

export async function updatePatient(id: string, data: unknown) {
  await requireRole("patients:write");
  const ctx = await requireClinicContext();

  const parsed = patientUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  try {
    const existing = await prisma.patient.findFirst({
      where: { id, clinicId: ctx.clinicId, deletedAt: null },
    });
    if (!existing) return prismaError({ global: ["Patient introuvable."] });

    const updateData = {
      ...parsed.data,
      dateOfBirth: parsed.data.dateOfBirth
        ? new Date(parsed.data.dateOfBirth)
        : null,
    };

    const patient = await prisma.patient.update({
      where: { id },
      data: updateData,
    });

    await logAudit({
      action: AuditAction.UPDATE,
      entityType: "Patient",
      entityId: id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
    });

    revalidatePath("/patients");
    revalidatePath(`/patients/${id}`);
    return { ok: true, patient } as const;
  } catch {
    return prismaError({
      global: ["Une erreur est survenue lors de la mise à jour du patient."],
    });
  }
}

export async function deletePatient(id: string) {
  await requireRole("patients:write");
  const ctx = await requireClinicContext();

  try {
    const existing = await prisma.patient.findFirst({
      where: { id, clinicId: ctx.clinicId, deletedAt: null },
    });
    if (!existing) return prismaError({ global: ["Patient introuvable."] });

    await prisma.patient.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await logAudit({
      action: AuditAction.DELETE,
      entityType: "Patient",
      entityId: id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
    });

    revalidatePath("/patients");
    return { ok: true } as const;
  } catch {
    return prismaError({
      global: ["Une erreur est survenue lors de la suppression du patient."],
    });
  }
}

export async function listPatients(search?: string) {
  await requireRole("patients:read");
  const ctx = await requireClinicContext();

  const patients = await prisma.patient.findMany({
    where: {
      clinicId: ctx.clinicId,
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" as const } },
              { lastName: { contains: search, mode: "insensitive" as const } },
              { phone: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: { lastName: "asc" },
    include: {
      _count: {
        select: { appointments: true, invoices: true },
      },
    },
  });

  return patients;
}

export async function getPatient(id: string) {
  await requireRole("patients:read");
  const ctx = await requireClinicContext();

  const patient = await prisma.patient.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
    include: {
      medicalNotes: { orderBy: { createdAt: "desc" } },
      toothStatuses: {
        include: { events: { orderBy: { createdAt: "desc" }, take: 1 } },
      },
      treatmentPlans: {
        include: { items: { include: { procedure: true } } },
        orderBy: { createdAt: "desc" },
      },
      appointments: {
        where: { deletedAt: null },
        orderBy: { startAt: "desc" },
        take: 10,
      },
      invoices: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!patient) notFound();
  return patient;
}

export async function createMedicalNote(data: unknown) {
  await requireRole("patients:write");
  const ctx = await requireClinicContext();

  const parsed = medicalNoteSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  try {
    const note = await prisma.medicalNote.create({
      data: withClinic(ctx, {
        ...parsed.data,
        createdById: ctx.userId,
      }),
    });

    await logAudit({
      action: AuditAction.CREATE,
      entityType: "MedicalNote",
      entityId: note.id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
    });

    revalidatePath(`/patients/${parsed.data.patientId}`);
    return { ok: true, note } as const;
  } catch {
    return prismaError({
      global: ["Une erreur est survenue lors de la création de la note."],
    });
  }
}

export async function upsertToothStatus(data: unknown) {
  await requireRole("patients:write");
  const ctx = await requireClinicContext();

  const parsed = toothStatusSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  try {
    const { patientId, tooth, status, notes } = parsed.data;

    const existing = await prisma.toothStatus.findUnique({
      where: {
        clinicId_patientId_tooth: { clinicId: ctx.clinicId, patientId, tooth },
      },
    });

    if (existing) {
      await prisma.toothStatus.update({
        where: { id: existing.id },
        data: { status, notes, updatedAt: new Date() },
      });
      await prisma.toothStatusEvent.create({
        data: withClinic(ctx, {
          toothStatusId: existing.id,
          patientId,
          createdById: ctx.userId,
          oldStatus: existing.status,
          newStatus: status,
          notes,
        }),
      });
    } else {
      const created = await prisma.toothStatus.create({
        data: withClinic(ctx, { patientId, tooth, status, notes }),
      });
      await prisma.toothStatusEvent.create({
        data: withClinic(ctx, {
          toothStatusId: created.id,
          patientId,
          createdById: ctx.userId,
          newStatus: status,
          notes,
        }),
      });
    }

    await logAudit({
      action: AuditAction.UPDATE,
      entityType: "ToothStatus",
      entityId: `${patientId}-${tooth}`,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
      metadata: { status },
    });

    revalidatePath(`/patients/${patientId}`);
    return { ok: true } as const;
  } catch {
    return prismaError({
      global: [
        "Une erreur est survenue lors de la mise à jour du statut dentaire.",
      ],
    });
  }
}
