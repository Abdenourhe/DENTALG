import { getPrescriptionForPrint } from "@/app/(app)/prescriptions/actions";
import { formatDateTime } from "@/lib/date";

interface Props {
  params: Promise<{ id: string; prescriptionId: string }>;
}

export default async function PrescriptionPrintPage({ params }: Props) {
  const { prescriptionId } = await params;
  const p = await getPrescriptionForPrint(prescriptionId);

  return (
    <div className="print-page">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{p.clinic.name}</h1>
        <p className="text-sm text-slate-600">
          {p.clinic.address && <span>{p.clinic.address}</span>}
          {p.clinic.phone && (
            <span className="ml-4">Tél : {p.clinic.phone}</span>
          )}
          {p.clinic.email && (
            <span className="ml-4">Email : {p.clinic.email}</span>
          )}
        </p>
      </header>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900">Ordonnance</h2>
        <p className="text-sm text-slate-600">
          N° {p.number} — {formatDateTime(p.issuedAt)}
        </p>
      </section>

      <section className="mb-8">
        <p className="text-sm">
          <span className="font-medium">Patient :</span> {p.patient.firstName}{" "}
          {p.patient.lastName}
        </p>
        <p className="text-sm">
          <span className="font-medium">N° dossier :</span> {p.patient.number}
        </p>
      </section>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-900">
            <th className="py-2 text-left font-medium">Médicament</th>
            <th className="py-2 text-left font-medium">Posologie</th>
            <th className="py-2 text-left font-medium">Durée</th>
            <th className="py-2 text-left font-medium">Instructions</th>
          </tr>
        </thead>
        <tbody>
          {p.items.map((item) => (
            <tr key={item.id} className="border-b border-slate-200">
              <td className="py-3 align-top font-medium">{item.name}</td>
              <td className="py-3 align-top">{item.dosage ?? "—"}</td>
              <td className="py-3 align-top">{item.duration ?? "—"}</td>
              <td className="py-3 align-top">{item.instructions ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {p.notes && (
        <section className="mt-8">
          <p className="font-medium text-sm">Notes :</p>
          <p className="text-sm whitespace-pre-wrap">{p.notes}</p>
        </section>
      )}

      <footer className="mt-16 text-right text-sm">
        <p className="font-medium">
          Dr. {p.createdBy.firstName} {p.createdBy.lastName}
        </p>
        <p className="text-slate-500">{formatDateTime(p.issuedAt)}</p>
      </footer>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .print-page {
              max-width: 210mm;
              margin: 0 auto;
              padding: 20mm;
              background: white;
              color: black;
            }
            @media print {
              @page { size: A4; margin: 15mm; }
              body { background: white; }
              .print-page { padding: 0; }
            }
          `,
        }}
      />
    </div>
  );
}
