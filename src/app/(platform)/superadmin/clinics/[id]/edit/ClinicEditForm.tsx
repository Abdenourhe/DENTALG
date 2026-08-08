"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import LogoUploader from "@/components/ui/logo-uploader";
import { updateClinicFromForm } from "../../../actions";
import { Plan } from "@prisma/client";

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

export default function ClinicEditForm({ clinic }: ClinicEditFormProps) {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState<string | null>(clinic.logoUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    formData.set("clinicId", clinic.id);
    formData.set("logoUrl", logoUrl || "");
    await updateClinicFromForm(formData);
    setIsSubmitting(false);
    router.push(`/superadmin/clinics/${clinic.id}`);
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Nom du cabinet
          </label>
          <input
            name="name"
            defaultValue={clinic.name}
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Slug</label>
          <input
            defaultValue={clinic.slug}
            disabled
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            name="email"
            type="email"
            defaultValue={clinic.email}
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Téléphone
          </label>
          <input
            name="phone"
            defaultValue={clinic.phone ?? ""}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium text-slate-700">Adresse</label>
          <input
            name="address"
            defaultValue={clinic.address ?? ""}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Ville</label>
          <input
            name="city"
            defaultValue={clinic.city ?? ""}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Wilaya</label>
          <input
            name="wilaya"
            defaultValue={clinic.wilaya ?? ""}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Forfait</label>
          <select
            name="plan"
            defaultValue={clinic.plan}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="FREE">Gratuit</option>
            <option value="ESSENTIEL">Essentiel</option>
            <option value="PRO">Pro</option>
            <option value="PREMIUM">Premium</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={clinic.isActive}
            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
          />
          <label className="text-sm font-medium text-slate-700">
            Cabinet actif
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Logo du cabinet
        </label>
        <LogoUploader logoUrl={logoUrl} onChange={setLogoUrl} />
        <p className="text-xs text-slate-500">
          Ce logo sera affiché sur le profil public du cabinet, les rapports,
          les ordonnances et les factures.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement…" : "Enregistrer les modifications"}
        </Button>
        <Link
          href={`/superadmin/clinics/${clinic.id}`}
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}
