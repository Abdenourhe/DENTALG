import { z } from "zod";
import { Role, TicketType, PlatformMessageType } from "@prisma/client";

export const platformMessageSchema = z.object({
  title: z.string().min(1, "Titre requis."),
  content: z.string().min(1, "Contenu requis."),
  type: z.nativeEnum(PlatformMessageType),
  targetRole: z.nativeEnum(Role).optional().or(z.literal("")),
  targetClinicId: z.string().optional().or(z.literal("")),
  isBroadcast: z.boolean().default(false),
});

export const ticketReplySchema = z.object({
  ticketId: z.string().min(1),
  content: z.string().min(1, "Message requis."),
});

export const updateTicketStatusSchema = z.object({
  ticketId: z.string().min(1),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
});

export const reviewUserRequestSchema = z.object({
  requestId: z.string().min(1),
  status: z.enum(["APPROVED", "REJECTED"]),
  notes: z.string().optional().or(z.literal("")),
});

export const toggleClinicStatusSchema = z.object({
  clinicId: z.string().min(1),
});
