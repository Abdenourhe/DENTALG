import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { requireClinicContext } from "@/lib/tenant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/date";
import { FileText } from "lucide-react";

export default async function PrescriptionsPage() {
  await requireRole("prescriptions:read");
  const ctx = await requireClinicContext();

  const prescriptions = await prisma.prescription.findMany({
    where: { clinicId: ctx.clinicId, deletedAt: null },
    orderBy: { issuedAt: "desc" },
    take: 50,
    include: {
      patient: { select: { id: true, firstName: true, lastName: true } },
      createdBy: { select: { firstName: true, lastName: true } },
      items: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Ordonnances
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Historique des ordonnances du cabinet.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <FileText className="h-5 w-5 text-violet-600" />
            Liste des ordonnances
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">N°</th>
                  <th className="px-6 py-3">Patient</th>
                  <th className="px-6 py-3">Médicaments</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Statut</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {prescriptions.map((p) => (
                  <tr
                    key={p.id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {p.number}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/patients/${p.patient.id}`}
                        className="font-medium text-slate-900 hover:text-primary"
                      >
                        {p.patient.lastName} {p.patient.firstName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {p.items.map((i) => i.name).join(", ")}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatDateTime(p.issuedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={p.status === "ISSUED" ? "success" : "default"}
                      >
                        {p.status === "ISSUED" ? "Émise" : p.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/patients/${p.patient.id}/prescriptions/${p.id}/print`}
                      >
                        <Button variant="secondary" size="sm">
                          Imprimer
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {prescriptions.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Aucune ordonnance enregistrée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
