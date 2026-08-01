import { listPatients } from "@/app/(app)/patients/actions";
import { getDentists } from "../actions";
import AppointmentForm from "./appointment-form";

interface Props {
  searchParams: Promise<{ patientId?: string }>;
}

export default async function NewAppointmentPage({ searchParams }: Props) {
  const { patientId } = await searchParams;
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
    />
  );
}
