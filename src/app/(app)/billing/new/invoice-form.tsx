"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createInvoice } from "../actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TextArea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toCents, fromCents, formatDA } from "@/lib/money";
import { Trash2, Plus } from "lucide-react";

interface PatientOption {
  id: string;
  firstName: string;
  lastName: string;
  number: string;
}

interface ProcedureOption {
  id: string;
  code: string;
  name: string;
  priceCents: number;
}

interface InvoiceItem {
  key: string;
  procedureId: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  tooth?: number;
}

interface Props {
  patients: PatientOption[];
  procedures: ProcedureOption[];
  defaultPatientId?: string;
}

const paymentMethods = [
  { value: "CASH", label: "Espèces" },
  { value: "CARD", label: "Carte bancaire" },
  { value: "TRANSFER", label: "Virement" },
  { value: "CHEQUE", label: "Chèque" },
  { value: "OTHER", label: "Autre" },
];

function makeKey() {
  return Math.random().toString(36).slice(2);
}

function parseAmount(value: string): number {
  const num = parseFloat(value.replace(",", "."));
  return Number.isNaN(num) ? 0 : num;
}

export default function InvoiceForm({
  patients,
  procedures,
  defaultPatientId,
}: Props) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);
  const [patientId, setPatientId] = useState(defaultPatientId ?? "");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentDA, setPaymentDA] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      key: makeKey(),
      procedureId: "",
      quantity: 1,
      unitPriceCents: 0,
      totalCents: 0,
    },
  ]);

  const procedureMap = useMemo(
    () => new Map(procedures.map((p) => [p.id, p])),
    [procedures],
  );

  const totalCents = useMemo(
    () => items.reduce((sum, item) => sum + item.totalCents, 0),
    [items],
  );
  const paymentCents = useMemo(
    () => toCents(parseAmount(paymentDA)),
    [paymentDA],
  );
  const balance = Math.max(0, totalCents - paymentCents);

  function updateItem(index: number, patch: Partial<InvoiceItem>) {
    setItems((prev) => {
      const next = [...prev];
      const current = { ...next[index], ...patch };

      if (patch.procedureId !== undefined) {
        const proc = procedureMap.get(current.procedureId);
        if (proc) {
          current.unitPriceCents = proc.priceCents;
        }
      }

      current.totalCents = current.unitPriceCents * current.quantity;
      next[index] = current;
      return next;
    });
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      {
        key: makeKey(),
        procedureId: "",
        quantity: 1,
        unitPriceCents: 0,
        totalCents: 0,
      },
    ]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setErrors({});

    const validItems = items
      .filter((item) => item.procedureId && item.totalCents > 0)
      .map((item) => ({
        procedureId: item.procedureId,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        totalCents: item.totalCents,
        tooth: item.tooth,
      }));

    const res = await createInvoice({
      patientId,
      dueDate,
      notes,
      items: validItems,
      initialPaymentCents: paymentCents,
      initialPaymentMethod: paymentMethod,
    });

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

  const procedureOptions = procedures.map((p) => ({
    value: p.id,
    label: `${p.code} — ${p.name} (${formatDA(p.priceCents)})`,
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Nouvelle facture</h2>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Select
              name="patientId"
              label="Patient *"
              required
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="Choisir un patient..."
              options={patientOptions}
              error={errors.patientId?.[0]}
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Actes facturés
              </label>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={item.key}
                    className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-12"
                  >
                    <div className="sm:col-span-5">
                      <Select
                        value={item.procedureId}
                        onChange={(e) =>
                          updateItem(index, { procedureId: e.target.value })
                        }
                        placeholder="Choisir un acte..."
                        options={procedureOptions}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, {
                            quantity: Math.max(
                              1,
                              parseInt(e.target.value) || 1,
                            ),
                          })
                        }
                        placeholder="Qté"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={fromCents(item.unitPriceCents).toFixed(2)}
                        onChange={(e) => {
                          const cents = toCents(parseAmount(e.target.value));
                          updateItem(index, { unitPriceCents: cents });
                        }}
                        placeholder="Prix unitaire"
                      />
                    </div>
                    <div className="flex items-center justify-end sm:col-span-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {formatDA(item.totalCents)}
                      </span>
                    </div>
                    <div className="flex items-center justify-end sm:col-span-1">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        title="Supprimer la ligne"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {errors.items && (
                <p className="mt-2 text-sm text-red-600">{errors.items[0]}</p>
              )}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={addItem}
              >
                <Plus className="mr-1 h-4 w-4" />
                Ajouter un acte
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                name="dueDate"
                label="Date d'échéance"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                error={errors.dueDate?.[0]}
              />
              <div />
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
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
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
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
