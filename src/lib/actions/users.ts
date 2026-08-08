"use server";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { requireClinicContext } from "@/lib/tenant";
import type { Role } from "@prisma/client";

export async function getClinicUsers(options?: { role?: Role; includeInactive?: boolean }) {
  await requireRole("users:manage");
  const ctx = await requireClinicContext();

  return prisma.user.findMany({
    where: {
      clinicId: ctx.clinicId,
      deletedAt: null,
      ...(options?.role ? { role: options.role } : {}),
      ...(options?.includeInactive ? {} : { isActive: true }),
    },
    orderBy: { lastName: "asc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
    },
  });
}

export async function getUser(id: string) {
  await requireRole("users:manage");
  const ctx = await requireClinicContext();

  const user = await prisma.user.findFirst({
    where: { id, clinicId: ctx.clinicId, deletedAt: null },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!user) notFound();
  return user;
}
