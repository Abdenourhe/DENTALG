import { listPatients } from "@/app/(app)/patients/actions";
import { listProceduresForInvoice } from "../actions";
import InvoiceForm from "./invoice-form";

interface Props {
  searchParams: Promise<{ patientId?: string }>;
}

export default async function NewInvoicePage({ searchParams }: Props) {
  const { patientId } = await searchParams;
  const [patients, procedures] = await Promise.all([
    listPatients(),
    listProceduresForInvoice(),
  ]);

  return (
    <InvoiceForm
      patients={patients.map((p) => ({
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        number: p.number,
      }))}
      procedures={procedures.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        priceCents: p.priceCents,
      }))}
      defaultPatientId={patientId}
    />
  );
}
