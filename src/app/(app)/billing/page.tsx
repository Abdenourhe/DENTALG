import Link from "next/link";
import { listInvoices, listProcedures } from "./actions";
import InvoicePaymentForm from "./invoice-payment-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date";
import { formatDA } from "@/lib/money";
import {
  formatInvoiceStatus,
  invoiceStatusColors,
} from "@/lib/billing/invoice-helpers";

export default async function BillingPage() {
  const invoices = await listInvoices();
  const procedures = await listProcedures();

  const totalOutstanding = invoices
    .filter((i) => i.status === "ISSUED" || i.status === "OVERDUE")
    .reduce((sum, i) => sum + (i.totalCents - i.paidCents), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Facturation</h2>
        <Link href="/billing/new">
          <Button>Nouvelle facture</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-slate-500">Factures ce mois</p>
            <p className="text-2xl font-bold text-slate-900">
              {invoices.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-slate-500">Reste à payer</p>
            <p className="text-2xl font-bold text-red-600">
              {formatDA(totalOutstanding)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-slate-500">Actes tarifés</p>
            <p className="text-2xl font-bold text-slate-900">
              {procedures.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Factures récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="pb-2 font-medium">N°</th>
                  <th className="pb-2 font-medium">Patient</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Total</th>
                  <th className="pb-2 font-medium">Payé</th>
                  <th className="pb-2 font-medium">Reste</th>
                  <th className="pb-2 font-medium">Statut</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => {
                  const balance = Math.max(0, inv.totalCents - inv.paidCents);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="py-3 font-medium">
                        <Link
                          href={`/billing/${inv.id}`}
                          className="hover:underline"
                        >
                          {inv.number}
                        </Link>
                      </td>
                      <td className="py-3">
                        {inv.patient.lastName} {inv.patient.firstName}
                      </td>
                      <td className="py-3 text-slate-600">
                        {formatDate(inv.issuedAt)}
                      </td>
                      <td className="py-3 font-medium">
                        {formatDA(inv.totalCents)}
                      </td>
                      <td className="py-3">{formatDA(inv.paidCents)}</td>
                      <td className="py-3 font-medium text-red-600">
                        {formatDA(balance)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                            invoiceStatusColors[inv.status] ??
                            "bg-slate-100 text-slate-800 border-slate-200"
                          }`}
                        >
                          {formatInvoiceStatus(inv.status)}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <InvoicePaymentForm
                          invoiceId={inv.id}
                          patientId={inv.patientId}
                          balanceCents={balance}
                        />
                      </td>
                    </tr>
                  );
                })}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      Aucune facture.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
