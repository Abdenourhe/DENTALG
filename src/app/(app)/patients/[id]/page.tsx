import Link from "next/link";
import { notFound } from "next/navigation";
import { getPatient, upsertToothStatus } from "../actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime } from "@/lib/date";
import { formatDA } from "@/lib/money";
import { formatToothName } from "./tooth-names";

interface Props {
  params: Promise<{ id: string }>;
}

const TOOTH_COLORS: Record<string, string> = {
  HEALTHY: "bg-green-500",
  CARIES: "bg-red-500",
  TREATED: "bg-amber-500",
  MISSING: "bg-slate-800",
  CROWN: "bg-purple-500",
  IMPLANT: "bg-blue-500",
  ROOT_CANAL: "bg-cyan-500",
  EXTRACTION_PLANNED: "bg-orange-500",
};

const UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

export default async function PatientDetailPage({ params }: Props) {
  const { id } = await params;
  const patient = await getPatient(id);
  if (!patient) notFound();

  const toothMap = new Map(
    patient.toothStatuses.map((t) => [t.tooth, t])
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {patient.lastName} {patient.firstName}
          </h2>
          <p className="text-sm text-slate-500">
            N° {patient.number} — {formatDate(patient.dateOfBirth)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/patients/${id}/edit`}>
            <Button variant="secondary">Modifier</Button>
          </Link>
        </div>
      </div>

      {/* Informations */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Coordonnées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-slate-500">Téléphone :</span> {patient.phone ?? "—"}</p>
            <p><span className="text-slate-500">Email :</span> {patient.email ?? "—"}</p>
            <p><span className="text-slate-500">Adresse :</span> {patient.address ?? "—"}</p>
            <p><span className="text-slate-500">Ville :</span> {patient.city ?? "—"} {patient.wilaya ? `(${patient.wilaya})` : ""}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {patient.notes ?? "Aucune note."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-slate-500">RDV :</span> {patient.appointments.length}</p>
            <p><span className="text-slate-500">Factures :</span> {patient.invoices.length}</p>
            <p><span className="text-slate-500">Plans de traitement :</span> {patient.treatmentPlans.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Odontogramme */}
      <Card>
        <CardHeader>
          <CardTitle>Odontogramme (FDI)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-center gap-1">
              {UPPER.map((n) => {
                const ts = toothMap.get(n);
                return (
                  <div key={n} className="flex flex-col items-center gap-1">
                    <div
                      className={`h-8 w-8 rounded-full ${
                        ts ? TOOTH_COLORS[ts.status] : "bg-green-500"
                      } border-2 border-white shadow`}
                      title={`${n} — ${formatToothName(n)}${ts ? ` [${ts.status}]` : ""}`}
                    />
                    <span className="text-[10px] text-slate-500">{n}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center gap-1">
              {LOWER.map((n) => {
                const ts = toothMap.get(n);
                return (
                  <div key={n} className="flex flex-col items-center gap-1">
                    <div
                      className={`h-8 w-8 rounded-full ${
                        ts ? TOOTH_COLORS[ts.status] : "bg-green-500"
                      } border-2 border-white shadow`}
                      title={`${n} — ${formatToothName(n)}${ts ? ` [${ts.status}]` : ""}`}
                    />
                    <span className="text-[10px] text-slate-500">{n}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            {Object.entries(TOOTH_COLORS).map(([status, color]) => (
              <span key={status} className="flex items-center gap-1">
                <span className={`inline-block h-3 w-3 rounded-full ${color}`} />
                {status}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Historique des RDV */}
      <Card>
        <CardHeader>
          <CardTitle>Derniers rendez-vous</CardTitle>
        </CardHeader>
        <CardContent>
          {patient.appointments.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun rendez-vous.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {patient.appointments.map((a) => (
                  <tr key={a.id}>
                    <td className="py-2">{formatDateTime(a.startAt)}</td>
                    <td className="py-2">{a.reason ?? "—"}</td>
                    <td className="py-2">
                      <Badge
                        variant={
                          a.status === "COMPLETED"
                            ? "success"
                            : a.status === "CANCELLED"
                            ? "danger"
                            : a.status === "CONFIRMED"
                            ? "info"
                            : "default"
                        }
                      >
                        {a.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Factures */}
      <Card>
        <CardHeader>
          <CardTitle>Dernières factures</CardTitle>
        </CardHeader>
        <CardContent>
          {patient.invoices.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune facture.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {patient.invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-2">{inv.number}</td>
                    <td className="py-2">{formatDate(inv.issuedAt)}</td>
                    <td className="py-2 font-medium">{formatDA(inv.totalCents)}</td>
                    <td className="py-2">
                      <Badge
                        variant={
                          inv.status === "PAID"
                            ? "success"
                            : inv.status === "OVERDUE"
                            ? "danger"
                            : inv.status === "ISSUED"
                            ? "warning"
                            : "default"
                        }
                      >
                        {inv.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
