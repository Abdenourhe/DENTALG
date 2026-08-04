"use client";

import { useState } from "react";
import Link from "next/link";
import { createClinicRequest } from "@/app/(platform)/superadmin/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Store,
  ArrowLeft,
  Send,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export function RequestClinicForm() {
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);

  async function handleSubmit(formData: FormData) {
    setStatus("submitting");
    setErrors(null);

    const data = Object.fromEntries(formData.entries());
    const result = await createClinicRequest(data);

    if (result.ok) {
      setStatus("success");
    } else {
      setStatus("error");
      setErrors(
        "errors" in result ? (result.errors as Record<string, string[]>) : null,
      );
    }
  }

  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-xl space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Demande envoyée !
          </h1>
          <p className="text-slate-500">
            Votre demande de création de cabinet a été transmise à
            l&apos;administrateur de la plateforme. Vous recevrez un email dès
            qu&apos;elle sera approuvée.
          </p>
          <div className="flex justify-center gap-3 pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;accueil
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            Demander un cabinet
          </h1>
          <p className="mt-2 text-slate-500">
            Remplissez ce formulaire pour demander la création de votre cabinet
            dentaire sur DENTALG.
          </p>
        </div>

        <Card>
          <CardHeader className="border-b px-6 py-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Store className="h-5 w-5 text-blue-600" />
              Informations du cabinet
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {status === "error" && (
              <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="h-4 w-4" />
                  Erreur lors de l&apos;envoi
                </div>
                {errors &&
                  Object.entries(errors).map(([field, msgs]) => (
                    <p key={field} className="mt-1">
                      <strong>{field}:</strong> {msgs.join(", ")}
                    </p>
                  ))}
              </div>
            )}

            <form action={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Nom du cabinet *
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Slug * (identifiant URL)
                  </label>
                  <input
                    name="slug"
                    type="text"
                    required
                    placeholder="mon-cabinet"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Email *
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Téléphone
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Adresse
                  </label>
                  <input
                    name="address"
                    type="text"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Ville
                  </label>
                  <input
                    name="city"
                    type="text"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Wilaya
                  </label>
                  <input
                    name="wilaya"
                    type="text"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  Propriétaire du cabinet
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Prénom *
                    </label>
                    <input
                      name="ownerFirstName"
                      type="text"
                      required
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Nom *
                    </label>
                    <input
                      name="ownerLastName"
                      type="text"
                      required
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Email propriétaire *
                    </label>
                    <input
                      name="ownerEmail"
                      type="email"
                      required
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Mot de passe * (min. 6 caractères)
                    </label>
                    <input
                      name="ownerPassword"
                      type="password"
                      required
                      minLength={6}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={status === "submitting"}
                className="w-full"
              >
                <Send className="mr-2 h-4 w-4" />
                {status === "submitting"
                  ? "Envoi en cours..."
                  : "Envoyer la demande"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
