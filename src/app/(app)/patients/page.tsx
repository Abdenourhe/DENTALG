import Link from "next/link";
import { listPatients } from "@/lib/actions/patients";
import { PatientActions } from "@/components/patients/patient-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users } from "lucide-react";

export default async function PatientsPage() {
  const patients = await listPatients({ includeInactive: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
          <p className="text-slate-500">Gérez les dossiers de vos patients.</p>
        </div>
        <Link href="/patients/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau patient
          </Button>
        </Link>
      </div>

      {patients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              Aucun patient
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Commencez par créer votre premier patient.
            </p>
            <Link href="/patients/new" className="mt-4">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau patient
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {patients.map((patient) => (
            <Card
              key={patient.id}
              className="transition-all hover:border-primary-200 hover:shadow-sm"
            >
              <CardContent className="flex items-center justify-between py-4">
                <Link href={`/patients/${patient.id}`} className="flex-1">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {patient.firstName} {patient.lastName}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {patient.number} · {patient.phone || "Pas de téléphone"}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-3">
                  <Badge variant={patient.isActive ? "success" : "warning"}>
                    {patient.isActive ? "Actif" : "Archivé"}
                  </Badge>
                  <PatientActions
                    patientId={patient.id}
                    isActive={patient.isActive}
                    variant="row"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
