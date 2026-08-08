"use client";

import { useState, useCallback } from "react";
import { Upload, X, Loader2 } from "lucide-react";

interface LogoUploaderProps {
  logoUrl: string | null;
  onChange: (logoUrl: string | null) => void;
}

export default function LogoUploader({ logoUrl, onChange }: LogoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const file = files[0];
      setUploading(true);
      setError(null);

      if (!file.type.startsWith("image/")) {
        setError("Seules les images sont acceptées.");
        setUploading(false);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image trop grande (max 5 Mo).");
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "dentalg/logos");

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.url) {
          onChange(data.url);
        } else {
          setError(data.error || "Erreur d'upload.");
        }
      } catch {
        setError("Erreur réseau lors de l'upload.");
      } finally {
        setUploading(false);
      }
    },
    [onChange],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleUpload(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      {logoUrl ? (
        <div className="relative inline-flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt="Logo du cabinet"
            className="h-20 w-20 rounded-lg object-contain"
          />
          <div>
            <p className="text-sm font-medium text-slate-900">Logo actuel</p>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
            >
              <X className="h-3 w-3" />
              Supprimer le logo
            </button>
          </div>
        </div>
      ) : (
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-slate-300 bg-slate-50 hover:bg-slate-100"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
            disabled={uploading}
          />
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="mt-2 text-xs text-slate-500">
                Upload en cours…
              </span>
            </>
          ) : (
            <>
              <Upload className="h-6 w-6 text-slate-400" />
              <span className="mt-2 text-xs font-medium text-slate-600">
                Glissez-déposez ou cliquez pour ajouter un logo
              </span>
              <span className="text-[10px] text-slate-400">
                JPG, PNG — max 5 Mo
              </span>
            </>
          )}
        </label>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
