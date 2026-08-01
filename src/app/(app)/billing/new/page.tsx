"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createInvoice } from "../actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function NewInvoicePage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setErrors({});

    const data = Object.fromEntries(formData.entries());
    const res = await createInvoice(data);

    if (!res.ok) {
      setErrors(res.errors as Record<string, string[]>);
      setPending(false);
      return;
    }

    router.push("/billing");
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Nouvelle facture</h2>
      <Card>
        <CardContent className="pt-6">
          <form action={handleSubmit} className="space-y-4">
            <Input name="patientId" label="ID Patient *" required error={errors.patientId?.[0]} />
            <Input
              name="totalCents"
              label="Total (centimes) *"
              type="number"
              required
              error={errors.totalCents?.[0]}
            />
            <Input name="dueDate" label="Date d'échéance" type="date" />
            <TextArea name="notes" label="Notes" rows={3} />

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
                Créer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
