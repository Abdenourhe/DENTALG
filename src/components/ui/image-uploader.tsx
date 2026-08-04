"use client";

import { useState, useCallback } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export default function ImageUploader({
  photos,
  onChange,
  maxPhotos = 5,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const remainingSlots = maxPhotos - photos.length;
      if (remainingSlots <= 0) {
        setError(`Maximum ${maxPhotos} photos.`);
        return;
      }

      const filesToUpload = Array.from(files).slice(0, remainingSlots);
      setUploading(true);
      setError(null);

      const uploadedUrls: string[] = [];

      for (const file of filesToUpload) {
        if (!file.type.startsWith("image/")) {
          setError("Seules les images sont acceptées.");
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          setError("Image trop grande (max 5 Mo).");
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (data.url) {
            uploadedUrls.push(data.url);
          } else {
            setError(data.error || "Erreur d'upload.");
          }
        } catch {
          setError("Erreur réseau lors de l'upload.");
        }
      }

      if (uploadedUrls.length > 0) {
        onChange([...photos, ...uploadedUrls]);
      }
      setUploading(false);
    },
    [photos, onChange, maxPhotos]
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

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Preview grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((url, i) => (
            <div key={`${url}-${i}`} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {photos.length < maxPhotos && (
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
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
            disabled={uploading}
          />
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="mt-2 text-xs text-slate-500">Upload en cours…</span>
            </>
          ) : (
            <>
              <Upload className="h-6 w-6 text-slate-400" />
              <span className="mt-2 text-xs font-medium text-slate-600">
                Glissez-déposez ou cliquez pour ajouter
              </span>
              <span className="text-[10px] text-slate-400">
                JPG, PNG — max 5 Mo ({photos.length}/{maxPhotos})
              </span>
            </>
          )}
        </label>
      )}

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {/* Hidden input for form submission */}
      <input type="hidden" name="photos" value={photos.join("\n")} />
    </div>
  );
}
