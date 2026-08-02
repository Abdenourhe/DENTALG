"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Save, FlaskConical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TextArea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Props {
  patientId: string;
  patientName: string;
  patientNumber: string;
  order?: {
    id: string;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    requestedTests: string[];
    notes: string | null;
  };
  action: (data: Record<string, unknown>) => Promise<{
    ok: boolean;
    errors?: Record<string, string[]>;
  }>;
  backUrl: string;
}

export default function LabOrderForm({
  patientId,
  patientName,
  patientNumber,
  order,
  action,
  backUrl,
}: Props) {
  const router = useRouter();
  const isEditing = !!order;
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);
  const [tests, setTests] = useState<string[]>(
    order?.requestedTests.length ? order.requestedTests : [""],
  );

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setErrors({});

    const data = Object.fromEntries(formData.entries());
    const filteredTests = tests.filter((t) => t.trim() !== "");

    const res = await action({
      ...data,
      patientId,
      requestedTests: filteredTests,
    });

    if (!res.ok) {
      setErrors(res.errors || {});
      setPending(false);
      return;
    }

    router.push(backUrl);
  }

  function addTest() {
    setTests([...tests, ""]);
  }

  function updateTest(index: number, value: string) {
    const next = [...tests];
    next[index] = value;
    setTests(next);
  }

  function removeTest(index: number) {
    if (tests.length <= 1) return;
    setTests(tests.filter((_, i) => i !== index));
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.push(backUrl)}
          className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          {isEditing ? "Modifier la demande" : "Nouvelle demande d'analyse"}
        </h2>
        <p className="text-sm text-slate-500">
          Prescription d&apos;analyses biologiques pour le patient.
        </p>
      </div>

      <div className="flex items-start gap-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <FlaskConical className="h-6 w-6" />
        </div>
        <div>
          <p className="font-semibold text-slate-900">{patientName}</p>
          <p className="text-sm text-slate-600">Dossier n° {patientNumber}</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={handleSubmit} className="space-y-5">
            {isEditing && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Select
                  name="status"
                  label="Statut"
                  defaultValue={order?.status}
                  options={[
                    { value: "PENDING", label: "En attente" },
                    { value: "IN_PROGRESS", label: "En cours" },
                    { value: "COMPLETED", label: "Terminée" },
                    { value: "CANCELLED", label: "Annulée" },
                  ]}
                  error={errors.status?.[0]}
                />
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Analyses demandées
              </label>
              {tests.map((test, index) => (
                <div key={index} className="flex items-start gap-2">
                  <input
                    type="hidden"
                    name={`requestedTests[${index}]`}
                    value={test}
                  />
                  <Input
                    value={test}
                    onChange={(e) => updateTest(index, e.target.value)}
                    placeholder="Ex : NFS, Glycémie, Bilan lipidique..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => removeTest(index)}
                    disabled={tests.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addTest}
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une analyse
              </Button>
              {errors.requestedTests && (
                <p className="text-xs text-red-600">
                  {errors.requestedTests[0]}
                </p>
              )}
            </div>

            <TextArea
              name="notes"
              label="Notes"
              rows={3}
              defaultValue={order?.notes || ""}
              placeholder="Précisions sur les analyses, laboratoire, urgence..."
            />

            {errors.global && (
              <p className="text-sm text-red-600">{errors.global[0]}</p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push(backUrl)}
              >
                Annuler
              </Button>
              <Button type="submit" isLoading={pending}>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? "Enregistrer" : "Créer la demande"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
