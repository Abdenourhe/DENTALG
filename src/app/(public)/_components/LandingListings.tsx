import Link from "next/link";
import { ArrowRight, Store } from "lucide-react";
import {
  listPublicClinicListings,
  listPublicEquipmentListings,
} from "@/lib/actions/carrieres-listings";
import ListingsGrid from "./ListingsGrid";

export default async function LandingListings() {
  const [clinicListings, equipmentListings] = await Promise.all([
    listPublicClinicListings(),
    listPublicEquipmentListings(),
  ]);

  const listings = [
    ...clinicListings.map((item) => ({ ...item, kind: "clinic" as const })),
    ...equipmentListings.map((item) => ({
      ...item,
      kind: "equipment" as const,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 3);

  if (listings.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-700 ring-1 ring-amber-100">
            <Store className="h-4 w-4" />
            Annonces entre professionnels
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
            Cabinets à vendre & matériel dentaire
          </h2>
          <p className="mt-2 max-w-2xl text-slate-500">
            Les cabinets partenaires vendent du matériel ou cèdent leur cabinet.
            Consultez les dernières annonces publiées.
          </p>
        </div>
        <Link
          href="/carrieres?tab=equipment"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-700"
        >
          Voir toutes les annonces
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-10">
        <ListingsGrid listings={listings} emptyMessage="" />
      </div>
    </section>
  );
}
