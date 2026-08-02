"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FlaskConical, Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import {
  updateLabOrder,
  createLabResult,
  updateLabResult,
  deleteLabResult,
  deleteLabOrder,
} from "@/app/(app)/lab/actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TextArea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/date";

interface LabOrder {
  id: string;
  number: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  orderedAt: Date;
  requestedTests: string[];
  notes: string | null;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    number: string;
  };
  createdBy: { firstName: string; lastName: string };
  results: LabResult[];
}

interface LabResult {
  id: string;
  testName: string;
  value: string | null;
  unit: string | null;
  referenceRange: string | null;
  status: "PENDING" | "NORMAL" | "ABNORMAL" | "CRITICAL";
  notes: string | null;
  createdAt: Date;
  reportedBy: { firstName: string; lastName: string } | null;
}

interface Props {
  order: LabOrder;
  backUrl: string;
}

export type { LabOrder, LabResult };

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "En attente",
    IN_PROGRESS: "En cours",
    COMPLETED: "Terminée",
    CANCELLED: "Annulée",
  };
  return labels[status] ?? status;
}

function statusVariant(
  status: string,
): "default" | "success" | "warning" | "danger" | "info" {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "IN_PROGRESS":
      return "info";
    case "PENDING":
      return "warning";
    case "CANCELLED":
      return "danger";
    default:
      return "default";
  }
}

function resultStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "En attente",
    NORMAL: "Normal",
    ABNORMAL: "Anormal",
    CRITICAL: "Critique",
  };
  return labels[status] ?? status;
}

function resultStatusVariant(
  status: string,
): "default" | "success" | "warning" | "danger" | "info" {
  switch (status) {
    case "NORMAL":
      return "success";
    case "ABNORMAL":
      return "warning";
    case "CRITICAL":
      return "danger";
    default:
      return "default";
  }
}

function firstError(res: {
  ok: false;
  errors?: Record<string, string[]>;
}): string {
  const errors = res.errors || {};
  return errors.global?.[0] || Object.values(errors).flat()[0] || "Erreur.";
}

