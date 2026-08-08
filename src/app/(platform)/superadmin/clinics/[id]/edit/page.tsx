import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
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
      <Breadcrumb
        items={[
          { label: "Cabinets", href: "/superadmin/clinics" },
          { label: clinic.name, href: `/superadmin/clinics/${clinic.id}` },
          { label: "Modifier" },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Modifier le cabinet
        </h1>
        <p className="mt-1 text-slate-500">
          Mettez à jour les informations de {clinic.name}.
        </p>
      </div>

      <ClinicEditForm clinic={clinic} />
    </div>
  );
}
