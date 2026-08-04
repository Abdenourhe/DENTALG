import { z } from "zod";

export const clinicListingSchema = z.object({
  title: z.string().min(1, "Titre requis."),
  description: z.string().min(1, "Description requise."),
  price: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  wilaya: z.string().optional().or(z.literal("")),
  photos: z.string().optional().or(z.literal("")),
  contactPhone: z.string().optional().or(z.literal("")),
  contactEmail: z.string().optional().or(z.literal("")),
});

export const equipmentListingSchema = z.object({
  title: z.string().min(1, "Titre requis."),
  description: z.string().min(1, "Description requise."),
  price: z.string().optional().or(z.literal("")),
  condition: z.string().optional().or(z.literal("")),
  brand: z.string().optional().or(z.literal("")),
  photos: z.string().optional().or(z.literal("")),
  contactPhone: z.string().optional().or(z.literal("")),
  contactEmail: z.string().optional().or(z.literal("")),
});
