import Link from "next/link";
import { notFound } from "next/navigation";
import { getInvoice, issueInvoice, recordPayment, deleteInvoice } from "@/lib/actions/invoices";
import { PaymentForm } from "@/components/forms/payment-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDA } from "@/lib/money";
import { formatDate } from "@/lib/date";
import { ArrowLeft, FileText, Trash2 } from "lucide-react";

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

const statusLabels: Record<string, string> = {
  DRAFT: "Brouillon",
  ISSUED: "Émise",
  PAID: "Payée",
  OVERDUE: "En retard",
  CREDIT_NOTE: "Avoir",
};

const methodLabels: Record<string, string> = {
  CASH: "Espèces",
  CARD: "Carte bancaire",
  TRANSFER: "Virement",
  CHEQUE: "Chèque",
  OTHER: "Autre",
};

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) notFound();

  async function handleIssue() {
    "use server";
    await issueInvoice(id);
  }

  async function handleDelete() {
    "use server";
    await deleteInvoice(id);
  }

  async function handlePayment(data: {
    amount: number;
    method: "CASH" | "CARD" | "TRANSFER" | "CHEQUE" | "OTHER";
    reference: string;
  }) {
    "use server";
    return recordPayment(id, data);
  }

  const remaining = invoice.totalCents - invoice.paidCents;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/billing">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{invoice.number}</h1>
            <p className="text-slate-500">
              {invoice.patient.firstName} {invoice.patient.lastName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {invoice.status === "DRAFT" && (
            <form action={handleIssue}>
              <Button type="submit" size="sm">
                <FileText className="mr-1.5 h-4 w-4" />
                Émettre
              </Button>
            </form>
          )}
          <form action={handleDelete}>
            <Button type="submit" variant="danger" size="sm">
              <Trash2 className="mr-1.5 h-4 w-4" />
              Supprimer
            </Button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Actes facturés</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                    <th className="py-2">Acte</th>
                    <th className="py-2">Dent</th>
                    <th className="py-2">Qté</th>
                    <th className="py-2 text-right">Prix unit.</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="py-3">{item.procedure.name}</td>
                      <td className="py-3">{item.tooth ?? "—"}</td>
                      <td className="py-3">{item.quantity}</td>
                      <td className="py-3 text-right">{formatDA(item.unitPriceCents)}</td>
                      <td className="py-3 text-right font-medium">{formatDA(item.totalCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex justify-end text-lg font-semibold">
                Total : {formatDA(invoice.totalCents)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historique des paiements</CardTitle>
            </CardHeader>
            <CardContent>
              {invoice.payments.length === 0 ? (
                <p className="text-sm text-slate-500">Aucun paiement enregistré.</p>
              ) : (
                <div className="space-y-3">
                  {invoice.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
                    >
                      <div>
                        <p className="font-medium text-slate-900">
                          {formatDA(payment.amountCents)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {methodLabels[payment.method] ?? payment.method} · {formatDate(payment.paidAt)}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500">
                        par {payment.receivedBy.firstName} {payment.receivedBy.lastName}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Statut</span>
                <Badge
                  variant={
                    invoice.status === "PAID"
                      ? "success"
                      : invoice.status === "OVERDUE"
                        ? "danger"
                        : invoice.status === "ISSUED"
                          ? "warning"
                          : "default"
                  }
                >
                  {statusLabels[invoice.status] ?? invoice.status}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total</span>
                <span className="font-medium">{formatDA(invoice.totalCents)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Payé</span>
                <span className="font-medium">{formatDA(invoice.paidCents)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Reste</span>
                <span className="font-medium">{formatDA(remaining)}</span>
              </div>
            </CardContent>
          </Card>

          {remaining > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Enregistrer un paiement</CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentForm invoice={invoice} action={handlePayment} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
