import glob, os

path = glob.glob('src/app/*/superadmin/actions.ts')[0]
with open(path, 'r') as f:
    content = f.read()

old_section = '''  revalidatePath("/superadmin/requests");
  return { ok: true, request: req } as const;
}

// ===================================================================
// Stats for superadmin dashboard
// ==================================================================='''

new_section = '''  revalidatePath("/superadmin/requests");
  return { ok: true, request: req } as const;
}

// ===================================================================
// Clinic management
// ===================================================================

export async function toggleClinicStatus(data: unknown) {
  await requirePlatformAdmin();
  const parsed = toggleClinicStatusSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: parsed.data.clinicId },
  });
  if (!clinic) {
    return { ok: false, errors: { clinicId: ["Cabinet introuvable."] } } as const;
  }

  await prisma.clinic.update({
    where: { id: parsed.data.clinicId },
    data: { isActive: !clinic.isActive },
  });

  revalidatePath("/superadmin/clinics");
  return { ok: true } as const;
}

// ===================================================================
// Stats for superadmin dashboard
// ==================================================================='''

if old_section in content:
    content = content.replace(old_section, new_section)
    with open(path, 'w') as f:
        f.write(content)
    print(f"Updated {path}")
else:
    print("Old section not found!")
    # Also add import
