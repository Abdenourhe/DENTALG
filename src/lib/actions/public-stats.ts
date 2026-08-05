"use server";

import { prisma } from "@/lib/prisma";

export async function getPublicStats() {
  const [clinics, offers] = await Promise.all([
    prisma.clinic.count({ where: { isActive: true, deletedAt: null } }),
    prisma.jobOffer.count({ where: { status: "PUBLISHED", deletedAt: null } }),
  ]);

  return { clinics, offers };
}
