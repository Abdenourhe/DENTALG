import { z } from "zod";

export const prescriptionItemSchema = z.object({
  name: z.string().min(1, "Nom du médicament requis."),
  dosage: z.string().optional().or(z.literal("")),
  duration: z.string().optional().or(z.literal("")),
  instructions: z.string().optional().or(z.literal("")),
});

export const prescriptionSchema = z.object({
  patientId: z.string().min(1, "Patient requis."),
  notes: z.string().optional().or(z.literal("")),
  items: z
    .array(prescriptionItemSchema)
    .min(1, "Au moins un médicament est requis."),
});

export const prescriptionUpdateSchema = z.object({
  notes: z.string().optional().or(z.literal("")),
  items: z
    .array(prescriptionItemSchema)
    .min(1, "Au moins un médicament est requis."),
  status: z.enum(["DRAFT", "ISSUED"]).optional(),
});
