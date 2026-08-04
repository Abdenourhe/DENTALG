import { z } from "zod";
import { Role, PlatformMessageType } from "@prisma/client";

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

// ── Clinic CRUD ──
export const createClinicSchema = z.object({
  name: z.string().min(1, "Nom requis."),
  slug: z
    .string()
    .min(1, "Slug requis.")
    .regex(/^[a-z0-9-]+$/, "Slug invalide (minuscules, chiffres, tirets)."),
  email: z.string().email("Email invalide."),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  wilaya: z.string().optional().or(z.literal("")),
  plan: z.enum(["FREE", "ESSENTIEL", "PRO", "PREMIUM"]).default("FREE"),
});

export const updateClinicSchema = z.object({
  clinicId: z.string().min(1),
  name: z.string().min(1, "Nom requis.").optional(),
  email: z.string().email("Email invalide.").optional(),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  wilaya: z.string().optional().or(z.literal("")),
  plan: z.enum(["FREE", "ESSENTIEL", "PRO", "PREMIUM"]).optional(),
  isActive: z.boolean().optional(),
});

export const deleteClinicSchema = z.object({
  clinicId: z.string().min(1),
});

// ── Clinic Request ──
export const clinicRequestSchema = z.object({
  name: z.string().min(1, "Nom du cabinet requis."),
  slug: z
    .string()
    .min(1, "Slug requis.")
    .regex(/^[a-z0-9-]+$/, "Slug invalide."),
  email: z.string().email("Email invalide."),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  wilaya: z.string().optional().or(z.literal("")),
  ownerFirstName: z.string().min(1, "Prénom requis."),
  ownerLastName: z.string().min(1, "Nom requis."),
  ownerEmail: z.string().email("Email du propriétaire invalide."),
  ownerPassword: z.string().min(6, "Mot de passe min. 6 caractères."),
});

export const reviewClinicRequestSchema = z.object({
  requestId: z.string().min(1),
  status: z.enum(["APPROVED", "REJECTED"]),
  notes: z.string().optional().or(z.literal("")),
});

// ── Feature flags ──
export const updateFeaturesSchema = z.object({
  clinicId: z.string().min(1),
  features: z.record(z.string(), z.boolean()),
});
