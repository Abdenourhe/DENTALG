import Link from "next/link";
import { listProcedures } from "@/lib/actions/procedures";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Stethoscope } from "lucide-react";
import { formatDA } from "@/lib/money";

export default async function ProceduresPage() {
  const procedures = await listProcedures({ includeInactive: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Actes</h1>
          <p className="text-slate-500">Gérez le catalogue d'actes du cabinet.</p>
        </div>
        <Link href="/procedures/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel acte
          </Button>
        </Link>
      </div>

      {procedures.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Stethoscope className="h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              Aucun acte
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Créez votre premier acte pour commencer.
            </p>
            <Link href="/procedures/new" className="mt-4">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouvel acte
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {procedures.map((procedure) => (
            <Link key={procedure.id} href={`/procedures/${procedure.id}`}>
              <Card className="transition-all hover:border-primary-200 hover:shadow-sm">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: procedure.color ?? "#cbd5e1" }}
                    />
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {procedure.code} · {procedure.name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {procedure.description || "Pas de description"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-900">
                      {formatDA(procedure.priceCents)}
                    </span>
                    <Badge variant={procedure.isActive ? "success" : "warning"}>
                      {procedure.isActive ? "Actif" : "Inactif"}
                    </Badge>
                    {procedure.isReference && (
                      <Badge variant="default">Référence</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
