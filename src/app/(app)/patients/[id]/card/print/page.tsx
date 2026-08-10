import Link from "next/link";
import { notFound } from "next/navigation";
import { getPatient } from "../../../actions";
import { prisma } from "@/lib/prisma";
import { requireClinicContext } from "@/lib/tenant";
import { Button } from "@/components/ui/button";
import { Barcode } from "@/components/ui/barcode";
import PrintButton from "./print-button";
import { ArrowLeft, Phone, MapPin, Mail } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

function capitalize(value: string): string {
  return value
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export default async function PatientCardPrintPage({ params }: Props) {
  const { id } = await params;
  const ctx = await requireClinicContext();
  const patient = await getPatient(id);
  if (!patient) notFound();

  const [clinic, doctor] = await Promise.all([
    prisma.clinic.findUnique({
      where: { id: ctx.clinicId },
      select: {
        name: true,
        logoUrl: true,
        phone: true,
        email: true,
        address: true,
      },
    }),
    prisma.user.findFirst({
      where: {
        clinicId: ctx.clinicId,
        role: { in: ["DENTIST", "OWNER"] },
        isActive: true,
        deletedAt: null,
      },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
      select: { firstName: true, lastName: true },
    }),
  ]);

  const fullName = `${capitalize(patient.lastName)} ${capitalize(
    patient.firstName,
  )}`;
  const clinicName = clinic?.name ?? "Cabinet dentaire";
  const doctorName = doctor
    ? `Dr. ${capitalize(doctor.lastName)} ${capitalize(doctor.firstName)}`
    : null;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Toolbar */}
      <div className="no-print mx-auto max-w-5xl p-4 print:hidden">
        <div className="mb-4 flex items-center justify-between">
          <Link href={`/patients/${id}`}>
            <Button type="button" variant="secondary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la fiche
            </Button>
          </Link>
          <PrintButton />
        </div>
        <p className="text-sm text-slate-500">
          Format carte standard 86 × 54 mm. Ajustez les marges à 0 et le papier
          à la taille personnalisée dans la boîte d’impression.
        </p>
      </div>

      {/* Cards preview */}
      <div className="mx-auto flex max-w-5xl flex-wrap items-start justify-center gap-10 p-8 print:p-0">
        {/* FRONT */}
        <div
          className="card relative overflow-hidden rounded-2xl bg-white shadow-2xl print:shadow-none"
          style={{ width: "86mm", height: "54mm" }}
        >
          {/* Top accent bar */}
          <div className="h-2.5 bg-gradient-to-r from-primary-700 to-primary-500" />

          <div className="flex h-[calc(100%-10px)] flex-col">
            {/* Header */}
            <div className="flex items-start justify-between px-4 pt-3">
              <div className="flex items-center gap-2.5">
                {clinic?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={clinic.logoUrl}
                    alt={clinicName}
                    className="h-9 w-9 rounded-lg border border-slate-100 object-contain p-0.5"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 text-xs font-bold text-white">
                    {clinicName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="max-w-[120px] truncate text-xs font-bold leading-tight text-slate-900">
                    {clinicName}
                  </p>
                  {doctorName && (
                    <p className="text-[9px] text-slate-500">{doctorName}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-semibold uppercase tracking-wider text-slate-400">
                  Dossier
                </p>
                <p className="text-sm font-bold text-primary-700">
                  {patient.number}
                </p>
              </div>
            </div>

            {/* Patient */}
            <div className="flex-1 px-4 pt-4">
              <p className="text-[8px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                Patient / المريض
              </p>
              <h1 className="mt-0.5 truncate text-[22px] font-bold leading-none tracking-tight text-slate-900">
                {fullName}
              </h1>
              {patient.arabicName && (
                <p
                  className="mt-1 truncate text-base font-medium text-slate-600"
                  dir="rtl"
                >
                  {patient.arabicName}
                </p>
              )}
              {patient.dateOfBirth && (
                <p className="mt-1 text-[10px] text-slate-500">
                  Né(e) le{" "}
                  {new Date(patient.dateOfBirth).toLocaleDateString("fr-FR")}
                </p>
              )}
            </div>

            {/* Barcode strip at bottom */}
            <div className="mt-auto flex items-center justify-center border-t border-slate-100 bg-slate-50 px-4 py-2">
              <Barcode
                value={patient.number}
                width={1.5}
                height={32}
                displayValue={true}
              />
            </div>
          </div>
        </div>

        {/* BACK */}
        <div
          className="card relative overflow-hidden rounded-2xl bg-white shadow-2xl print:shadow-none"
          style={{ width: "86mm", height: "54mm" }}
        >
          <div className="h-2.5 bg-gradient-to-r from-primary-700 to-primary-500" />

          <div className="flex h-[calc(100%-10px)] flex-col p-4">
            <div className="flex items-center gap-2.5">
              {clinic?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={clinic.logoUrl}
                  alt={clinicName}
                  className="h-8 w-8 rounded-lg border border-slate-100 object-contain p-0.5"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 text-[10px] font-bold text-white">
                  {clinicName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <p className="text-sm font-bold text-slate-900">{clinicName}</p>
            </div>

            <div className="mt-3 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Coordonnées / تواصل
              </p>
              <div className="mt-2 space-y-1.5 text-[10px] text-slate-700">
                {clinic?.address && (
                  <p className="flex items-start gap-1.5">
                    <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-primary-600" />
                    {clinic.address}
                  </p>
                )}
                {clinic?.phone && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3 shrink-0 text-primary-600" />
                    {clinic.phone}
                  </p>
                )}
                {clinic?.email && (
                  <p className="flex items-center gap-1.5">
                    <Mail className="h-3 w-3 shrink-0 text-primary-600" />
                    {clinic.email}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-2 text-center">
              <p className="text-[9px] text-slate-500">
                Veuillez présenter cette carte à chaque visite.
              </p>
              <p className="text-[9px] text-slate-500" dir="rtl">
                يرجى إبراز هذه البطاقة في كل زيارة.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body { background: white; margin: 0; }
              .no-print { display: none !important; }
              .card { page-break-inside: avoid; box-shadow: none !important; }
            }
          `,
        }}
      />
    </div>
  );
}
