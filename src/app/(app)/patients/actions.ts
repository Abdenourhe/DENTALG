"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { requireClinicContext, withClinic } from "@/lib/tenant";
import { patientSchema, patientUpdateSchema, medicalNoteSchema, toothStatusSchema } from "@/lib/validations/patient";
import { revalidatePath } from "next/cache";

async function nextPatientNumber(clinicId: string): Promise<string> {
  const latest = await prisma.patient.findFirst({
    where: { clinicId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: { number: true },
  });
  const seq = latest ? parseInt(latest.number, 10) + 1 : 1;
  return String(seq).padStart(4, "0");
}

export async function createPatient(data: unknown) {
  await requireRole("patients:write");
  const ctx = await requireClinicContext();

  const parsed = patientSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  const number = await nextPatientNumber(ctx.clinicId);
  const payload = withClinic(ctx, {
    ...parsed.data,
    number,
    dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null,
  });

  const patient = await prisma.patient.create({ data: payload });
  revalidatePath("/patients");
  return { ok: true, patient } as const;
}

export async function updatePatient(id: string, data: unknown) {
  await requireRole("patients:write");
  const ctx = await requireClinicContext();

  const parsed = patientUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  const existing = await prisma.patient.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
  });
  if (!existing) return { ok: false, errors: { global: ["Patient introuvable."] } } as const;

  const updateData = {
    ...parsed.data,
    dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null,
  };

  const patient = await prisma.patient.update({
    where: { id },
    data: updateData,
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
  if (!existing) return { ok: false, errors: { global: ["Patient introuvable."] } } as const;

  await prisma.patient.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/patients");
  return { ok: true } as const;
}

export async function listPatients(search?: string) {
  await requireRole("patients:read");
  const ctx = await requireClinicContext();

  const patients = await prisma.patient.findMany({
    where: {
      clinicId: ctx.clinicId,
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" as const } },
              { lastName: { contains: search, mode: "insensitive" as const } },
              { phone: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: { lastName: "asc" },
    include: {
      _count: {
        select: { appointments: true, invoices: true },
      },
    },
  });

  return patients;
}

export async function getPatient(id: string) {
  await requireRole("patients:read");
  const ctx = await requireClinicContext();

  const patient = await prisma.patient.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
    include: {
      medicalNotes: { orderBy: { createdAt: "desc" } },
      toothStatuses: {
        include: { events: { orderBy: { createdAt: "desc" }, take: 1 } },
      },
      treatmentPlans: {
        include: { items: { include: { procedure: true } } },
        orderBy: { createdAt: "desc" },
      },
      appointments: {
        where: { deletedAt: null },
        orderBy: { startAt: "desc" },
        take: 10,
      },
      invoices: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  return patient;
}

export async function createMedicalNote(data: unknown) {
  await requireRole("patients:write");
  const ctx = await requireClinicContext();

  const parsed = medicalNoteSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  const note = await prisma.medicalNote.create({
    data: withClinic(ctx, {
      ...parsed.data,
      createdById: ctx.userId,
    }),
  });
  revalidatePath(`/patients/${parsed.data.patientId}`);
  return { ok: true, note } as const;
}

export async function upsertToothStatus(data: unknown) {
  await requireRole("patients:write");
  const ctx = await requireClinicContext();

  const parsed = toothStatusSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  const { patientId, tooth, status, notes } = parsed.data;

  const existing = await prisma.toothStatus.findUnique({
    where: { clinicId_patientId_tooth: { clinicId: ctx.clinicId, patientId, tooth } },
  });

  if (existing) {
    await prisma.toothStatus.update({
      where: { id: existing.id },
      data: { status, notes, updatedAt: new Date() },
    });
    await prisma.toothStatusEvent.create({
      data: withClinic(ctx, {
        toothStatusId: existing.id,
        patientId,
        createdById: ctx.userId,
        oldStatus: existing.status,
        newStatus: status,
        notes,
      }),
    });
  } else {
    const created = await prisma.toothStatus.create({
      data: withClinic(ctx, { patientId, tooth, status, notes }),
    });
    await prisma.toothStatusEvent.create({
      data: withClinic(ctx, {
        toothStatusId: created.id,
        patientId,
        createdById: ctx.userId,
        newStatus: status,
        notes,
      }),
    });
  }

  revalidatePath(`/patients/${patientId}`);
  return { ok: true } as const;
}
