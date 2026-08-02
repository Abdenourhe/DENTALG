import Link from "next/link";
import { notFound } from "next/navigation";
import { getInvoice } from "../actions";
import InvoicePaymentForm from "../invoice-payment-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date";
import { formatDA } from "@/lib/money";
import {
  formatInvoiceStatus,
  invoiceStatusColors,
} from "@/lib/billing/invoice-helpers";
import { ArrowLeft, User, Calendar } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: Props) {
  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) notFound();

  const balance = Math.max(0, invoice.totalCents - invoice.paidCents);
  const patient = invoice.patient;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/billing">
          <Button type="button" variant="secondary">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Retour
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">
            Facture {invoice.number}
          </h1>
          <p className="flex items-center gap-2 text-sm text-slate-600">
            <User className="h-4 w-4" />
            {patient.lastName} {patient.firstName}
          </p>
          <p className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="h-4 w-4" />
            Émise le {formatDate(invoice.issuedAt)}
            {invoice.dueDate && (
              <span className="ml-2">
                — Échéance {formatDate(invoice.dueDate)}
              </span>
            )}
          </p>
          {invoice.notes && (
            <p className="mt-2 text-sm text-slate-600">{invoice.notes}</p>
          )}
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${
            invoiceStatusColors[invoice.status] ??
            "bg-slate-100 text-slate-800 border-slate-200"
          }`}
        >
          {formatInvoiceStatus(invoice.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-slate-500">Total</p>
            <p className="text-2xl font-bold text-slate-900">
              {formatDA(invoice.totalCents)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-slate-500">Payé</p>
            <p className="text-2xl font-bold text-green-600">
              {formatDA(invoice.paidCents)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-slate-500">Reste à payer</p>
            <p
              className={`text-2xl font-bold ${
                balance > 0 ? "text-red-600" : "text-slate-900"
              }`}
            >
              {formatDA(balance)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lignes de facture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="pb-2 font-medium">Acte</th>
                  <th className="pb-2 font-medium">Dent</th>
                  <th className="pb-2 font-medium">Qté</th>
                  <th className="pb-2 font-medium">Prix unitaire</th>
                  <th className="pb-2 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3">
                      <span className="font-medium text-slate-900">
                        {item.procedure.name}
                      </span>
                      <span className="ml-2 text-xs text-slate-500">
                        ({item.procedure.code})
                      </span>
                    </td>
                    <td className="py-3 text-slate-600">{item.tooth ?? "—"}</td>
                    <td className="py-3 text-slate-600">{item.quantity}</td>
                    <td className="py-3 text-slate-600">
                      {formatDA(item.unitPriceCents)}
                    </td>
                    <td className="py-3 text-right font-semibold text-slate-900">
                      {formatDA(item.totalCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200">
                  <td colSpan={4} className="py-3 text-right font-medium">
                    Total
                  </td>
                  <td className="py-3 text-right text-lg font-bold text-slate-900">
                    {formatDA(invoice.totalCents)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Historique des paiements</CardTitle>
          {balance > 0 && (
            <InvoicePaymentForm
              invoiceId={invoice.id}
              patientId={invoice.patientId}
              balanceCents={balance}
            />
          )}
        </CardHeader>
        <CardContent>
          {invoice.payments.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500">
              Aucun paiement enregistré.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-600">
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Méthode</th>
                    <th className="pb-2 font-medium text-right">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.payments.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3">{formatDate(p.paidAt)}</td>
                      <td className="py-3 text-slate-600">
                        {paymentMethodLabel(p.method)}
                      </td>
                      <td className="py-3 text-right font-semibold text-slate-900">
                        {formatDA(p.amountCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function paymentMethodLabel(method: string): string {
  switch (method) {
    case "CASH":
      return "Espèces";
    case "CARD":
      return "Carte bancaire";
    case "TRANSFER":
      return "Virement";
    case "CHEQUE":
      return "Chèque";
    case "OTHER":
      return "Autre";
    default:
      return method;
  }
}
