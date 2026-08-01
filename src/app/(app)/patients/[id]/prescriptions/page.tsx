import Link from "next/link";
import { notFound } from "next/navigation";
import {
  listPrescriptions,
  getPatientForPrescription,
} from "@/app/(app)/prescriptions/actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/date";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PrescriptionsPage({ params }: Props) {
  const { id } = await params;
  const patient = await getPatientForPrescription(id);
  if (!patient) notFound();

  const prescriptions = await listPrescriptions(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Ordonnances — {patient.firstName} {patient.lastName}
          </h2>
          <p className="text-sm text-slate-500">N° {patient.number}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/patients/${id}`}>
            <Button variant="secondary">Retour au dossier</Button>
          </Link>
          <Link href={`/patients/${id}/prescriptions/new`}>
            <Button>Nouvelle ordonnance</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique</CardTitle>
        </CardHeader>
        <CardContent>
          {prescriptions.length === 0 ? (
            <p className="text-sm text-slate-500">
              Aucune ordonnance pour ce patient.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {prescriptions.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-4"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      Ordonnance {p.number}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatDateTime(p.issuedAt)} — Dr. {p.createdBy.firstName}{" "}
                      {p.createdBy.lastName}
                    </p>
                    <p className="text-sm text-slate-600">
                      {p.items.length} médicament{p.items.length > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/patients/${id}/prescriptions/${p.id}`}>
                      <Button variant="secondary" size="sm">
                        Ouvrir
                      </Button>
                    </Link>
                    <Link
                      href={`/patients/${id}/prescriptions/${p.id}/print`}
                      target="_blank"
                    >
                      <Button variant="secondary" size="sm">
                        Imprimer
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
