import { z } from "zod";

export const procedureSchema = z.object({
  code: z.string().min(1, "Le code est requis."),
  name: z.string().min(1, "Le nom est requis."),
  description: z.string().optional().or(z.literal("")),
  price: z.coerce.number().min(0, "Le prix doit être positif."),
  color: z.string().optional().or(z.literal("")),
});

export const procedureUpdateSchema = procedureSchema.partial();

export type ProcedureInput = z.infer<typeof procedureSchema>;
