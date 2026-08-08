import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/platform-auth";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminPage() {
  await requirePlatformAdmin();

  const [clinicCount, userCount, patientCount, jobOfferCount] =
    await Promise.all([
      prisma.clinic.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.patient.count({ where: { deletedAt: null } }),
      prisma.jobOffer.count({ where: { deletedAt: null } }),
    ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">
        Administration plateforme
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-slate-500">Cabinets</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              {clinicCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-slate-500">Utilisateurs</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              {userCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-slate-500">Patients</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              {patientCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-slate-500">Offres emploi</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              {jobOfferCount}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
