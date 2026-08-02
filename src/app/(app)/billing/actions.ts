"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { requireClinicContext, withClinic } from "@/lib/tenant";
import {
  invoiceSchema,
  paymentSchema,
  procedureSchema,
} from "@/lib/validations/billing";
import { revalidatePath } from "next/cache";
import { nextNumber } from "@/lib/billing/numbering";
import { logAudit } from "@/lib/audit";
import { AuditAction } from "@prisma/client";

function prismaError(errors: Record<string, string[]>): {
  ok: false;
  errors: Record<string, string[]>;
} {
  return { ok: false, errors } as const;
}

export async function listInvoices() {
  await requireRole("billing:read");
  const ctx = await requireClinicContext();

  return prisma.invoice.findMany({
    where: { clinicId: ctx.clinicId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      patient: { select: { firstName: true, lastName: true } },
      payments: true,
    },
    take: 100,
  });
}

export async function createInvoice(data: unknown) {
  await requireRole("billing:write");
  const ctx = await requireClinicContext();

  const parsed = invoiceSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  try {
    const number = await nextNumber(ctx.clinicId, "INVOICE", {
      prefix: "F-",
      pad: 5,
    });

    if (parsed.data.initialPaymentCents > parsed.data.totalCents) {
      return prismaError({
        global: [
          "Le paiement initial ne peut pas être supérieur au total de la facture.",
        ],
      });
    }

    const invoice = await prisma.$transaction(async (tx) => {
      const created = await tx.invoice.create({
        data: withClinic(ctx, {
          number,
          patientId: parsed.data.patientId,
          totalCents: parsed.data.totalCents,
          paidCents: parsed.data.initialPaymentCents,
          status:
            parsed.data.totalCents === parsed.data.initialPaymentCents
              ? "PAID"
              : "ISSUED",
          dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
          notes: parsed.data.notes || null,
          createdById: ctx.userId,
          issuedAt: new Date(),
        }),
      });

      if (parsed.data.initialPaymentCents > 0) {
        await tx.payment.create({
          data: withClinic(ctx, {
            patientId: parsed.data.patientId,
            invoiceId: created.id,
            amountCents: parsed.data.initialPaymentCents,
            method: parsed.data.initialPaymentMethod,
            receivedById: ctx.userId,
          }),
        });
      }

      return created;
    });

    await logAudit({
      action: AuditAction.CREATE,
      entityType: "Invoice",
      entityId: invoice.id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
    });

    revalidatePath("/billing");
    return { ok: true, invoice } as const;
  } catch {
    return prismaError({
      global: ["Une erreur est survenue lors de la création de la facture."],
    });
  }
}

export async function recordPayment(data: unknown) {
  await requireRole("billing:write");
  const ctx = await requireClinicContext();

  const parsed = paymentSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  try {
    const { invoiceId } = parsed.data;

    const payment = await prisma.$transaction(async (tx) => {
      const created = await tx.payment.create({
        data: withClinic(ctx, {
          ...parsed.data,
          receivedById: ctx.userId,
        }),
      });

      if (invoiceId) {
        const payments = await tx.payment.findMany({
          where: { invoiceId, clinicId: ctx.clinicId },
          select: { amountCents: true },
        });
        const totalPaid = payments.reduce((sum, p) => sum + p.amountCents, 0);
        await tx.invoice.update({
          where: { id: invoiceId },
          data: { paidCents: totalPaid },
        });
      }

      return created;
    });

    await logAudit({
      action: AuditAction.CREATE,
      entityType: "Payment",
      entityId: payment.id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
      metadata: { amountCents: payment.amountCents, invoiceId },
    });

    revalidatePath("/billing");
    return { ok: true, payment } as const;
  } catch {
    return prismaError({
      global: ["Une erreur est survenue lors de l'enregistrement du paiement."],
    });
  }
}

export async function listProcedures() {
  await requireRole("procedures:manage");
  const ctx = await requireClinicContext();

  return prisma.procedure.findMany({
    where: { clinicId: ctx.clinicId, deletedAt: null, isActive: true },
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
      data: withClinic(ctx, parsed.data),
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
