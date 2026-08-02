import { z } from "zod";

export const procedureSchema = z.object({
  code: z.string().min(1, "Code requis."),
  name: z.string().min(1, "Nom requis."),
  description: z.string().optional().or(z.literal("")),
  priceCents: z.coerce.number().int().min(0, "Tarif invalide.").default(0),
  color: z.string().optional().or(z.literal("")),
});

export const quoteSchema = z.object({
  patientId: z.string().min(1, "Patient requis."),
  totalCents: z.number().int().min(0).default(0),
  validUntil: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export const quoteItemSchema = z.object({
  procedureId: z.string().min(1, "Acte requis."),
  tooth: z.number().int().min(11).max(48).optional(),
  quantity: z.number().int().min(1).default(1),
  unitPriceCents: z.number().int().min(0).default(0),
});

export const invoiceSchema = z.object({
  patientId: z.string().min(1, "Patient requis."),
  quoteId: z.string().optional().or(z.literal("")),
  totalCents: z.number().int().min(0).default(0),
  dueDate: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export const invoiceItemSchema = z.object({
  procedureId: z.string().min(1, "Acte requis."),
  tooth: z.number().int().min(11).max(48).optional(),
  quantity: z.number().int().min(1).default(1),
  unitPriceCents: z.number().int().min(0).default(0),
});

export const paymentSchema = z.object({
  patientId: z.string().min(1, "Patient requis."),
  invoiceId: z.string().optional().or(z.literal("")),
  amountCents: z.number().int().min(1, "Montant requis."),
  method: z
    .enum(["CASH", "CARD", "TRANSFER", "CHEQUE", "OTHER"])
    .default("CASH"),
  reference: z.string().optional().or(z.literal("")),
});
