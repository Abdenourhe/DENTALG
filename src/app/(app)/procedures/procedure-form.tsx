"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Procedure {
  id?: string;
  code: string;
  name: string;
  description: string | null;
  priceCents: number;
  color: string | null;
}

interface Props {
  procedure?: Procedure;
  action: (
    formData: FormData,
  ) => Promise<{ ok: boolean; errors?: Record<string, string[]> }>;
  backUrl: string;
  title: string;
}

export default function ProcedureForm({
  procedure,
  action,
  backUrl,
  title,
}: Props) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setErrors({});

    const res = await action(formData);

    if (!res.ok) {
      setErrors(res.errors || {});
      setPending(false);
      return;
    }

    router.push(backUrl);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href={backUrl}
          className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">
          Code unique, nom, description et tarif de l&apos;acte.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="code"
                label="Code *"
                defaultValue={procedure?.code || ""}
                required
                error={errors.code?.[0]}
              />
              <Input
                name="priceCents"
                label="Tarif (centimes) *"
                type="number"
                defaultValue={procedure?.priceCents.toString() || "0"}
                required
                error={errors.priceCents?.[0]}
              />
            </div>
            <Input
              name="name"
              label="Nom *"
              defaultValue={procedure?.name || ""}
              required
              error={errors.name?.[0]}
            />
            <Input
              name="color"
              label="Couleur (hex)"
              type="color"
              defaultValue={procedure?.color || "#64748b"}
              error={errors.color?.[0]}
            />
            <TextArea
              name="description"
              label="Description"
              rows={3}
              defaultValue={procedure?.description || ""}
            />

            {errors.global && (
              <p className="text-sm text-red-600">{errors.global[0]}</p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Link href={backUrl}>
                <Button type="button" variant="secondary">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" isLoading={pending}>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
