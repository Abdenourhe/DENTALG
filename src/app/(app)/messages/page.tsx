import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Megaphone,
  AlertTriangle,
  Wrench,
  RefreshCw,
  Info,
  MailOpen,
  Mail,
  ArrowLeft,
} from "lucide-react";
import { markMessageAsRead } from "./actions";
import { PlatformMessageType } from "@prisma/client";

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

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user?.clinicId) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-slate-500">Connectez-vous pour voir vos messages.</p>
      </div>
    );
  }

  const { clinicId, role, id: userId } = session.user;

  const messages = await prisma.platformMessage.findMany({
    where: {
      OR: [
        { isBroadcast: true },
        { targetClinicId: clinicId },
        { targetClinicId: null, targetRole: null },
      ],
      AND: [
        {
          OR: [{ targetRole: null }, { targetRole: role }],
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = messages.filter((m) => !m.readBy.includes(userId)).length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Messages de la plateforme
          </h1>
          <p className="mt-1 text-slate-500">
            {unreadCount > 0 ? (
              <span className="inline-flex items-center gap-1.5">
                <Badge variant="danger" pulse>
                  {unreadCount}
                </Badge>
                message{unreadCount > 1 ? "s" : ""} non lu
                {unreadCount > 1 ? "s" : ""}
              </span>
            ) : (
              "Aucun message non lu."
            )}
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
      </div>

      <Card>
        <CardHeader className="border-b px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Megaphone className="h-5 w-5 text-purple-600" />
            Messages ({messages.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {messages.map((msg) => {
              const cfg = typeConfig[msg.type];
              const Icon = cfg.icon;
              const isRead = msg.readBy.includes(userId);

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-4 px-6 py-4 transition-colors hover:bg-slate-50 ${
                    !isRead ? "bg-blue-50/40" : ""
                  }`}
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
                          Tous
                        </Badge>
                      )}
                      {!isRead && (
                        <Badge variant="danger" pulse className="text-[10px]">
                          Nouveau
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
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
                    </div>
                  </div>
                  {!isRead && (
                    <form
                      action={async () => {
                        "use server";
                        await markMessageAsRead(msg.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200 transition-colors hover:bg-blue-100"
                        title="Marquer comme lu"
                      >
                        <MailOpen className="h-3.5 w-3.5" />
                        Lu
                      </button>
                    </form>
                  )}
                  {isRead && (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <Mail className="h-3.5 w-3.5" />
                      Lu
                    </span>
                  )}
                </div>
              );
            })}
            {messages.length === 0 && (
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <Mail className="h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm text-slate-500">
                  Aucun message de la plateforme.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
