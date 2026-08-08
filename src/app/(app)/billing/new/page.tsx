import { createInvoice } from "@/lib/actions/invoices";
import { listPatients } from "@/lib/actions/patients";
import { listProcedures } from "@/lib/actions/procedures";
import { InvoiceForm } from "@/components/forms/invoice-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewInvoicePage() {
  const [patients, procedures] = await Promise.all([
    listPatients(),
    listProcedures(),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nouvelle facture</h1>
        <p className="text-slate-500">Créez une facture pour un patient.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détails de la facture</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceForm action={createInvoice} patients={patients} procedures={procedures} />
        </CardContent>
      </Card>
    </div>
  );
}
