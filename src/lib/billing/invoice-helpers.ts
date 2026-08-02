export function formatInvoiceStatus(status: string): string {
  switch (status) {
    case "PAID":
      return "Payée";
    case "ISSUED":
      return "Émise";
    case "OVERDUE":
      return "En retard";
    case "DRAFT":
      return "Brouillon";
    case "CREDIT_NOTE":
      return "Avoir";
    default:
      return status;
  }
}

export const invoiceStatusColors: Record<string, string> = {
  PAID: "bg-green-100 text-green-800 border-green-200",
  ISSUED: "bg-amber-100 text-amber-800 border-amber-200",
  OVERDUE: "bg-red-100 text-red-800 border-red-200",
  DRAFT: "bg-slate-100 text-slate-800 border-slate-200",
  CREDIT_NOTE: "bg-purple-100 text-purple-800 border-purple-200",
};
