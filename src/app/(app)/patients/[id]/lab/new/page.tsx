import { notFound } from "next/navigation";
import { getPatient } from "../../../actions";
import { createLabOrder } from "@/app/(app)/lab/actions";
import LabOrderForm from "../lab-order-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NewLabOrderPage({ params }: Props) {
  const { id } = await params;
  const patient = await getPatient(id);
  if (!patient) notFound();

  async function createAction(data: Record<string, unknown>) {
    "use server";
    return createLabOrder(data);
  }

  return (
    <LabOrderForm
      patientId={patient.id}
      patientName={`${patient.firstName} ${patient.lastName}`}
      patientNumber={patient.number}
      action={createAction}
      backUrl={`/patients/${id}/lab`}
    />
  );
}
