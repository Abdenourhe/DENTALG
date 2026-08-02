import { notFound } from "next/navigation";
import { getAppointment, getDentists, updateAppointment } from "../../actions";
import { listPatients } from "@/app/(app)/patients/actions";
import AppointmentForm from "../../appointment-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditAppointmentPage({ params }: Props) {
  const { id } = await params;
  const [appointment, patients, dentists] = await Promise.all([
    getAppointment(id),
    listPatients(),
    getDentists(),
  ]);

  if (!appointment) notFound();

  async function updateAction(data: Record<string, unknown>) {
    "use server";
    return updateAppointment(id, data);
  }

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
      appointment={{
        id: appointment.id,
        patientId: appointment.patientId,
        dentistId: appointment.dentistId,
        startAt: appointment.startAt,
        endAt: appointment.endAt,
        reason: appointment.reason,
        notes: appointment.notes,
        status: appointment.status,
      }}
      action={updateAction}
      title="Modifier le rendez-vous"
      subtitle="Mettez à jour les informations du rendez-vous."
      backUrl="/appointments"
    />
  );
}
