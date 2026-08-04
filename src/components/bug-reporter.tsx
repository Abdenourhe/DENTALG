"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Bug,
  X,
  Send,
  AlertTriangle,
  Lightbulb,
  MessageCircle,
  HelpCircle,
} from "lucide-react";
import { TicketType } from "@prisma/client";

const typeConfig: Record<
  TicketType,
  { label: string; icon: typeof Bug; color: string }
> = {
  BUG: { label: "Bug", icon: AlertTriangle, color: "text-red-600" },
  COMMENT: {
    label: "Commentaire",
    icon: MessageCircle,
    color: "text-blue-600",
  },
  FEATURE_REQUEST: {
    label: "Nouvelle fonction",
    icon: Lightbulb,
    color: "text-amber-600",
  },
  SUGGESTION: {
    label: "Suggestion",
    icon: HelpCircle,
    color: "text-emerald-600",
  },
};

export function BugReporter() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Ne pas afficher pour les non-connectés ou les PLATFORM_ADMIN
  if (!session?.user || session.user.role === "PLATFORM_ADMIN") return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/support-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData)),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setIsOpen(false);
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition-all hover:scale-110 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        title="Signaler un problème"
      >
        <Bug className="h-6 w-6" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-end p-4 sm:items-center sm:justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                Signaler un problème
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {success ? (
              <div className="rounded-xl bg-emerald-50 p-4 text-center text-emerald-700">
                <p className="font-medium">Merci !</p>
                <p className="text-sm">
                  Votre signalement a été envoyé à l&apos;équipe.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(typeConfig) as TicketType[]).map((type) => {
                      const cfg = typeConfig[type];
                      const Icon = cfg.icon;
                      return (
                        <label
                          key={type}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50"
                        >
                          <input
                            type="radio"
                            name="type"
                            value={type}
                            defaultChecked={type === "BUG"}
                            className="sr-only"
                          />
                          <Icon className={`h-4 w-4 ${cfg.color}`} />
                          {cfg.label}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Sujet
                  </label>
                  <input
                    name="subject"
                    type="text"
                    required
                    placeholder="Résumé du problème"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    required
                    placeholder="Décrivez le problème en détail..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {loading ? "Envoi..." : "Envoyer"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
