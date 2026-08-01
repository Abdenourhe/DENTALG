"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPrescription } from "@/app/(app)/prescriptions/actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface PrescriptionItem {
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
}

interface Props {
  patientId: string;
  patientName: string;
  patientNumber: string;
}

export default function NewPrescriptionPageClient({
  patientId,
  patientName,
  patientNumber,
}: Props) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<PrescriptionItem[]>([
    { name: "", dosage: "", duration: "", instructions: "" },
  ]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);

  function addItem() {
    setItems([
      ...items,
      { name: "", dosage: "", duration: "", instructions: "" },
    ]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(
    index: number,
    field: keyof PrescriptionItem,
    value: string,
  ) {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    setItems(next);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setErrors({});

    const res = await createPrescription({
      patientId,
      notes,
      items: items.filter((i) => i.name.trim() !== ""),
    });

    if (!res.ok) {
      setErrors(res.errors);
      setPending(false);
      return;
    }

    router.push(
      `/patients/${patientId}/prescriptions/${res.prescription.id}/print`,
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Nouvelle ordonnance
          </h2>
          <p className="text-sm text-slate-500">
            {patientName} — N° {patientNumber}
          </p>
        </div>
        <Link href={`/patients/${patientId}/prescriptions`}>
          <Button variant="secondary">Annuler</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Médicaments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="space-y-3 rounded-lg border border-slate-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">
                    Médicament #{index + 1}
                  </p>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Supprimer
                    </Button>
                  )}
                </div>
                <Input
                  label="Nom *"
                  value={item.name}
                  onChange={(e) => updateItem(index, "name", e.target.value)}
                  error={errors.items?.[index]}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Posologie"
                    value={item.dosage}
                    onChange={(e) =>
                      updateItem(index, "dosage", e.target.value)
                    }
                    placeholder="ex: 1 comprimé 3 fois/jour"
                  />
                  <Input
                    label="Durée"
                    value={item.duration}
                    onChange={(e) =>
                      updateItem(index, "duration", e.target.value)
                    }
                    placeholder="ex: 7 jours"
                  />
                </div>
                <Input
                  label="Instructions complémentaires"
                  value={item.instructions}
                  onChange={(e) =>
                    updateItem(index, "instructions", e.target.value)
                  }
                  placeholder="ex: Avant les repas"
                />
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={addItem}>
              + Ajouter un médicament
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <TextArea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Conseils ou remarques pour le patient..."
            />
          </CardContent>
        </Card>

        {errors.global && (
          <p className="text-sm text-red-600">{errors.global[0]}</p>
        )}

        <div className="flex justify-end gap-3">
          <Link href={`/patients/${patientId}/prescriptions`}>
            <Button type="button" variant="secondary">
              Annuler
            </Button>
          </Link>
          <Button type="submit" isLoading={pending}>
            Enregistrer et imprimer
          </Button>
        </div>
      </form>
    </div>
  );
}
