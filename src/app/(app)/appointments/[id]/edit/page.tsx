import Link from "next/link";
import { notFound } from "next/navigation";
import { getAppointment, updateAppointment } from "@/lib/actions/appointments";
import { listPatients } from "@/lib/actions/patients";
import { getClinicUsers } from "@/lib/actions/users";
import { AppointmentForm } from "@/components/forms/appointment-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface EditAppointmentPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAppointmentPage({ params }: EditAppointmentPageProps) {
  const { id } = await params;
  const appointment = await getAppointment(id);
  if (!appointment) notFound();

  const [patients, dentists] = await Promise.all([
    listPatients(),
    getClinicUsers({ role: "DENTIST" }),
  ]);

  async function handleUpdate(formData: FormData) {
    "use server";
    return updateAppointment(id, formData);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/appointments/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Modifier le rendez-vous</h1>
          <p className="text-slate-500">Rendez-vous du {appointment.startAt.toLocaleDateString("fr-DZ")}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détails du rendez-vous</CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentForm
            action={handleUpdate}
            patients={patients}
            dentists={dentists}
            initialData={appointment}
            submitLabel="Enregistrer"
          />
        </CardContent>
      </Card>
    </div>
  );
}
