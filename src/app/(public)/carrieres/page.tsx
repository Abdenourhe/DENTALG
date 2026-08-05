import Link from "next/link";
import { auth } from "@/auth";
import PublicHeader from "../_components/PublicHeader";
import JobOffersSection from "../_components/JobOffersSection";
import { listPublicJobOffers } from "@/lib/actions/job-offers";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  GraduationCap,
  Stethoscope,
  Plus,
  ArrowRight,
} from "lucide-react";

function isStageOffer(title: string) {
  return /stage|internship|stagiaire/i.test(title);
}

export default async function CarrieresPublicPage() {
  const session = await auth();
  const offers = await listPublicJobOffers();

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
            prochaine opportunité professionnelle.
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

          {session?.user?.clinicId && (
            <div className="mt-8">
              <Link href="/carrieres/manage">
                <Button className="bg-primary hover:bg-primary-800">
                  <Plus className="mr-2 h-4 w-4" />
                  Publier une offre
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Offres récentes
            </h2>
            <p className="text-sm text-slate-500">
              Découvrez les dernières opportunités publiées par les cabinets.
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
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 sm:flex-row">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="DENTALG" className="h-5 w-auto" />
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} DENTALG — Marketplace dentaire en
            Algérie
          </p>
        </div>
      </footer>
    </div>
  );
}
