import { z } from "zod";

function parseDate(val: string): Date {
  const d = new Date(val);
  if (isNaN(d.getTime())) throw new Error("Date invalide.");
  return d;
}

const baseAppointmentSchema = z.object({
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

export const appointmentSchema = baseAppointmentSchema.refine(
  (data) => {
    try {
      const start = parseDate(data.startAt);
      const end = parseDate(data.endAt);
      return end > start;
    } catch {
      return true; // let the string validation catch bad dates
    }
  },
  {
    message: "La date de fin doit être après la date de début.",
    path: ["endAt"],
  },
);

export const appointmentUpdateSchema = baseAppointmentSchema.partial().refine(
  (data) => {
    if (!data.startAt || !data.endAt) return true;
    try {
      const start = parseDate(data.startAt);
      const end = parseDate(data.endAt);
      return end > start;
    } catch {
      return true;
    }
  },
  {
    message: "La date de fin doit être après la date de début.",
    path: ["endAt"],
  },
);

export const waitlistSchema = z.object({
  patientId: z.string().min(1),
  preferredDays: z.array(z.string()).default([]),
  preferredTimeStart: z.string().optional().or(z.literal("")),
  preferredTimeEnd: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});
