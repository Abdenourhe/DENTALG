import Link from "next/link";
import { getInvoice } from "../../actions";
import { formatDate } from "@/lib/date";
import { formatDA } from "@/lib/money";
import {
  formatInvoiceStatus,
  invoiceStatusColors,
} from "@/lib/billing/invoice-helpers";
import { Button } from "@/components/ui/button";
import PrintButton from "./print-button";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InvoicePrintPage({ params }: Props) {
  const { id } = await params;
  const invoice = await getInvoice(id);
  const balance = Math.max(0, invoice.totalCents - invoice.paidCents);

  return (
    <div className="min-h-screen bg-white">
      <div className="no-print mx-auto max-w-3xl p-4 print:hidden">
        <div className="mb-4 flex items-center justify-between">
          <Link href={`/billing/${invoice.id}`}>
            <Button type="button" variant="secondary">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Retour
            </Button>
          </Link>
          <PrintButton />
        </div>
      </div>

      <div className="mx-auto max-w-3xl p-8 print:p-0">
        <div className="mb-8 flex items-start justify-between border-b border-slate-200 pb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">DENTALG</h1>
            <p className="text-sm text-slate-500">
              Gestion de cabinet dentaire
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">
              {invoice.number}
            </p>
            <p className="text-sm text-slate-600">
              Émise le {formatDate(invoice.issuedAt)}
            </p>
            <span
              className={`mt-2 inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${
                invoiceStatusColors[invoice.status] ??
                "bg-slate-100 text-slate-800 border-slate-200"
              }`}
            >
              {formatInvoiceStatus(invoice.status)}
            </span>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Patient
            </h2>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {invoice.patient.lastName} {invoice.patient.firstName}
            </p>
            {invoice.patient.phone && (
              <p className="text-sm text-slate-600">
                Tél. {invoice.patient.phone}
              </p>
            )}
          </div>
          <div className="sm:text-right">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Cabinet
            </h2>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {invoice.clinic?.name ?? "Cabinet"}
            </p>
            {invoice.dueDate && (
              <p className="text-sm text-slate-600">
                Échéance : {formatDate(invoice.dueDate)}
              </p>
            )}
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className="pb-2 font-semibold text-slate-900">Acte</th>
              <th className="pb-2 font-semibold text-slate-900">Dent</th>
              <th className="pb-2 text-right font-semibold text-slate-900">
                Qté
              </th>
              <th className="pb-2 text-right font-semibold text-slate-900">
                Prix unitaire
              </th>
              <th className="pb-2 text-right font-semibold text-slate-900">
                Total
              </th>
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
                <td className="py-3 text-right text-slate-600">
                  {item.quantity}
                </td>
                <td className="py-3 text-right text-slate-600">
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
            <tr>
              <td
                colSpan={4}
                className="py-2 text-right text-sm text-slate-600"
              >
                Payé
              </td>
              <td className="py-2 text-right text-sm font-semibold text-slate-900">
                {formatDA(invoice.paidCents)}
              </td>
            </tr>
            <tr>
              <td colSpan={4} className="py-2 text-right text-sm font-medium">
                Reste à payer
              </td>
              <td
                className={`py-2 text-right font-bold ${
                  balance > 0 ? "text-red-600" : "text-slate-900"
                }`}
              >
                {formatDA(balance)}
              </td>
            </tr>
          </tfoot>
        </table>

        {invoice.notes && (
          <div className="mt-8 rounded-lg border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-900">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
              {invoice.notes}
            </p>
          </div>
        )}

        <div className="mt-12 text-center text-xs text-slate-500">
          <p>Document généré par DENTALG — {formatDate(new Date())}</p>
        </div>
      </div>
    </div>
  );
}
