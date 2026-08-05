"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  MapPin,
  Building2,
  ArrowRight,
  Clock,
  GraduationCap,
  Stethoscope,
} from "lucide-react";

type PublicOffer = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  publishedAt: Date | null;
  closesAt: Date | null;
  clinic: {
    name: string;
    city: string | null;
    wilaya: string | null;
  };
  _count?: {
    applications: number;
  };
};

function isStageOffer(title: string) {
  return /stage|internship|stagiaire/i.test(title);
}

function formatRelativeDate(date: Date | null) {
  if (!date) return null;
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
  return new Date(date).toLocaleDateString("fr-DZ");
}

function OfferLocation({ offer }: { offer: PublicOffer }) {
  const city = offer.clinic.city;
  const wilaya = offer.clinic.wilaya;
  const location = offer.location;

  let display = "Localisation non précisée";
  if (location) {
    display = location;
  } else if (city && wilaya) {
    display = `${city}, ${wilaya}`;
  } else if (city) {
    display = city;
  } else if (wilaya) {
    display = wilaya;
  }

  return (
    <span className="flex items-center gap-1">
      <MapPin className="h-3.5 w-3.5" />
      {display}
    </span>
  );
}

interface JobOffersSectionProps {
  offers: PublicOffer[];
  variant?: "list" | "grid";
  limit?: number;
  showViewAll?: boolean;
  viewAllHref?: string;
  emptyMessage?: string;
}

export default function JobOffersSection({
  offers,
  variant = "list",
  limit,
  showViewAll = false,
  viewAllHref = "/carrieres",
  emptyMessage = "Aucune offre pour le moment.",
}: JobOffersSectionProps) {
  const displayedOffers = limit ? offers.slice(0, limit) : offers;

  if (offers.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 py-12 text-center">
        <Briefcase className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-3 text-sm text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {variant === "list" ? (
        <div className="grid gap-4">
          {displayedOffers.map((offer) => {
            const isStage = isStageOffer(offer.title);
            const published = formatRelativeDate(offer.publishedAt);

            return (
              <Card
                key={offer.id}
                className="group overflow-hidden transition-all hover:border-primary-200 hover:shadow-md"
              >
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-900">
                        {offer.title}
                      </h3>
                      <Badge
                        variant={isStage ? "info" : "success"}
                        className="text-[10px]"
                      >
                        {isStage ? (
                          <>
                            <GraduationCap className="mr-1 h-3 w-3" />
                            Stage
                          </>
                        ) : (
                          <>
                            <Stethoscope className="mr-1 h-3 w-3" />
                            Emploi
                          </>
                        )}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {offer.clinic.name}
                      </span>
                      <OfferLocation offer={offer} />
                      {published && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {published}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                      {offer.description}
                    </p>
                  </div>
                  <Link href={`/carrieres/${offer.id}`} className="shrink-0">
                    <Button
                      size="sm"
                      className="w-full bg-primary hover:bg-primary-800 sm:w-auto"
                    >
                      Voir
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayedOffers.map((offer) => {
            const isStage = isStageOffer(offer.title);
            const published = formatRelativeDate(offer.publishedAt);

            return (
              <Card
                key={offer.id}
                className="group flex flex-col transition-all hover:border-primary-200 hover:shadow-md"
              >
                <CardContent className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-base font-semibold text-slate-900">
                      {offer.title}
                    </h3>
                    <Badge
                      variant={isStage ? "info" : "success"}
                      className="shrink-0 text-[10px]"
                    >
                      {isStage ? "Stage" : "Emploi"}
                    </Badge>
                  </div>
                  <div className="mt-3 space-y-1.5 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      {offer.clinic.name}
                    </span>
                    <OfferLocation offer={offer} />
                    {published && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {published}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                    {offer.description}
                  </p>
                  <div className="mt-auto pt-4">
                    <Link href={`/carrieres/${offer.id}`}>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full border border-primary text-primary hover:bg-primary-50"
                      >
                        Voir l&apos;offre
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {showViewAll && (
        <div className="flex justify-center pt-4">
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-700"
          >
            Voir toutes les offres
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
