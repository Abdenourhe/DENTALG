import { PrismaClient, Role, Plan } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Plan definitions
  const plans = [
    { plan: Plan.FREE, name: "Gratuit", monthlyPriceCents: 0, yearlyPriceCents: 0, features: {} },
    { plan: Plan.ESSENTIEL, name: "Essentiel", monthlyPriceCents: 500000, yearlyPriceCents: 5000000, features: { INVOICING: true } },
    { plan: Plan.PRO, name: "Pro", monthlyPriceCents: 1500000, yearlyPriceCents: 15000000, features: { INVOICING: true, PRESCRIPTIONS: true, LAB_ORDERS: true, TREATMENT_PLANS: true, JOB_OFFERS: true } },
    { plan: Plan.PREMIUM, name: "Premium", monthlyPriceCents: 3000000, yearlyPriceCents: 30000000, features: { INVOICING: true, PRESCRIPTIONS: true, LAB_ORDERS: true, TREATMENT_PLANS: true, JOB_OFFERS: true, ANALYTICS: true } },
  ];

  for (const p of plans) {
    await prisma.planDefinition.upsert({
      where: { plan: p.plan },
      update: {},
      create: {
        plan: p.plan,
        name: p.name,
        monthlyPriceCents: p.monthlyPriceCents,
        yearlyPriceCents: p.yearlyPriceCents,
        features: p.features,
      },
    });
  }

  // 2. Platform admin (if env provided)
  const adminEmail = process.env.PLATFORM_ADMIN_EMAIL;
  const adminPassword = process.env.PLATFORM_ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existing) {
      await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash: await bcrypt.hash(adminPassword, 12),
          firstName: "Admin",
          lastName: "Plateforme",
          role: Role.PLATFORM_ADMIN,
          isActive: true,
        },
      });
      console.log("✅ Platform admin created");
    }
  }

  console.log("🎉 Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
