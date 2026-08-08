import { z } from "zod";

export const patientSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis."),
  lastName: z.string().min(1, "Le nom est requis."),
  nationalId: z.string().optional().or(z.literal("")),
  sex: z.enum(["M", "F"]).optional().or(z.literal("")),
  bloodGroup: z
    .enum(["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"])
    .optional()
    .or(z.literal("")),
  generalCondition: z
    .enum([
      "RAS",
      "HYPERTENSION_ARTERIELLE",
      "DIABETE",
      "INSUFFISANCE_CARDIAQUE",
      "INFARCTUS_DU_MYOCARDE",
      "ENDOCARDITE",
      "ASTHME",
      "TUBERCULOSE",
      "ALLERGIE",
      "INSUFFISANCE_RENALE_CHRONIQUE",
      "ANEMIES",
      "RETARD_PSYCHOMOTEUR",
      "EPILEPSIE",
      "AUTRE",
    ])
    .optional()
    .or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("Email invalide.").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  wilaya: z.string().optional().or(z.literal("")),
  emergencyContactName: z.string().optional().or(z.literal("")),
  emergencyContactPhone: z.string().optional().or(z.literal("")),
  medicalHistory: z.string().optional().or(z.literal("")),
  allergies: z.string().optional().or(z.literal("")),
  currentMedications: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export const patientUpdateSchema = patientSchema.partial();

export type PatientInput = z.infer<typeof patientSchema>;
