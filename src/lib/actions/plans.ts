"use server";

import { prisma } from "@/lib/prisma";

export async function listPublicPlans() {
  const plans = await prisma.planDefinition.findMany({
    where: { isActive: true },
    orderBy: { monthlyPriceCents: "asc" },
  });

  return plans.map((p) => ({
    id: p.id,
    plan: p.plan,
    name: p.name,
    description: p.description,
    monthlyPriceCents: p.monthlyPriceCents,
    yearlyPriceCents: p.yearlyPriceCents,
    features: Array.isArray(p.features)
      ? (p.features as string[])
      : typeof p.features === "string"
        ? (JSON.parse(p.features) as string[])
        : [],
  }));
}
