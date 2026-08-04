import Link from "next/link";
import { listPublicJobOffers } from "@/lib/actions/job-offers";
import {
  listPublicClinicListings,
  listPublicEquipmentListings,
} from "@/lib/actions/carrieres-listings";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  MapPin,
  ArrowRight,
  Building2,
  GraduationCap,
  Stethoscope,
  Store,
  Wrench,
  ImageIcon,
} from "lucide-react";
import type { JobOffer, ClinicListing, EquipmentListing } from "@prisma/client";

function formatDA(cents: number) {
  if (cents === 0) return "Prix sur demande";
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency: "DZD",
  }).format(cents / 100);
}

export default async function CarrieresPublicPage() {
  const [offers, clinics, equipment] = await Promise.all([
    listPublicJobOffers(),
    listPublicClinicListings(),
    listPublicEquipmentListings(),
  ]);

  const stageCount = offers.filter((o: JobOffer) =>
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
              Carrières & Annonces
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
      <section className="bg-slate-900 px-6 py-14">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Carrières & Annonces dentaires
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            Offres d&apos;emploi, cabinets à vendre et matériel dentaire en
            Algérie. Le marketplace dédié aux professionnels de la dentisterie.
          </p>

          {/* Stats */}
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
              <Store className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-white">
                {clinics.length} cabinet{clinics.length > 1 ? "s" : ""} à vendre
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 ring-1 ring-white/10">
              <Wrench className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-white">
                {equipment.length} matériel{equipment.length > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-6 py-10 space-y-14">
        {/* ── JOB OFFERS ── */}
        <section>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Offres d&apos;emploi & stages
              </h2>
              <p className="text-sm text-slate-500">
                Postes dans les cabinets dentaires en Algérie
              </p>
            </div>
          </div>

          {offers.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              Aucune offre pour le moment.
            </p>
          ) : (
            <div className="grid gap-4">
              {offers.slice(0, 5).map((offer: JobOffer & { clinic: { name: string; city: string | null; wilaya: string | null } }) => {
                const isStage = /stage|internship|stagiaire/i.test(offer.title);
                return (
                  <Card
                    key={offer.id}
                    className="transition-all hover:shadow-md"
                  >
                    <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-slate-900">
                            {offer.title}
                          </h3>
                          <Badge variant={isStage ? "info" : "success"}>
                            {isStage ? "Stage" : "Emploi"}
                          </Badge>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5" />
                            {offer.clinic.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {offer.clinic.city}, {offer.clinic.wilaya}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/carrieres/${offer.id}`}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-800"
                      >
                        Voir
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* ── CLINICS FOR SALE ── */}
        <section>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
              <Store className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Cabinets dentaires à vendre
              </h2>
              <p className="text-sm text-slate-500">
                Cédez ou acquérez un cabinet équipé en Algérie
              </p>
            </div>
          </div>

          {clinics.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              Aucun cabinet à vendre pour le moment.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {clinics.map((item: ClinicListing & { clinic: { name: string } }) => (
                <Card
                  key={item.id}
                  className="overflow-hidden transition-all hover:shadow-md"
                >
                  {item.photos.length > 0 ? (
                    <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.photos[0]}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute right-2 top-2">
                        <Badge variant="warning">À vendre</Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-40 items-center justify-center bg-slate-100">
                      <ImageIcon className="h-10 w-10 text-slate-300" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-slate-900 line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                      {item.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-primary">
                        {formatDA(item.price)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="h-3 w-3" />
                        {item.city || "N/A"}
                      </span>
                    </div>
                    <Link
                      href={`/carrieres/clinics/${item.id}`}
                      className="mt-3 block text-center rounded-lg bg-slate-100 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
                    >
                      Voir détails
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* ── EQUIPMENT FOR SALE ── */}
        <section>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
              <Wrench className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Matériel dentaire
              </h2>
              <p className="text-sm text-slate-500">
                Équipements, fauteuils, instruments et plus
              </p>
            </div>
          </div>

          {equipment.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              Aucun matériel en vente pour le moment.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {equipment.map((item: EquipmentListing & { clinic: { name: string } }) => (
                <Card
                  key={item.id}
                  className="overflow-hidden transition-all hover:shadow-md"
                >
                  {item.photos.length > 0 ? (
                    <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.photos[0]}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute right-2 top-2">
                        <Badge variant="success">En vente</Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-40 items-center justify-center bg-slate-100">
                      <ImageIcon className="h-10 w-10 text-slate-300" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-slate-900 line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                      {item.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      {item.brand && (
                        <span className="text-xs text-slate-500">
                          {item.brand}
                        </span>
                      )}
                      {item.condition && (
                        <Badge variant="default" className="text-[10px]">
                          {item.condition}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-primary">
                        {formatDA(item.price)}
                      </span>
                    </div>
                    <Link
                      href={`/carrieres/equipment/${item.id}`}
                      className="mt-3 block text-center rounded-lg bg-slate-100 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
                    >
                      Voir détails
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
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
