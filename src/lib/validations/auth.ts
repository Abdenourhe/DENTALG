import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(10, "Le mot de passe doit contenir au moins 10 caractères.")
  .regex(/[A-Z]/, "Le mot de passe doit contenir une majuscule.")
  .regex(/[a-z]/, "Le mot de passe doit contenir une minuscule.")
  .regex(/[0-9]/, "Le mot de passe doit contenir un chiffre.")
  .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir un caractère spécial.");

export const loginSchema = z.object({
  email: z.string().email("Email invalide."),
  password: z.string().min(1, "Mot de passe requis."),
  provider: z.enum(["clinic", "platform"]).default("clinic"),
});

export const registerSchema = z
  .object({
    clinicName: z.string().min(2, "Nom du cabinet requis."),
    clinicSlug: z
      .string()
      .min(3, "Slug trop court.")
      .regex(/^[a-z0-9-]+$/, "Slug invalide."),
    clinicEmail: z.string().email("Email du cabinet invalide."),
    firstName: z.string().min(1, "Prénom requis."),
    lastName: z.string().min(1, "Nom requis."),
    email: z.string().email("Email invalide."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirmation requise."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });
