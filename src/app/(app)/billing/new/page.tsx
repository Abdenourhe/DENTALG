import { listPatients } from "@/app/(app)/patients/actions";
import InvoiceForm from "./invoice-form";

interface Props {
  searchParams: Promise<{ patientId?: string }>;
}

export default async function NewInvoicePage({ searchParams }: Props) {
  const { patientId } = await searchParams;
  const patients = await listPatients();

  return (
    <InvoiceForm
      patients={patients.map((p) => ({
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        number: p.number,
      }))}
      defaultPatientId={patientId}
    />
  );
}
