"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { requireClinicContext, withClinic } from "@/lib/tenant";
import {
  prescriptionSchema,
  prescriptionUpdateSchema,
} from "@/lib/validations/prescription";
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

export async function createPrescription(data: unknown) {
  await requireRole("prescriptions:write");
  const ctx = await requireClinicContext();

  const parsed = prescriptionSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  try {
    const number = await nextNumber(ctx.clinicId, "PRESCRIPTION", {
      prefix: "ORD-",
      pad: 4,
    });

    const { patientId, notes, items } = parsed.data;

    const prescription = await prisma.prescription.create({
      data: withClinic(ctx, {
        patientId,
        createdById: ctx.userId,
        number,
        status: "ISSUED",
        notes: notes || null,
        issuedAt: new Date(),
        items: {
          create: items.map((item, index) =>
            withClinic(ctx, {
              ...item,
              dosage: item.dosage || null,
              duration: item.duration || null,
              instructions: item.instructions || null,
              position: index,
            }),
          ),
        },
      }),
      include: { items: { orderBy: { position: "asc" } } },
    });

    await logAudit({
      action: AuditAction.CREATE,
      entityType: "Prescription",
      entityId: prescription.id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
    });

    revalidatePath(`/patients/${patientId}`);
    revalidatePath(`/patients/${patientId}/prescriptions`);

    return { ok: true, prescription } as const;
  } catch {
    return prismaError({
      global: ["Une erreur est survenue lors de la création de l'ordonnance."],
    });
  }
}

export async function updatePrescription(id: string, data: unknown) {
  await requireRole("prescriptions:write");
  const ctx = await requireClinicContext();

  const parsed = prescriptionUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  try {
    const existing = await prisma.prescription.findFirst({
      where: { id, clinicId: ctx.clinicId, deletedAt: null },
      include: { items: true },
    });
    if (!existing) {
      return prismaError({ global: ["Ordonnance introuvable."] });
    }

    const { notes, items, status } = parsed.data;

    await prisma.prescriptionItem.deleteMany({
      where: { prescriptionId: id, clinicId: ctx.clinicId },
    });

    const prescription = await prisma.prescription.update({
      where: { id },
      data: {
        notes: notes || null,
        status: status ?? existing.status,
        items: {
          create: items.map((item, index) =>
            withClinic(ctx, {
              ...item,
              dosage: item.dosage || null,
              duration: item.duration || null,
              instructions: item.instructions || null,
              position: index,
            }),
          ),
        },
      },
      include: { items: { orderBy: { position: "asc" } } },
    });

    await logAudit({
      action: AuditAction.UPDATE,
      entityType: "Prescription",
      entityId: id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
    });

    revalidatePath(`/patients/${existing.patientId}`);
    revalidatePath(`/patients/${existing.patientId}/prescriptions`);
    revalidatePath(`/patients/${existing.patientId}/prescriptions/${id}`);

    return { ok: true, prescription } as const;
  } catch {
    return prismaError({
      global: [
        "Une erreur est survenue lors de la mise à jour de l'ordonnance.",
      ],
    });
  }
}

export async function deletePrescription(id: string) {
  await requireRole("prescriptions:write");
  const ctx = await requireClinicContext();

  try {
    const existing = await prisma.prescription.findFirst({
      where: { id, clinicId: ctx.clinicId, deletedAt: null },
    });
    if (!existing) {
      return prismaError({ global: ["Ordonnance introuvable."] });
    }

    await prisma.prescription.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await logAudit({
      action: AuditAction.DELETE,
      entityType: "Prescription",
      entityId: id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
    });

    revalidatePath(`/patients/${existing.patientId}`);
    revalidatePath(`/patients/${existing.patientId}/prescriptions`);

    return { ok: true } as const;
  } catch {
    return prismaError({
      global: [
        "Une erreur est survenue lors de la suppression de l'ordonnance.",
      ],
    });
  }
}

export async function listPrescriptions(patientId: string) {
  await requireRole("prescriptions:read");
  const ctx = await requireClinicContext();

  const prescriptions = await prisma.prescription.findMany({
    where: {
      clinicId: ctx.clinicId,
      patientId,
      deletedAt: null,
    },
    orderBy: { issuedAt: "desc" },
    include: {
      createdBy: { select: { firstName: true, lastName: true } },
      items: { orderBy: { position: "asc" } },
    },
  });

  return prescriptions;
}

export async function getPrescription(id: string) {
  await requireRole("prescriptions:read");
  const ctx = await requireClinicContext();

  const prescription = await prisma.prescription.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
    include: {
      patient: true,
      createdBy: { select: { firstName: true, lastName: true } },
      items: { orderBy: { position: "asc" } },
    },
  });

  if (!prescription) notFound();

  await logAudit({
    action: AuditAction.VIEW,
    entityType: "Prescription",
    entityId: id,
    clinicId: ctx.clinicId,
    userId: ctx.userId,
  });

  return prescription;
}

export async function getPrescriptionForPrint(id: string) {
  await requireRole("prescriptions:read");
  const ctx = await requireClinicContext();

  const prescription = await prisma.prescription.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
    include: {
      patient: true,
      createdBy: { select: { firstName: true, lastName: true } },
      items: { orderBy: { position: "asc" } },
      clinic: {
        select: {
          name: true,
          email: true,
          phone: true,
          address: true,
          logoUrl: true,
        },
      },
    },
  });

  if (!prescription) notFound();

  return prescription;
}

export async function getPatientForPrescription(patientId: string) {
  await requireRole("prescriptions:read");
  const ctx = await requireClinicContext();

  const patient = await prisma.patient.findFirst({
    where: { id: patientId, clinicId: ctx.clinicId, deletedAt: null },
  });

  if (!patient) notFound();
  return patient;
}
