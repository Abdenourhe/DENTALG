"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { AuditAction, type Procedure, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { requireClinicContext } from "@/lib/tenant";
import { logAudit } from "@/lib/audit";
import { procedureSchema, procedureUpdateSchema } from "@/lib/validations/procedure";

export type ProcedureActionErrors = Record<string, string[]> & {
  global?: string[];
};

export type ProcedureActionResult =
  | { ok: true; procedure: Procedure }
  | { ok: false; errors: ProcedureActionErrors };

function formDataToObject(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

function zodFieldErrors(
  error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } },
): ProcedureActionErrors {
  const raw = error.flatten().fieldErrors;
  const errors: ProcedureActionErrors = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value && value.length > 0) {
      errors[key] = value;
    }
  }
  return errors;
}

export async function listProcedures(options?: { includeInactive?: boolean }) {
  await requireRole("procedures:manage");
  const ctx = await requireClinicContext();

  return prisma.procedure.findMany({
    where: {
      OR: [{ clinicId: ctx.clinicId }, { clinicId: null, isReference: true }],
      deletedAt: null,
      ...(options?.includeInactive ? {} : { isActive: true }),
    },
    orderBy: { code: "asc" },
  });
}

export async function getProcedure(id: string) {
  await requireRole("procedures:manage");
  const ctx = await requireClinicContext();

  const procedure = await prisma.procedure.findFirst({
    where: {
      id,
      OR: [{ clinicId: ctx.clinicId }, { clinicId: null, isReference: true }],
      deletedAt: null,
    },
  });

  if (!procedure) notFound();
  return procedure;
}

export async function createProcedure(formData: FormData): Promise<ProcedureActionResult> {
  await requireRole("procedures:manage");
  const ctx = await requireClinicContext();

  const data = formDataToObject(formData);
  const parsed = procedureSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: zodFieldErrors(parsed.error) };
  }

  try {
    const procedure = await prisma.procedure.create({
      data: {
        clinicId: ctx.clinicId,
        code: parsed.data.code,
        name: parsed.data.name,
        description: parsed.data.description || null,
        priceCents: Math.round(parsed.data.price * 100),
        color: parsed.data.color || null,
        isActive: true,
        isReference: false,
      },
    });

    await logAudit({
      action: AuditAction.CREATE,
      entityType: "Procedure",
      entityId: procedure.id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
    });

    revalidatePath("/procedures");
    return { ok: true, procedure };
  } catch {
    return {
      ok: false,
      errors: { global: ["Erreur lors de la création de l'acte."] },
    };
  }
}

export async function updateProcedure(
  id: string,
  formData: FormData,
): Promise<ProcedureActionResult> {
  await requireRole("procedures:manage");
  const ctx = await requireClinicContext();

  const existing = await prisma.procedure.findFirst({
    where: {
      id,
      clinicId: ctx.clinicId,
      deletedAt: null,
    },
  });
  if (!existing) notFound();

  const data = formDataToObject(formData);
  const parsed = procedureUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: zodFieldErrors(parsed.error) };
  }

  try {
    const updateData: Prisma.ProcedureUncheckedUpdateInput = {};
    if (parsed.data.code !== undefined) updateData.code = parsed.data.code;
    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
    if (parsed.data.description !== undefined) {
      updateData.description = parsed.data.description || null;
    }
    if (parsed.data.price !== undefined) {
      updateData.priceCents = Math.round(parsed.data.price * 100);
    }
    if (parsed.data.color !== undefined) {
      updateData.color = parsed.data.color || null;
    }

    const procedure = await prisma.procedure.update({
      where: { id },
      data: updateData,
    });

    await logAudit({
      action: AuditAction.UPDATE,
      entityType: "Procedure",
      entityId: procedure.id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
    });

    revalidatePath("/procedures");
    revalidatePath(`/procedures/${id}`);
    return { ok: true, procedure };
  } catch {
    return {
      ok: false,
      errors: { global: ["Erreur lors de la mise à jour de l'acte."] },
    };
  }
}

export async function toggleProcedureStatus(id: string, isActive: boolean) {
  await requireRole("procedures:manage");
  const ctx = await requireClinicContext();

  const existing = await prisma.procedure.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
  });
  if (!existing) notFound();

  const procedure = await prisma.procedure.update({
    where: { id },
    data: { isActive },
  });

  await logAudit({
    action: AuditAction.UPDATE,
    entityType: "Procedure",
    entityId: procedure.id,
    clinicId: ctx.clinicId,
    userId: ctx.userId,
    metadata: { isActive },
  });

  revalidatePath("/procedures");
  revalidatePath(`/procedures/${id}`);
  return { ok: true, procedure };
}

export async function deleteProcedure(id: string) {
  await requireRole("procedures:manage");
  const ctx = await requireClinicContext();

  const existing = await prisma.procedure.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
  });
  if (!existing) notFound();

  const procedure = await prisma.procedure.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await logAudit({
    action: AuditAction.DELETE,
    entityType: "Procedure",
    entityId: procedure.id,
    clinicId: ctx.clinicId,
    userId: ctx.userId,
  });

  revalidatePath("/procedures");
  revalidatePath(`/procedures/${id}`);
  return { ok: true, procedure };
}
