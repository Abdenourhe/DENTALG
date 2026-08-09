import { z } from "zod";

export const checkInSchema = z.object({
  patientId: z.string().min(1, "Patient requis."),
  appointmentId: z.string().optional().or(z.literal("")),
  dentistId: z.string().optional().or(z.literal("")),
  roomId: z.string().optional().or(z.literal("")),
  priority: z.enum(["LOW", "NORMAL", "HIGH"]).default("NORMAL"),
  arrivalType: z.enum(["WALK_IN", "APPOINTMENT"]).default("WALK_IN"),
  notes: z.string().optional().or(z.literal("")),
});

export const assignRoomSchema = z.object({
  entryId: z.string().min(1, "Entrée requise."),
  roomId: z.string().optional().or(z.literal("")),
});

export const updatePrioritySchema = z.object({
  entryId: z.string().min(1),
  priority: z.enum(["LOW", "NORMAL", "HIGH"]),
});

export const entryActionSchema = z.object({
  entryId: z.string().min(1),
});

export const notifyStaffSchema = z.object({
  entryId: z.string().min(1),
  message: z.string().min(1, "Message requis."),
});
