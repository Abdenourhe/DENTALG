import { requirePlatformAdmin } from "@/lib/platform-auth";
import { listTestimonials } from "../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { MessageSquareQuote, Star, Eye, EyeOff, Trash2 } from "lucide-react";
import {
  toggleTestimonialVisibilityFromForm,
  deleteTestimonialFromForm,
} from "../actions";

export default async function SuperAdminTestimonialsPage() {
  await requirePlatformAdmin();
  const testimonials = await listTestimonials();

  const published = testimonials.filter((t) => t.isPublished).length;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Témoignages" }]} />

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Témoignages
        </h1>
        <p className="mt-1 text-slate-500">
          Validez les témoignages envoyés par les profils des cabinets avant
          leur affichage sur la page d&apos;accueil.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <MessageSquareQuote className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {testimonials.length}
              </p>
              <p className="text-xs text-slate-500">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <Eye className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{published}</p>
              <p className="text-xs text-slate-500">Publiés</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <EyeOff className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">
                {testimonials.length - published}
              </p>
              <p className="text-xs text-slate-500">Masqués</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b px-6 py-4">
          <CardTitle className="text-base font-semibold">
            Tous les témoignages ({testimonials.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y p-0">
          {testimonials.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">
              Aucun témoignage envoyé pour le moment.
            </p>
          ) : (
            testimonials.map((t) => (
              <div
                key={t.id}
                className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">
                      {t.authorName}
                    </p>
                    <span className="text-xs text-slate-400">
                      {t.authorRole}
                      {t.city ? ` · ${t.city}` : ""}
                    </span>
                    <span className="text-xs text-slate-400">
                      · {t.clinic.name}
                    </span>
                  </div>
                  <div className="mt-1 flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    Envoyé le{" "}
                    {new Date(t.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {t.isPublished ? (
                    <Badge variant="success">Publié</Badge>
                  ) : (
                    <Badge variant="warning">En attente</Badge>
                  )}
                  <form action={toggleTestimonialVisibilityFromForm}>
                    <input type="hidden" name="id" value={t.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-100"
                    >
                      {t.isPublished ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5" />
                          Masquer
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5" />
                          Publier
                        </>
                      )}
                    </button>
                  </form>
                  <form action={deleteTestimonialFromForm}>
                    <input type="hidden" name="id" value={t.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 ring-1 ring-red-200 transition-colors hover:bg-red-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Supprimer
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
