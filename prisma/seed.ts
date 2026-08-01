import { PrismaClient, Plan, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const PLAN_DEFINITIONS = [
  {
    plan: Plan.FREE,
    name: "Gratuit",
    description: "1 utilisateur, 100 patients, fonctionnalités essentielles.",
    monthlyPriceCents: 0,
    yearlyPriceCents: 0,
    features: { maxUsers: 1, maxPatients: 100, includesBilling: false },
  },
  {
    plan: Plan.ESSENTIEL,
    name: "Essentiel",
    description: "5 utilisateurs, patients illimités, facturation.",
    monthlyPriceCents: 300_000,
    yearlyPriceCents: 3_000_000,
    features: { maxUsers: 5, maxPatients: null, includesBilling: true },
  },
  {
    plan: Plan.PRO,
    name: "Pro",
    description: "15 utilisateurs, rappels SMS, offres d'emploi.",
    monthlyPriceCents: 800_000,
    yearlyPriceCents: 8_000_000,
    features: { maxUsers: 15, maxPatients: null, includesBilling: true, includesSms: true },
  },
  {
    plan: Plan.PREMIUM,
    name: "Premium",
    description: "Utilisateurs illimités, API, support prioritaire.",
    monthlyPriceCents: 1_500_000,
    yearlyPriceCents: 15_000_000,
    features: { maxUsers: null, maxPatients: null, includesBilling: true, includesSms: true, includesApi: true },
  },
];

const REFERENCE_PROCEDURES = [
  { code: "CONS", name: "Consultation", description: "Consultation initiale", priceCents: 100_000 },
  { code: "DET", name: "Détartrage", description: "Détartrage standard", priceCents: 250_000 },
  { code: "OBT", name: "Obturation", description: "Soin de carie / obturation", priceCents: 300_000 },
  { code: "SURF", name: "Surfaçage", description: "Détartrage + surfaçage", priceCents: 350_000 },
  { code: "ENDO", name: "Endodontie", description: "Traitement canalaire", priceCents: 1_200_000 },
  { code: "EXT", name: "Extraction simple", description: "Extraction dentaire simple", priceCents: 200_000 },
  { code: "EXTC", name: "Extraction chirurgicale", description: "Extraction chirurgicale", priceCents: 500_000 },
  { code: "COUR", name: "Couronne", description: "Couronne prothétique", priceCents: 1_800_000 },
  { code: "BRID", name: "Bridge", description: "Bridge prothétique", priceCents: 6_000_000 },
  { code: "IMPL", name: "Implant", description: "Implant dentaire", priceCents: 8_000_000 },
  { code: "BLAN", name: "Blanchiment", description: "Blanchiment dentaire", priceCents: 1_500_000 },
];

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${name}`);
  }
  return value;
}

async function main() {
  for (const planDef of PLAN_DEFINITIONS) {
    await prisma.planDefinition.upsert({
      where: { plan: planDef.plan },
      update: {},
      create: {
        plan: planDef.plan,
        name: planDef.name,
        description: planDef.description,
        monthlyPriceCents: planDef.monthlyPriceCents,
        yearlyPriceCents: planDef.yearlyPriceCents,
        features: planDef.features,
      },
    });
  }

  for (const proc of REFERENCE_PROCEDURES) {
    const existing = await prisma.procedure.findFirst({
      where: { clinicId: null, code: proc.code },
    });

    if (!existing) {
      await prisma.procedure.create({
        data: {
          clinicId: null,
          code: proc.code,
          name: proc.name,
          description: proc.description,
          priceCents: proc.priceCents,
          isReference: true,
        },
      });
    }
  }

  const adminEmail = requireEnv("PLATFORM_ADMIN_EMAIL");
  const adminPassword = requireEnv("PLATFORM_ADMIN_PASSWORD");
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: Role.PLATFORM_ADMIN,
      clinicId: null,
    },
    create: {
      email: adminEmail,
      passwordHash,
      firstName: "Plateforme",
      lastName: "Administrateur",
      role: Role.PLATFORM_ADMIN,
      clinicId: null,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
