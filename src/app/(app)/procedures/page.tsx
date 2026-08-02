import Link from "next/link";
import { listProcedures, deleteProcedureForm } from "./actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDAShort } from "@/lib/money";
import { Stethoscope, Plus, Pencil, Trash2 } from "lucide-react";

export default async function ProceduresPage() {
  const procedures = await listProcedures();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Actes</h2>
          <p className="text-sm text-slate-500">
            Catalogue des actes et soins du cabinet.
          </p>
        </div>
        <Link href="/procedures/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel acte
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          {procedures.length === 0 ? (
            <div className="py-10 text-center">
              <Stethoscope className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-4 text-sm text-slate-500">
                Aucun acte n’a encore été créé.
              </p>
              <Link
                href="/procedures/new"
                className="mt-2 inline-block text-sm font-medium text-slate-900 hover:underline"
              >
                Créer le premier acte
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {procedures.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: p.color || "#64748b" }}
                    />
                    <div>
                      <p className="font-medium text-slate-900">
                        {p.code} — {p.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {p.description || "Aucune description"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-slate-900">
                      {formatDAShort(p.priceCents)}
                    </span>
                    <div className="flex gap-2">
                      <Link href={`/procedures/${p.id}/edit`}>
                        <Button variant="secondary" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <form action={deleteProcedureForm.bind(null, p.id)}>
                        <Button variant="danger" size="sm" type="submit">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
