import Link from "next/link";
import { notFound } from "next/navigation";
import { getProcedure, deleteProcedure } from "@/lib/actions/procedures";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDA } from "@/lib/money";
import { ArrowLeft, Trash2 } from "lucide-react";

interface ProcedureDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProcedureDetailPage({ params }: ProcedureDetailPageProps) {
  const { id } = await params;
  const procedure = await getProcedure(id);
  if (!procedure) notFound();

  async function handleDelete() {
    "use server";
    await deleteProcedure(id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/procedures">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{procedure.name}</h1>
            <p className="text-slate-500">{procedure.code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!procedure.isReference && (
            <form action={handleDelete}>
              <Button type="submit" variant="danger" size="sm">
                <Trash2 className="mr-1.5 h-4 w-4" />
                Supprimer
              </Button>
            </form>
          )}
          <Link href={`/procedures/${id}/edit`}>
            <Button variant="secondary" size="sm">Modifier</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Info label="Code" value={procedure.code} />
            <Info label="Nom" value={procedure.name} />
            <Info label="Prix" value={formatDA(procedure.priceCents)} />
            <Info label="Description" value={procedure.description} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statut</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge variant={procedure.isActive ? "success" : "warning"}>
              {procedure.isActive ? "Actif" : "Inactif"}
            </Badge>
            {procedure.isReference && (
              <p className="text-sm text-slate-500">
                Cet acte fait partie du catalogue de référence. Il ne peut pas être modifié ni supprimé.
              </p>
            )}
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-4 w-4 rounded-full"
                style={{ backgroundColor: procedure.color ?? "#cbd5e1" }}
              />
              <span className="text-sm text-slate-500">Couleur d'affichage</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-900">{value || "—"}</dd>
    </div>
  );
}
