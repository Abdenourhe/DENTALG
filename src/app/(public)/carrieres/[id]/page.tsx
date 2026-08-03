import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicJobOffer, applyToJob } from "@/lib/actions/job-offers";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  Mail,
  GraduationCap,
  Stethoscope,
  Send,
  CheckCircle2,
  Users,
} from "lucide-react";
import { formatDate } from "@/lib/date";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function JobOfferDetailPage({ params }: Props) {
  const { id } = await params;
  const offer = await getPublicJobOffer(id);
  if (!offer) notFound();

  const isStage = /stage|internship|stagiaire/i.test(offer.title);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="DENTALG" className="h-6 w-auto" />
          </Link>
          <Link
            href="/carrieres"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux offres
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        {/* Offer header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isStage ? "info" : "success"}>
              {isStage ? (
                <>
                  <GraduationCap className="mr-1 h-3 w-3" />
                  Stage
                </>
              ) : (
                <>
                  <Stethoscope className="mr-1 h-3 w-3" />
                  Emploi
                </>
              )}
            </Badge>
            {offer.closesAt && new Date(offer.closesAt) < new Date() && (
              <Badge variant="danger">Clôturée</Badge>
            )}
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {offer.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-slate-400" />
              <strong className="text-slate-700">{offer.clinic.name}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-slate-400" />
              {offer.clinic.city}, {offer.clinic.wilaya}
            </span>
            {offer.publishedAt && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-400" />
                Publiée le {formatDate(offer.publishedAt)}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Description du poste</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {offer.description}
                </div>
              </CardContent>
            </Card>

            {offer.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Prérequis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                    {offer.requirements}
                  </div>
                </CardContent>
              </Card>
            )}

            {offer.location && (
              <Card>
                <CardHeader>
                  <CardTitle>Lieu de travail</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="flex items-center gap-2 text-sm text-slate-700">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {offer.location}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Clinic info */}
            <Card>
              <CardHeader>
                <CardTitle>À propos du cabinet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm font-semibold text-slate-900">
                  {offer.clinic.name}
                </p>
                <p className="flex items-center gap-2 text-sm text-slate-500">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {offer.clinic.city}, {offer.clinic.wilaya}
                </p>
                <p className="flex items-center gap-2 text-sm text-slate-500">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {offer.clinic.email}
                </p>
              </CardContent>
            </Card>

            {/* Apply form */}
            <Card>
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
                  <div className="grid grid-cols-2 gap-3">
                    <Input name="firstName" label="Prénom *" required />
                    <Input name="lastName" label="Nom *" required />
                  </div>
                  <Input name="email" label="Email *" type="email" required />
                  <Input name="phone" label="Téléphone" />
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Lettre de motivation
                    </label>
                    <textarea
                      name="coverLetter"
                      rows={4}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Présentez-vous brièvement..."
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer ma candidature
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Tips */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Conseil
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Personnalisez votre lettre de motivation en mentionnant
                    pourquoi ce poste vous intéresse. Les cabinets apprécient
                    les candidatures personnalisées.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-3 px-6 sm:flex-row">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="DENTALG" className="h-5 w-auto" />
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} DENTALG
          </p>
        </div>
      </footer>
    </div>
  );
}
