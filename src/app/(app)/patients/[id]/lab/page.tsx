import Link from "next/link";
import { notFound } from "next/navigation";
import { FlaskConical, Plus } from "lucide-react";
import { listLabOrders } from "@/app/(app)/lab/actions";
import { getPatient } from "../../actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/date";

interface Props {
  params: Promise<{ id: string }>;
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "En attente",
    IN_PROGRESS: "En cours",
    COMPLETED: "Terminée",
    CANCELLED: "Annulée",
  };
  return labels[status] ?? status;
}

function statusVariant(
  status: string,
): "default" | "success" | "warning" | "danger" | "info" {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "IN_PROGRESS":
      return "info";
    case "PENDING":
      return "warning";
    case "CANCELLED":
      return "danger";
    default:
      return "default";
  }
}

function resultSummary(results: { status: string }[]): {
  label: string;
  variant: "default" | "success" | "warning" | "danger" | "info";
} {
  if (results.length === 0)
    return { label: "Aucun résultat", variant: "default" };
  const hasCritical = results.some((r) => r.status === "CRITICAL");
  const hasAbnormal = results.some((r) => r.status === "ABNORMAL");
  if (hasCritical) return { label: "Résultat critique", variant: "danger" };
  if (hasAbnormal) return { label: "Résultat anormal", variant: "warning" };
  const allNormal = results.every((r) => r.status === "NORMAL");
  if (allNormal) return { label: "Tous normaux", variant: "success" };
  return { label: "Partiel", variant: "info" };
}

export default async function LabOrdersPage({ params }: Props) {
  const { id } = await params;
  const [patient, orders] = await Promise.all([
    getPatient(id),
    listLabOrders(id),
  ]);

  if (!patient) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Analyses biologiques — {patient.firstName} {patient.lastName}
          </h2>
          <p className="text-sm text-slate-500">N° {patient.number}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/patients/${id}`}>
            <Button variant="secondary">Retour au dossier</Button>
          </Link>
          <Link href={`/patients/${id}/lab/new`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle demande
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-slate-500" />
            Demandes d&apos;analyses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-slate-500">
              Aucune demande d&apos;analyse pour ce patient.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {orders.map((order) => {
                const summary = resultSummary(order.results);
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">
                          Demande {order.number}
                        </p>
                        <Badge variant={statusVariant(order.status)}>
                          {statusLabel(order.status)}
                        </Badge>
                        <Badge variant={summary.variant}>{summary.label}</Badge>
                      </div>
                      <p className="text-sm text-slate-500">
                        {formatDateTime(order.orderedAt)} — Dr.{" "}
                        {order.createdBy.firstName} {order.createdBy.lastName}
                      </p>
                      <p className="text-sm text-slate-600">
                        {order.requestedTests.join(", ")}
                      </p>
                    </div>
                    <Link href={`/patients/${id}/lab/${order.id}`}>
                      <Button variant="secondary" size="sm">
                        Ouvrir
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
