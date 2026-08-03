"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { requireClinicContext, withClinic } from "@/lib/tenant";
import { createUserSchema, updateUserSchema } from "@/lib/validations/user";
import { Role } from "@prisma/client";
import { auth } from "@/auth";

// ------------------------------------------------------------------
// List users (clinic-scoped)
// ------------------------------------------------------------------

export async function listUsers() {
  await requireRole("users:manage");
  const ctx = await requireClinicContext();

  return prisma.user.findMany({
    where: {
      clinicId: ctx.clinicId,
      deletedAt: null,
      role: { not: Role.PLATFORM_ADMIN },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });
}

// ------------------------------------------------------------------
// Create user
// ------------------------------------------------------------------

export async function createUser(data: unknown) {
  await requireRole("users:manage");
  const ctx = await requireClinicContext();

  const parsed = createUserSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return {
      ok: false,
      errors: { email: ["Un utilisateur avec cet email existe déjà."] },
    } as const;
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const user = await prisma.user.create({
    data: withClinic(ctx, {
      email: parsed.data.email,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      passwordHash,
      role: parsed.data.role,
      isActive: true,
    }),
  });

  revalidatePath("/users");
  return { ok: true, user: { id: user.id, email: user.email } } as const;
}

// ------------------------------------------------------------------
// Get single user
// ------------------------------------------------------------------

export async function getUser(id: string) {
  await requireRole("users:manage");
  const ctx = await requireClinicContext();

  return prisma.user.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });
}

// ------------------------------------------------------------------
// Update user
// ------------------------------------------------------------------

export async function updateUser(id: string, data: unknown) {
  await requireRole("users:manage");
  const ctx = await requireClinicContext();

  const parsed = updateUserSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  const existing = await prisma.user.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
  });
  if (!existing) {
    return {
      ok: false,
      errors: { global: ["Utilisateur introuvable."] },
    } as const;
  }

  // Prevent demoting the only owner
  if (
    parsed.data.role &&
    existing.role === Role.OWNER &&
    parsed.data.role !== Role.OWNER
  ) {
    const ownerCount = await prisma.user.count({
      where: { clinicId: ctx.clinicId, role: Role.OWNER, deletedAt: null },
    });
    if (ownerCount <= 1) {
      return {
        ok: false,
        errors: { role: ["Impossible de rétrograder le seul propriétaire."] },
      } as const;
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath("/users");
  revalidatePath(`/users/${id}`);
  return { ok: true, user } as const;
}

// ------------------------------------------------------------------
// Soft-delete user
// ------------------------------------------------------------------

export async function deleteUser(id: string) {
  await requireRole("users:manage");
  const ctx = await requireClinicContext();

  const existing = await prisma.user.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
  });
  if (!existing) {
    return {
      ok: false,
      errors: { global: ["Utilisateur introuvable."] },
    } as const;
  }

  // Prevent deleting yourself
  const session = await auth();
  if (session?.user?.id === id) {
    return {
      ok: false,
      errors: { global: ["Vous ne pouvez pas supprimer votre propre compte."] },
    } as const;
  }

  // Prevent deleting the only owner
  if (existing.role === Role.OWNER) {
    const ownerCount = await prisma.user.count({
      where: { clinicId: ctx.clinicId, role: Role.OWNER, deletedAt: null },
    });
    if (ownerCount <= 1) {
      return {
        ok: false,
        errors: { global: ["Impossible de supprimer le seul propriétaire."] },
      } as const;
    }
  }

  await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });

  revalidatePath("/users");
  return { ok: true } as const;
}
