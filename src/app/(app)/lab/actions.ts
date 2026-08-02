"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { requireClinicContext, withClinic } from "@/lib/tenant";
import {
  labOrderSchema,
  labOrderUpdateSchema,
  labResultSchema,
  labResultUpdateSchema,
} from "@/lib/validations/lab";
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

export async function createLabOrder(data: unknown) {
  await requireRole("lab:write");
  const ctx = await requireClinicContext();

  const parsed = labOrderSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  try {
    const number = await nextNumber(ctx.clinicId, "LAB_ORDER", {
      prefix: "LAB-",
      pad: 4,
    });

    const { patientId, requestedTests, ...rest } = parsed.data;

    const order = await prisma.labOrder.create({
      data: withClinic(ctx, {
        patientId,
        createdById: ctx.userId,
        number,
        requestedTests,
        ...rest,
      }),
    });

    await logAudit({
      action: AuditAction.CREATE,
      entityType: "LabOrder",
      entityId: order.id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
    });

    revalidatePath(`/patients/${patientId}`);
    revalidatePath(`/patients/${patientId}/lab`);

    return { ok: true, order } as const;
  } catch {
    return prismaError({
      global: [
        "Une erreur est survenue lors de la création de la demande d'analyse.",
      ],
    });
  }
}

export async function updateLabOrder(id: string, data: unknown) {
  await requireRole("lab:write");
  const ctx = await requireClinicContext();

  const parsed = labOrderUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  try {
    const existing = await prisma.labOrder.findFirst({
      where: { id, clinicId: ctx.clinicId, deletedAt: null },
    });
    if (!existing)
      return prismaError({ global: ["Demande d'analyse introuvable."] });

    const order = await prisma.labOrder.update({
      where: { id },
      data: { ...parsed.data, updatedAt: new Date() },
    });

    await logAudit({
      action: AuditAction.UPDATE,
      entityType: "LabOrder",
      entityId: id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
    });

    revalidatePath(`/patients/${existing.patientId}`);
    revalidatePath(`/patients/${existing.patientId}/lab`);
    revalidatePath(`/patients/${existing.patientId}/lab/${id}`);

    return { ok: true, order } as const;
  } catch {
    return prismaError({
      global: [
        "Une erreur est survenue lors de la mise à jour de la demande d'analyse.",
      ],
    });
  }
}

export async function deleteLabOrder(id: string) {
  await requireRole("lab:write");
  const ctx = await requireClinicContext();

  try {
    const existing = await prisma.labOrder.findFirst({
      where: { id, clinicId: ctx.clinicId, deletedAt: null },
    });
    if (!existing)
      return prismaError({ global: ["Demande d'analyse introuvable."] });

    await prisma.labOrder.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await logAudit({
      action: AuditAction.DELETE,
      entityType: "LabOrder",
      entityId: id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
    });

    revalidatePath(`/patients/${existing.patientId}`);
    revalidatePath(`/patients/${existing.patientId}/lab`);

    return { ok: true } as const;
  } catch {
    return prismaError({
      global: [
        "Une erreur est survenue lors de la suppression de la demande d'analyse.",
      ],
    });
  }
}

export async function listLabOrders(patientId: string) {
  await requireRole("lab:read");
  const ctx = await requireClinicContext();

  return prisma.labOrder.findMany({
    where: {
      clinicId: ctx.clinicId,
      patientId,
      deletedAt: null,
    },
    orderBy: { orderedAt: "desc" },
    include: {
      createdBy: { select: { firstName: true, lastName: true } },
      results: {
        orderBy: { testName: "asc" },
      },
    },
  });
}

export async function getLabOrder(id: string) {
  await requireRole("lab:read");
  const ctx = await requireClinicContext();

  const order = await prisma.labOrder.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
    include: {
      patient: true,
      createdBy: { select: { firstName: true, lastName: true } },
      results: {
        orderBy: { testName: "asc" },
        include: {
          reportedBy: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  if (!order) notFound();

  await logAudit({
    action: AuditAction.VIEW,
    entityType: "LabOrder",
    entityId: id,
    clinicId: ctx.clinicId,
    userId: ctx.userId,
  });

  return order;
}

export async function createLabResult(data: unknown) {
  await requireRole("lab:write");
  const ctx = await requireClinicContext();

  const parsed = labResultSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  try {
    const order = await prisma.labOrder.findFirst({
      where: {
        id: parsed.data.labOrderId,
        clinicId: ctx.clinicId,
        deletedAt: null,
      },
    });
    if (!order)
      return prismaError({ global: ["Demande d'analyse introuvable."] });

    const result = await prisma.labResult.create({
      data: withClinic(ctx, {
        labOrderId: parsed.data.labOrderId,
        testName: parsed.data.testName,
        value: parsed.data.value || null,
        unit: parsed.data.unit || null,
        referenceRange: parsed.data.referenceRange || null,
        status: parsed.data.status,
        notes: parsed.data.notes || null,
        reportedAt: new Date(),
        reportedById: ctx.userId,
      }),
    });

    await logAudit({
      action: AuditAction.CREATE,
      entityType: "LabResult",
      entityId: result.id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
    });

    revalidatePath(`/patients/${order.patientId}`);
    revalidatePath(`/patients/${order.patientId}/lab`);
    revalidatePath(`/patients/${order.patientId}/lab/${order.id}`);

    return { ok: true, result } as const;
  } catch {
    return prismaError({
      global: ["Une erreur est survenue lors de l'ajout du résultat."],
    });
  }
}

export async function updateLabResult(id: string, data: unknown) {
  await requireRole("lab:write");
  const ctx = await requireClinicContext();

  const parsed = labResultUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  try {
    const existing = await prisma.labResult.findFirst({
      where: { id, clinicId: ctx.clinicId },
      include: { labOrder: true },
    });
    if (!existing) return prismaError({ global: ["Résultat introuvable."] });

    const result = await prisma.labResult.update({
      where: { id },
      data: {
        ...parsed.data,
        updatedAt: new Date(),
        ...(parsed.data.value || parsed.data.status
          ? { reportedAt: new Date(), reportedById: ctx.userId }
          : {}),
      },
    });

    await logAudit({
      action: AuditAction.UPDATE,
      entityType: "LabResult",
      entityId: id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
    });

    revalidatePath(`/patients/${existing.labOrder.patientId}`);
    revalidatePath(`/patients/${existing.labOrder.patientId}/lab`);
    revalidatePath(
      `/patients/${existing.labOrder.patientId}/lab/${existing.labOrder.id}`,
    );

    return { ok: true, result } as const;
  } catch {
    return prismaError({
      global: ["Une erreur est survenue lors de la mise à jour du résultat."],
    });
  }
}

export async function deleteLabResult(id: string) {
  await requireRole("lab:write");
  const ctx = await requireClinicContext();

  try {
    const existing = await prisma.labResult.findFirst({
      where: { id, clinicId: ctx.clinicId },
      include: { labOrder: true },
    });
    if (!existing) return prismaError({ global: ["Résultat introuvable."] });

    await prisma.labResult.delete({ where: { id } });

    await logAudit({
      action: AuditAction.DELETE,
      entityType: "LabResult",
      entityId: id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
    });

    revalidatePath(`/patients/${existing.labOrder.patientId}`);
    revalidatePath(`/patients/${existing.labOrder.patientId}/lab`);
    revalidatePath(
      `/patients/${existing.labOrder.patientId}/lab/${existing.labOrder.id}`,
    );

    return { ok: true } as const;
  } catch {
    return prismaError({
      global: ["Une erreur est survenue lors de la suppression du résultat."],
    });
  }
}
