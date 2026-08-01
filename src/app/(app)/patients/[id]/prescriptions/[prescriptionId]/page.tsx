import Link from "next/link";
import { getPrescription } from "@/app/(app)/prescriptions/actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/date";

interface Props {
  params: Promise<{ id: string; prescriptionId: string }>;
}

export default async function PrescriptionDetailPage({ params }: Props) {
  const { id, prescriptionId } = await params;
  const prescription = await getPrescription(prescriptionId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Ordonnance {prescription.number}
          </h2>
          <p className="text-sm text-slate-500">
            {formatDateTime(prescription.issuedAt)} — Dr.{" "}
            {prescription.createdBy.firstName} {prescription.createdBy.lastName}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/patients/${id}/prescriptions`}>
            <Button variant="secondary">Retour</Button>
          </Link>
          <Link
            href={`/patients/${id}/prescriptions/${prescriptionId}/print`}
            target="_blank"
          >
            <Button>Imprimer</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            <span className="text-slate-500">Nom :</span>{" "}
            {prescription.patient.firstName} {prescription.patient.lastName}
          </p>
          <p>
            <span className="text-slate-500">N° :</span>{" "}
            {prescription.patient.number}
          </p>
          {prescription.patient.phone && (
            <p>
              <span className="text-slate-500">Téléphone :</span>{" "}
              {prescription.patient.phone}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Médicaments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-100">
            {prescription.items.map((item) => (
              <div key={item.id} className="py-4">
                <p className="font-medium text-slate-900">{item.name}</p>
                <div className="mt-1 text-sm text-slate-600">
                  {item.dosage && <p>Posologie : {item.dosage}</p>}
                  {item.duration && <p>Durée : {item.duration}</p>}
                  {item.instructions && (
                    <p>Instructions : {item.instructions}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {prescription.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-slate-700">
              {prescription.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
