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
        nationalId: patient.nationalId,
        sex: patient.sex,
        bloodGroup: patient.bloodGroup,
        generalCondition: patient.generalCondition,
        dateOfBirth: patient.dateOfBirth,
        phone: patient.phone,
        email: patient.email,
        address: patient.address,
        city: patient.city,
        wilaya: patient.wilaya,
        emergencyContactName: patient.emergencyContactName,
        emergencyContactPhone: patient.emergencyContactPhone,
        medicalHistory: patient.medicalHistory,
        allergies: patient.allergies,
        currentMedications: patient.currentMedications,
        notes: patient.notes,
      }}
    />
  );
}
