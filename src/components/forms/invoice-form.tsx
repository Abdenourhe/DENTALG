"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Invoice, Patient, Procedure } from "@prisma/client";

interface InvoiceItem {
  procedureId: string;
  quantity: number;
  unitPrice: number;
  tooth: string;
}

interface InvoiceFormProps {
  action: (data: {
    patientId: string;
    dueDate: string;
    notes: string;
    items: InvoiceItem[];
  }) => Promise<
    | { ok: true; invoice: Invoice }
    | { ok: false; errors: Record<string, string[]> & { global?: string[] } }
  >;
  patients: Pick<Patient, "id" | "firstName" | "lastName">[];
  procedures: Pick<Procedure, "id" | "code" | "name" | "priceCents">[];
}

export function InvoiceForm({ action, patients, procedures }: InvoiceFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[]> & { global?: string[] }>({});
  const [pending, setPending] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([
    { procedureId: "", quantity: 1, unitPrice: 0, tooth: "" },
  ]);

  function addItem() {
    setItems([...items, { procedureId: "", quantity: 1, unitPrice: 0, tooth: "" }]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof InvoiceItem, value: string | number) {
    const next = [...items];
    const item = next[index];
    if (!item) return;

    item[field] = value as never;

    if (field === "procedureId") {
      const procedure = procedures.find((p) => p.id === value);
      if (procedure) {
        item.unitPrice = procedure.priceCents / 100;
      }
    }

    setItems(next);
  }

  function calculateTotal(): number {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setErrors({});

    const result = await action({
      patientId: formData.get("patientId") as string,
      dueDate: formData.get("dueDate") as string,
      notes: formData.get("notes") as string,
      items: items.map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        tooth: item.tooth,
      })),
    });

    if (result.ok) {
      router.push("/billing");
      router.refresh();
    } else {
      setErrors(result.errors);
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {errors.global && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {errors.global.join(", ")}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="patientId">Patient *</Label>
          <Select id="patientId" name="patientId" required>
            <option value="">Sélectionner un patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName}
              </option>
            ))}
          </Select>
          {errors.patientId && <p className="text-xs text-red-600">{errors.patientId[0]}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dueDate">Date d'échéance</Label>
          <Input id="dueDate" name="dueDate" type="date" />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Actes facturés</h3>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            Ajouter un acte
          </Button>
        </div>

        {items.map((item, index) => (
          <div key={index} className="grid gap-3 rounded-lg border border-slate-200 p-4 sm:grid-cols-12">
            <div className="sm:col-span-5">
              <Label htmlFor={`procedure-${index}`}>Acte *</Label>
              <Select
                id={`procedure-${index}`}
                value={item.procedureId}
                onChange={(e) => updateItem(index, "procedureId", e.target.value)}
              >
                <option value="">Sélectionner un acte</option>
                {procedures.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} · {p.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor={`quantity-${index}`}>Qté *</Label>
              <Input
                id={`quantity-${index}`}
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => updateItem(index, "quantity", e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor={`price-${index}`}>Prix unit. *</Label>
              <Input
                id={`price-${index}`}
                type="number"
                step="0.01"
                min="0"
                value={item.unitPrice}
                onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor={`tooth-${index}`}>Dent</Label>
              <Input
                id={`tooth-${index}`}
                type="number"
                min="1"
                max="88"
                value={item.tooth}
                onChange={(e) => updateItem(index, "tooth", e.target.value)}
                placeholder="11"
              />
            </div>

            <div className="flex items-end sm:col-span-1">
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
              >
                ×
              </Button>
            </div>
          </div>
        ))}

        <div className="flex justify-end text-lg font-semibold text-slate-900">
          Total : {calculateTotal().toFixed(2)} DA
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.push("/billing")}>
          Annuler
        </Button>
        <Button type="submit" isLoading={pending}>
          Créer la facture
        </Button>
      </div>
    </form>
  );
}
