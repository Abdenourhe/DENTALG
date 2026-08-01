import { z } from "zod";

export const appointmentSchema = z.object({
  patientId: z.string().min(1, "Patient requis."),
  dentistId: z.string().min(1, "Dentiste requis."),
  startAt: z.string().min(1, "Date et heure requises."),
  endAt: z.string().min(1, "Date et heure de fin requises."),
  status: z
    .enum(["SCHEDULED", "CONFIRMED", "CANCELLED", "NO_SHOW", "COMPLETED"])
    .default("SCHEDULED"),
  notes: z.string().optional().or(z.literal("")),
  reason: z.string().optional().or(z.literal("")),
});

export const appointmentUpdateSchema = appointmentSchema.partial();

export const waitlistSchema = z.object({
  patientId: z.string().min(1),
  preferredDays: z.array(z.string()).default([]),
  preferredTimeStart: z.string().optional().or(z.literal("")),
  preferredTimeEnd: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});
