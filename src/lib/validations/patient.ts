import { z } from "zod";

export const patientSchema = z.object({
  firstName: z.string().min(1, "Prénom requis."),
  lastName: z.string().min(1, "Nom requis."),
  nationalId: z.string().optional().or(z.literal("")),
  sex: z.enum(["M", "F"]).optional().or(z.literal("")),
  bloodGroup: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
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
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  wilaya: z.string().optional().or(z.literal("")),
  emergencyContactName: z.string().optional().or(z.literal("")),
  emergencyContactPhone: z.string().optional().or(z.literal("")),
  medicalHistory: z.string().optional().or(z.literal("")),
  allergies: z.string().optional().or(z.literal("")),
  currentMedications: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  addToWaitingRoom: z.enum(["on", ""]).optional().or(z.literal("")).default(""),
  waitingRoomReason: z.string().optional().or(z.literal("")),
  waitingRoomPriority: z
    .enum(["LOW", "NORMAL", "HIGH"])
    .optional()
    .or(z.literal("")),
  waitingRoomDentistId: z.string().optional().or(z.literal("")),
  waitingRoomRoomId: z.string().optional().or(z.literal("")),
});

export const patientUpdateSchema = patientSchema.partial();

export const medicalNoteSchema = z.object({
  patientId: z.string().min(1),
  content: z.string().min(1, "Contenu requis."),
});

export const toothStatusSchema = z.object({
  patientId: z.string().min(1),
  tooth: z.number().int().min(11).max(48),
  status: z.enum([
    "HEALTHY",
    "CARIES",
    "TREATED",
    "MISSING",
    "CROWN",
    "IMPLANT",
    "ROOT_CANAL",
    "EXTRACTION_PLANNED",
    "FRACTURE",
    "ABCESS",
  ]),
  surfaces: z.preprocess((val) => {
    if (!val || typeof val !== "object" || Array.isArray(val)) return undefined;
    const result: Record<string, string> = {};
    for (const [k, v] of Object.entries(val)) {
      result[k] = String(v);
    }
    return result;
  }, z.record(z.string(), z.string()).optional()),
  notes: z.string().optional().or(z.literal("")),
});

export const treatmentPlanSchema = z.object({
  patientId: z.string().min(1),
  title: z.string().min(1, "Titre requis."),
  status: z
    .enum(["DRAFT", "PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
    .default("DRAFT"),
  totalCents: z.number().int().min(0).default(0),
  notes: z.string().optional().or(z.literal("")),
});

export const treatmentItemSchema = z.object({
  treatmentPlanId: z.string().min(1),
  procedureId: z.string().min(1),
  tooth: z.number().int().min(11).max(48).optional(),
  quantity: z.number().int().min(1).default(1),
  priceCents: z.number().int().min(0).default(0),
  notes: z.string().optional().or(z.literal("")),
});
