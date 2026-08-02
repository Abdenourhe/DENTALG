"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { requireClinicContext, withClinic } from "@/lib/tenant";
import { procedureSchema } from "@/lib/validations/billing";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { logAudit } from "@/lib/audit";
import { AuditAction } from "@prisma/client";

function prismaError(errors: Record<string, string[]>): {
  ok: false;
  errors: Record<string, string[]>;
} {
  return { ok: false, errors } as const;
}

export async function listProcedures() {
  await requireRole("procedures:manage");
  const ctx = await requireClinicContext();

  return prisma.procedure.findMany({
    where: {
      clinicId: ctx.clinicId,
      isReference: false,
      deletedAt: null,
    },
    orderBy: { name: "asc" },
  });
}

export async function createProcedure(data: unknown) {
  await requireRole("procedures:manage");
  const ctx = await requireClinicContext();

  const parsed = procedureSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  try {
    const procedure = await prisma.procedure.create({
      data: withClinic(ctx, {
        ...parsed.data,
        priceCents: Number(parsed.data.priceCents),
        isActive: true,
        isReference: false,
      }),
    });

    await logAudit({
      action: AuditAction.CREATE,
      entityType: "Procedure",
      entityId: procedure.id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
    });

    revalidatePath("/procedures");
    return { ok: true, procedure } as const;
  } catch {
    return prismaError({
      global: ["Une erreur est survenue lors de la création de l'acte."],
    });
  }
}

export async function updateProcedure(id: string, data: unknown) {
  await requireRole("procedures:manage");
  const ctx = await requireClinicContext();

  const parsed = procedureSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  try {
    const existing = await prisma.procedure.findFirst({
      where: {
        id,
        clinicId: ctx.clinicId,
        isReference: false,
        deletedAt: null,
      },
    });
    if (!existing) return prismaError({ global: ["Acte introuvable."] });

    const procedure = await prisma.procedure.update({
      where: { id },
      data: {
        ...parsed.data,
        priceCents: Number(parsed.data.priceCents),
      },
    });

    await logAudit({
      action: AuditAction.UPDATE,
      entityType: "Procedure",
      entityId: id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
    });

    revalidatePath("/procedures");
    return { ok: true, procedure } as const;
  } catch {
    return prismaError({
      global: ["Une erreur est survenue lors de la mise à jour de l'acte."],
    });
  }
}

export async function deleteProcedure(id: string) {
  await requireRole("procedures:manage");
  const ctx = await requireClinicContext();

  try {
    const existing = await prisma.procedure.findFirst({
      where: {
        id,
        clinicId: ctx.clinicId,
        isReference: false,
        deletedAt: null,
      },
    });
    if (!existing) return prismaError({ global: ["Acte introuvable."] });

    await prisma.procedure.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await logAudit({
      action: AuditAction.DELETE,
      entityType: "Procedure",
      entityId: id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
    });

    revalidatePath("/procedures");
    return { ok: true } as const;
  } catch {
    return prismaError({
      global: ["Une erreur est survenue lors de la suppression de l'acte."],
    });
  }
}

export async function deleteProcedureForm(id: string) {
  "use server";
  await deleteProcedure(id);
}

export async function getProcedure(id: string) {
  await requireRole("procedures:manage");
  const ctx = await requireClinicContext();

  const procedure = await prisma.procedure.findFirst({
    where: { id, clinicId: ctx.clinicId, isReference: false, deletedAt: null },
  });

  if (!procedure) notFound();
  return procedure;
}
