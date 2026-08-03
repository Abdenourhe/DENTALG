import Link from "next/link";
import { listProcedures, deleteProcedureForm } from "./actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PageWrapper,
  StaggerContainer,
  FadeUp,
} from "@/components/ui/animations";
import { formatDAShort } from "@/lib/money";
import { Stethoscope, Plus, Pencil, Trash2, Tag } from "lucide-react";

export default async function ProceduresPage() {
  const procedures = await listProcedures();

  return (
    <PageWrapper className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Actes
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {procedures.length} acte{procedures.length > 1 ? "s" : ""} dans le
            catalogue du cabinet.
          </p>
        </div>
        <Link href="/procedures/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel acte
          </Button>
        </Link>
      </div>

      <StaggerContainer stagger={0.04}>
        <FadeUp>
          <Card>
            <CardContent className="pt-5">
              {procedures.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                    <Stethoscope className="h-7 w-7 text-slate-400" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-slate-500">
                    Aucun acte n&apos;a encore été créé.
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Créez votre premier acte pour commencer à facturer.
                  </p>
                  <Link href="/procedures/new">
                    <Button variant="secondary" className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Créer le premier acte
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {procedures.map((p, i) => (
                    <div
                      key={p.id}
                      className="group flex flex-col gap-3 py-4 transition-colors hover:bg-slate-50/50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1"
                          style={{
                            backgroundColor: `${p.color || "#64748b"}15`,
                            borderColor: `${p.color || "#64748b"}30`,
                          }}
                        >
                          <Tag
                            className="h-5 w-5"
                            style={{ color: p.color || "#64748b" }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900">
                            {p.code} — {p.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {p.description || "Aucune description"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <span className="text-lg font-bold text-slate-900">
                          {formatDAShort(p.priceCents)}
                        </span>
                        <div className="flex gap-1">
                          <Link href={`/procedures/${p.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <form action={deleteProcedureForm.bind(null, p.id)}>
                            <Button
                              variant="ghost"
                              size="sm"
                              type="submit"
                              className="h-9 w-9 p-0 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            >
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
        </FadeUp>
      </StaggerContainer>
    </PageWrapper>
  );
}
