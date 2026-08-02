import Link from "next/link";
import { listPatients } from "./actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 text-slate-500">{p.number}</td>
                    <td className="py-3 font-medium text-slate-900">
                      {p.lastName} {p.firstName}
                    </td>
                    <td className="py-3 text-slate-600">
                      {p.nationalId ?? "—"}
                    </td>
                    <td className="py-3 text-slate-600">{p.phone ?? "—"}</td>
                    <td className="py-3 text-slate-600">
                      {formatDate(p.dateOfBirth)}
                    </td>
                    <td className="py-3 text-slate-600">
                      {p._count.appointments}
                    </td>
                    <td className="py-3 text-slate-600">{p._count.invoices}</td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/patients/${p.id}`}
                        className="text-sm font-medium text-slate-900 hover:underline"
                      >
                        Ouvrir
                      </Link>
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
