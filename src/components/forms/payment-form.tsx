"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { Invoice } from "@prisma/client";

type PaymentMethod = "CASH" | "CARD" | "TRANSFER" | "CHEQUE" | "OTHER";

interface PaymentFormProps {
  invoice: Pick<Invoice, "id" | "totalCents" | "paidCents">;
  action: (data: {
    amount: number;
    method: PaymentMethod;
    reference: string;
  }) => Promise<
    | { ok: true; invoice: Invoice }
    | { ok: false; errors: Record<string, string[]> & { global?: string[] } }
  >;
}

const methods: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Espèces" },
  { value: "CARD", label: "Carte bancaire" },
  { value: "TRANSFER", label: "Virement" },
  { value: "CHEQUE", label: "Chèque" },
  { value: "OTHER", label: "Autre" },
];

export function PaymentForm({ invoice, action }: PaymentFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[]> & { global?: string[] }>({});
  const [pending, setPending] = useState(false);

  const remaining = (invoice.totalCents - invoice.paidCents) / 100;

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setErrors({});

    const result = await action({
      amount: Number(formData.get("amount")),
      method: formData.get("method") as PaymentMethod,
      reference: formData.get("reference") as string,
    });

    if (result.ok) {
      router.refresh();
    } else {
      setErrors(result.errors);
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {errors.global && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {errors.global.join(", ")}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="amount">Montant (DA) *</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            max={remaining}
            defaultValue={remaining.toFixed(2)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="method">Moyen de paiement *</Label>
          <Select id="method" name="method" defaultValue="CASH" required>
            {methods.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="reference">Référence</Label>
          <Input id="reference" name="reference" placeholder="N° chèque, transaction, etc." />
        </div>
      </div>

      <Button type="submit" isLoading={pending} className="w-full">
        Enregistrer le paiement
      </Button>
    </form>
  );
}
