import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AVAILABLE_FEATURES, FeatureKey } from "@/lib/features";
import { updateClinicFeatures } from "@/app/(platform)/superadmin/actions";
import {
  FlaskConical,
  FileText,
  CreditCard,
  Briefcase,
  BarChart3,
  ClipboardList,
  Settings,
  Check,
  X,
} from "lucide-react";

const featureIcons: Record<FeatureKey, typeof FlaskConical> = {
  LAB_ORDERS: FlaskConical,
  PRESCRIPTIONS: FileText,
  INVOICING: CreditCard,
  JOB_OFFERS: Briefcase,
  ANALYTICS: BarChart3,
  TREATMENT_PLANS: ClipboardList,
};

export default async function FeaturesSettingsPage() {
  const session = await auth();
  if (session?.user?.role !== "OWNER" || !session.user.clinicId) {
    notFound();
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: session.user.clinicId },
    select: { id: true, features: true },
  });
  if (!clinic) notFound();

  const enabled = (clinic.features ?? {}) as Record<string, boolean>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Fonctionnalités
        </h1>
        <p className="mt-1 text-slate-500">
          Activez ou désactivez les modules de votre cabinet.
        </p>
      </div>

      <Card>
        <CardHeader className="border-b px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Settings className="h-5 w-5 text-slate-500" />
            Modules disponibles
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {(Object.keys(AVAILABLE_FEATURES) as FeatureKey[]).map((key) => {
              const feature = AVAILABLE_FEATURES[key];
              const Icon = featureIcons[key];
              const isEnabled = enabled[key] === true;

              return (
                <div
                  key={key}
                  className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${isEnabled ? "bg-blue-50" : "bg-slate-100"}`}
                    >
                      <Icon
                        className={`h-5 w-5 ${isEnabled ? "text-blue-600" : "text-slate-400"}`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {feature.label}
                      </p>
                      <p className="text-sm text-slate-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  <form
                    action={async () => {
                      "use server";
                      const newFeatures = { ...enabled, [key]: !isEnabled };
                      await updateClinicFeatures({
                        clinicId: clinic.id,
                        features: newFeatures,
                      });
                    }}
                  >
                    <button
                      type="submit"
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        isEnabled
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-500 ring-1 ring-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {isEnabled ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Activé
                        </>
                      ) : (
                        <>
                          <X className="h-3.5 w-3.5" />
                          Désactivé
                        </>
                      )}
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
