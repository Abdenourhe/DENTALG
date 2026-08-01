import { notFound } from "next/navigation";
import { getPatientForPrescription } from "@/app/(app)/prescriptions/actions";
import PrescriptionForm from "./prescription-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NewPrescriptionPage({ params }: Props) {
  const { id } = await params;
  const patient = await getPatientForPrescription(id);
  if (!patient) notFound();

  return (
    <PrescriptionForm
      patientId={patient.id}
      patientName={`${patient.firstName} ${patient.lastName}`}
      patientNumber={patient.number}
    />
  );
}
