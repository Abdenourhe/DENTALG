import { createPatient } from "@/lib/actions/patients";
import { PatientForm } from "@/components/forms/patient-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewPatientPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nouveau patient</h1>
        <p className="text-slate-500">Créez un nouveau dossier patient.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du patient</CardTitle>
        </CardHeader>
        <CardContent>
          <PatientForm action={createPatient} submitLabel="Créer le patient" />
        </CardContent>
      </Card>
    </div>
  );
}
