"use server";

import { prisma } from "@/lib/prisma";

const prefixes = {
  PATIENT: "P",
  INVOICE: "F",
  QUOTE: "D",
  PRESCRIPTION: "O",
  LAB_ORDER: "L",
} as const;

export type CounterType = keyof typeof prefixes;

export async function nextNumber(
  clinicId: string,
  type: CounterType,
  options?: { pad?: number },
): Promise<string> {
  const counter = await prisma.counter.upsert({
    where: { clinicId_type: { clinicId, type } },
    update: { value: { increment: 1 } },
    create: { clinicId, type, value: 1 },
  });

  const year = new Date().getFullYear();
  const seq = String(counter.value).padStart(options?.pad ?? 4, "0");
  return `${prefixes[type]}-${year}-${seq}`;
}
