"use client";

import { useState, useRef } from "react";
import { applyToJob } from "@/lib/actions/job-offers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Upload, FileText, X, Loader2, CheckCircle2 } from "lucide-react";

interface ApplyFormProps {
  jobOfferId: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

export default function ApplyForm({ jobOfferId }: ApplyFormProps) {
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState(false);
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [cvName, setCvName] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function uploadCv(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        cv: ["Format accepté : PDF, JPG, JPEG ou PNG."],
      }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({
        ...prev,
        cv: ["Fichier trop volumineux (max 5 Mo)."],
      }));
      return;
    }

    setUploading(true);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.cv;
      return next;
    });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "dentalg/cvs");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.url) {
        setCvUrl(data.url);
        setCvName(file.name);
      } else {
        setErrors((prev) => ({
          ...prev,
          cv: [data.error || "Erreur lors de l'upload du CV."],
        }));
      }
    } catch {
      setErrors((prev) => ({
        ...prev,
        cv: ["Erreur réseau lors de l'upload."],
      }));
    } finally {
      setUploading(false);
    }
  }

  function removeCv() {
    setCvUrl(null);
    setCvName(null);
  }

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setErrors({});
    setSuccess(false);

    const data = Object.fromEntries(formData.entries());
    const res = await applyToJob({
      ...data,
      cvUrl: cvUrl || "",
    });

    setPending(false);

    if (!res.ok) {
      setErrors(res.errors as Record<string, string[]>);
      return;
    }

    setSuccess(true);
    setCvUrl(null);
    setCvName(null);
    formRef.current?.reset();
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="space-y-4"
      onSubmit={(e) => {
        if (pending || uploading) e.preventDefault();
      }}
    >
      <input type="hidden" name="jobOfferId" value={jobOfferId} />

      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Candidature envoyée avec succès.
        </div>
      )}

      {errors.global && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {errors.global[0]}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input
          name="firstName"
          label="Prénom *"
          required
          error={errors.firstName?.[0]}
        />
        <Input
          name="lastName"
          label="Nom *"
          required
          error={errors.lastName?.[0]}
        />
      </div>

      <Input
        name="email"
        label="Email *"
        type="email"
        required
        error={errors.email?.[0]}
      />
      <Input name="phone" label="Téléphone" error={errors.phone?.[0]} />

      {/* CV upload */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          CV (PDF, JPG ou PNG)
        </label>
        {!cvUrl ? (
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition-colors hover:border-primary hover:bg-primary-50/50">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadCv(file);
              }}
              disabled={uploading}
            />
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
            ) : (
              <Upload className="h-6 w-6 text-slate-400" />
            )}
            <p className="mt-2 text-xs text-slate-600">
              {uploading
                ? "Upload en cours..."
                : "Cliquez pour déposer votre CV"}
            </p>
            <p className="text-[10px] text-slate-400">Max 5 Mo</p>
          </label>
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <FileText className="h-4 w-4 shrink-0 text-primary-600" />
              <span className="truncate text-xs text-slate-700">{cvName}</span>
            </div>
            <button
              type="button"
              onClick={removeCv}
              className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {errors.cv?.[0] && (
          <p className="mt-1 text-xs text-red-600">{errors.cv[0]}</p>
        )}
      </div>

      {/* Cover letter */}
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
        {errors.coverLetter?.[0] && (
          <p className="mt-1 text-xs text-red-600">{errors.coverLetter[0]}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={pending || uploading}>
        {pending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Send className="mr-2 h-4 w-4" />
        )}
        {pending ? "Envoi en cours..." : "Envoyer ma candidature"}
      </Button>
    </form>
  );
}
