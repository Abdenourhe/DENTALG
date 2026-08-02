import Link from "next/link";
import { listPatients } from "./actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Pencil } from "lucide-react";
import { formatDate } from "@/lib/date";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const patients = await listPatients(q);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Patients</h2>
        <Link href="/patients/new">
          <Button>Nouveau patient</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-4">
          <form className="mb-4 flex gap-2">
            <Input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Rechercher par nom ou téléphone..."
              className="max-w-sm"
            />
            <Button type="submit" variant="secondary">
              Rechercher
            </Button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="pb-2 font-medium">N°</th>
                  <th className="pb-2 font-medium">Nom</th>
                  <th className="pb-2 font-medium">N° carte d&apos;identité</th>
                  <th className="pb-2 font-medium">Téléphone</th>
                  <th className="pb-2 font-medium">Naissance</th>
                  <th className="pb-2 font-medium">RDV</th>
                  <th className="pb-2 font-medium">Factures</th>
                  <th className="pb-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 text-slate-500">
                      <Link href={`/patients/${p.id}`} className="block">
                        {p.number}
                      </Link>
                    </td>
                    <td className="py-3 font-medium text-slate-900">
                      <Link href={`/patients/${p.id}`} className="block">
                        {p.lastName} {p.firstName}
                      </Link>
                    </td>
                    <td className="py-3 text-slate-600">
                      <Link href={`/patients/${p.id}`} className="block">
                        {p.nationalId ?? "—"}
                      </Link>
                    </td>
                    <td className="py-3 text-slate-600">
                      <Link href={`/patients/${p.id}`} className="block">
                        {p.phone ?? "—"}
                      </Link>
                    </td>
                    <td className="py-3 text-slate-600">
                      <Link href={`/patients/${p.id}`} className="block">
                        {formatDate(p.dateOfBirth)}
                      </Link>
                    </td>
                    <td className="py-3 text-slate-600">
                      <Link href={`/patients/${p.id}`} className="block">
                        {p._count.appointments}
                      </Link>
                    </td>
                    <td className="py-3 text-slate-600">
                      <Link href={`/patients/${p.id}`} className="block">
                        {p._count.invoices}
                      </Link>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/patients/${p.id}`}
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                          title="Ouvrir"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/patients/${p.id}/edit`}
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {patients.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      Aucun patient trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
