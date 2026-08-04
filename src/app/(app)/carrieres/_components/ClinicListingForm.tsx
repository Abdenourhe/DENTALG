"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import ImageUploader from "@/components/ui/image-uploader";
import { Plus } from "lucide-react";

export default function ClinicListingForm({
  createAction,
}: {
  createAction: (data: {
    title: string;
    description: string;
    price?: string;
    city?: string;
    wilaya?: string;
    contactPhone?: string;
    photos: string;
  }) => Promise<{ ok: boolean } | { ok: false; errors: Record<string, string[]> }>;
}) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      price: (formData.get("price") as string) || undefined,
      city: (formData.get("city") as string) || undefined,
      wilaya: (formData.get("wilaya") as string) || undefined,
      contactPhone: (formData.get("contactPhone") as string) || undefined,
      photos: photos.join("\n"),
    };

    startTransition(async () => {
      await createAction(data);
      setPhotos([]);
      (document.getElementById("clinic-form") as HTMLFormElement)?.reset();
    });
  }

  return (
    <form id="clinic-form" action={handleSubmit} className="space-y-4">
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
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Photos</label>
        <ImageUploader photos={photos} onChange={setPhotos} maxPhotos={5} />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Création…" : <><Plus className="mr-2 h-4 w-4" />Créer l&apos;annonce</>}
      </Button>
    </form>
  );
}
