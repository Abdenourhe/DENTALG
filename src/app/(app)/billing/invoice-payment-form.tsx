"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { recordPayment } from "./actions";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toCents } from "@/lib/money";

interface Props {
  invoiceId: string;
  patientId: string;
  balanceCents: number;
}

const paymentMethods = [
  { value: "CASH", label: "Espèces" },
  { value: "CARD", label: "Carte bancaire" },
  { value: "TRANSFER", label: "Virement" },
  { value: "CHEQUE", label: "Chèque" },
  { value: "OTHER", label: "Autre" },
];

export default function InvoicePaymentForm({
  invoiceId,
  patientId,
  balanceCents,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState((balanceCents / 100).toFixed(2));
  const [method, setMethod] = useState("CASH");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return balanceCents > 0 ? (
      <Button type="button" size="sm" onClick={() => setOpen(true)}>
        Payer
      </Button>
    ) : (
      <span className="text-xs text-slate-400">Soldé</span>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const amountCents = toCents(parseFloat(amount) || 0);
    if (amountCents <= 0 || amountCents > balanceCents) {
      setError("Montant invalide.");
      setPending(false);
      return;
    }

    const res = await recordPayment({
      patientId,
      invoiceId,
      amountCents,
      method,
      reference: "",
    });

    setPending(false);
    if (!res.ok) {
      setError(
        (res.errors as Record<string, string[]> | undefined)?.global?.[0] ??
          "Erreur lors du paiement.",
      );
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        name="amount"
        type="number"
        step="0.01"
        min="0.01"
        max={(balanceCents / 100).toFixed(2)}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-28"
      />
      <Select
        name="method"
        value={method}
        onChange={(e) => setMethod(e.target.value)}
        options={paymentMethods}
        className="w-40"
      />
      <Button type="submit" size="sm" isLoading={pending}>
        OK
      </Button>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={() => setOpen(false)}
      >
        Annuler
      </Button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </form>
  );
}
