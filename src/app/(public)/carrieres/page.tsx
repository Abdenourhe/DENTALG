import Link from "next/link";
import { auth } from "@/auth";
import PublicHeader from "../_components/PublicHeader";
import PublicFooter from "../_components/PublicFooter";
import JobOffersSection from "../_components/JobOffersSection";
import ListingsGrid from "../_components/ListingsGrid";
import { listPublicJobOffers } from "@/lib/actions/job-offers";
import {
  listPublicClinicListings,
  listPublicEquipmentListings,
} from "@/lib/actions/carrieres-listings";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  GraduationCap,
  Stethoscope,
  Plus,
  ArrowRight,
  Building2,
  Wrench,
  Store,
} from "lucide-react";

function isStageOffer(title: string) {
  return /stage|internship|stagiaire/i.test(title);
}

function Tabs({ activeTab }: { activeTab: string }) {
  const tabs = [
    { id: "jobs", label: "Offres d'emploi", icon: Briefcase },
    { id: "clinics", label: "Cabinets à vendre", icon: Store },
    { id: "equipment", label: "Matériel", icon: Wrench },
  ];

  return (
    <div className="flex gap-2 border-b border-slate-200">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <Link
            key={tab.id}
            href={`/carrieres?tab=${tab.id}`}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

export default async function CarrieresPublicPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  const { tab = "jobs" } = await searchParams;

  const [offers, clinicListings, equipmentListings] = await Promise.all([
    listPublicJobOffers(),
    listPublicClinicListings(),
    listPublicEquipmentListings(),
  ]);

  const stageCount = offers.filter((o) => isStageOffer(o.title)).length;
  const emploiCount = offers.length - stageCount;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <PublicHeader active="carrieres" />

      <section className="bg-slate-900 px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-primary-200 ring-1 ring-white/20">
            <Briefcase className="h-4 w-4" />
            Espace recrutement dentaire
          </span>

          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Offres d&apos;emploi & stages dentaires
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            Postes proposés par les cabinets dentaires en Algérie. Trouvez votre
            prochaine opportunité professionnelle ou publiez vos besoins.
          </p>

          <div className="mx-auto mt-8 flex max-w-xl flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 ring-1 ring-white/10">
              <Stethoscope className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-white">
                {emploiCount} emploi{emploiCount > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 ring-1 ring-white/10">
              <GraduationCap className="h-4 w-4 text-primary-300" />
              <span className="text-sm font-medium text-white">
                {stageCount} stage{stageCount > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 ring-1 ring-white/10">
              <Briefcase className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-white">
                {offers.length} offre{offers.length > 1 ? "s" : ""} au total
              </span>
            </div>
          </div>

          <div className="mx-auto mt-8 flex flex-wrap justify-center gap-3">
            {session?.user?.clinicId ? (
              <Link href="/carrieres/manage">
                <Button className="bg-primary hover:bg-primary-800">
                  <Plus className="mr-2 h-4 w-4" />
                  Publier une offre
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button className="bg-primary hover:bg-primary-800">
                    <Building2 className="mr-2 h-4 w-4" />
                    Espace recruteur
                  </Button>
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm transition-all hover:bg-white/15"
                >
                  Créer un compte pro
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white px-6">
        <div className="mx-auto max-w-6xl">
          <Tabs activeTab={tab} />
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        {tab === "clinics" && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                Cabinets à vendre
              </h2>
              <p className="text-sm text-slate-500">
                {clinicListings.length} annonce
                {clinicListings.length > 1 ? "s" : ""} publiée
                {clinicListings.length > 1 ? "s" : ""} par des cabinets.
              </p>
            </div>
            <ListingsGrid
              listings={clinicListings.map((item) => ({
                ...item,
                kind: "clinic" as const,
              }))}
              emptyMessage="Aucun cabinet à vendre pour le moment."
            />
          </>
        )}

        {tab === "equipment" && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                Matériel dentaire
              </h2>
              <p className="text-sm text-slate-500">
                {equipmentListings.length} annonce
                {equipmentListings.length > 1 ? "s" : ""} de matériel
                d&apos;occasion ou neuf.
              </p>
            </div>
            <ListingsGrid
              listings={equipmentListings.map((item) => ({
                ...item,
                kind: "equipment" as const,
              }))}
              emptyMessage="Aucun matériel en vente pour le moment."
            />
          </>
        )}

        {(tab === "jobs" || !tab) && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Offres récentes
                </h2>
                <p className="text-sm text-slate-500">
                  Découvrez les dernières opportunités publiées par les
                  cabinets.
                </p>
              </div>
              {!session?.user?.clinicId && (
                <Link
                  href="/login"
                  className="hidden items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-700 sm:inline-flex"
                >
                  Espace recruteur
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>

            <JobOffersSection
              offers={offers}
              variant="list"
              emptyMessage="Aucune offre d'emploi ou de stage pour le moment. Revenez bientôt ou publiez la vôtre."
            />
          </>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
