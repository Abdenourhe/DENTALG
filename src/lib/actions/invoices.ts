"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { AuditAction, InvoiceStatus, type Invoice, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { requireClinicContext } from "@/lib/tenant";
import { logAudit } from "@/lib/audit";
import { nextNumber } from "@/lib/billing/numbering";
import { invoiceSchema, paymentSchema } from "@/lib/validations/invoice";

export type InvoiceActionErrors = Record<string, string[]> & {
  global?: string[];
};

export type InvoiceActionResult =
  | { ok: true; invoice: Invoice }
  | { ok: false; errors: InvoiceActionErrors };

function zodFieldErrors(
  error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } },
): InvoiceActionErrors {
  const raw = error.flatten().fieldErrors;
  const errors: InvoiceActionErrors = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value && value.length > 0) {
      errors[key] = value;
    }
  }
  return errors;
}

function calculateTotal(items: { quantity: number; unitPrice: number }[]): number {
  return items.reduce((sum, item) => sum + Math.round(item.quantity * item.unitPrice * 100), 0);
}

export async function listInvoices(options?: { status?: InvoiceStatus; patientId?: string }) {
  await requireRole("billing:read");
  const ctx = await requireClinicContext();

  return prisma.invoice.findMany({
    where: {
      clinicId: ctx.clinicId,
      deletedAt: null,
      ...(options?.status ? { status: options.status } : {}),
      ...(options?.patientId ? { patientId: options.patientId } : {}),
    },
    include: {
      patient: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { items: true, payments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInvoice(id: string) {
  await requireRole("billing:read");
  const ctx = await requireClinicContext();

  const invoice = await prisma.invoice.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
    include: {
      patient: { select: { id: true, firstName: true, lastName: true } },
      items: {
        include: {
          procedure: { select: { id: true, code: true, name: true } },
        },
      },
      payments: {
        orderBy: { paidAt: "desc" },
        include: {
          receivedBy: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  });

  if (!invoice) notFound();
  return invoice;
}

export async function createInvoice(data: unknown): Promise<InvoiceActionResult> {
  await requireRole("billing:write");
  const ctx = await requireClinicContext();

  const parsed = invoiceSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: zodFieldErrors(parsed.error) };
  }

  try {
    const number = await nextNumber(ctx.clinicId, "INVOICE", { pad: 4 });
    const totalCents = calculateTotal(parsed.data.items);

    const invoice = await prisma.invoice.create({
      data: {
        clinicId: ctx.clinicId,
        patientId: parsed.data.patientId,
        createdById: ctx.userId,
        number,
        status: InvoiceStatus.DRAFT,
        totalCents,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        notes: parsed.data.notes || null,
        items: {
          create: parsed.data.items.map((item) => ({
            clinicId: ctx.clinicId,
            createdById: ctx.userId,
            procedureId: item.procedureId,
            quantity: item.quantity,
            unitPriceCents: Math.round(item.unitPrice * 100),
            totalCents: Math.round(item.quantity * item.unitPrice * 100),
            tooth: item.tooth || null,
          })),
        },
      },
    });

    await logAudit({
      action: AuditAction.CREATE,
      entityType: "Invoice",
      entityId: invoice.id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
    });

    revalidatePath("/billing");
    return { ok: true, invoice };
  } catch {
    return {
      ok: false,
      errors: { global: ["Erreur lors de la création de la facture."] },
    };
  }
}

export async function issueInvoice(id: string) {
  await requireRole("billing:write");
  const ctx = await requireClinicContext();

  const existing = await prisma.invoice.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
  });
  if (!existing) notFound();

  const invoice = await prisma.invoice.update({
    where: { id },
    data: { status: InvoiceStatus.ISSUED, issuedAt: new Date() },
  });

  await logAudit({
    action: AuditAction.UPDATE,
    entityType: "Invoice",
    entityId: invoice.id,
    clinicId: ctx.clinicId,
    userId: ctx.userId,
    metadata: { status: InvoiceStatus.ISSUED },
  });

  revalidatePath("/billing");
  revalidatePath(`/billing/${id}`);
  return { ok: true, invoice };
}

export async function recordPayment(
  invoiceId: string,
  data: unknown,
): Promise<InvoiceActionResult> {
  await requireRole("billing:write");
  const ctx = await requireClinicContext();

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, clinicId: ctx.clinicId, deletedAt: null },
  });
  if (!invoice) notFound();

  const parsed = paymentSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: zodFieldErrors(parsed.error) };
  }

  try {
    const amountCents = Math.round(parsed.data.amount * 100);
    const newPaidCents = invoice.paidCents + amountCents;

    const [payment, updatedInvoice] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          clinicId: ctx.clinicId,
          patientId: invoice.patientId,
          invoiceId: invoice.id,
          receivedById: ctx.userId,
          amountCents,
          method: parsed.data.method,
          reference: parsed.data.reference || null,
        },
      }),
      prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          paidCents: newPaidCents,
          status: newPaidCents >= invoice.totalCents ? InvoiceStatus.PAID : invoice.status,
        },
      }),
    ]);

    await logAudit({
      action: AuditAction.CREATE,
      entityType: "Payment",
      entityId: payment.id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
      metadata: { invoiceId, amountCents },
    });

    revalidatePath("/billing");
    revalidatePath(`/billing/${invoiceId}`);
    return { ok: true, invoice: updatedInvoice };
  } catch {
    return {
      ok: false,
      errors: { global: ["Erreur lors de l'enregistrement du paiement."] },
    };
  }
}

export async function deleteInvoice(id: string) {
  await requireRole("billing:write");
  const ctx = await requireClinicContext();

  const existing = await prisma.invoice.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
  });
  if (!existing) notFound();

  const invoice = await prisma.invoice.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await logAudit({
    action: AuditAction.DELETE,
    entityType: "Invoice",
    entityId: invoice.id,
    clinicId: ctx.clinicId,
    userId: ctx.userId,
  });

  revalidatePath("/billing");
  revalidatePath(`/billing/${id}`);
  return { ok: true, invoice };
}
