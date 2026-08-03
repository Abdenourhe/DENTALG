import Link from "next/link";
import { Printer, Receipt, TrendingUp, AlertCircle } from "lucide-react";
import { InvoiceRow } from "./invoice-row";
import { listInvoices, listProcedures } from "./actions";
import InvoicePaymentForm from "./invoice-payment-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PageWrapper,
  StaggerContainer,
  FadeUp,
} from "@/components/ui/animations";
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

  const overdueCount = invoices.filter((i) => i.status === "OVERDUE").length;

  return (
    <PageWrapper className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Facturation
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {invoices.length} facture{invoices.length > 1 ? "s" : ""}{" "}
            enregistrée
            {invoices.length > 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/billing/new">
          <Button>
            <Receipt className="mr-2 h-4 w-4" />
            Nouvelle facture
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FadeUp>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 ring-1 ring-blue-200">
                <Receipt className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {invoices.length}
                </p>
                <p className="text-xs text-slate-500">Factures ce mois</p>
              </div>
            </CardContent>
          </Card>
        </FadeUp>
        <FadeUp>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 ring-1 ring-red-200">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {formatDA(totalOutstanding)}
                </p>
                <p className="text-xs text-slate-500">Reste à payer</p>
              </div>
            </CardContent>
          </Card>
        </FadeUp>
        <FadeUp>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-200">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {procedures.length}
                </p>
                <p className="text-xs text-slate-500">Actes tarifés</p>
              </div>
            </CardContent>
          </Card>
        </FadeUp>
      </StaggerContainer>

      {/* Overdue alert */}
      {overdueCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>
            {overdueCount} facture{overdueCount > 1 ? "s" : ""} en retard de
            paiement.
          </span>
        </div>
      )}

      {/* Invoices table */}
      <StaggerContainer stagger={0.03}>
        <FadeUp>
          <Card>
            <CardContent className="pt-5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="pb-3 font-medium">N°</th>
                      <th className="pb-3 font-medium">Patient</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Total</th>
                      <th className="pb-3 font-medium">Payé</th>
                      <th className="pb-3 font-medium">Reste</th>
                      <th className="pb-3 font-medium">Statut</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.map((inv) => {
                      const balance = Math.max(
                        0,
                        inv.totalCents - inv.paidCents,
                      );
                      return (
                        <InvoiceRow key={inv.id} id={inv.id}>
                          <td className="py-3.5 font-medium text-slate-900">
                            {inv.number}
                          </td>
                          <td className="py-3.5">
                            <span className="font-medium text-slate-900">
                              {inv.patient.lastName} {inv.patient.firstName}
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-500">
                            {formatDate(inv.issuedAt)}
                          </td>
                          <td className="py-3.5 font-semibold text-slate-900">
                            {formatDA(inv.totalCents)}
                          </td>
                          <td className="py-3.5 text-slate-600">
                            {formatDA(inv.paidCents)}
                          </td>
                          <td className="py-3.5 font-semibold">
                            {balance > 0 ? (
                              <span className="text-red-600">
                                {formatDA(balance)}
                              </span>
                            ) : (
                              <span className="text-emerald-600">0 DA</span>
                            )}
                          </td>
                          <td className="py-3.5">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                                invoiceStatusColors[inv.status] ??
                                "bg-slate-100 text-slate-800 border-slate-200"
                              }`}
                            >
                              {formatInvoiceStatus(inv.status)}
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/billing/${inv.id}/print`}
                                title="Imprimer la facture"
                              >
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="h-9 w-9 p-0"
                                >
                                  <Printer className="h-4 w-4" />
                                </Button>
                              </Link>
                              <InvoicePaymentForm
                                invoiceId={inv.id}
                                patientId={inv.patientId}
                                balanceCents={balance}
                              />
                            </div>
                          </td>
                        </InvoiceRow>
                      );
                    })}
                    {invoices.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-16 text-center">
                          <Receipt className="mx-auto h-12 w-12 text-slate-300" />
                          <p className="mt-3 text-sm font-medium text-slate-500">
                            Aucune facture enregistrée.
                          </p>
                          <Link href="/billing/new">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="mt-4"
                            >
                              Créer une facture
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </FadeUp>
      </StaggerContainer>
    </PageWrapper>
  );
}
