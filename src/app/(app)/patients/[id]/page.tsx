import Link from "next/link";
import { notFound } from "next/navigation";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Stethoscope,
  CreditCard,
  FileText,
  Pill,
  FlaskConical,
  ChevronRight,
  Plus,
  Heart,
  AlertCircle,
  Activity,
  Fingerprint,
} from "lucide-react";
import { getPatient } from "../actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime } from "@/lib/date";
import { formatDA } from "@/lib/money";
import OdontogramWrapper from "./odontogram-wrapper";
import {
  formatInvoiceStatus,
  invoiceStatusColors,
} from "@/lib/billing/invoice-helpers";

interface Props {
  params: Promise<{ id: string }>;
}

function formatGeneralCondition(value: string | null): string | null {
  if (!value) return null;
  const map: Record<string, string> = {
    RAS: "RAS",
    HYPERTENSION_ARTERIELLE: "Hypertension artérielle",
    DIABETE: "Diabète",
    INSUFFISANCE_CARDIAQUE: "Insuffisance cardiaque",
    INFARCTUS_DU_MYOCARDE: "Infarctus du myocarde",
    ENDOCARDITE: "Endocardite",
    ASTHME: "Asthme",
    TUBERCULOSE: "Tuberculose",
    ALLERGIE: "Allergie",
    INSUFFISANCE_RENALE_CHRONIQUE: "Insuffisance rénale chronique",
    ANEMIES: "Anémies",
    RETARD_PSYCHOMOTEUR: "Retard psychomoteur",
    EPILEPSIE: "Épilepsie",
    AUTRE: "Autre",
  };
  return map[value] ?? value;
}

