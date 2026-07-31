"use server";

import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { Role } from "@prisma/client";
import bcrypt from "bcrypt";

type RegisterResult =
  | { ok: true }
  | { ok: false; errors: Record<string, string[]> };

export async function registerClinic(
  _prevState: RegisterResult | null,
  formData: FormData
): Promise<RegisterResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const {
    clinicName,
    clinicSlug,
    clinicEmail,
    firstName,
    lastName,
    email,
    password,
  } = parsed.data;

  try {
    const existingClinic = await prisma.clinic.findUnique({
      where: { slug: clinicSlug },
    });
    if (existingClinic) {
      return {
        ok: false,
        errors: { clinicSlug: ["Ce slug est déjà utilisé."] },
      };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return {
        ok: false,
        errors: { email: ["Cet email est déjà utilisé."] },
      };
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const referenceProcedures = await prisma.procedure.findMany({
      where: { clinicId: null, isReference: true },
    });

    await prisma.$transaction(async (tx) => {
      const clinic = await tx.clinic.create({
        data: {
          name: clinicName,
          slug: clinicSlug,
          email: clinicEmail,
        },
      });

      await tx.user.create({
        data: {
          clinicId: clinic.id,
          email,
          passwordHash,
          firstName,
          lastName,
          role: Role.OWNER,
        },
      });

      for (const ref of referenceProcedures) {
        await tx.procedure.create({
          data: {
            clinicId: clinic.id,
            code: ref.code,
            name: ref.name,
            description: ref.description,
            priceCents: ref.priceCents,
            color: ref.color,
            isReference: false,
          },
        });
      }
    });

    return { ok: true };
  } catch (e) {
    console.error(e);
    return {
      ok: false,
      errors: { root: ["Une erreur est survenue. Veuillez réessayer."] },
    };
  }
}
