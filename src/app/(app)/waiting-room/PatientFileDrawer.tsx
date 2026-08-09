"use client";

import { useEffect, useState, useTransition } from "react";
import { getPatientFile } from "./actions";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Calendar,
  FileText,
  Mail,
  MapPin,
  Phone,
  Pill,
  Receipt,
  X,
} from "lucide-react";

interface PatientFileDrawerProps {
  patientId: string | null;
  onClose: () => void;
}

export default function PatientFileDrawer({
  patientId,
  onClose,
}: PatientFileDrawerProps) {
  const [file, setFile] =
    useState<Awaited<ReturnType<typeof getPatientFile>>>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!patientId) {
      setFile(null);
      return;
    }
    startTransition(async () => {
      const data = await getPatientFile(patientId);
      setFile(data);
    });
  }, [patientId]);

  if (!patientId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 h-full w-full max-w-lg overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900">Dossier patient</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-5 p-5">
          {isPending && <p className="text-sm text-slate-500">Chargement…</p>}

          {!isPending && !file && (
            <p className="text-sm text-red-600">
              Impossible de charger le dossier.
            </p>
          )}

          {file && (
            <>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  {file.lastName} {file.firstName}
                </h3>
                <p className="text-sm text-slate-500">
                  N° dossier {file.number}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {file.phone && (
                    <Badge variant="default" className="gap-1">
                      <Phone className="h-3 w-3" />
                      {file.phone}
                    </Badge>
                  )}
                  {file.email && (
                    <Badge variant="default" className="gap-1">
                      <Mail className="h-3 w-3" />
                      {file.email}
                    </Badge>
                  )}
                  {(file.city || file.wilaya) && (
                    <Badge variant="default" className="gap-1">
                      <MapPin className="h-3 w-3" />
                      {file.city}
                      {file.city && file.wilaya ? ", " : ""}
                      {file.wilaya}
                    </Badge>
                  )}
                </div>
              </div>

              <Link href={`/patients/${file.id}`}>
                <Button variant="secondary" className="w-full gap-2">
                  <FileText className="h-4 w-4" />
                  Ouvrir la fiche complète
                </Button>
              </Link>

              {(file.allergies ||
                file.currentMedications ||
                file.medicalHistory) && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader className="px-4 py-3">
                    <CardTitle className="text-sm font-semibold text-red-800">
                      Alertes médicales
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 px-4 py-3 text-sm text-red-900">
                    {file.allergies && (
                      <p>
                        <span className="font-medium">Allergies :</span>{" "}
                        {file.allergies}
                      </p>
                    )}
                    {file.currentMedications && (
                      <p>
                        <span className="font-medium">Traitement :</span>{" "}
                        {file.currentMedications}
                      </p>
                    )}
                    {file.medicalHistory && (
                      <p>
                        <span className="font-medium">Antécédents :</span>{" "}
                        {file.medicalHistory}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="border-b px-4 py-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    Derniers rendez-vous
                  </CardTitle>
                </CardHeader>
                <CardContent className="divide-y p-0">
                  {file.appointments.length > 0 ? (
                    file.appointments.map((a) => (
                      <div key={a.id} className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-900">
                          {format(new Date(a.startAt), "dd/MM/yyyy HH:mm", {
                            locale: fr,
                          })}
                        </p>
                        <p className="text-xs text-slate-500">
                          Dr. {a.dentist.lastName} {a.dentist.firstName} ·{" "}
                          {a.status}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="px-4 py-6 text-center text-sm text-slate-500">
                      Aucun rendez-vous.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b px-4 py-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <Receipt className="h-4 w-4 text-emerald-600" />
                    Factures impayées
                  </CardTitle>
                </CardHeader>
                <CardContent className="divide-y p-0">
                  {file.invoices.length > 0 ? (
                    file.invoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <p className="text-sm font-medium text-slate-900">
                          {inv.number}
                        </p>
                        <p className="text-sm font-semibold text-slate-900">
                          {(inv.totalCents / 100).toLocaleString("fr-DZ")} DA
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="px-4 py-6 text-center text-sm text-slate-500">
                      Aucune facture impayée.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b px-4 py-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <Pill className="h-4 w-4 text-violet-600" />
                    Dernières ordonnances
                  </CardTitle>
                </CardHeader>
                <CardContent className="divide-y p-0">
                  {file.prescriptions.length > 0 ? (
                    file.prescriptions.map((p) => (
                      <div key={p.id} className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-900">
                          {p.number}
                        </p>
                        <p className="text-xs text-slate-500">
                          {format(new Date(p.issuedAt), "dd/MM/yyyy", {
                            locale: fr,
                          })}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="px-4 py-6 text-center text-sm text-slate-500">
                      Aucune ordonnance.
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
