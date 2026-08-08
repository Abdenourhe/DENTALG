import Link from "next/link";
import { listSupportTickets, updateTicketStatusFromForm } from "../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Ticket,
  ArrowLeft,
  Bug,
  MessageCircle,
  Lightbulb,
  HelpCircle,
  Clock,
  CheckCircle2,
  Loader2,
  XCircle,
  Eye,
} from "lucide-react";
import { TicketType, TicketStatus } from "@prisma/client";

const typeConfig: Record<
  TicketType,
  { label: string; icon: typeof Bug; color: string; badge: string }
> = {
  BUG: {
    label: "Bug",
    icon: Bug,
    color: "text-red-600",
    badge: "bg-red-50 text-red-700 ring-red-200",
  },
  COMMENT: {
    label: "Commentaire",
    icon: MessageCircle,
    color: "text-blue-600",
    badge: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  FEATURE_REQUEST: {
    label: "Demande de fonction",
    icon: Lightbulb,
    color: "text-amber-600",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  SUGGESTION: {
    label: "Suggestion",
    icon: HelpCircle,
    color: "text-emerald-600",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
};

const statusConfig: Record<
  TicketStatus,
  {
    label: string;
    variant: "default" | "success" | "warning" | "danger" | "info";
    icon: typeof Clock;
  }
> = {
  OPEN: {
    label: "Ouvert",
    variant: "danger",
    icon: Clock,
  },
  IN_PROGRESS: {
    label: "En cours",
    variant: "warning",
    icon: Loader2,
  },
  RESOLVED: {
    label: "Résolu",
    variant: "success",
    icon: CheckCircle2,
  },
  CLOSED: {
    label: "Fermé",
    variant: "default",
    icon: XCircle,
  },
};

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const tickets = await listSupportTickets(status);

  const counts = {
    all: tickets.length,
    open: tickets.filter((t) => t.status === "OPEN").length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED").length,
    closed: tickets.filter((t) => t.status === "CLOSED").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Tickets support
          </h1>
          <p className="mt-1 text-slate-500">
            Gérez les retours des cabinets (bugs, commentaires, suggestions).
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

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Link href="/superadmin/tickets">
          <Badge
            variant={!status ? "default" : "default"}
            className={!status ? "bg-slate-900 text-white" : ""}
          >
            Tous ({counts.all})
          </Badge>
        </Link>
        <Link href="/superadmin/tickets?status=OPEN">
          <Badge
            variant={status === "OPEN" ? "danger" : "default"}
            pulse={status === "OPEN"}
          >
            Ouverts ({counts.open})
          </Badge>
        </Link>
        <Link href="/superadmin/tickets?status=IN_PROGRESS">
          <Badge variant={status === "IN_PROGRESS" ? "warning" : "default"}>
            En cours ({counts.inProgress})
          </Badge>
        </Link>
        <Link href="/superadmin/tickets?status=RESOLVED">
          <Badge variant={status === "RESOLVED" ? "success" : "default"}>
            Résolus ({counts.resolved})
          </Badge>
        </Link>
        <Link href="/superadmin/tickets?status=CLOSED">
          <Badge variant={status === "CLOSED" ? "default" : "default"}>
            Fermés ({counts.closed})
          </Badge>
        </Link>
      </div>

      <Card>
        <CardHeader className="border-b px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Ticket className="h-5 w-5 text-slate-500" />
            Liste des tickets ({tickets.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Sujet</th>
                  <th className="px-6 py-3">Cabinet</th>
                  <th className="px-6 py-3">Auteur</th>
                  <th className="px-6 py-3">Statut</th>
                  <th className="px-6 py-3">Messages</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tickets.map((ticket) => {
                  const typeCfg = typeConfig[ticket.type];
                  const statusCfg = statusConfig[ticket.status];
                  const TypeIcon = typeCfg.icon;
                  const StatusIcon = statusCfg.icon;
                  return (
                    <tr
                      key={ticket.id}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${typeCfg.badge}`}
                        >
                          <TypeIcon
                            className={`h-3.5 w-3.5 ${typeCfg.color}`}
                          />
                          {typeCfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">
                          {ticket.subject}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                          {ticket.description}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {ticket.clinic.name}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-900">
                          {ticket.user.firstName} {ticket.user.lastName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {ticket.user.role}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            ticket.status === "OPEN"
                              ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                              : ticket.status === "IN_PROGRESS"
                                ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                                : ticket.status === "RESOLVED"
                                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                  : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                          }`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-500">
                        {ticket._count.messages}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(ticket.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {ticket.status === "OPEN" && (
                            <form action={updateTicketStatusFromForm}>
                              <input
                                type="hidden"
                                name="ticketId"
                                value={ticket.id}
                              />
                              <input
                                type="hidden"
                                name="status"
                                value="IN_PROGRESS"
                              />
                              <button
                                type="submit"
                                className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200 transition-colors hover:bg-amber-100"
                              >
                                Prendre en charge
                              </button>
                            </form>
                          )}
                          {ticket.status === "IN_PROGRESS" && (
                            <form action={updateTicketStatusFromForm}>
                              <input
                                type="hidden"
                                name="ticketId"
                                value={ticket.id}
                              />
                              <input
                                type="hidden"
                                name="status"
                                value="RESOLVED"
                              />
                              <button
                                type="submit"
                                className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 transition-colors hover:bg-emerald-100"
                              >
                                Résoudre
                              </button>
                            </form>
                          )}
                          <Link
                            href={`/superadmin/tickets/${ticket.id}`}
                            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {tickets.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      <Ticket className="mx-auto h-10 w-10 text-slate-300" />
                      <p className="mt-3 text-sm font-medium">
                        Aucun ticket trouvé.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
