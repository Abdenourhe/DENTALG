"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { requireClinicContext, withClinic } from "@/lib/tenant";
import { invoiceSchema, paymentSchema, procedureSchema } from "@/lib/validations/billing";
import { revalidatePath } from "next/cache";

async function nextInvoiceNumber(clinicId: string): Promise<string> {
  const latest = await prisma.invoice.findFirst({
    where: { clinicId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: { number: true },
  });
  const seq = latest ? parseInt(latest.number.replace(/\D/g, ""), 10) + 1 : 1;
  return `F-${String(seq).padStart(5, "0")}`;
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

  const number = await nextInvoiceNumber(ctx.clinicId);
  const invoice = await prisma.invoice.create({
    data: withClinic(ctx, {
      ...parsed.data,
      number,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      createdById: ctx.userId,
      issuedAt: new Date(),
    }),
  });

  revalidatePath("/billing");
  return { ok: true, invoice } as const;
}

export async function recordPayment(data: unknown) {
  await requireRole("billing:write");
  const ctx = await requireClinicContext();

  const parsed = paymentSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  const payment = await prisma.payment.create({
    data: withClinic(ctx, {
      ...parsed.data,
      receivedById: ctx.userId,
    }),
  });

  // Update invoice paidCents
  if (parsed.data.invoiceId) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: parsed.data.invoiceId, clinicId: ctx.clinicId },
      include: { payments: true },
    });
    if (invoice) {
      const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amountCents, 0);
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { paidCents: totalPaid },
      });
    }
  }

  revalidatePath("/billing");
  return { ok: true, payment } as const;
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

  const procedure = await prisma.procedure.create({
    data: withClinic(ctx, parsed.data),
  });

  revalidatePath("/procedures");
  return { ok: true, procedure } as const;
}
