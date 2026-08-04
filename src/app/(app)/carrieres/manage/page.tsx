import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Plus,
  ArrowLeft,
  Eye,
  Trash2,
  Users,
  Clock,
  CheckCircle2,
  Send,
  Globe,
  Store,
  Wrench,
} from "lucide-react";
import {
  listJobOffers,
  publishJobOffer,
  deleteJobOffer,
} from "../actions";
import {
  listClinicListings,
  createClinicListing,
  publishClinicListing,
  deleteClinicListing,
  listEquipmentListings,
  createEquipmentListing,
  publishEquipmentListing,
  deleteEquipmentListing,
} from "@/lib/actions/carrieres-listings";

function formatDA(cents: number) {
  if (cents === 0) return "Prix sur demande";
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency: "DZD",
  }).format(cents / 100);
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
            href={`/carrieres/manage?tab=${tab.id}`}
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

// ── Job Offers Section ──
async function JobsSection() {
  const offers = await listJobOffers();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Plus className="h-5 w-5 text-blue-600" />
            Nouvelle offre
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form
            action={async (formData: FormData) => {
              "use server";
              const data = Object.fromEntries(formData.entries());
              const { createJobOffer } = await import("../actions");
              await createJobOffer(data);
            }}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Titre *</label>
                <input name="title" type="text" required placeholder="Ex: Assistant(e) dentaire" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Lieu</label>
                <input name="location" type="text" placeholder="Ex: Alger" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Description *</label>
              <textarea name="description" rows={3} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <Button type="submit"><Plus className="mr-2 h-4 w-4" />Créer</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b px-6 py-4">
          <CardTitle className="text-base font-semibold">Mes offres ({offers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                <tr><th className="px-6 py-3">Titre</th><th className="px-6 py-3">Statut</th><th className="px-6 py-3 text-center">Candidatures</th><th className="px-6 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y">
                {offers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-900">{offer.title}</td>
                    <td className="px-6 py-4">
                      {offer.status === "PUBLISHED" ? (
                        <Badge variant="success"><CheckCircle2 className="mr-1 h-3 w-3" />Publiée</Badge>
                      ) : (
                        <Badge variant="warning"><Clock className="mr-1 h-3 w-3" />Brouillon</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center"><Users className="inline h-3.5 w-3.5" /> {offer._count.applications}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {offer.status !== "PUBLISHED" && (
                          <form action={async () => { "use server"; await publishJobOffer(offer.id); }}>
                            <button type="submit" className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200"><Send className="h-3 w-3" /></button>
                          </form>
                        )}
                        <Link href={`/carrieres/${offer.id}`} target="_blank"><button className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600 ring-1 ring-slate-200"><Eye className="h-3 w-3" /></button></Link>
                        <form action={async () => { "use server"; await deleteJobOffer(offer.id); }}>
                          <button type="submit" className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs text-red-700 ring-1 ring-red-200"><Trash2 className="h-3 w-3" /></button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
                {offers.length === 0 && <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">Aucune offre.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Clinic Listings Section ──
async function ClinicsSection() {
  const listings = await listClinicListings();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Plus className="h-5 w-5 text-amber-600" />
            Nouveau cabinet à vendre
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form
            action={async (formData: FormData) => {
              "use server";
              const data = Object.fromEntries(formData.entries());
              await createClinicListing(data);
            }}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Titre *</label>
                <input name="title" type="text" required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Prix (DA)</label>
                <input name="price" type="number" min="0" placeholder="0 = sur demande" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div><label className="mb-1.5 block text-sm font-medium text-slate-700">Ville</label><input name="city" type="text" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
              <div><label className="mb-1.5 block text-sm font-medium text-slate-700">Wilaya</label><input name="wilaya" type="text" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
              <div><label className="mb-1.5 block text-sm font-medium text-slate-700">Téléphone contact</label><input name="contactPhone" type="tel" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Description *</label>
              <textarea name="description" rows={3} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Photos (URLs, une par ligne)</label>
              <textarea name="photos" rows={3} placeholder="https://...&#10;https://..." className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <Button type="submit"><Plus className="mr-2 h-4 w-4" />Créer l&apos;annonce</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b px-6 py-4">
          <CardTitle className="text-base font-semibold">Mes cabinets ({listings.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                <tr><th className="px-6 py-3">Titre</th><th className="px-6 py-3">Prix</th><th className="px-6 py-3">Statut</th><th className="px-6 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y">
                {listings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-900">{item.title}</td>
                    <td className="px-6 py-4 text-sm">{formatDA(item.price)}</td>
                    <td className="px-6 py-4">
                      {item.status === "PUBLISHED" ? <Badge variant="success">Publié</Badge> : <Badge variant="warning">Brouillon</Badge>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {item.status !== "PUBLISHED" && (
                          <form action={async () => { "use server"; await publishClinicListing(item.id); }}>
                            <button type="submit" className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200"><Send className="h-3 w-3" /></button>
                          </form>
                        )}
                        <Link href={`/carrieres/clinics/${item.id}`} target="_blank"><button className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600 ring-1 ring-slate-200"><Eye className="h-3 w-3" /></button></Link>
                        <form action={async () => { "use server"; await deleteClinicListing(item.id); }}>
                          <button type="submit" className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs text-red-700 ring-1 ring-red-200"><Trash2 className="h-3 w-3" /></button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
                {listings.length === 0 && <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">Aucun cabinet à vendre.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Equipment Listings Section ──
async function EquipmentSection() {
  const listings = await listEquipmentListings();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Plus className="h-5 w-5 text-emerald-600" />
            Nouveau matériel
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form
            action={async (formData: FormData) => {
              "use server";
              const data = Object.fromEntries(formData.entries());
              await createEquipmentListing(data);
            }}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Titre *</label>
                <input name="title" type="text" required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Prix (DA)</label>
                <input name="price" type="number" min="0" placeholder="0 = sur demande" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div><label className="mb-1.5 block text-sm font-medium text-slate-700">Marque</label><input name="brand" type="text" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
              <div><label className="mb-1.5 block text-sm font-medium text-slate-700">État</label><input name="condition" type="text" placeholder="Neuf, Occasion..." className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
              <div><label className="mb-1.5 block text-sm font-medium text-slate-700">Téléphone contact</label><input name="contactPhone" type="tel" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Description *</label>
              <textarea name="description" rows={3} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Photos (URLs, une par ligne)</label>
              <textarea name="photos" rows={3} placeholder="https://...&#10;https://..." className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <Button type="submit"><Plus className="mr-2 h-4 w-4" />Créer l&apos;annonce</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b px-6 py-4">
          <CardTitle className="text-base font-semibold">Mon matériel ({listings.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                <tr><th className="px-6 py-3">Titre</th><th className="px-6 py-3">Prix</th><th className="px-6 py-3">Statut</th><th className="px-6 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y">
                {listings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-900">{item.title}</td>
                    <td className="px-6 py-4 text-sm">{formatDA(item.price)}</td>
                    <td className="px-6 py-4">
                      {item.status === "PUBLISHED" ? <Badge variant="success">Publié</Badge> : <Badge variant="warning">Brouillon</Badge>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {item.status !== "PUBLISHED" && (
                          <form action={async () => { "use server"; await publishEquipmentListing(item.id); }}>
                            <button type="submit" className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200"><Send className="h-3 w-3" /></button>
                          </form>
                        )}
                        <Link href={`/carrieres/equipment/${item.id}`} target="_blank"><button className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600 ring-1 ring-slate-200"><Eye className="h-3 w-3" /></button></Link>
                        <form action={async () => { "use server"; await deleteEquipmentListing(item.id); }}>
                          <button type="submit" className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs text-red-700 ring-1 ring-red-200"><Trash2 className="h-3 w-3" /></button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
                {listings.length === 0 && <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">Aucun matériel en vente.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Page ──
export default async function CarrieresManagePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.clinicId) notFound();

  const { tab = "jobs" } = await searchParams;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Gestion Carrières & Annonces
          </h1>
          <p className="mt-1 text-slate-500">
            Gérez vos offres d&apos;emploi, cabinets à vendre et matériel.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/carrieres"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Globe className="h-4 w-4" />
            Voir le site public
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </div>
      </div>

      <Tabs activeTab={tab} />

      {tab === "clinics" && <ClinicsSection />}
      {tab === "equipment" && <EquipmentSection />}
      {(tab === "jobs" || !tab) && <JobsSection />}
    </div>
  );
}
