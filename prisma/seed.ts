import { PrismaClient, Role, Plan } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data (optional — remove in production)
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.quoteItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.treatmentItem.deleteMany();
  await prisma.treatmentPlan.deleteMany();
  await procedureDeleteMany();
  await prisma.appointment.deleteMany();
  await prisma.medicalNote.deleteMany();
  await prisma.toothStatusEvent.deleteMany();
  await prisma.toothStatus.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();
  await prisma.clinic.deleteMany();

  // Create demo clinic
  const clinic = await prisma.clinic.create({
    data: {
      name: "Cabinet Dentaire Benali",
      slug: "cabinet-benali",
      email: "contact@benali-dental.dz",
      phone: "023456789",
      address: "12 Rue Didouche Mourad",
      city: "Alger Centre",
      wilaya: "Alger",
      plan: Plan.PRO,
      isActive: true,
    },
  });

  console.log(`✅ Clinic created: ${clinic.name}`);

  // Create owner
  const passwordHash = await bcrypt.hash("DemoPass123!", 10);
  const owner = await prisma.user.create({
    data: {
      clinicId: clinic.id,
      email: "dr.benali@demo.dz",
      passwordHash,
      firstName: "Amine",
      lastName: "Benali",
      role: Role.OWNER,
      isActive: true,
    },
  });

  // Create assistant
  const assistant = await prisma.user.create({
    data: {
      clinicId: clinic.id,
      email: "assistant@demo.dz",
      passwordHash: await bcrypt.hash("DemoPass123!", 10),
      firstName: "Fatima",
      lastName: "Zerrouki",
      role: Role.ASSISTANT,
      isActive: true,
    },
  });

  // Create secretary
  const secretary = await prisma.user.create({
    data: {
      clinicId: clinic.id,
      email: "secretary@demo.dz",
      passwordHash: await bcrypt.hash("DemoPass123!", 10),
      firstName: "Karim",
      lastName: "Hadji",
      role: Role.SECRETARY,
      isActive: true,
    },
  });

  console.log(`✅ Users created: ${owner.email}, ${assistant.email}, ${secretary.email}`);

  // Create patients
  const patients = await prisma.patient.createMany({
    data: [
      {
        clinicId: clinic.id,
        number: "0001",
        firstName: "Fatima",
        lastName: "Zerrouki",
        phone: "0555123456",
        email: "fatima.z@email.dz",
        address: "Bab Ezzouar",
        city: "Alger",
        wilaya: "Alger",
        dateOfBirth: new Date("1990-05-15"),
        notes: "Allergie pénicilline. Diabète type 2.",
      },
      {
        clinicId: clinic.id,
        number: "0002",
        firstName: "Karim",
        lastName: "Hadji",
        phone: "0555987654",
        email: "karim.h@email.dz",
        address: "Hydra",
        city: "Alger",
        wilaya: "Alger",
        dateOfBirth: new Date("1985-11-22"),
        notes: "Fumeur. Hypertension.",
      },
      {
        clinicId: clinic.id,
        number: "0003",
        firstName: "Selma",
        lastName: "Oudj",
        phone: "0555345678",
        email: "selma.o@email.dz",
        address: "El Biar",
        city: "Alger",
        wilaya: "Alger",
        dateOfBirth: new Date("1995-03-08"),
      },
      {
        clinicId: clinic.id,
        number: "0004",
        firstName: "Youssef",
        lastName: "Meziane",
        phone: "0555567890",
        city: "Oran",
        wilaya: "Oran",
        dateOfBirth: new Date("1988-09-12"),
      },
    ],
  });

  console.log(`✅ Patients created: 4`);

  // Create procedures
  const procedures = await prisma.procedure.createMany({
    data: [
      { clinicId: clinic.id, code: "CONSULT", name: "Consultation", priceCents: 200000, color: "#3b82f6", isActive: true },
      { clinicId: clinic.id, code: "DETART", name: "Détartrage", priceCents: 300000, color: "#10b981", isActive: true },
      { clinicId: clinic.id, code: "OBTUR", name: "Obturation composite", priceCents: 450000, color: "#f59e0b", isActive: true },
      { clinicId: clinic.id, code: "EXTRAC", name: "Extraction simple", priceCents: 250000, color: "#ef4444", isActive: true },
      { clinicId: clinic.id, code: "IMPLANT", name: "Implant + couronne", priceCents: 4500000, color: "#8b5cf6", isActive: true },
      { clinicId: clinic.id, code: "DEVIT", name: "Dévitalisation", priceCents: 1200000, color: "#06b6d4", isActive: true },
      { clinicId: clinic.id, code: "COURN", name: "Couronne céramique", priceCents: 1800000, color: "#a855f7", isActive: true },
    ],
  });

  console.log(`✅ Procedures created: 7`);

  // Create a published job offer
  await prisma.jobOffer.create({
    data: {
      clinicId: clinic.id,
      title: "Assistant(e) dentaire — CDI",
      description: "Nous recherchons un(e) assistant(e) dentaire qualifié(e) pour rejoindre notre équipe.\n\nMissions :\n- Accueil et gestion des patients\n- Assistance au fauteuil\n- Stérilisation du matériel\n- Gestion des stocks\n\nProfil recherché :\n- Diplôme d'assistant(e) dentaire\n- 2 ans d'expérience minimum\n- Maîtrise du français",
      location: "Alger Centre",
      requirements: "Diplôme assistant dentaire, 2 ans expérience",
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  console.log(`✅ Job offer created`);

  console.log("🎉 Seed completed successfully!");
  console.log("");
  console.log("Login credentials:");
  console.log("  Owner:    dr.benali@demo.dz / DemoPass123!");
  console.log("  Assistant: assistant@demo.dz / DemoPass123!");
  console.log("  Secretary: secretary@demo.dz / DemoPass123!");
}

async function procedureDeleteMany() {
  await prisma.procedure.deleteMany();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
