import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Plus,
  ArrowLeft,
  Eye,
  Pencil,
  Trash2,
  Users,
  Clock,
  CheckCircle2,
  Send,
  Globe,
} from "lucide-react";
import {
  listJobOffers,
  createJobOffer,
  publishJobOffer,
  deleteJobOffer,
} from "../actions";

export default async function CarrieresManagePage() {
  const session = await auth();
  if (!session?.user?.clinicId) notFound();

  const offers = await listJobOffers();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Mes offres d&apos;emploi
          </h1>
          <p className="mt-1 text-slate-500">
            Gérez vos offres de stage et d&apos;emploi dentaire.
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

      {/* Create form */}
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
              await createJobOffer(data);
            }}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Titre *
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="Ex: Assistant(e) dentaire — Alger Centre"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Lieu
                </label>
                <input
                  name="location"
                  type="text"
                  placeholder="Ex: Alger, Bab Ezzouar"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Description *
              </label>
              <textarea
                name="description"
                rows={3}
                required
                placeholder="Décrivez le poste, les missions, le profil recherché..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Prérequis
              </label>
              <textarea
                name="requirements"
                rows={2}
                placeholder="Diplôme, expérience, compétences requises..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Date de clôture
                </label>
                <input
                  name="closesAt"
                  type="date"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
            <Button type="submit">
              <Plus className="mr-2 h-4 w-4" />
              Créer l&apos;offre
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Offers list */}
      <Card>
        <CardHeader className="border-b px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Briefcase className="h-5 w-5 text-blue-600" />
            Offres publiées ({offers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Titre</th>
                  <th className="px-6 py-3">Statut</th>
                  <th className="px-6 py-3 text-center">Candidatures</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {offers.map((offer) => (
                  <tr
                    key={offer.id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {offer.title}
                      </p>
                      {offer.location && (
                        <p className="text-xs text-slate-500">
                          {offer.location}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {offer.status === "PUBLISHED" ? (
                        <Badge variant="success">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Publiée
                        </Badge>
                      ) : (
                        <Badge variant="warning">
                          <Clock className="mr-1 h-3 w-3" />
                          Brouillon
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <Users className="h-3.5 w-3.5" />
                        {offer._count.applications}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {offer.publishedAt
                        ? new Date(offer.publishedAt).toLocaleDateString(
                            "fr-FR",
                          )
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {offer.status !== "PUBLISHED" && (
                          <form
                            action={async () => {
                              "use server";
                              await publishJobOffer(offer.id);
                            }}
                          >
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 transition-colors hover:bg-emerald-100"
                            >
                              <Send className="h-3 w-3" />
                              Publier
                            </button>
                          </form>
                        )}
                        <Link href={`/carrieres/${offer.id}`} target="_blank">
                          <button className="inline-flex items-center rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 transition-colors hover:bg-slate-100">
                            <Eye className="h-3 w-3" />
                          </button>
                        </Link>
                        <form
                          action={async () => {
                            "use server";
                            await deleteJobOffer(offer.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="inline-flex items-center rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 ring-1 ring-red-200 transition-colors hover:bg-red-100"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
                {offers.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      <Briefcase className="mx-auto h-10 w-10 text-slate-300" />
                      <p className="mt-3 text-sm font-medium">
                        Aucune offre créée.
                      </p>
                      <p className="text-xs text-slate-400">
                        Utilisez le formulaire ci-dessus pour publier votre
                        première offre.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
