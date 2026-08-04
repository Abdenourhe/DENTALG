import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicEquipmentListing } from "@/lib/actions/carrieres-listings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Phone,
  Mail,
  Wrench,
  ImageIcon,
  Tag,
  Box,
} from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

function formatDA(cents: number) {
  if (cents === 0) return "Prix sur demande";
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency: "DZD",
  }).format(cents / 100);
}

export default async function EquipmentListingDetailPage({ params }: Props) {
  const { id } = await params;
  const item = await getPublicEquipmentListing(id);
  if (!item) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
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
            Retour aux annonces
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Badge variant="success">
            <Wrench className="mr-1 h-3 w-3" />
            Matériel dentaire
          </Badge>
          {item.condition && (
            <Badge variant="default">{item.condition}</Badge>
          )}
        </div>

        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          {item.title}
        </h1>
        <p className="mt-1 text-xl font-semibold text-primary">
          {formatDA(item.price)}
        </p>

        {/* Photos */}
        {item.photos.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {item.photos.map((photo, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo}
                  alt={`Photo ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 flex h-48 items-center justify-center rounded-xl bg-slate-100">
            <ImageIcon className="h-12 w-12 text-slate-300" />
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {item.description}
                </div>
              </CardContent>
            </Card>

            {item.brand && (
              <Card>
                <CardHeader>
                  <CardTitle>Marque</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="flex items-center gap-2 text-sm text-slate-700">
                    <Box className="h-4 w-4 text-slate-400" />
                    {item.brand}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm font-semibold text-slate-900">
                  {item.clinic.name}
                </p>
                {item.contactPhone && (
                  <p className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400" />
                    {item.contactPhone}
                  </p>
                )}
                {item.contactEmail && (
                  <p className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {item.contactEmail}
                  </p>
                )}
                {!item.contactPhone && !item.contactEmail && item.clinic.phone && (
                  <p className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400" />
                    {item.clinic.phone}
                  </p>
                )}
                {!item.contactPhone && !item.contactEmail && !item.clinic.phone && item.clinic.email && (
                  <p className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {item.clinic.email}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
