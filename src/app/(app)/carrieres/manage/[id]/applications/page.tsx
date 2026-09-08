import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Mail,
  Phone,
  FileText,
  Download,
  User,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  listJobApplications,
  updateApplicationStatusFromForm,
} from "../../../actions";

const STATUS_CONFIG = {
  PENDING: { label: "Nouvelle", variant: "info" as const, icon: Clock },
  REVIEWING: {
    label: "En cours d'examen",
    variant: "warning" as const,
    icon: Eye,
  },
  ACCEPTED: {
    label: "Acceptée",
    variant: "success" as const,
    icon: CheckCircle2,
  },
  REJECTED: { label: "Refusée", variant: "danger" as const, icon: XCircle },
};

export default async function JobApplicationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.clinicId) notFound();

  const { id } = await params;
  const result = await listJobApplications(id);
  if (!result) notFound();

  const { offer, applications } = result;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href="/carrieres/manage"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux offres
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
          Candidatures — {offer.title}
        </h1>
        <p className="mt-1 text-slate-500">
          {applications.length} candidature{applications.length > 1 ? "s" : ""}{" "}
          reçue{applications.length > 1 ? "s" : ""} pour cette offre.
        </p>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <User className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-500">
              Aucune candidature pour le moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const candidate = app.candidateProfile;
            const status = STATUS_CONFIG[app.status];
            const StatusIcon = status.icon;

            return (
              <Card key={app.id}>
                <CardHeader className="flex-wrap gap-3 border-b px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 ring-1 ring-slate-200">
                      {candidate.firstName[0]}
                      {candidate.lastName[0]}
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {candidate.firstName} {candidate.lastName}
                      </CardTitle>
                      <p className="text-xs text-slate-500">
                        Postulé le{" "}
                        {new Date(app.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <Badge variant={status.variant}>
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {status.label}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                    <a
                      href={`mailto:${candidate.email}`}
                      className="flex items-center gap-1.5 hover:text-primary"
                    >
                      <Mail className="h-4 w-4" />
                      {candidate.email}
                    </a>
                    {candidate.phone && (
                      <a
                        href={`tel:${candidate.phone}`}
                        className="flex items-center gap-1.5 hover:text-primary"
                      >
                        <Phone className="h-4 w-4" />
                        {candidate.phone}
                      </a>
                    )}
                    {candidate.cvUrl && (
                      <a
                        href={candidate.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 font-medium text-primary hover:text-primary-700"
                      >
                        <Download className="h-4 w-4" />
                        Télécharger le CV
                      </a>
                    )}
                  </div>

                  {candidate.coverLetter && (
                    <div className="rounded-lg bg-slate-50 p-4">
                      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <FileText className="h-3.5 w-3.5" />
                        Lettre de motivation
                      </p>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
                        {candidate.coverLetter}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                    {(
                      [
                        ["REVIEWING", "Marquer en cours"],
                        ["ACCEPTED", "Accepter"],
                        ["REJECTED", "Refuser"],
                      ] as const
                    ).map(([value, label]) =>
                      app.status === value ? null : (
                        <form
                          key={value}
                          action={updateApplicationStatusFromForm}
                        >
                          <input
                            type="hidden"
                            name="applicationId"
                            value={app.id}
                          />
                          <input type="hidden" name="status" value={value} />
                          <button
                            type="submit"
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium ring-1 transition-colors ${
                              value === "ACCEPTED"
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100"
                                : value === "REJECTED"
                                  ? "bg-red-50 text-red-700 ring-red-200 hover:bg-red-100"
                                  : "bg-amber-50 text-amber-700 ring-amber-200 hover:bg-amber-100"
                            }`}
                          >
                            {label}
                          </button>
                        </form>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
