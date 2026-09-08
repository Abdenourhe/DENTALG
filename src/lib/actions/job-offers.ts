"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { requireClinicContext, withClinic } from "@/lib/tenant";
import {
  jobOfferSchema,
  jobOfferUpdateSchema,
  jobApplicationSchema,
} from "@/lib/validations/job";
import { revalidatePath } from "next/cache";

// ------------------------------------------------------------------
// Public — no auth required
// ------------------------------------------------------------------

export async function listPublicJobOffers() {
  return prisma.jobOffer.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    orderBy: { publishedAt: "desc" },
    include: {
      clinic: { select: { name: true, city: true, wilaya: true } },
      _count: { select: { applications: true } },
    },
  });
}

export async function getPublicJobOffer(id: string) {
  return prisma.jobOffer.findFirst({
    where: { id, status: "PUBLISHED", deletedAt: null },
    include: {
      clinic: {
        select: {
          name: true,
          city: true,
          wilaya: true,
          email: true,
          logoUrl: true,
        },
      },
    },
  });
}

export async function applyToJob(data: unknown) {
  const parsed = jobApplicationSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  const { jobOfferId, firstName, lastName, email, phone, coverLetter, cvUrl } =
    parsed.data;

  const offer = await prisma.jobOffer.findFirst({
    where: { id: jobOfferId, status: "PUBLISHED", deletedAt: null },
  });
  if (!offer)
    return { ok: false, errors: { global: ["Offre introuvable."] } } as const;

  const profile = await prisma.candidateProfile.upsert({
    where: { email },
    update: {
      firstName,
      lastName,
      phone: phone || undefined,
      coverLetter: coverLetter || undefined,
      cvUrl: cvUrl || undefined,
    },
    create: {
      firstName,
      lastName,
      email,
      phone: phone || undefined,
      coverLetter: coverLetter || undefined,
      cvUrl: cvUrl || undefined,
    },
  });

  const application = await prisma.jobApplication.create({
    data: {
      clinicId: offer.clinicId,
      jobOfferId,
      candidateProfileId: profile.id,
    },
  });

  revalidatePath(`/carrieres/${jobOfferId}`);
  return { ok: true, application } as const;
}

// ------------------------------------------------------------------
// Authenticated clinic actions
// ------------------------------------------------------------------

export async function listJobOffers() {
  await requireRole("patients:read");
  const ctx = await requireClinicContext();

  return prisma.jobOffer.findMany({
    where: { clinicId: ctx.clinicId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });
}

export async function createJobOffer(data: unknown) {
  await requireRole("patients:write");
  const ctx = await requireClinicContext();

  const parsed = jobOfferSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  const offer = await prisma.jobOffer.create({
    data: withClinic(ctx, {
      ...parsed.data,
      closesAt: parsed.data.closesAt ? new Date(parsed.data.closesAt) : null,
    }),
  });

  revalidatePath("/carrieres");
  return { ok: true, offer } as const;
}

export async function updateJobOffer(id: string, data: unknown) {
  await requireRole("patients:write");
  const ctx = await requireClinicContext();

  const parsed = jobOfferUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  const existing = await prisma.jobOffer.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
  });
  if (!existing)
    return { ok: false, errors: { global: ["Offre introuvable."] } } as const;

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.closesAt)
    updateData.closesAt = new Date(parsed.data.closesAt);

  const offer = await prisma.jobOffer.update({
    where: { id },
    data: updateData,
  });
  revalidatePath("/carrieres");
  return { ok: true, offer } as const;
}

export async function publishJobOffer(id: string) {
  await requireRole("patients:write");
  const ctx = await requireClinicContext();

  const existing = await prisma.jobOffer.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
  });
  if (!existing)
    return { ok: false, errors: { global: ["Offre introuvable."] } } as const;

  const offer = await prisma.jobOffer.update({
    where: { id },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });

  revalidatePath("/carrieres");
  return { ok: true, offer } as const;
}

export async function deleteJobOffer(id: string) {
  await requireRole("patients:write");
  const ctx = await requireClinicContext();

  const existing = await prisma.jobOffer.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
  });
  if (!existing)
    return { ok: false, errors: { global: ["Offre introuvable."] } } as const;

  await prisma.jobOffer.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/carrieres");
  return { ok: true } as const;
}

// ------------------------------------------------------------------
// Job applications — candidates who applied to the clinic's offers
// ------------------------------------------------------------------

export async function listJobApplications(jobOfferId: string) {
  await requireRole("patients:read");
  const ctx = await requireClinicContext();

  const offer = await prisma.jobOffer.findFirst({
    where: { id: jobOfferId, clinicId: ctx.clinicId, deletedAt: null },
  });
  if (!offer) return null;

  const applications = await prisma.jobApplication.findMany({
    where: { jobOfferId, clinicId: ctx.clinicId },
    orderBy: { createdAt: "desc" },
    include: { candidateProfile: true },
  });

  return { offer, applications };
}

export async function updateApplicationStatus(
  applicationId: string,
  status: string,
) {
  await requireRole("patients:write");
  const ctx = await requireClinicContext();

  const existing = await prisma.jobApplication.findFirst({
    where: { id: applicationId, clinicId: ctx.clinicId },
  });
  if (!existing)
    return {
      ok: false,
      errors: { global: ["Candidature introuvable."] },
    } as const;

  const validStatuses = ["PENDING", "REVIEWING", "ACCEPTED", "REJECTED"];
  if (!validStatuses.includes(status)) {
    return { ok: false, errors: { global: ["Statut invalide."] } } as const;
  }

  const application = await prisma.jobApplication.update({
    where: { id: applicationId },
    data: {
      status: status as "PENDING" | "REVIEWING" | "ACCEPTED" | "REJECTED",
      reviewedById: ctx.userId,
    },
  });

  revalidatePath(`/carrieres/manage/${existing.jobOfferId}/applications`);
  return { ok: true, application } as const;
}

export async function updateApplicationStatusFromForm(formData: FormData) {
  const applicationId = formData.get("applicationId") as string;
  const status = formData.get("status") as string;
  await updateApplicationStatus(applicationId, status);
}
