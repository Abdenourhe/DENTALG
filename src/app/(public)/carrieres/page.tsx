import Link from "next/link";
import { listPublicJobOffers } from "@/lib/actions/job-offers";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function CarrieresPublicPage() {
  const offers = await listPublicJobOffers();

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-slate-900">
            DENTALG
          </Link>
          <div className="flex gap-4 text-sm">
            <Link href="/login" className="text-slate-700 hover:text-slate-900">
              Connexion pro
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Offres d&apos;emploi dentaire</h1>
          <p className="mt-2 text-lg text-slate-600">
            Stages, postes d&apos;assistant, associations et remplacements en Algérie.
          </p>
        </div>

        <div className="grid gap-4">
          {offers.map((offer) => (
            <Card key={offer.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {offer.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {offer.clinic.name} — {offer.clinic.city}, {offer.clinic.wilaya}
                    </p>
                  </div>
                  <Badge variant="info">
                    {offer._count.applications} candidature
                    {offer._count.applications > 1 ? "s" : ""}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-slate-700 line-clamp-2">
                  {offer.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Publiée le {offer.publishedAt?.toLocaleDateString("fr-FR")}
                  </span>
                  <Link
                    href={`/carrieres/${offer.id}`}
                    className="text-sm font-medium text-slate-900 hover:underline"
                  >
                    Postuler →
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
          {offers.length === 0 && (
            <p className="py-12 text-center text-slate-500">
              Aucune offre disponible pour le moment.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
