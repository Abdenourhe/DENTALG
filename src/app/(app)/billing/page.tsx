import Link from "next/link";
import { listInvoices } from "@/lib/actions/invoices";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, CreditCard } from "lucide-react";
import { formatDA } from "@/lib/money";

const statusLabels: Record<string, string> = {
  DRAFT: "Brouillon",
  ISSUED: "Émise",
  PAID: "Payée",
  OVERDUE: "En retard",
  CREDIT_NOTE: "Avoir",
};

export default async function BillingPage() {
  const invoices = await listInvoices();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Facturation</h1>
          <p className="text-slate-500">Gérez les factures et les paiements.</p>
        </div>
        <Link href="/billing/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle facture
          </Button>
        </Link>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <CreditCard className="h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              Aucune facture
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Créez votre première facture.
            </p>
            <Link href="/billing/new" className="mt-4">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle facture
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {invoices.map((invoice) => (
            <Link key={invoice.id} href={`/billing/${invoice.id}`}>
              <Card className="transition-all hover:border-primary-200 hover:shadow-sm">
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {invoice.number} · {invoice.patient.firstName} {invoice.patient.lastName}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {invoice._count.items} acte(s) · {invoice._count.payments} paiement(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-900">
                      {formatDA(invoice.totalCents)}
                    </span>
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
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
