"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LogoUploader from "@/components/ui/logo-uploader";
import { updateClinicFromForm } from "../../../actions";
import { Plan } from "@prisma/client";
import { Building2, Contact, ImageIcon, Save, Settings, X } from "lucide-react";

interface ClinicEditFormProps {
  clinic: {
    id: string;
    name: string;
    slug: string;
    email: string;
    phone: string | null;
    address: string | null;
    city: string | null;
    wilaya: string | null;
    plan: Plan;
    isActive: boolean;
    logoUrl: string | null;
  };
}

const planOptions = [
  { value: "FREE", label: "Gratuit" },
  { value: "ESSENTIEL", label: "Essentiel" },
  { value: "PRO", label: "Pro" },
  { value: "PREMIUM", label: "Premium" },
];

export default function ClinicEditForm({ clinic }: ClinicEditFormProps) {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState<string | null>(clinic.logoUrl);
  const [isActive, setIsActive] = useState(clinic.isActive);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    formData.set("clinicId", clinic.id);
    formData.set("logoUrl", logoUrl || "");
    formData.set("isActive", isActive ? "on" : "");
    await updateClinicFromForm(formData);
    setIsSubmitting(false);
    router.push(`/superadmin/clinics/${clinic.id}`);
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Identité visuelle */}
        <Card className="lg:col-span-1">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <ImageIcon className="h-4 w-4 text-violet-600" />
              Identité visuelle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div className="flex justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={clinic.name}
                  className="h-24 w-24 rounded-lg border border-slate-200 bg-white object-contain p-2 shadow-sm"
                />
              ) : (
                <div className="flex h-24 w-24 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white">
                  <Building2 className="h-10 w-10 text-slate-300" />
                  <span className="mt-1 text-[10px] text-slate-400">
                    Aucun logo
                  </span>
                </div>
              )}
            </div>
            <LogoUploader logoUrl={logoUrl} onChange={setLogoUrl} />
            <p className="text-xs leading-relaxed text-slate-500">
              Ce logo sera affiché dans le profil public du cabinet, les
              ordonnances, les factures et l’interface des utilisateurs.
            </p>
          </CardContent>
        </Card>

        {/* Informations générales */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Building2 className="h-4 w-4 text-blue-600" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                name="name"
                label="Nom du cabinet"
                defaultValue={clinic.name}
                required
              />
              <Input
                label="Slug"
                defaultValue={clinic.slug}
                disabled
                className="bg-slate-50"
              />
              <Input
                name="email"
                type="email"
                label="Email"
                defaultValue={clinic.email}
                required
              />
              <Input
                name="phone"
                label="Téléphone"
                defaultValue={clinic.phone ?? ""}
              />
              <Input
                name="address"
                label="Adresse"
                defaultValue={clinic.address ?? ""}
                className="sm:col-span-2"
              />
              <Input
                name="city"
                label="Ville"
                defaultValue={clinic.city ?? ""}
              />
              <Input
                name="wilaya"
                label="Wilaya"
                defaultValue={clinic.wilaya ?? ""}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Forfait */}
        <Card>
          <CardHeader className="border-b px-5 py-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Contact className="h-4 w-4 text-emerald-600" />
              Forfait
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <Select
              name="plan"
              label="Forfait actuel"
              defaultValue={clinic.plan}
              options={planOptions}
            />
          </CardContent>
        </Card>

        {/* Statut */}
        <Card>
          <CardHeader className="border-b px-5 py-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Settings className="h-4 w-4 text-amber-600" />
              Paramètres
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Cabinet actif
                </p>
                <p className="text-xs text-slate-500">
                  Un cabinet inactif ne peut plus se connecter à la plateforme.
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                label=""
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/superadmin/clinics/${clinic.id}`}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <X className="h-4 w-4" />
          Annuler
        </Link>
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          <Save className="h-4 w-4" />
          {isSubmitting ? "Enregistrement…" : "Enregistrer les modifications"}
        </Button>
      </div>
    </form>
  );
}
