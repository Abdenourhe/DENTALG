import { z } from "zod";

export const labOrderSchema = z.object({
  patientId: z.string().min(1, "Patient requis."),
  requestedTests: z
    .array(z.string().min(1, "Nom de l'analyse requis."))
    .min(1, "Au moins une analyse est requise."),
  status: z
    .enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
    .default("PENDING"),
  notes: z.string().optional().or(z.literal("")),
});

export const labOrderUpdateSchema = labOrderSchema.partial();

export const labResultSchema = z.object({
  labOrderId: z.string().min(1, "Demande d'analyse requise."),
  testName: z.string().min(1, "Nom de l'analyse requis."),
  value: z.string().optional().or(z.literal("")),
  unit: z.string().optional().or(z.literal("")),
  referenceRange: z.string().optional().or(z.literal("")),
  status: z
    .enum(["PENDING", "NORMAL", "ABNORMAL", "CRITICAL"])
    .default("PENDING"),
  notes: z.string().optional().or(z.literal("")),
});

export const labResultUpdateSchema = labResultSchema.partial();
