"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <h2 className="text-xl font-semibold text-slate-900">
        Une erreur est survenue
      </h2>
      <p className="text-sm text-slate-500">{error.message}</p>
      <Button onClick={reset}>Réessayer</Button>
    </div>
  );
}
