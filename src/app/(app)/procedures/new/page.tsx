import { createProcedure } from "@/lib/actions/procedures";
import { ProcedureForm } from "@/components/forms/procedure-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewProcedurePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nouvel acte</h1>
        <p className="text-slate-500">Ajoutez un acte au catalogue du cabinet.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'acte</CardTitle>
        </CardHeader>
        <CardContent>
          <ProcedureForm action={createProcedure} submitLabel="Créer l'acte" />
        </CardContent>
      </Card>
    </div>
  );
}
