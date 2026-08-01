import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicJobOffer, applyToJob } from "@/lib/actions/job-offers";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/textarea";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function JobOfferDetailPage({ params }: Props) {
  const { id } = await params;
  const offer = await getPublicJobOffer(id);
  if (!offer) notFound();

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/carrieres" className="text-xl font-bold text-slate-900">
            DENTALG
          </Link>
          <Link href="/carrieres" className="text-sm text-slate-700 hover:underline">
            ← Retour aux offres
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-12">
        <Card>
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold text-slate-900">{offer.title}</h1>
            <p className="mt-1 text-slate-600">
              {offer.clinic.name} — {offer.clinic.city}, {offer.clinic.wilaya}
            </p>
            <div className="mt-4 whitespace-pre-wrap text-sm text-slate-700">
              {offer.description}
            </div>
            {offer.requirements && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-slate-900">Prérequis</h3>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                  {offer.requirements}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Postuler</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={async (formData: FormData) => {
                "use server";
                const data = Object.fromEntries(formData.entries());
                await applyToJob(data);
              }}
              className="space-y-4"
            >
              <input type="hidden" name="jobOfferId" value={offer.id} />
              <div className="grid grid-cols-2 gap-4">
                <Input name="firstName" label="Prénom *" required />
                <Input name="lastName" label="Nom *" required />
              </div>
              <Input name="email" label="Email *" type="email" required />
              <Input name="phone" label="Téléphone" />
              <TextArea name="coverLetter" label="Lettre de motivation" rows={4} />
              <div className="flex justify-end">
                <Button type="submit">Envoyer ma candidature</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
