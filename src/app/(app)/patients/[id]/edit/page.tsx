import { getPatient } from "../../actions";
import PatientEditForm from "./patient-edit-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPatientPage({ params }: Props) {
  const { id } = await params;
  const patient = await getPatient(id);

  return (
    <PatientEditForm
      patient={{
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        phone: patient.phone,
        email: patient.email,
        address: patient.address,
        city: patient.city,
        wilaya: patient.wilaya,
        notes: patient.notes,
      }}
    />
  );
}