export default function LabOrderDetail({ order, backUrl }: Props) {
  const router = useRouter();
  const [results, setResults] = useState<LabResult[]>(order.results);
  const [orderStatus, setOrderStatus] = useState(order.status);
  const [orderNotes, setOrderNotes] = useState(order.notes || "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleUpdateOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await updateLabOrder(order.id, {
      status: orderStatus,
      notes: orderNotes,
    });
    setPending(false);
    if (!res.ok) {
      setError(firstError(res));
    } else {
      router.refresh();
    }
  }

  async function handleCreateResult(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries()) as Record<
      string,
      string
    >;
    const res = await createLabResult({
      labOrderId: order.id,
      testName: data.testName,
      value: data.value,
      unit: data.unit,
      referenceRange: data.referenceRange,
      status: data.status as LabResult["status"],
      notes: data.notes,
    });
    setPending(false);
    if (!res.ok) {
      setError(firstError(res));
    } else if (res.result) {
      setResults([...results, res.result as unknown as LabResult]);
      form.reset();
      router.refresh();
    }
  }

  async function handleUpdateResult(
    resultId: string,
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as Record<
      string,
      string
    >;
    const res = await updateLabResult(resultId, {
      value: data.value,
      unit: data.unit,
      referenceRange: data.referenceRange,
      status: data.status as LabResult["status"],
      notes: data.notes,
    });
    setPending(false);
    if (!res.ok) {
      setError(firstError(res));
    } else {
      router.refresh();
    }
  }

  async function handleDeleteResult(resultId: string) {
    setPending(true);
    setError(null);
    const res = await deleteLabResult(resultId);
    setPending(false);
    if (!res.ok) {
      setError(res.errors?.global?.[0] || "Erreur lors de la suppression.");
    } else {
      setResults(results.filter((r) => r.id !== resultId));
      router.refresh();
    }
  }

  async function handleDeleteOrder() {
    if (!confirm("Supprimer cette demande d'analyse ?")) return;
    setPending(true);
    setError(null);
    const res = await deleteLabOrder(order.id);
    setPending(false);
    if (!res.ok) {
      setError(res.errors?.global?.[0] || "Erreur lors de la suppression.");
    } else {
      router.push(backUrl);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={backUrl}>
            <Button variant="secondary" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Demande {order.number}
            </h2>
            <p className="text-sm text-slate-500">
              {formatDateTime(order.orderedAt)} — Dr.{" "}
              {order.createdBy.firstName} {order.createdBy.lastName}
            </p>
          </div>
        </div>
        <Badge variant={statusVariant(orderStatus)}>
          {statusLabel(orderStatus)}
        </Badge>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateOrder} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Select
                name="status"
                label="Statut"
                value={orderStatus}
                onChange={(e) =>
                  setOrderStatus(e.target.value as LabOrder["status"])
                }
                options={[
                  { value: "PENDING", label: "En attente" },
                  { value: "IN_PROGRESS", label: "En cours" },
                  { value: "COMPLETED", label: "Terminée" },
                  { value: "CANCELLED", label: "Annulée" },
                ]}
              />
              <TextArea
                name="notes"
                label="Notes"
                rows={3}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" isLoading={pending}>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-slate-500" />
            Analyses demandées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {order.requestedTests.map((test) => (
              <span
                key={test}
                className="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-900"
              >
                {test}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Résultats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {results.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun résultat saisi.</p>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <form
                  key={result.id}
                  onSubmit={(e) => handleUpdateResult(result.id, e)}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-medium text-slate-900">
                      {result.testName}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant={resultStatusVariant(result.status)}>
                        {resultStatusLabel(result.status)}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteResult(result.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Input
                      name="value"
                      label="Valeur"
                      defaultValue={result.value || ""}
                    />
                    <Input
                      name="unit"
                      label="Unité"
                      defaultValue={result.unit || ""}
                    />
                    <Input
                      name="referenceRange"
                      label="Normale"
                      defaultValue={result.referenceRange || ""}
                    />
                    <Select
                      name="status"
                      label="Statut"
                      defaultValue={result.status}
                      options={[
                        { value: "PENDING", label: "En attente" },
                        { value: "NORMAL", label: "Normal" },
                        { value: "ABNORMAL", label: "Anormal" },
                        { value: "CRITICAL", label: "Critique" },
                      ]}
                    />
                  </div>
                  <TextArea
                    name="notes"
                    label="Notes"
                    rows={2}
                    defaultValue={result.notes || ""}
                  />
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Saisi le {formatDateTime(result.createdAt)}
                      {result.reportedBy
                        ? ` par ${result.reportedBy.firstName} ${result.reportedBy.lastName}`
                        : ""}
                    </span>
                    <Button type="submit" size="sm" isLoading={pending}>
                      <Save className="mr-2 h-4 w-4" />
                      Mettre à jour
                    </Button>
                  </div>
                </form>
              ))}
            </div>
          )}

          <form
            onSubmit={handleCreateResult}
            className="rounded-lg border border-dashed border-slate-300 p-4"
          >
            <p className="mb-3 text-sm font-medium text-slate-700">
              Ajouter un résultat
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Input
                name="testName"
                label="Analyse"
                placeholder="Nom de l'analyse"
              />
              <Input name="value" label="Valeur" placeholder="Résultat" />
              <Input name="unit" label="Unité" placeholder="Ex : mg/L" />
              <Select
                name="status"
                label="Statut"
                defaultValue="PENDING"
                options={[
                  { value: "PENDING", label: "En attente" },
                  { value: "NORMAL", label: "Normal" },
                  { value: "ABNORMAL", label: "Anormal" },
                  { value: "CRITICAL", label: "Critique" },
                ]}
              />
            </div>
            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                name="referenceRange"
                label="Normale"
                placeholder="Ex : 4.0 - 10.0"
              />
              <TextArea
                name="notes"
                label="Notes"
                rows={2}
                placeholder="Commentaire"
              />
            </div>
            <div className="mt-3 flex justify-end">
              <Button type="submit" size="sm" isLoading={pending}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={handleDeleteOrder}
          isLoading={pending}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Supprimer la demande
        </Button>
      </div>
    </div>
  );
}
