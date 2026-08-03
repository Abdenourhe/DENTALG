import Link from "next/link";
import { listPublicJobOffers } from "@/lib/actions/job-offers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
  Building2,
  Search,
  GraduationCap,
  Stethoscope,
  Users,
} from "lucide-react";

export default async function CarrieresPublicPage() {
  const offers = await listPublicJobOffers();

  // Count by type (heuristic from title keywords)
  const stageCount = offers.filter((o) =>
    /stage|internship|stagiaire/i.test(o.title),
  ).length;
  const emploiCount = offers.length - stageCount;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="DENTALG" className="h-7 w-auto" />
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/carrieres" className="font-medium text-primary">
              Offres
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary-800"
            >
              Connexion pro
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-slate-900 px-6 py-16">
        <div className="mx-auto max-w-6xl text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 ring-1 ring-primary/30">
            <Briefcase className="h-7 w-7 text-primary-300" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Offres d&apos;emploi dentaire
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Stages, postes d&apos;assistant, associations et remplacements dans
            les cabinets dentaires en Algérie.
          </p>

          {/* Stats */}
          <div className="mx-auto mt-8 flex max-w-md justify-center gap-4">
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
          </div>
        </div>
      </section>

      {/* Offers list */}
      <section className="mx-auto w-full max-w-6xl px-6 py-12">
        {offers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              Aucune offre pour le moment
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Revenez bientôt ou publiez votre propre offre depuis votre espace
              cabinet.
            </p>
            <Link
              href="/register"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-800"
            >
              Créer un compte cabinet
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {offers.map((offer) => {
              const isStage = /stage|internship|stagiaire/i.test(offer.title);
              return (
                <Card
                  key={offer.id}
                  className="group transition-all duration-200 hover:border-primary-200 hover:shadow-md"
                >
                  <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-900">
                          {offer.title}
                        </h3>
                        <Badge variant={isStage ? "info" : "success"}>
                          {isStage ? "Stage" : "Emploi"}
                        </Badge>
                        {offer.closesAt &&
                          new Date(offer.closesAt) < new Date() && (
                            <Badge variant="danger">Clôturée</Badge>
                          )}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-4 w-4 text-slate-400" />
                          {offer.clinic.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          {offer.clinic.city}, {offer.clinic.wilaya}
                        </span>
                        {offer.publishedAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-slate-400" />
                            Publiée le{" "}
                            {offer.publishedAt.toLocaleDateString("fr-FR")}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                        {offer.description}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-xs text-slate-400">
                        {offer._count.applications} candidature
                        {offer._count.applications > 1 ? "s" : ""}
                      </span>
                      <Link
                        href={`/carrieres/${offer.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-800"
                      >
                        Voir l&apos;offre
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA for clinics */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="relative overflow-hidden rounded-2xl bg-primary-900 px-6 py-10 text-center">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-primary-700/30 blur-3xl" />
            <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />
          </div>
          <div className="relative">
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Vous cherchez à recruter ?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-primary-200">
              Publiez vos offres de stage et d&apos;emploi gratuitement sur
              DENTALG et trouvez les meilleurs talents dentaires en Algérie.
            </p>
            <Link
              href="/register"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-primary-900 transition-colors hover:bg-primary-50"
            >
              Créer un compte cabinet
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 sm:flex-row">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="DENTALG" className="h-5 w-auto" />
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} DENTALG — Plateforme de recrutement
            dentaire en Algérie
          </p>
        </div>
      </footer>
    </div>
  );
}
