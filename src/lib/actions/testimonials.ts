"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { requireClinicContext, withClinic } from "@/lib/tenant";
import { testimonialSchema } from "@/lib/validations/testimonial";
import { revalidatePath } from "next/cache";

// ------------------------------------------------------------------
// Public — no auth required
// ------------------------------------------------------------------

export async function listPublicTestimonials() {
  return prisma.testimonial.findMany({
    where: { isPublished: true, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 12,
    select: {
      id: true,
      authorName: true,
      authorRole: true,
      city: true,
      quote: true,
      rating: true,
    },
  });
}

// ------------------------------------------------------------------
// Authenticated clinic actions — any profile of the platform
// ------------------------------------------------------------------

export async function listMyTestimonials() {
  await requireRole("testimonials:write");
  const ctx = await requireClinicContext();

  return prisma.testimonial.findMany({
    where: { userId: ctx.userId, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
}

export async function createTestimonial(data: unknown) {
  await requireRole("testimonials:write");
  const ctx = await requireClinicContext();

  const parsed = testimonialSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  const testimonial = await prisma.testimonial.create({
    data: withClinic(ctx, {
      userId: ctx.userId,
      authorName: parsed.data.authorName,
      authorRole: parsed.data.authorRole,
      city: parsed.data.city || null,
      quote: parsed.data.quote,
      rating: parsed.data.rating,
    }),
  });

  revalidatePath("/settings/testimonials");
  return { ok: true, testimonial } as const;
}
