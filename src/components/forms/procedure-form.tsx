"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Procedure } from "@prisma/client";

interface ProcedureFormProps {
  action: (formData: FormData) => Promise<
    | { ok: true; procedure: Procedure }
    | { ok: false; errors: Record<string, string[]> & { global?: string[] } }
  >;
  initialData?: Partial<Procedure> & { price?: number };
  submitLabel?: string;
}

export function ProcedureForm({
  action,
  initialData,
  submitLabel = "Enregistrer",
}: ProcedureFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[]> & { global?: string[] }>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setErrors({});

    const result = await action(formData);

    if (result.ok) {
      router.push("/procedures");
      router.refresh();
    } else {
      setErrors(result.errors);
      setPending(false);
    }
  }

  const price = initialData?.priceCents
    ? (initialData.priceCents / 100).toFixed(2)
    : initialData?.price?.toFixed(2) ?? "";

  return (
    <form action={handleSubmit} className="space-y-6">
      {errors.global && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {errors.global.join(", ")}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="code">Code *</Label>
          <Input
            id="code"
            name="code"
            defaultValue={initialData?.code ?? ""}
            placeholder="CONS-001"
            required
          />
          {errors.code && <p className="text-xs text-red-600">{errors.code[0]}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="price">Prix (DA) *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={price}
            required
          />
          {errors.price && <p className="text-xs text-red-600">{errors.price[0]}</p>}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="name">Nom *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={initialData?.name ?? ""}
            placeholder="Consultation dentaire"
            required
          />
          {errors.name && <p className="text-xs text-red-600">{errors.name[0]}</p>}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={initialData?.description ?? ""}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="color">Couleur</Label>
          <div className="flex items-center gap-3">
            <Input
              id="color"
              name="color"
              type="color"
              defaultValue={initialData?.color ?? "#3b82f6"}
              className="h-10 w-16 p-1"
            />
            <span className="text-sm text-slate-500">Utilisée dans le planning</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.push("/procedures")}>
          Annuler
        </Button>
        <Button type="submit" isLoading={pending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
