import Link from "next/link";
import { listInvoices, listProcedures } from "./actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date";
import { formatDA } from "@/lib/money";

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
            <p className="text-2xl font-bold text-slate-900">{invoices.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-slate-500">Reste à payer</p>
            <p className="text-2xl font-bold text-red-600">{formatDA(totalOutstanding)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-slate-500">Actes tarifés</p>
            <p className="text-2xl font-bold text-slate-900">{procedures.length}</p>
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
                  <th className="pb-2 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="py-3 font-medium">{inv.number}</td>
                    <td className="py-3">
                      {inv.patient.lastName} {inv.patient.firstName}
                    </td>
                    <td className="py-3 text-slate-600">
                      {formatDate(inv.issuedAt)}
                    </td>
                    <td className="py-3 font-medium">{formatDA(inv.totalCents)}</td>
                    <td className="py-3">{formatDA(inv.paidCents)}</td>
                    <td className="py-3">
                      <Badge
                        variant={
                          inv.status === "PAID"
                            ? "success"
                            : inv.status === "OVERDUE"
                            ? "danger"
                            : inv.status === "ISSUED"
                            ? "warning"
                            : "default"
                        }
                      >
                        {inv.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
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
