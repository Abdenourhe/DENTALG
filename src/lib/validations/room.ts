import { z } from "zod";

export const roomSchema = z.object({
  name: z.string().min(1, "Nom de la salle requis."),
  order: z.coerce.number().int().min(0).default(0),
  isActive: z.enum(["on", ""]).optional().or(z.literal("")).default(""),
});

export const roomUpdateSchema = roomSchema.partial();
