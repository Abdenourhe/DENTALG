"use server";

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
import { AuditAction, Prisma } from "@prisma/client";

function prismaError(errors: Record<string, string[]>): {
  ok: false;
  errors: Record<string, string[]>;
} {
  return { ok: false, errors } as const;
}

function normalizeOptional(value: string | undefined): string | null {
  return value === undefined || value === "" ? null : value;
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
    const d = parsed.data;

    const patient = await prisma.patient.create({
      data: withClinic(ctx, {
        number,
        firstName: d.firstName,
        lastName: d.lastName,
        nationalId: normalizeOptional(d.nationalId),
        sex: normalizeOptional(d.sex),
        bloodGroup: normalizeOptional(d.bloodGroup),
        dateOfBirth: d.dateOfBirth ? new Date(d.dateOfBirth) : null,
        phone: normalizeOptional(d.phone),
        email: normalizeOptional(d.email),
        address: normalizeOptional(d.address),
        city: normalizeOptional(d.city),
        wilaya: normalizeOptional(d.wilaya),
        emergencyContactName: normalizeOptional(d.emergencyContactName),
        emergencyContactPhone: normalizeOptional(d.emergencyContactPhone),
        medicalHistory: normalizeOptional(d.medicalHistory),
        allergies: normalizeOptional(d.allergies),
        currentMedications: normalizeOptional(d.currentMedications),
        notes: normalizeOptional(d.notes),
      }),
    });

    await logAudit({
      action: AuditAction.CREATE,
      entityType: "Patient",
      entityId: patient.id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
    });

    revalidatePath("/patients");
    return { ok: true, patient } as const;
  } catch (err) {
    console.error("createPatient error", err);
    return prismaError({
      global: [
        `Une erreur est survenue lors de la création du patient. ${
          err instanceof Error ? err.message : ""
        }`,
      ],
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

    const d = parsed.data;
    const normalized: Prisma.PatientUpdateInput = {};

    if (d.firstName !== undefined) normalized.firstName = d.firstName;
    if (d.lastName !== undefined) normalized.lastName = d.lastName;
    if (d.nationalId !== undefined)
      normalized.nationalId = normalizeOptional(d.nationalId);
    if (d.sex !== undefined) normalized.sex = normalizeOptional(d.sex);
    if (d.bloodGroup !== undefined)
      normalized.bloodGroup = normalizeOptional(d.bloodGroup);
    if (d.dateOfBirth !== undefined)
      normalized.dateOfBirth = d.dateOfBirth ? new Date(d.dateOfBirth) : null;
    if (d.phone !== undefined) normalized.phone = normalizeOptional(d.phone);
    if (d.email !== undefined) normalized.email = normalizeOptional(d.email);
    if (d.address !== undefined)
      normalized.address = normalizeOptional(d.address);
    if (d.city !== undefined) normalized.city = normalizeOptional(d.city);
    if (d.wilaya !== undefined) normalized.wilaya = normalizeOptional(d.wilaya);
    if (d.emergencyContactName !== undefined)
      normalized.emergencyContactName = normalizeOptional(
        d.emergencyContactName,
      );
    if (d.emergencyContactPhone !== undefined)
      normalized.emergencyContactPhone = normalizeOptional(
        d.emergencyContactPhone,
      );
    if (d.medicalHistory !== undefined)
      normalized.medicalHistory = normalizeOptional(d.medicalHistory);
    if (d.allergies !== undefined)
      normalized.allergies = normalizeOptional(d.allergies);
    if (d.currentMedications !== undefined)
      normalized.currentMedications = normalizeOptional(d.currentMedications);
    if (d.notes !== undefined) normalized.notes = normalizeOptional(d.notes);

    const patient = await prisma.patient.update({
      where: { id },
      data: normalized,
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

export async function archivePatient(id: string) {
  await requireRole("patients:write");
  const ctx = await requireClinicContext();

  try {
    const existing = await prisma.patient.findFirst({
      where: { id, clinicId: ctx.clinicId, deletedAt: null },
    });
    if (!existing) return prismaError({ global: ["Patient introuvable."] });

    const patient = await prisma.patient.update({
      where: { id },
      data: { isActive: false },
    });

    await logAudit({
      action: AuditAction.UPDATE,
      entityType: "Patient",
      entityId: id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
      metadata: { isActive: false },
    });

    revalidatePath("/patients");
    revalidatePath(`/patients/${id}`);
    return { ok: true, patient } as const;
  } catch (err) {
    console.error("archivePatient error", err);
    return prismaError({
      global: [
        `Une erreur est survenue lors de l'archivage du patient. ${
          err instanceof Error ? err.message : ""
        }`,
      ],
    });
  }
}

export async function restorePatient(id: string) {
  await requireRole("patients:write");
  const ctx = await requireClinicContext();

  try {
    const existing = await prisma.patient.findFirst({
      where: { id, clinicId: ctx.clinicId, deletedAt: null },
    });
    if (!existing) return prismaError({ global: ["Patient introuvable."] });

    const patient = await prisma.patient.update({
      where: { id },
      data: { isActive: true },
    });

    await logAudit({
      action: AuditAction.UPDATE,
      entityType: "Patient",
      entityId: id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
      metadata: { isActive: true },
    });

    revalidatePath("/patients");
    revalidatePath(`/patients/${id}`);
    return { ok: true, patient } as const;
  } catch (err) {
    console.error("restorePatient error", err);
    return prismaError({
      global: [
        `Une erreur est survenue lors de la réactivation du patient. ${
          err instanceof Error ? err.message : ""
        }`,
      ],
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
  } catch (err) {
    console.error("deletePatient error", err);
    return prismaError({
      global: [
        `Une erreur est survenue lors de la suppression du patient. ${
          err instanceof Error ? err.message : ""
        }`,
      ],
    });
  }
}

export async function listPatients(search?: string, archived?: boolean) {
  await requireRole("patients:read");
  const ctx = await requireClinicContext();

  const patients = await prisma.patient.findMany({
    where: {
      clinicId: ctx.clinicId,
      deletedAt: null,
      isActive: archived ? false : true,
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
      prescriptions: {
        where: { deletedAt: null },
        orderBy: { issuedAt: "desc" },
        take: 5,
        include: { items: { orderBy: { position: "asc" } } },
      },
      labOrders: {
        where: { deletedAt: null },
        orderBy: { orderedAt: "desc" },
        take: 5,
        include: { results: { orderBy: { testName: "asc" } } },
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
    const { patientId, tooth, status, surfaces, notes } = parsed.data;

    const existing = await prisma.toothStatus.findUnique({
      where: {
        clinicId_patientId_tooth: { clinicId: ctx.clinicId, patientId, tooth },
      },
    });

    if (existing) {
      await prisma.toothStatus.update({
        where: { id: existing.id },
        data: {
          status,
          surfaces: (surfaces ?? existing.surfaces ?? undefined) as
            Prisma.InputJsonValue | undefined,
          notes,
          updatedAt: new Date(),
        },
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
        data: withClinic(ctx, { patientId, tooth, status, surfaces, notes }),
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
      metadata: { status, surfaces },
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
