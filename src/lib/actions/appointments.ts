"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { AuditAction, type Appointment, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { requireClinicContext } from "@/lib/tenant";
import { logAudit } from "@/lib/audit";
import {
  appointmentSchema,
  appointmentUpdateSchema,
  type AppointmentInput,
} from "@/lib/validations/appointment";

export type AppointmentActionErrors = Record<string, string[]> & {
  global?: string[];
};

export type AppointmentActionResult =
  | { ok: true; appointment: Appointment }
  | { ok: false; errors: AppointmentActionErrors };

function parseDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}:00`);
}

function formDataToObject(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

function zodFieldErrors(
  error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } },
): AppointmentActionErrors {
  const raw = error.flatten().fieldErrors;
  const errors: AppointmentActionErrors = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value && value.length > 0) {
      errors[key] = value;
    }
  }
  return errors;
}

function buildAppointmentData(
  data: AppointmentInput,
  ctx: { clinicId: string; userId: string },
): Prisma.AppointmentUncheckedCreateInput {
  return {
    clinicId: ctx.clinicId,
    patientId: data.patientId,
    dentistId: data.dentistId,
    createdById: ctx.userId,
    startAt: parseDateTime(data.date, data.startTime),
    endAt: parseDateTime(data.date, data.endTime),
    status: data.status,
    reason: data.reason || null,
    notes: data.notes || null,
  };
}

export async function listAppointments(options?: {
  from?: Date;
  to?: Date;
  patientId?: string;
  dentistId?: string;
}) {
  await requireRole("appointments:read");
  const ctx = await requireClinicContext();

  return prisma.appointment.findMany({
    where: {
      clinicId: ctx.clinicId,
      deletedAt: null,
      ...(options?.from ? { startAt: { gte: options.from } } : {}),
      ...(options?.to ? { endAt: { lte: options.to } } : {}),
      ...(options?.patientId ? { patientId: options.patientId } : {}),
      ...(options?.dentistId ? { dentistId: options.dentistId } : {}),
    },
    include: {
      patient: { select: { id: true, firstName: true, lastName: true } },
      dentist: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { startAt: "asc" },
  });
}

export async function getAppointment(id: string) {
  await requireRole("appointments:read");
  const ctx = await requireClinicContext();

  const appointment = await prisma.appointment.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
    include: {
      patient: { select: { id: true, firstName: true, lastName: true } },
      dentist: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  if (!appointment) notFound();
  return appointment;
}

export async function createAppointment(
  formData: FormData,
): Promise<AppointmentActionResult> {
  await requireRole("appointments:write");
  const ctx = await requireClinicContext();

  const data = formDataToObject(formData);
  const parsed = appointmentSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: zodFieldErrors(parsed.error) };
  }

  try {
    const appointment = await prisma.appointment.create({
      data: buildAppointmentData(parsed.data, ctx),
    });

    await logAudit({
      action: AuditAction.CREATE,
      entityType: "Appointment",
      entityId: appointment.id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
    });

    revalidatePath("/rendez-vous");
    return { ok: true, appointment };
  } catch {
    return {
      ok: false,
      errors: { global: ["Erreur lors de la création du rendez-vous."] },
    };
  }
}

export async function updateAppointment(
  id: string,
  formData: FormData,
): Promise<AppointmentActionResult> {
  await requireRole("appointments:write");
  const ctx = await requireClinicContext();

  const existing = await prisma.appointment.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
  });
  if (!existing) notFound();

  const data = formDataToObject(formData);
  const parsed = appointmentUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: zodFieldErrors(parsed.error) };
  }

  try {
    const updateData: Prisma.AppointmentUncheckedUpdateInput = {};

    if (parsed.data.patientId) updateData.patientId = parsed.data.patientId;
    if (parsed.data.dentistId) updateData.dentistId = parsed.data.dentistId;
    if (parsed.data.status) updateData.status = parsed.data.status;
    if (parsed.data.reason !== undefined) {
      updateData.reason = parsed.data.reason || null;
    }
    if (parsed.data.notes !== undefined) {
      updateData.notes = parsed.data.notes || null;
    }

    const hasDate = parsed.data.date;
    const hasStart = parsed.data.startTime;
    const hasEnd = parsed.data.endTime;

    if (hasDate && hasStart) {
      updateData.startAt = parseDateTime(hasDate, hasStart);
    }
    if (hasDate && hasEnd) {
      updateData.endAt = parseDateTime(hasDate, hasEnd);
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
    });

    await logAudit({
      action: AuditAction.UPDATE,
      entityType: "Appointment",
      entityId: appointment.id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
    });

    revalidatePath("/rendez-vous");
    revalidatePath(`/rendez-vous/${id}`);
    return { ok: true, appointment };
  } catch {
    return {
      ok: false,
      errors: { global: ["Erreur lors de la mise à jour du rendez-vous."] },
    };
  }
}

export async function updateAppointmentStatus(
  id: string,
  status: Appointment["status"],
) {
  await requireRole("appointments:write");
  const ctx = await requireClinicContext();

  const existing = await prisma.appointment.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
  });
  if (!existing) notFound();

  const appointment = await prisma.appointment.update({
    where: { id },
    data: { status },
  });

  await logAudit({
    action: AuditAction.UPDATE,
    entityType: "Appointment",
    entityId: appointment.id,
    clinicId: ctx.clinicId,
    userId: ctx.userId,
    metadata: { status },
  });

  revalidatePath("/rendez-vous");
  revalidatePath(`/rendez-vous/${id}`);
  return { ok: true, appointment };
}

export async function deleteAppointment(id: string) {
  await requireRole("appointments:write");
  const ctx = await requireClinicContext();

  const existing = await prisma.appointment.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
  });
  if (!existing) notFound();

  const appointment = await prisma.appointment.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await logAudit({
    action: AuditAction.DELETE,
    entityType: "Appointment",
    entityId: appointment.id,
    clinicId: ctx.clinicId,
    userId: ctx.userId,
  });

  revalidatePath("/rendez-vous");
  revalidatePath(`/rendez-vous/${id}`);
  return { ok: true, appointment };
}
