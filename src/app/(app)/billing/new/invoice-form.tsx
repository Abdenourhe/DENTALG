"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createInvoice } from "../actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TextArea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toCents, formatDA } from "@/lib/money";

interface PatientOption {
  id: string;
  firstName: string;
  lastName: string;
  number: string;
}

interface Props {
  patients: PatientOption[];
  defaultPatientId?: string;
}

const paymentMethods = [
  { value: "CASH", label: "Espèces" },
  { value: "CARD", label: "Carte bancaire" },
  { value: "TRANSFER", label: "Virement" },
  { value: "CHEQUE", label: "Chèque" },
  { value: "OTHER", label: "Autre" },
];

function parseAmount(value: string): number {
  const num = parseFloat(value.replace(",", "."));
  return Number.isNaN(num) ? 0 : num;
}

export default function InvoiceForm({ patients, defaultPatientId }: Props) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);
  const [totalDA, setTotalDA] = useState("");
  const [paymentDA, setPaymentDA] = useState("");

  const totalCents = useMemo(() => toCents(parseAmount(totalDA)), [totalDA]);
  const paymentCents = useMemo(
    () => toCents(parseAmount(paymentDA)),
    [paymentDA],
  );
  const balance = Math.max(0, totalCents - paymentCents);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setErrors({});

    const raw = Object.fromEntries(formData.entries());
    const payload = {
      ...raw,
      totalCents,
      initialPaymentCents: paymentCents,
    };
    const res = await createInvoice(payload);

    if (!res.ok) {
      setErrors(res.errors as Record<string, string[]>);
      setPending(false);
      return;
    }

    router.push("/billing");
  }

  const patientOptions = patients.map((p) => ({
    value: p.id,
    label: `${p.lastName} ${p.firstName} (N° ${p.number})`,
  }));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Nouvelle facture</h2>
      <Card>
        <CardContent className="pt-6">
          <form action={handleSubmit} className="space-y-5">
            <Select
              name="patientId"
              label="Patient *"
              required
              defaultValue={defaultPatientId || ""}
              placeholder="Choisir un patient..."
              options={patientOptions}
              error={errors.patientId?.[0]}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                name="totalDA"
                label="Montant total (DA) *"
                type="number"
                step="0.01"
                min="0"
                required
                value={totalDA}
                onChange={(e) => setTotalDA(e.target.value)}
                error={errors.totalCents?.[0]}
              />
              <Input
                name="dueDate"
                label="Date d'échéance"
                type="date"
                error={errors.dueDate?.[0]}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                name="initialPaymentDA"
                label="Paiement initial (DA)"
                type="number"
                step="0.01"
                min="0"
                value={paymentDA}
                onChange={(e) => setPaymentDA(e.target.value)}
                error={errors.initialPaymentCents?.[0]}
              />
              <Select
                name="initialPaymentMethod"
                label="Méthode de paiement"
                defaultValue="CASH"
                options={paymentMethods}
              />
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Total</span>
                <span className="font-semibold text-slate-900">
                  {formatDA(totalCents)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Payé maintenant</span>
                <span className="font-semibold text-slate-900">
                  {formatDA(paymentCents)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-600">Reste à payer</span>
                <span className="text-lg font-bold text-red-600">
                  {formatDA(balance)}
                </span>
              </div>
            </div>

            <TextArea
              name="notes"
              label="Notes"
              rows={3}
              error={errors.notes?.[0]}
            />

            {errors.global && (
              <p className="text-sm text-red-600">{errors.global[0]}</p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/billing")}
              >
                Annuler
              </Button>
              <Button type="submit" isLoading={pending}>
                Créer la facture
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
