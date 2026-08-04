import Link from "next/link";
import {
  listPublicClinicListings,
  listPublicEquipmentListings,
} from "@/lib/actions/carrieres-listings";
import { listPublicJobOffers } from "@/lib/actions/job-offers";
import {
  Briefcase,
  MapPin,
  ArrowRight,
  Store,
  Wrench,
  GraduationCap,
  Stethoscope,
  ImageIcon,
  Building2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { JobOffer, ClinicListing, EquipmentListing } from "@prisma/client";

function formatDA(cents: number) {
  if (cents === 0) return "Prix sur demande";
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency: "DZD",
  }).format(cents / 100);
}

export default async function CareersPreviewSection() {
  const [offers, clinics, equipment] = await Promise.all([
    listPublicJobOffers(),
    listPublicClinicListings(),
    listPublicEquipmentListings(),
  ]);

  const latestOffers = offers.slice(0, 3);
  const latestClinics = clinics.slice(0, 2);
  const latestEquipment = equipment.slice(0, 2);

  const stageCount = offers.filter((o: JobOffer) =>
    /stage|internship|stagiaire/i.test(o.title),
  ).length;
  const emploiCount = offers.length - stageCount;

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Carrières & Annonces
          </h2>
          <p className="mt-2 text-slate-500">
            Offres d&apos;emploi, cabinets à vendre et matériel dentaire en Algérie.
          </p>
        </div>
        <Link
          href="/carrieres"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-700"
        >
          Voir toutes les annonces
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-6 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-sm text-blue-700">
          <Stethoscope className="h-4 w-4" />
          {emploiCount} emploi{emploiCount > 1 ? "s" : ""}
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-1.5 text-sm text-purple-700">
          <GraduationCap className="h-4 w-4" />
          {stageCount} stage{stageCount > 1 ? "s" : ""}
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-sm text-amber-700">
          <Store className="h-4 w-4" />
          {clinics.length} cabinet{clinics.length > 1 ? "s" : ""} à vendre
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700">
          <Wrench className="h-4 w-4" />
          {equipment.length} matériel{equipment.length > 1 ? "s" : ""}
        </div>
      </div>

      {/* Grid */}
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {/* Job Offers Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
              <Briefcase className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Offres d&apos;emploi</h3>
          </div>

          {latestOffers.length === 0 ? (
            <p className="text-sm text-slate-400">Aucune offre pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {latestOffers.map((offer: JobOffer & { clinic: { name: string; city: string | null; wilaya: string | null } }) => {
                const isStage = /stage|internship|stagiaire/i.test(offer.title);
                return (
                  <Card key={offer.id} className="transition-shadow hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">
                            {offer.title}
                          </h4>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {offer.clinic.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {offer.clinic.city}
                            </span>
                          </div>
                        </div>
                        <Badge variant={isStage ? "info" : "success"} className="shrink-0 text-[10px]">
                          {isStage ? "Stage" : "Emploi"}
                        </Badge>
                      </div>
                      <Link
                        href={`/carrieres/${offer.id}`}
                        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        Voir l&apos;offre <ArrowRight className="h-3 w-3" />
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Clinics Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
              <Store className="h-4 w-4 text-amber-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Cabinets à vendre</h3>
          </div>

          {latestClinics.length === 0 ? (
            <p className="text-sm text-slate-400">Aucun cabinet à vendre.</p>
          ) : (
            <div className="space-y-3">
              {latestClinics.map((item: ClinicListing & { clinic: { name: string } }) => (
                <Card key={item.id} className="overflow-hidden transition-shadow hover:shadow-md">
                  {item.photos.length > 0 ? (
                    <div className="relative h-32 w-full overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.photos[0]}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute right-2 top-2">
                        <Badge variant="warning" className="text-[10px]">À vendre</Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-32 items-center justify-center bg-slate-100">
                      <ImageIcon className="h-8 w-8 text-slate-300" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                      {item.description}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-bold text-primary">
                        {formatDA(item.price)}
                      </span>
                      <Link
                        href={`/carrieres/clinics/${item.id}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Voir détails
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Equipment Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
              <Wrench className="h-4 w-4 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Matériel dentaire</h3>
          </div>

          {latestEquipment.length === 0 ? (
            <p className="text-sm text-slate-400">Aucun matériel en vente.</p>
          ) : (
            <div className="space-y-3">
              {latestEquipment.map((item: EquipmentListing & { clinic: { name: string } }) => (
                <Card key={item.id} className="overflow-hidden transition-shadow hover:shadow-md">
                  {item.photos.length > 0 ? (
                    <div className="relative h-32 w-full overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.photos[0]}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute right-2 top-2">
                        <Badge variant="success" className="text-[10px]">En vente</Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-32 items-center justify-center bg-slate-100">
                      <ImageIcon className="h-8 w-8 text-slate-300" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">
                      {item.title}
                    </h4>
                    {item.brand && (
                      <p className="mt-1 text-xs text-slate-500">{item.brand}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-bold text-primary">
                        {formatDA(item.price)}
                      </span>
                      <Link
                        href={`/carrieres/equipment/${item.id}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Voir détails
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
