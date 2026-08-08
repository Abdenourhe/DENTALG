import Link from "next/link";
import { notFound } from "next/navigation";
import { getPatient, updatePatient } from "@/lib/actions/patients";
import { PatientForm } from "@/components/forms/patient-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface EditPatientPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPatientPage({ params }: EditPatientPageProps) {
  const { id } = await params;
  const patient = await getPatient(id);
  if (!patient) notFound();

  async function handleUpdate(formData: FormData) {
    "use server";
    return updatePatient(id, formData);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/patients/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Modifier le patient</h1>
          <p className="text-slate-500">{patient.firstName} {patient.lastName}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du patient</CardTitle>
        </CardHeader>
        <CardContent>
          <PatientForm action={handleUpdate} initialData={patient} submitLabel="Enregistrer" />
        </CardContent>
      </Card>
    </div>
  );
}
