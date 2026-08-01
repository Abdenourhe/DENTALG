"use server";

import { revalidatePath } from "next/cache";
import { requirePlatformAdmin } from "@/lib/platform-auth";
import { prisma } from "@/lib/prisma";
import { AuditAction } from "@prisma/client";

export async function toggleClinicStatus(formData: FormData): Promise<void> {
  const admin = await requirePlatformAdmin();
  const clinicId = formData.get("clinicId") as string;

  if (!clinicId) return;

  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
  if (!clinic) return;

  await prisma.clinic.update({
    where: { id: clinicId },
    data: { isActive: !clinic.isActive },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.userId,
      action: AuditAction.UPDATE,
      entityType: "Clinic",
      entityId: clinicId,
      metadata: { field: "isActive", newValue: !clinic.isActive },
    },
  });

  revalidatePath("/superadmin/clinics");
  revalidatePath("/superadmin");
}
