import { prisma } from "@/lib/prisma";

export type CounterType =
  "PATIENT" | "INVOICE" | "QUOTE" | "PRESCRIPTION" | "LAB_ORDER";

/**
 * Returns the next sequential number atomically using an upsert counter.
 * This is safe under concurrent requests because PostgreSQL handles the
 * increment atomically.
 */
export async function nextNumber(
  clinicId: string,
  type: CounterType,
  options?: { prefix?: string; pad?: number },
): Promise<string> {
  const counter = await prisma.counter.upsert({
    where: { clinicId_type: { clinicId, type } },
    update: { value: { increment: 1 } },
    create: { clinicId, type, value: 1 },
  });

  const seq = counter.value;
  const prefix = options?.prefix ?? "";
  const pad = options?.pad ?? 4;

  return `${prefix}${String(seq).padStart(pad, "0")}`;
}
