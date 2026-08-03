import { z } from "zod";
import { Role } from "@prisma/client";

export const createUserSchema = z.object({
  email: z.string().email("Email invalide."),
  firstName: z.string().min(1, "Prénom requis."),
  lastName: z.string().min(1, "Nom requis."),
  password: z.string().min(6, "Minimum 6 caractères."),
  role: z.enum([Role.DENTIST, Role.ASSISTANT, Role.SECRETARY]),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1, "Prénom requis.").optional(),
  lastName: z.string().min(1, "Nom requis.").optional(),
  role: z
    .enum([Role.OWNER, Role.DENTIST, Role.ASSISTANT, Role.SECRETARY])
    .optional(),
  isActive: z.boolean().optional(),
});
