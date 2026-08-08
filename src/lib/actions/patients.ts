"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { AuditAction, type Patient, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { requireClinicContext } from "@/lib/tenant";
import { logAudit } from "@/lib/audit";
import { nextNumber } from "@/lib/billing/numbering";
import { patientSchema, patientUpdateSchema } from "@/lib/validations/patient";

export type PatientActionErrors = Record<string, string[]> & {
  global?: string[];
};

export type PatientActionResult =
  | { ok: true; patient: Patient }
  | { ok: false; errors: PatientActionErrors };

function normalizeOptional(value: string | undefined): string | null {
  return value === undefined || value === "" ? null : value;
}

function formDataToObject(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

function buildPatientData(
  data: Record<string, unknown>,
): Omit<Prisma.PatientUncheckedCreateInput, "id" | "number" | "clinicId" | "createdAt" | "updatedAt" | "deletedAt" | "isActive"> {
  return {
    firstName: data.firstName as string,
    lastName: data.lastName as string,
    nationalId: normalizeOptional(data.nationalId as string | undefined),
    sex: normalizeOptional(data.sex as string | undefined) as "M" | "F" | null,
    bloodGroup: normalizeOptional(data.bloodGroup as string | undefined) as
      | Prisma.PatientCreateInput["bloodGroup"]
      | null,
    generalCondition: normalizeOptional(
      data.generalCondition as string | undefined,
    ) as Prisma.PatientCreateInput["generalCondition"] | null,
    dateOfBirth: data.dateOfBirth
      ? new Date(data.dateOfBirth as string)
      : null,
    phone: normalizeOptional(data.phone as string | undefined),
    email: normalizeOptional(data.email as string | undefined),
    address: normalizeOptional(data.address as string | undefined),
    city: normalizeOptional(data.city as string | undefined),
    wilaya: normalizeOptional(data.wilaya as string | undefined),
    emergencyContactName: normalizeOptional(
      data.emergencyContactName as string | undefined,
    ),
    emergencyContactPhone: normalizeOptional(
      data.emergencyContactPhone as string | undefined,
    ),
    medicalHistory: normalizeOptional(
      data.medicalHistory as string | undefined,
    ),
    allergies: normalizeOptional(data.allergies as string | undefined),
    currentMedications: normalizeOptional(
      data.currentMedications as string | undefined,
    ),
    notes: normalizeOptional(data.notes as string | undefined),
  };
}

function zodFieldErrors(
  error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } },
): PatientActionErrors {
  const raw = error.flatten().fieldErrors;
  const errors: PatientActionErrors = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value && value.length > 0) {
      errors[key] = value;
    }
  }
  return errors;
}

export async function listPatients(options?: { includeInactive?: boolean }) {
  await requireRole("patients:read");
  const ctx = await requireClinicContext();

  return prisma.patient.findMany({
    where: {
      clinicId: ctx.clinicId,
      deletedAt: null,
      ...(options?.includeInactive ? {} : { isActive: true }),
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPatient(id: string) {
  await requireRole("patients:read");
  const ctx = await requireClinicContext();

  const patient = await prisma.patient.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
  });

  if (!patient) notFound();
  return patient;
}

export async function createPatient(formData: FormData): Promise<PatientActionResult> {
  await requireRole("patients:write");
  const ctx = await requireClinicContext();

  const data = formDataToObject(formData);
  const parsed = patientSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: zodFieldErrors(parsed.error) };
  }

  try {
    const number = await nextNumber(ctx.clinicId, "PATIENT", { pad: 4 });
    const patient = await prisma.patient.create({
      data: {
        ...buildPatientData(parsed.data),
        number,
        clinicId: ctx.clinicId,
      },
    });

    await logAudit({
      action: AuditAction.CREATE,
      entityType: "Patient",
      entityId: patient.id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
    });

    revalidatePath("/patients");
    return { ok: true, patient };
  } catch {
    return {
      ok: false,
      errors: { global: ["Erreur lors de la création du patient."] },
    };
  }
}

export async function updatePatient(
  id: string,
  formData: FormData,
): Promise<PatientActionResult> {
  await requireRole("patients:write");
  const ctx = await requireClinicContext();

  const existing = await prisma.patient.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
  });
  if (!existing) notFound();

  const data = formDataToObject(formData);
  const parsed = patientUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: zodFieldErrors(parsed.error) };
  }

  try {
    const updateData: Prisma.PatientUpdateInput = {};
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value === undefined) continue;
      if (key === "dateOfBirth") {
        updateData.dateOfBirth = value ? new Date(value as string) : null;
      } else {
        (updateData as Record<string, unknown>)[key] = normalizeOptional(
          value as string | undefined,
        );
      }
    }

    const patient = await prisma.patient.update({
      where: { id },
      data: updateData,
    });

    await logAudit({
      action: AuditAction.UPDATE,
      entityType: "Patient",
      entityId: patient.id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
    });

    revalidatePath("/patients");
    revalidatePath(`/patients/${id}`);
    return { ok: true, patient };
  } catch {
    return {
      ok: false,
      errors: { global: ["Erreur lors de la mise à jour du patient."] },
    };
  }
}

export async function archivePatient(id: string, isActive: boolean) {
  await requireRole("patients:write");
  const ctx = await requireClinicContext();

  const existing = await prisma.patient.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
  });
  if (!existing) notFound();

  const patient = await prisma.patient.update({
    where: { id },
    data: { isActive },
  });

  await logAudit({
    action: AuditAction.UPDATE,
    entityType: "Patient",
    entityId: patient.id,
    clinicId: ctx.clinicId,
    userId: ctx.userId,
    metadata: { isActive },
  });

  revalidatePath("/patients");
  revalidatePath(`/patients/${id}`);
  return { ok: true, patient } as const;
}

export async function deletePatient(id: string) {
  await requireRole("patients:write");
  const ctx = await requireClinicContext();

  const existing = await prisma.patient.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
  });
  if (!existing) notFound();

  const patient = await prisma.patient.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await logAudit({
    action: AuditAction.DELETE,
    entityType: "Patient",
    entityId: patient.id,
    clinicId: ctx.clinicId,
    userId: ctx.userId,
  });

  revalidatePath("/patients");
  revalidatePath(`/patients/${id}`);
  return { ok: true, patient } as const;
}
