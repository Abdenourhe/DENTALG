import Link from "next/link";
import { listPatients } from "./actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  PageWrapper,
  StaggerContainer,
  FadeUp,
} from "@/components/ui/animations";
import {
  Users,
  UserPlus,
  Search,
  Eye,
  Pencil,
  Archive,
  ArchiveRestore,
  Phone,
  CalendarDays,
  Receipt,
  ChevronRight,
} from "lucide-react";
import { formatDate } from "@/lib/date";
import PatientRowActions from "./patient-row-actions";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; archived?: string }>;
}) {
  const { q, archived } = await searchParams;
  const showArchived = archived === "true";
  const patients = await listPatients(q, showArchived);

  return (
    <PageWrapper className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {showArchived ? "Patients archivés" : "Patients"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {patients.length} patient{patients.length > 1 ? "s" : ""} au total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={showArchived ? "/patients" : "/patients?archived=true"}>
            <Button variant="secondary">
              {showArchived ? (
                <>
                  <ArchiveRestore className="mr-2 h-4 w-4" />
                  Patients actifs
                </>
              ) : (
                <>
                  <Archive className="mr-2 h-4 w-4" />
                  Patients archivés
                </>
              )}
            </Button>
          </Link>
          <Link href="/patients/new">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Nouveau patient
            </Button>
          </Link>
        </div>
      </div>

      <StaggerContainer stagger={0.03}>
        <FadeUp>
          <Card>
            <CardContent className="pt-5">
              {/* Search bar */}
              <form className="mb-5 flex gap-2">
                <div className="relative max-w-sm flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    name="q"
                    defaultValue={q ?? ""}
                    placeholder="Rechercher par nom ou téléphone..."
                    className="pl-9"
                  />
                </div>
                <Button type="submit" variant="secondary">
                  Rechercher
                </Button>
              </form>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="pb-3 font-medium">Patient</th>
                      <th className="pb-3 font-medium">N° CI</th>
                      <th className="pb-3 font-medium">Contact</th>
                      <th className="pb-3 font-medium">Naissance</th>
                      <th className="pb-3 font-medium">RDV</th>
                      <th className="pb-3 font-medium">Factures</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patients.map((p) => (
                      <tr
                        key={p.id}
                        className="group transition-colors hover:bg-slate-50/80"
                      >
                        <td className="py-3.5">
                          <Link
                            href={`/patients/${p.id}`}
                            className="flex items-center gap-3"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-700 ring-1 ring-primary-100">
                              {p.firstName[0]}
                              {p.lastName[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {p.lastName} {p.firstName}
                              </p>
                              <p className="text-xs text-slate-500">
                                N° {p.number}
                              </p>
                            </div>
                          </Link>
                        </td>
                        <td className="py-3.5 text-slate-600">
                          {p.nationalId ?? "—"}
                        </td>
                        <td className="py-3.5">
                          {p.phone ? (
                            <span className="flex items-center gap-1 text-sm text-slate-600">
                              <Phone className="h-3.5 w-3.5 text-slate-400" />
                              {p.phone}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3.5 text-slate-600">
                          {formatDate(p.dateOfBirth)}
                        </td>
                        <td className="py-3.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                            <CalendarDays className="h-3 w-3" />
                            {p._count.appointments}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                            <Receipt className="h-3 w-3" />
                            {p._count.invoices}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <Link
                              href={`/patients/${p.id}`}
                              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                              title="Ouvrir"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/patients/${p.id}/edit`}
                              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                              title="Modifier"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <PatientRowActions
                              patientId={p.id}
                              isActive={p.isActive}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                    {patients.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-16 text-center">
                          <Users className="mx-auto h-12 w-12 text-slate-300" />
                          <p className="mt-3 text-sm font-medium text-slate-500">
                            Aucun patient trouvé.
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {q
                              ? "Essayez une autre recherche."
                              : "Commencez par créer un nouveau patient."}
                          </p>
                          <Link href="/patients/new">
                            <Button variant="secondary" className="mt-4">
                              <UserPlus className="mr-2 h-4 w-4" />
                              Nouveau patient
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </FadeUp>
      </StaggerContainer>
    </PageWrapper>
  );
}
