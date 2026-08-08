import { createAppointment } from "@/lib/actions/appointments";
import { listPatients } from "@/lib/actions/patients";
import { getClinicUsers } from "@/lib/actions/users";
import { AppointmentForm } from "@/components/forms/appointment-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewAppointmentPage() {
  const [patients, dentists] = await Promise.all([
    listPatients(),
    getClinicUsers({ role: "DENTIST" }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nouveau rendez-vous</h1>
        <p className="text-slate-500">Planifiez une consultation.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détails du rendez-vous</CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentForm
            action={createAppointment}
            patients={patients}
            dentists={dentists}
            submitLabel="Créer le rendez-vous"
          />
        </CardContent>
      </Card>
    </div>
  );
}
