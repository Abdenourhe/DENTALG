import Link from "next/link";
import { ArrowRight, Briefcase, Plus } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { listPublicJobOffers } from "@/lib/actions/job-offers";
import JobOffersSection from "./JobOffersSection";

export default async function LandingJobOffers() {
  const session = await auth();
  const offers = await listPublicJobOffers();

  if (offers.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 ring-1 ring-blue-100">
            <Briefcase className="h-4 w-4" />
            Carrières dentaires
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
            Offres publiées par les professionnels
          </h2>
          <p className="mt-2 max-w-2xl text-slate-500">
            Les cabinets partenaires recrutent. Postulez directement en ligne et
            donnez un coup d&apos;accélérateur à votre carrière.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {session?.user?.clinicId && (
            <Link href="/carrieres/manage">
              <Button className="bg-primary hover:bg-primary-800">
                <Plus className="mr-2 h-4 w-4" />
                Publier une offre
              </Button>
            </Link>
          )}
          <Link
            href="/carrieres"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-700"
          >
            Voir toutes les offres
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mt-10">
        <JobOffersSection
          offers={offers}
          variant="grid"
          limit={3}
          showViewAll={false}
        />
      </div>
    </section>
  );
}
