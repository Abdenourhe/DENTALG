import Link from "next/link";
import { notFound } from "next/navigation";
import { getProcedure, updateProcedure } from "@/lib/actions/procedures";
import { ProcedureForm } from "@/components/forms/procedure-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface EditProcedurePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProcedurePage({ params }: EditProcedurePageProps) {
  const { id } = await params;
  const procedure = await getProcedure(id);
  if (!procedure) notFound();

  if (procedure.isReference) {
    notFound();
  }

  async function handleUpdate(formData: FormData) {
    "use server";
    return updateProcedure(id, formData);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/procedures/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Modifier l'acte</h1>
          <p className="text-slate-500">{procedure.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'acte</CardTitle>
        </CardHeader>
        <CardContent>
          <ProcedureForm
            action={handleUpdate}
            initialData={{ ...procedure, price: procedure.priceCents / 100 }}
            submitLabel="Enregistrer"
          />
        </CardContent>
      </Card>
    </div>
  );
}
