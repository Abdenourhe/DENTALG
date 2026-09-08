import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Building2,
  ImageIcon,
  MapPin,
  Store,
  Wrench,
} from "lucide-react";

type BaseListing = {
  id: string;
  title: string;
  price: number;
  photos: string[];
  clinic: { name: string; city: string | null; wilaya: string | null };
};

type ClinicListing = BaseListing & {
  kind: "clinic";
  location: string | null;
};

type EquipmentListing = BaseListing & {
  kind: "equipment";
  condition: string | null;
};

type Listing = ClinicListing | EquipmentListing;

function formatDA(cents: number) {
  if (cents === 0) return "Prix sur demande";
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency: "DZD",
  }).format(cents / 100);
}

interface ListingsGridProps {
  listings: Listing[];
  emptyMessage: string;
}

export default function ListingsGrid({
  listings,
  emptyMessage,
}: ListingsGridProps) {
  if (listings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 py-12 text-center">
        <Store className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-3 text-sm text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((item) => {
        const href =
          item.kind === "clinic"
            ? `/carrieres/clinics/${item.id}`
            : `/carrieres/equipment/${item.id}`;
        const location =
          item.kind === "clinic"
            ? item.location ||
              [item.clinic.city, item.clinic.wilaya].filter(Boolean).join(", ")
            : item.condition;

        return (
          <Card
            key={item.id}
            className="group flex flex-col overflow-hidden transition-all hover:border-primary-200 hover:shadow-md"
          >
            <div className="relative aspect-[4/3] bg-slate-100">
              {item.photos[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.photos[0]}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-slate-300" />
                </div>
              )}
            </div>
            <CardContent className="flex flex-1 flex-col p-5">
              <h3 className="line-clamp-2 text-base font-semibold text-slate-900">
                {item.title}
              </h3>
              <p className="mt-1 text-lg font-bold text-primary">
                {formatDA(item.price)}
              </p>
              <div className="mt-2 space-y-1 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  {item.clinic.name}
                </span>
                {location && (
                  <span className="flex items-center gap-1.5">
                    {item.kind === "clinic" ? (
                      <MapPin className="h-3.5 w-3.5" />
                    ) : (
                      <Wrench className="h-3.5 w-3.5" />
                    )}
                    {location}
                  </span>
                )}
              </div>
              <div className="mt-auto pt-4">
                <Link href={href}>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full border border-primary text-primary hover:bg-primary-50"
                  >
                    Voir l&apos;annonce
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
