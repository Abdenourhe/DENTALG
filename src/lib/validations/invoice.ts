import { z } from "zod";

export const invoiceItemSchema = z.object({
  procedureId: z.string().min(1, "L'acte est requis."),
  quantity: z.coerce.number().min(1, "La quantité doit être d'au moins 1."),
  unitPrice: z.coerce.number().min(0, "Le prix doit être positif."),
  tooth: z.coerce.number().min(1).max(88).optional().or(z.literal("")),
});

export const invoiceSchema = z.object({
  patientId: z.string().min(1, "Le patient est requis."),
  dueDate: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  items: z.array(invoiceItemSchema).min(1, "Au moins un acte est requis."),
});

export const paymentSchema = z.object({
  amount: z.coerce.number().min(0.01, "Le montant est requis."),
  method: z.enum(["CASH", "CARD", "TRANSFER", "CHEQUE", "OTHER"]),
  reference: z.string().optional().or(z.literal("")),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
