import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getSupportTicket,
  replyToTicketFromForm,
  updateTicketStatusFromForm,
} from "../../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  User,
  Shield,
} from "lucide-react";
import { TicketType } from "@prisma/client";

interface Props {
  params: Promise<{ id: string }>;
}

const typeConfig: Record<
  TicketType,
  { label: string; color: string; badge: string }
> = {
  BUG: {
    label: "Bug",
    color: "text-red-600",
    badge: "bg-red-50 text-red-700 ring-red-200",
  },
  COMMENT: {
    label: "Commentaire",
    color: "text-blue-600",
    badge: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  FEATURE_REQUEST: {
    label: "Demande de fonction",
    color: "text-amber-600",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  SUGGESTION: {
    label: "Suggestion",
    color: "text-emerald-600",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
};

export default async function TicketDetailPage({ params }: Props) {
  const { id } = await params;
  const ticket = await getSupportTicket(id);
  if (!ticket) notFound();

  const typeCfg = typeConfig[ticket.type];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/superadmin/tickets"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux tickets
        </Link>
        <div className="flex items-center gap-2">
          {ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
            <form action={updateTicketStatusFromForm}>
              <input type="hidden" name="ticketId" value={ticket.id} />
              <input type="hidden" name="status" value="RESOLVED" />
              <Button type="submit" variant="secondary">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Marquer résolu
              </Button>
            </form>
          )}
          {(ticket.status === "RESOLVED" || ticket.status === "CLOSED") && (
            <form action={updateTicketStatusFromForm}>
              <input type="hidden" name="ticketId" value={ticket.id} />
              <input type="hidden" name="status" value="OPEN" />
              <Button type="submit" variant="secondary">
                Rouvrir
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Ticket header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${typeCfg.badge}`}
            >
              {typeCfg.label}
            </span>
            <Badge
              variant={
                ticket.status === "OPEN"
                  ? "danger"
                  : ticket.status === "IN_PROGRESS"
                    ? "warning"
                    : ticket.status === "RESOLVED"
                      ? "success"
                      : "default"
              }
            >
              {ticket.status === "OPEN" && <Clock className="mr-1 h-3 w-3" />}
              {ticket.status === "IN_PROGRESS" && (
                <Clock className="mr-1 h-3 w-3" />
              )}
              {ticket.status === "RESOLVED" && (
                <CheckCircle2 className="mr-1 h-3 w-3" />
              )}
              {ticket.status === "CLOSED" && (
                <XCircle className="mr-1 h-3 w-3" />
              )}
              {ticket.status}
            </Badge>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            {ticket.subject}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {ticket.user.firstName} {ticket.user.lastName} (
              {ticket.user.email})
            </span>
            <span className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              {ticket.clinic.name}
            </span>
            <span>
              {new Date(ticket.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {ticket.description}
          </p>
          {ticket.attachments && (
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.isArray(ticket.attachments) &&
                (ticket.attachments as { name: string; url: string }[]).map(
                  (att, i) => (
                    <a
                      key={i}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100"
                    >
                      📎 {att.name}
                    </a>
                  ),
                )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversation */}
      <Card>
        <CardHeader className="border-b px-6 py-4">
          <CardTitle className="text-base font-semibold">
            Conversation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {ticket.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.isAdmin ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    msg.isAdmin
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {msg.isAdmin ? "A" : "U"}
                </div>
                <div
                  className={`max-w-lg rounded-2xl px-4 py-2.5 text-sm ${
                    msg.isAdmin
                      ? "bg-blue-50 text-blue-900"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className="mt-1 text-[10px] opacity-60">
                    {new Date(msg.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {ticket.messages.length === 0 && (
              <p className="text-center text-sm text-slate-400">
                Aucun message. Soyez le premier à répondre.
              </p>
            )}
          </div>

          {/* Reply form */}
          {ticket.status !== "CLOSED" && (
            <form action={replyToTicketFromForm} className="mt-6 flex gap-3">
              <input type="hidden" name="ticketId" value={ticket.id} />
              <input
                name="content"
                type="text"
                placeholder="Votre réponse..."
                required
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <Button type="submit">
                <Send className="mr-2 h-4 w-4" />
                Répondre
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
