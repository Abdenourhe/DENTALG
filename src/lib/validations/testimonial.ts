import { z } from "zod";

export const testimonialSchema = z.object({
  authorName: z.string().min(1, "Nom requis.").max(80),
  authorRole: z.string().min(1, "Rôle requis.").max(80),
  city: z.string().max(80).optional().or(z.literal("")),
  quote: z
    .string()
    .min(10, "Le témoignage doit faire au moins 10 caractères.")
    .max(600),
  rating: z.coerce.number().int().min(1).max(5),
});
