import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${name}`);
  }
  return value;
}

async function main() {
  const email = requireEnv("PLATFORM_ADMIN_EMAIL");
  const password = requireEnv("PLATFORM_ADMIN_PASSWORD");
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: Role.PLATFORM_ADMIN,
      clinicId: null,
    },
    create: {
      email,
      passwordHash,
      firstName: "Plateforme",
      lastName: "Administrateur",
      role: Role.PLATFORM_ADMIN,
      clinicId: null,
    },
  });

  console.log(`✅ Admin plateforme créé/mis à jour : ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
