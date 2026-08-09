import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { requireClinicContext } from "@/lib/tenant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/date";
import { FlaskConical } from "lucide-react";

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
};

const statusVariants: Record<
  string,
  "warning" | "info" | "success" | "danger" | "default"
> = {
  PENDING: "warning",
  IN_PROGRESS: "info",
  COMPLETED: "success",
  CANCELLED: "danger",
};

export default async function LabPage() {
  await requireRole("lab:read");
  const ctx = await requireClinicContext();

  const orders = await prisma.labOrder.findMany({
    where: { clinicId: ctx.clinicId, deletedAt: null },
    orderBy: { orderedAt: "desc" },
    take: 50,
    include: {
      patient: { select: { id: true, firstName: true, lastName: true } },
      createdBy: { select: { firstName: true, lastName: true } },
      results: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Laboratoire
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Demandes d&apos;analyses et résultats.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <FlaskConical className="h-5 w-5 text-emerald-600" />
            Demandes d&apos;analyses
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">N°</th>
                  <th className="px-6 py-3">Patient</th>
                  <th className="px-6 py-3">Analyses demandées</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Statut</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {order.number}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/patients/${order.patient.id}`}
                        className="font-medium text-slate-900 hover:text-primary"
                      >
                        {order.patient.lastName} {order.patient.firstName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {order.requestedTests.join(", ")}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatDateTime(order.orderedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={statusVariants[order.status] ?? "default"}
                      >
                        {statusLabels[order.status] ?? order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/patients/${order.patient.id}/lab/${order.id}`}
                      >
                        <Button variant="secondary" size="sm">
                          Voir
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Aucune demande d&apos;analyse.
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
