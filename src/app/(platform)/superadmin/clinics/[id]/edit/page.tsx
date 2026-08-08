import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building2 } from "lucide-react";
import ClinicEditForm from "./ClinicEditForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClinicEditPage({ params }: Props) {
  const { id } = await params;

  const clinic = await prisma.clinic.findUnique({
    where: { id },
  });

  if (!clinic) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/superadmin/clinics/${clinic.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au cabinet
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Modifier le cabinet
        </h1>
        <p className="mt-1 text-slate-500">{clinic.name}</p>
      </div>

      <Card>
        <CardHeader className="border-b px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Building2 className="h-5 w-5 text-blue-600" />
            Informations du cabinet
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ClinicEditForm clinic={clinic} />
        </CardContent>
      </Card>
    </div>
  );
}
