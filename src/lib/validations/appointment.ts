import { z } from "zod";

export const appointmentStatusValues = [
  "SCHEDULED",
  "CONFIRMED",
  "CANCELLED",
  "NO_SHOW",
  "COMPLETED",
] as const;

export const appointmentSchema = z.object({
  patientId: z.string().min(1, "Le patient est requis."),
  dentistId: z.string().min(1, "Le dentiste est requis."),
  date: z.string().min(1, "La date est requise."),
  startTime: z.string().min(1, "L'heure de début est requise."),
  endTime: z.string().min(1, "L'heure de fin est requise."),
  status: z.enum(appointmentStatusValues).default("SCHEDULED"),
  reason: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export const appointmentUpdateSchema = appointmentSchema.partial();

export type AppointmentInput = z.infer<typeof appointmentSchema>;