function capitalize(value: string): string {
  return value
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export default async function PatientDetailPage({ params }: Props) {
  const { id } = await params;
  const patient = await getPatient(id);
  if (!patient) notFound();

  const fullName = `${capitalize(patient.lastName)} ${capitalize(
    patient.firstName,
  )}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-white">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{fullName}</h1>
            <p className="text-sm text-slate-600">
              Dossier n° {patient.number} — Né(e) le{" "}
              {formatDate(patient.dateOfBirth)}
            </p>
            {patient.phone && (
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                <Phone className="h-3.5 w-3.5" />
                {patient.phone}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/patients/${id}/edit`}>
            <Button variant="secondary">Modifier</Button>
          </Link>
          <Link href={`/appointments/new?patientId=${id}`}>
            <Button variant="secondary">Nouveau RDV</Button>
          </Link>
          <Link href={`/billing/new?patientId=${id}`}>
            <Button variant="secondary">Nouvelle facture</Button>
          </Link>
          <Link href={`/patients/${id}/prescriptions/new`}>
            <Button>Ordonnance</Button>
          </Link>
        </div>
      </div>

      {/* Informations d'identité et contact */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <User className="h-4 w-4 text-slate-500" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-sm">
            <InfoRow
              label="N° carte nationale d'identité"
              value={patient.nationalId}
              icon={Fingerprint}
            />
            <InfoRow
              label="Sexe"
              value={
                patient.sex
                  ? patient.sex === "M"
                    ? "Masculin"
                    : "Féminin"
                  : null
              }
              icon={User}
            />
            <InfoRow
              label="Groupe sanguin"
              value={patient.bloodGroup}
              icon={Heart}
            />
            <InfoRow
              label="État général"
              value={formatGeneralCondition(patient.generalCondition)}
              icon={Activity}
            />
            <InfoRow
              label="Date de naissance"
              value={formatDate(patient.dateOfBirth)}
              icon={Calendar}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <MapPin className="h-4 w-4 text-slate-500" />
              Coordonnées
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-sm">
            <InfoRow label="Téléphone" value={patient.phone} icon={Phone} />
            <InfoRow label="Email" value={patient.email} icon={Mail} />
            <InfoRow label="Adresse" value={patient.address} icon={MapPin} />
            <InfoRow
              label="Ville"
              value={
                patient.city
                  ? `${patient.city}${patient.wilaya ? ` (${patient.wilaya})` : ""}`
                  : null
              }
              icon={MapPin}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <AlertCircle className="h-4 w-4 text-slate-500" />
              Personne à contacter en cas d&apos;urgence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-sm">
            <InfoRow
              label="Nom et prénom"
              value={patient.emergencyContactName}
              icon={User}
            />
            <InfoRow
              label="Téléphone"
              value={patient.emergencyContactPhone}
              icon={Phone}
            />
          </CardContent>
        </Card>
      </div>

      {/* Informations médicales */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Activity className="h-4 w-4 text-slate-500" />
              Antécédents médicaux
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <MedicalText value={patient.medicalHistory} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <AlertCircle className="h-4 w-4 text-slate-500" />
              Allergies
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <MedicalText value={patient.allergies} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Pill className="h-4 w-4 text-slate-500" />
              Médicaments en cours
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <MedicalText value={patient.currentMedications} />
          </CardContent>
        </Card>
      </div>

      {/* Notes libres + statistiques */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <FileText className="h-4 w-4 text-slate-500" />
              Notes libres
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <MedicalText value={patient.notes} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Calendar className="h-4 w-4 text-slate-500" />
              Statistiques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-sm">
            <StatRow
              label="Rendez-vous"
              value={patient.appointments.length}
              icon={Calendar}
            />
            <StatRow
              label="Factures"
              value={patient.invoices.length}
              icon={CreditCard}
            />
            <StatRow
              label="Plans de traitement"
              value={patient.treatmentPlans.length}
              icon={Stethoscope}
            />
            <StatRow
              label="Ordonnances"
              value={patient.prescriptions.length}
              icon={Pill}
            />
            <StatRow
              label="Analyses"
              value={patient.labOrders.length}
              icon={FlaskConical}
            />
          </CardContent>
        </Card>
      </div>

      {/* Odontogramme */}
      <Card>
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Stethoscope className="h-4 w-4 text-slate-500" />
            Odontogramme interactif (FDI)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <OdontogramWrapper
            patientId={id}
            toothStatuses={patient.toothStatuses.map((ts) => ({
              ...ts,
              surfaces: ts.surfaces as Record<string, string> | null,
            }))}
          />
        </CardContent>
      </Card>

      {/* RDV */}
      <SectionCard
        title="Derniers rendez-vous"
        icon={Calendar}
        href={`/appointments?patientId=${id}`}
        hrefLabel="Voir tout"
      >
        {patient.appointments.length === 0 ? (
          <EmptyState text="Aucun rendez-vous enregistré." />
        ) : (
          <div className="divide-y divide-slate-100">
            {patient.appointments.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-slate-900">
                    {formatDateTime(a.startAt)}
                  </span>
                  <span className="text-slate-600">{a.reason || "—"}</span>
                </div>
                <Badge
                  variant={
                    a.status === "COMPLETED"
                      ? "success"
                      : a.status === "CANCELLED"
                        ? "danger"
                        : a.status === "CONFIRMED"
                          ? "info"
                          : "default"
                  }
                >
                  {a.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Factures */}
      <SectionCard
        title="Dernières factures"
        icon={CreditCard}
        href={`/billing?patientId=${id}`}
        hrefLabel="Voir tout"
      >
        {patient.invoices.length === 0 ? (
          <EmptyState text="Aucune facture enregistrée." />
        ) : (
          <div className="divide-y divide-slate-100">
            {patient.invoices.map((inv) => {
              const balance = Math.max(0, inv.totalCents - inv.paidCents);
              return (
                <div
                  key={inv.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
                    <span className="font-medium text-slate-900">
                      {inv.number}
                    </span>
                    <span className="text-slate-600">
                      {formatDate(inv.issuedAt)}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
                    <div className="text-right text-xs text-slate-500">
                      <span className="line-through opacity-70">
                        {formatDA(inv.totalCents)}
                      </span>
                      {balance > 0 && (
                        <span className="ml-2 font-semibold text-red-600">
                          Reste {formatDA(balance)}
                        </span>
                      )}
                      {balance === 0 && (
                        <span className="ml-2 font-semibold text-green-600">
                          Payée
                        </span>
                      )}
                    </div>
                    <Badge
                      className={
                        invoiceStatusColors[inv.status] ??
                        "bg-slate-100 text-slate-800"
                      }
                    >
                      {formatInvoiceStatus(inv.status)}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Ordonnances */}
      <SectionCard
        title="Dernières ordonnances"
        icon={Pill}
        href={`/patients/${id}/prescriptions`}
        hrefLabel="Voir tout"
        action={
          <Link href={`/patients/${id}/prescriptions/new`}>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Nouvelle
            </Button>
          </Link>
        }
      >
        {patient.prescriptions.length === 0 ? (
          <EmptyState text="Aucune ordonnance enregistrée." />
        ) : (
          <div className="divide-y divide-slate-100">
            {patient.prescriptions.map((pres) => (
              <div
                key={pres.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-slate-900">
                    {pres.number}
                  </span>
                  <span className="text-slate-600">
                    {formatDate(pres.issuedAt)}
                  </span>
                  <span className="text-slate-600">
                    {pres.items.length} médicament
                    {pres.items.length > 1 ? "s" : ""}
                  </span>
                </div>
                <Link
                  href={`/patients/${id}/prescriptions/${pres.id}`}
                  className="flex items-center gap-1 text-sm font-medium text-slate-900 hover:underline"
                >
                  Ouvrir <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Analyses biologiques */}
      <SectionCard
        title="Dernières analyses"
        icon={FlaskConical}
        href={`/patients/${id}/lab`}
        hrefLabel="Voir tout"
        action={
          <Link href={`/patients/${id}/lab/new`}>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Nouvelle
            </Button>
          </Link>
        }
      >
        {patient.labOrders.length === 0 ? (
          <EmptyState text="Aucune analyse enregistrée." />
        ) : (
          <div className="divide-y divide-slate-100">
            {patient.labOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-slate-900">
                    {order.number}
                  </span>
                  <span className="text-slate-600">
                    {formatDate(order.orderedAt)}
                  </span>
                  <span className="text-slate-600">
                    {order.requestedTests.length} analyse
                    {order.requestedTests.length > 1 ? "s" : ""}
                  </span>
                </div>
                <Link
                  href={`/patients/${id}/lab/${order.id}`}
                  className="flex items-center gap-1 text-sm font-medium text-slate-900 hover:underline"
                >
                  Ouvrir <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function MedicalText({ value }: { value: string | null }) {
  return (
    <p className="min-h-[80px] whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
      {value || (
        <span className="italic text-slate-400">
          Aucune information enregistrée.
        </span>
      )}
    </p>
  );
}

function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | null;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="font-medium text-slate-900">
          {value || <span className="text-slate-400">—</span>}
        </p>
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-slate-600">
        <Icon className="h-4 w-4 text-slate-500" />
        <span>{label}</span>
      </div>
      <span className="text-lg font-bold text-slate-900">{value}</span>
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  href,
  hrefLabel,
  action,
  children,
}: {
  title: string;
  icon: React.ElementType;
  href?: string;
  hrefLabel?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Icon className="h-4 w-4 text-slate-500" />
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {action}
          {href && (
            <Link
              href={href}
              className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900 hover:underline"
            >
              {hrefLabel} <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center py-6">
      <p className="text-sm text-slate-500">{text}</p>
    </div>
  );
}
