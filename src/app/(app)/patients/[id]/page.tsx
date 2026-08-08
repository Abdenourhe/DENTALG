import Link from "next/link";
import { notFound } from "next/navigation";
import { getPatient } from "@/lib/actions/patients";
import { PatientActions } from "@/components/patients/patient-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date";

interface PatientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientDetailPage({ params }: PatientDetailPageProps) {
  const { id } = await params;
  const patient = await getPatient(id);
  if (!patient) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {patient.firstName} {patient.lastName}
          </h1>
          <p className="text-slate-500">{patient.number}</p>
        </div>
        <div className="flex items-center gap-2">
          <PatientActions
            patientId={patient.id}
            isActive={patient.isActive}
            variant="detail"
          />
          <Link href={`/patients/${patient.id}/edit`}>
            <Button variant="secondary">Modifier</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Info label="Téléphone" value={patient.phone} />
            <Info label="Email" value={patient.email} />
            <Info label="Date de naissance" value={formatDate(patient.dateOfBirth)} />
            <Info label="Sexe" value={patient.sex} />
            <Info label="Groupe sanguin" value={patient.bloodGroup} />
            <Info label="État général" value={patient.generalCondition} />
            <Info label="Adresse" value={patient.address} />
            <Info label="Ville" value={`${patient.city || ""} ${patient.wilaya || ""}`} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statut</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={patient.isActive ? "success" : "warning"}>
                {patient.isActive ? "Actif" : "Archivé"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact d&apos;urgence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Info label="Nom" value={patient.emergencyContactName} />
              <Info label="Téléphone" value={patient.emergencyContactPhone} />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations médicales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoBlock label="Antécédents médicaux" value={patient.medicalHistory} />
          <InfoBlock label="Allergies" value={patient.allergies} />
          <InfoBlock label="Traitements en cours" value={patient.currentMedications} />
          <InfoBlock label="Notes" value={patient.notes} />
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-900">{value || "—"}</dd>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-900">{value || "—"}</dd>
    </div>
  );
}
