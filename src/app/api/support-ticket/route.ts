import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TicketType } from "@prisma/client";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.clinicId) {
    return NextResponse.json(
      { ok: false, error: "Non authentifié" },
      { status: 401 },
    );
  }

  const body = await req.json();
  const type = Object.values(TicketType).includes(body.type)
    ? body.type
    : "BUG";

  const ticket = await prisma.supportTicket.create({
    data: {
      clinicId: session.user.clinicId,
      userId: session.user.id,
      type,
      subject: body.subject?.slice(0, 200) || "Sans sujet",
      description: body.description?.slice(0, 5000) || "",
      status: "OPEN",
    },
  });

  return NextResponse.json({ ok: true, ticket });
}
