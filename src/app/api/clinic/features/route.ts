import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getEnabledFeatures } from "@/lib/features";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.clinicId) {
    return NextResponse.json(
      { ok: false, error: "Non authentifié" },
      { status: 401 },
    );
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: session.user.clinicId },
    select: { features: true },
  });

  if (!clinic) {
    return NextResponse.json(
      { ok: false, error: "Cabinet introuvable" },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, features: getEnabledFeatures(clinic) });
}
