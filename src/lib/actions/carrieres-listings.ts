"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { requireClinicContext, withClinic } from "@/lib/tenant";
import {
  clinicListingSchema,
  equipmentListingSchema,
} from "@/lib/validations/carrieres";
import { revalidatePath } from "next/cache";

// ------------------------------------------------------------------
// Public — no auth required
// ------------------------------------------------------------------

export async function listPublicClinicListings() {
  return prisma.clinicListing.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      clinic: { select: { name: true, city: true, wilaya: true, email: true, phone: true } },
    },
  });
}

export async function getPublicClinicListing(id: string) {
  return prisma.clinicListing.findFirst({
    where: { id, status: "PUBLISHED", deletedAt: null },
    include: {
      clinic: { select: { name: true, city: true, wilaya: true, email: true, phone: true } },
    },
  });
}

export async function listPublicEquipmentListings() {
  return prisma.equipmentListing.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      clinic: { select: { name: true, city: true, wilaya: true, email: true, phone: true } },
    },
  });
}

export async function getPublicEquipmentListing(id: string) {
  return prisma.equipmentListing.findFirst({
    where: { id, status: "PUBLISHED", deletedAt: null },
    include: {
      clinic: { select: { name: true, city: true, wilaya: true, email: true, phone: true } },
    },
  });
}

// ------------------------------------------------------------------
// Authenticated clinic actions — Clinic Listings
// ------------------------------------------------------------------

export async function listClinicListings() {
  await requireRole("patients:read");
  const ctx = await requireClinicContext();
  return prisma.clinicListing.findMany({
    where: { clinicId: ctx.clinicId, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
}

export async function createClinicListing(data: unknown) {
  await requireRole("patients:write");
  const ctx = await requireClinicContext();
  const parsed = clinicListingSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  const photos = parsed.data.photos
    ? parsed.data.photos.split("\n").filter((u) => u.trim())
    : [];

  const listing = await prisma.clinicListing.create({
    data: withClinic(ctx, {
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price ? parseInt(parsed.data.price, 10) : 0,
      location: parsed.data.location || undefined,
      city: parsed.data.city || undefined,
      wilaya: parsed.data.wilaya || undefined,
      photos,
      contactPhone: parsed.data.contactPhone || undefined,
      contactEmail: parsed.data.contactEmail || undefined,
    }),
  });

  revalidatePath("/carrieres");
  return { ok: true, listing } as const;
}

export async function publishClinicListing(id: string) {
  await requireRole("patients:write");
  const ctx = await requireClinicContext();
  const existing = await prisma.clinicListing.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
  });
  if (!existing) return { ok: false, errors: { global: ["Annonce introuvable."] } } as const;

  await prisma.clinicListing.update({ where: { id }, data: { status: "PUBLISHED" } });
  revalidatePath("/carrieres");
  return { ok: true } as const;
}

export async function deleteClinicListing(id: string) {
  await requireRole("patients:write");
  const ctx = await requireClinicContext();
  const existing = await prisma.clinicListing.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
  });
  if (!existing) return { ok: false, errors: { global: ["Annonce introuvable."] } } as const;

  await prisma.clinicListing.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/carrieres");
  return { ok: true } as const;
}

// ------------------------------------------------------------------
// Authenticated clinic actions — Equipment Listings
// ------------------------------------------------------------------

export async function listEquipmentListings() {
  await requireRole("patients:read");
  const ctx = await requireClinicContext();
  return prisma.equipmentListing.findMany({
    where: { clinicId: ctx.clinicId, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
}

export async function createEquipmentListing(data: unknown) {
  await requireRole("patients:write");
  const ctx = await requireClinicContext();
  const parsed = equipmentListingSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  const photos = parsed.data.photos
    ? parsed.data.photos.split("\n").filter((u) => u.trim())
    : [];

  const listing = await prisma.equipmentListing.create({
    data: withClinic(ctx, {
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price ? parseInt(parsed.data.price, 10) : 0,
      condition: parsed.data.condition || undefined,
      brand: parsed.data.brand || undefined,
      photos,
      contactPhone: parsed.data.contactPhone || undefined,
      contactEmail: parsed.data.contactEmail || undefined,
    }),
  });

  revalidatePath("/carrieres");
  return { ok: true, listing } as const;
}

export async function publishEquipmentListing(id: string) {
  await requireRole("patients:write");
  const ctx = await requireClinicContext();
  const existing = await prisma.equipmentListing.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
  });
  if (!existing) return { ok: false, errors: { global: ["Annonce introuvable."] } } as const;

  await prisma.equipmentListing.update({ where: { id }, data: { status: "PUBLISHED" } });
  revalidatePath("/carrieres");
  return { ok: true } as const;
}

export async function deleteEquipmentListing(id: string) {
  await requireRole("patients:write");
  const ctx = await requireClinicContext();
  const existing = await prisma.equipmentListing.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
  });
  if (!existing) return { ok: false, errors: { global: ["Annonce introuvable."] } } as const;

  await prisma.equipmentListing.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/carrieres");
  return { ok: true } as const;
}
