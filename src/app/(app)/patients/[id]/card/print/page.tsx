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

  const [clinic, doctor] = await Promise.all([
    prisma.clinic.findUnique({
      where: { id: ctx.clinicId },
      select: {
        name: true,
        logoUrl: true,
        phone: true,
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
          className="card relative overflow-hidden rounded-2xl bg-slate-900 text-white shadow-2xl print:shadow-none"
          style={{ width: "86mm", height: "54mm" }}
        >
          {/* Background pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, #7c3aed 0%, transparent 40%), radial-gradient(circle at 80% 70%, #06b6d4 0%, transparent 40%)",
            }}
          />
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-600/20 blur-2xl"
            aria-hidden
          />

          <div className="relative flex h-full flex-col p-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                {clinic?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={clinic.logoUrl}
                    alt={clinicName}
                    className="h-9 w-9 rounded-lg bg-white object-contain p-0.5 shadow-sm"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 text-xs font-bold text-white shadow-sm">
                    {clinicName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="max-w-[120px] truncate text-xs font-bold leading-tight">
                    {clinicName}
                  </p>
                  {doctorName && (
                    <p className="text-[9px] text-slate-300">{doctorName}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-medium uppercase tracking-wider text-slate-400">
                  Dossier
                </p>
                <p className="text-sm font-bold text-primary-300">
                  {patient.number}
                </p>
              </div>
            </div>

            {/* Patient */}
            <div className="mt-4 flex-1">
              <p className="text-[8px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                Patient / المريض
              </p>
              <h1 className="mt-0.5 truncate text-xl font-bold leading-none tracking-tight">
                {fullName}
              </h1>
              {patient.arabicName && (
                <p
                  className="mt-1 truncate text-base font-medium text-slate-300"
                  dir="rtl"
                >
                  {patient.arabicName}
                </p>
              )}
              {patient.dateOfBirth && (
                <p className="mt-1 text-[10px] text-slate-400">
                  Né(e) le{" "}
                  {new Date(patient.dateOfBirth).toLocaleDateString("fr-FR")}
                </p>
              )}
            </div>

            {/* Barcode footer */}
            <div className="mt-auto flex items-end justify-between gap-3">
              <div className="flex flex-col gap-0.5 text-[9px] text-slate-400">
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
              <div className="shrink-0 rounded-md bg-white p-1">
                <Barcode
                  value={patient.number}
                  width={1.3}
                  height={28}
                  displayValue={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div
          className="card relative overflow-hidden rounded-2xl bg-slate-900 text-white shadow-2xl print:shadow-none"
          style={{ width: "86mm", height: "54mm" }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 80% 20%, #7c3aed 0%, transparent 40%), radial-gradient(circle at 20% 80%, #06b6d4 0%, transparent 40%)",
            }}
          />
          <div className="relative flex h-full flex-col items-center justify-center p-5 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              {clinic?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={clinic.logoUrl}
                  alt={clinicName}
                  className="h-6 w-6 rounded object-contain"
                />
              ) : (
                <span className="text-xs font-bold text-white">
                  {clinicName.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <p className="text-sm font-bold">{clinicName}</p>
            <p className="mt-2 text-[10px] leading-relaxed text-slate-300">
              Veuillez présenter cette carte à chaque visite.
            </p>
            <p className="text-[10px] leading-relaxed text-slate-300" dir="rtl">
              يرجى إبراز هذه البطاقة في كل زيارة.
            </p>
            {patient.phone && (
              <p className="mt-3 text-[10px] text-slate-400">
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
