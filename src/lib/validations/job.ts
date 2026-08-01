import { z } from "zod";

export const jobOfferSchema = z.object({
  title: z.string().min(1, "Titre requis."),
  description: z.string().min(1, "Description requise."),
  location: z.string().optional().or(z.literal("")),
  requirements: z.string().optional().or(z.literal("")),
  closesAt: z.string().optional().or(z.literal("")),
});

export const jobOfferUpdateSchema = jobOfferSchema.partial();

export const candidateProfileSchema = z.object({
  firstName: z.string().min(1, "Prénom requis."),
  lastName: z.string().min(1, "Nom requis."),
  email: z.string().email("Email invalide."),
  phone: z.string().optional().or(z.literal("")),
  coverLetter: z.string().optional().or(z.literal("")),
});

export const jobApplicationSchema = z.object({
  jobOfferId: z.string().min(1, "Offre requise."),
  firstName: z.string().min(1, "Prénom requis."),
  lastName: z.string().min(1, "Nom requis."),
  email: z.string().email("Email invalide."),
  phone: z.string().optional().or(z.literal("")),
  coverLetter: z.string().optional().or(z.literal("")),
});
