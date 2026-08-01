import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST() {
  const session = await auth();
  if (session?.user?.role !== "PLATFORM_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Create demo clinic
  const clinic = await prisma.clinic.create({
    data: {
      name: "Cabinet Dentaire Demo",
      slug: "demo-clinic",
      email: "demo@dentalg.dz",
      city: "Alger",
      wilaya: "Alger",
      plan: "PRO",
    },
  });

  // Create owner user
  const passwordHash = await bcrypt.hash("DemoPass123!", 10);
  const owner = await prisma.user.create({
    data: {
      clinicId: clinic.id,
      email: "owner@demo.dz",
      passwordHash,
      firstName: "Amine",
      lastName: "Benali",
      role: "OWNER",
    },
  });

  // Create patients
  const patients = await prisma.patient.createMany({
    data: [
      { clinicId: clinic.id, number: "0001", firstName: "Fatima", lastName: "Zerrouki", phone: "0555123456", city: "Alger", dateOfBirth: new Date("1990-05-15") },
      { clinicId: clinic.id, number: "0002", firstName: "Karim", lastName: "Hadji", phone: "0555987654", city: "Bab Ezzouar", dateOfBirth: new Date("1985-11-22") },
      { clinicId: clinic.id, number: "0003", firstName: "Selma", lastName: "Oudj", phone: "0555345678", city: "Hydra", dateOfBirth: new Date("1995-03-08") },
    ],
  });

  // Create procedures
  const procedures = await prisma.procedure.createMany({
    data: [
      { clinicId: clinic.id, code: "CONSULT", name: "Consultation", priceCents: 200000, color: "#3b82f6" },
      { clinicId: clinic.id, code: "DETART", name: "Détartrage", priceCents: 300000, color: "#10b981" },
      { clinicId: clinic.id, code: "OBTUR", name: "Obturation composite", priceCents: 450000, color: "#f59e0b" },
      { clinicId: clinic.id, code: "EXTRAC", name: "Extraction", priceCents: 250000, color: "#ef4444" },
      { clinicId: clinic.id, code: "IMPLANT", name: "Implant + couronne", priceCents: 4500000, color: "#8b5cf6" },
    ],
  });

  return NextResponse.json({ ok: true, clinicId: clinic.id });
}
