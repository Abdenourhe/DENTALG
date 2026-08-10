import Link from "next/link";
import { notFound } from "next/navigation";
import { getPatient } from "../../../actions";
import { prisma } from "@/lib/prisma";
import { requireClinicContext } from "@/lib/tenant";
import { Button } from "@/components/ui/button";
import { Barcode } from "@/components/ui/barcode";
import PrintButton from "./print-button";
import { ArrowLeft, Phone, MapPin } from "lucide-react";

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

  const clinic = await prisma.clinic.findUnique({
    where: { id: ctx.clinicId },
    select: {
      name: true,
      logoUrl: true,
      phone: true,
      address: true,
    },
  });

  const fullName = `${capitalize(patient.lastName)} ${capitalize(
    patient.firstName,
  )}`;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Toolbar */}
      <div className="no-print mx-auto max-w-3xl p-4 print:hidden">
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
          Pour imprimer sur du papier carte (85,6 × 54 mm), utilisez les
          paramètres d’impression personnalisés de votre navigateur.
        </p>
      </div>

      {/* Card preview */}
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 p-8 print:p-0">
        {/* Card */}
        <div
          className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl print:shadow-none"
          style={{
            width: "86mm",
            height: "54mm",
          }}
        >
          {/* Decorative header bar */}
          <div className="h-3 bg-gradient-to-r from-primary-700 to-primary-500" />

          <div className="flex h-[calc(100%-12px)] flex-col p-4">
            {/* Clinic header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {clinic?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={clinic.logoUrl}
                    alt={clinic.name ?? "Cabinet"}
                    className="h-8 w-8 rounded-md border border-slate-100 object-contain p-0.5"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-700 text-[10px] font-bold text-white">
                    {clinic?.name?.slice(0, 2).toUpperCase() ?? "DR"}
                  </div>
                )}
                <div>
                  <p className="max-w-[110px] truncate text-xs font-bold leading-tight text-slate-900">
                    {clinic?.name ?? "Cabinet dentaire"}
                  </p>
                  <p className="text-[8px] text-slate-500">
                    Carte patient / بطاقة المريض
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-primary-700">
                  N° {patient.number}
                </p>
              </div>
            </div>

            {/* Patient identity */}
            <div className="mt-3 flex-1">
              <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
                Patient
              </p>
              <h1 className="truncate text-lg font-bold leading-tight text-slate-900">
                {fullName}
              </h1>
              {patient.arabicName && (
                <p
                  className="truncate text-sm font-medium text-slate-600"
                  dir="rtl"
                >
                  {patient.arabicName}
                </p>
              )}
              {patient.dateOfBirth && (
                <p className="mt-0.5 text-[9px] text-slate-500">
                  Né(e) le{" "}
                  {new Date(patient.dateOfBirth).toLocaleDateString("fr-FR")}
                </p>
              )}
            </div>

            {/* Footer : barcode + contact */}
            <div className="flex items-end justify-between gap-2">
              <div className="flex flex-col gap-0.5 text-[8px] text-slate-500">
                {clinic?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-2.5 w-2.5" />
                    {clinic.phone}
                  </span>
                )}
                {clinic?.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-2.5 w-2.5" />
                    {clinic.address}
                  </span>
                )}
              </div>
              <div className="shrink-0">
                <Barcode
                  value={patient.number}
                  width={1}
                  height={24}
                  displayValue={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Back side suggestion / extra info */}
        <div
          className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-xl print:hidden"
          style={{
            width: "86mm",
            height: "54mm",
          }}
        >
          <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            <p className="text-sm font-semibold text-slate-700">
              {clinic?.name ?? "Cabinet dentaire"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Veuillez présenter cette carte à chaque visite.
            </p>
            <p className="text-xs text-slate-500" dir="rtl">
              يرجى إبراز هذه البطاقة في كل زيارة.
            </p>
            {patient.phone && (
              <p className="mt-2 text-xs text-slate-600">
                Tél. patient : {patient.phone}
              </p>
            )}
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body { background: white; }
              .no-print { display: none !important; }
            }
          `,
        }}
      />
    </div>
  );
}
