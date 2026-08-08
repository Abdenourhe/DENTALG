import Link from "next/link";
import { createPlatformMessage, listPlatformMessages } from "../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Megaphone,
  ArrowLeft,
  AlertTriangle,
  Wrench,
  Info,
  RefreshCw,
  Send,
  Users,
} from "lucide-react";
import { PlatformMessageType, Role } from "@prisma/client";

const typeConfig: Record<
  PlatformMessageType,
  { label: string; icon: typeof Info; color: string; badge: string }
> = {
  ANNOUNCEMENT: {
    label: "Annonce",
    icon: Megaphone,
    color: "text-blue-600",
    badge: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  ALERT: {
    label: "Alerte",
    icon: AlertTriangle,
    color: "text-red-600",
    badge: "bg-red-50 text-red-700 ring-red-200",
  },
  MAINTENANCE: {
    label: "Maintenance",
    icon: Wrench,
    color: "text-amber-600",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  UPDATE: {
    label: "Mise à jour",
    icon: RefreshCw,
    color: "text-emerald-600",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
};

const roleOptions = [
  { value: "", label: "Tous les rôles" },
  { value: Role.OWNER, label: "Propriétaires" },
  { value: Role.DENTIST, label: "Dentistes" },
  { value: Role.ASSISTANT, label: "Assistants" },
  { value: Role.SECRETARY, label: "Secrétaires" },
];

export default async function MessagesPage() {
  const messages = await listPlatformMessages();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Messagerie plateforme
          </h1>
          <p className="mt-1 text-slate-500">
            Envoyez des messages aux cabinets et utilisateurs.
          </p>
        </div>
        <Link
          href="/superadmin"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Send form */}
        <Card className="lg:col-span-1">
          <CardHeader className="border-b px-6 py-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Send className="h-5 w-5 text-blue-600" />
              Nouveau message
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form
              action={async (formData: FormData) => {
                "use server";
                const data = Object.fromEntries(formData.entries());
                await createPlatformMessage({
                  ...data,
                  isBroadcast: data.isBroadcast === "on",
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Type
                </label>
                <select
                  name="type"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {Object.entries(typeConfig).map(([key, cfg]) => (
                    <option key={key} value={key}>
                      {cfg.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Titre
                </label>
                <input
                  name="title"
                  type="text"
                  placeholder="Titre du message"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Contenu
                </label>
                <textarea
                  name="content"
                  rows={5}
                  placeholder="Contenu du message..."
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Cibler un rôle
                </label>
                <select
                  name="targetRole"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {roleOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                <input
                  type="checkbox"
                  name="isBroadcast"
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span className="text-sm text-slate-700">
                  Message broadcast (tous les cabinets)
                </span>
              </label>

              <Button type="submit" className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Envoyer
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Messages list */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b px-6 py-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Megaphone className="h-5 w-5 text-purple-600" />
              Messages envoyés ({messages.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {messages.map((msg) => {
                const cfg = typeConfig[msg.type];
                const Icon = cfg.icon;
                return (
                  <div
                    key={msg.id}
                    className="flex items-start gap-4 px-6 py-4 transition-colors hover:bg-slate-50"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.badge}`}
                    >
                      <Icon className={`h-5 w-5 ${cfg.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900">
                          {msg.title}
                        </p>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${cfg.badge}`}
                        >
                          {cfg.label}
                        </span>
                        {msg.isBroadcast && (
                          <Badge variant="info" className="text-[10px]">
                            <Users className="mr-1 h-3 w-3" />
                            Broadcast
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                        {msg.content}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                        <span>
                          {new Date(msg.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {msg.targetRole && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-500">
                            {msg.targetRole}
                          </span>
                        )}
                        <span className="text-slate-400">
                          {msg.readBy.length} lecture
                          {msg.readBy.length > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {messages.length === 0 && (
                <div className="flex flex-col items-center px-6 py-12 text-center">
                  <Megaphone className="h-10 w-10 text-slate-300" />
                  <p className="mt-3 text-sm text-slate-500">
                    Aucun message envoyé.
                  </p>
                  <p className="text-xs text-slate-400">
                    Utilisez le formulaire pour envoyer votre premier message.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
