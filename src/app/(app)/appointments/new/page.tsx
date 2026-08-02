import { listPatients } from "@/app/(app)/patients/actions";
import { getDentists, createAppointment } from "../actions";
import AppointmentForm from "../appointment-form";

interface Props {
  searchParams: Promise<{ patientId?: string; date?: string }>;
}

export default async function NewAppointmentPage({ searchParams }: Props) {
  const { patientId, date } = await searchParams;
  const [patients, dentists] = await Promise.all([
    listPatients(),
    getDentists(),
  ]);

  return (
    <AppointmentForm
      patients={patients.map((p) => ({
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        number: p.number,
        phone: p.phone,
      }))}
      dentists={dentists}
      defaultPatientId={patientId}
      defaultDate={date}
      action={createAppointment}
      title="Nouveau rendez-vous"
      subtitle="Planifiez un rendez-vous pour un patient avec un dentiste."
      backUrl="/appointments"
    />
  );
}
