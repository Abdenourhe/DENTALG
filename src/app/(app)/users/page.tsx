import Link from "next/link";
import { listUsers } from "./actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PageWrapper,
  StaggerContainer,
  FadeUp,
} from "@/components/ui/animations";
import {
  UserPlus,
  Shield,
  Stethoscope,
  Users,
  Phone,
  Pencil,
  Trash2,
  Mail,
  Clock,
} from "lucide-react";
import { Role } from "@prisma/client";
import { formatDate } from "@/lib/date";
import { DeleteUserButton } from "./delete-user-button";

const roleConfig: Record<
  Role,
  {
    label: string;
    icon: typeof Shield;
    variant: "default" | "success" | "warning" | "info" | "danger";
    color: string;
  }
> = {
  [Role.OWNER]: {
    label: "Propriétaire",
    icon: Shield,
    variant: "warning" as const,
    color: "text-amber-600 bg-amber-50 ring-amber-200",
  },
  [Role.DENTIST]: {
    label: "Dentiste",
    icon: Stethoscope,
    variant: "success" as const,
    color: "text-emerald-600 bg-emerald-50 ring-emerald-200",
  },
  [Role.ASSISTANT]: {
    label: "Assistant(e)",
    icon: Users,
    variant: "info" as const,
    color: "text-sky-600 bg-sky-50 ring-sky-200",
  },
  [Role.SECRETARY]: {
    label: "Secrétaire",
    icon: Phone,
    variant: "default" as const,
    color: "text-primary-600 bg-primary-50 ring-primary-200",
  },
  [Role.PLATFORM_ADMIN]: {
    label: "Admin plateforme",
    icon: Shield,
    variant: "danger" as const,
    color: "text-red-600 bg-red-50 ring-red-200",
  },
};

export default async function UsersPage() {
  const users = await listUsers();

  return (
    <PageWrapper className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Utilisateurs du cabinet
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Gérez les accès et les rôles de votre équipe.
          </p>
        </div>
        <Link href="/users/new">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Inviter un utilisateur
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <StaggerContainer className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Object.values(Role)
          .filter((r) => r !== Role.PLATFORM_ADMIN)
          .map((role) => {
            const config = roleConfig[role];
            const Icon = config.icon;
            const count = users.filter((u) => u.role === role).length;
            return (
              <FadeUp key={role}>
                <Card className="group">
                  <CardContent className="flex items-center gap-3 py-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${config.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {count}
                      </p>
                      <p className="text-xs text-slate-500">{config.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </FadeUp>
            );
          })}
      </StaggerContainer>

      {/* Users table */}
      <StaggerContainer stagger={0.04}>
        <FadeUp>
          <Card>
            <CardContent className="pt-5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="pb-3 font-medium">Utilisateur</th>
                      <th className="pb-3 font-medium">Rôle</th>
                      <th className="pb-3 font-medium">Statut</th>
                      <th className="pb-3 font-medium">Dernière connexion</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => {
                      const config = roleConfig[user.role];
                      const RoleIcon = config.icon;
                      return (
                        <tr
                          key={user.id}
                          className="group transition-colors hover:bg-slate-50/80"
                        >
                          <td className="py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                                {user.firstName[0]}
                                {user.lastName[0]}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {user.lastName} {user.firstName}
                                </p>
                                <p className="flex items-center gap-1 text-xs text-slate-500">
                                  <Mail className="h-3 w-3" />
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${config.color}`}
                            >
                              <RoleIcon className="h-3 w-3" />
                              {config.label}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <Badge
                              variant={user.isActive ? "success" : "danger"}
                              pulse={user.isActive}
                            >
                              {user.isActive ? "Actif" : "Inactif"}
                            </Badge>
                          </td>
                          <td className="py-3.5">
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Clock className="h-3.5 w-3.5" />
                              {user.lastLoginAt
                                ? formatDate(user.lastLoginAt)
                                : "Jamais"}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                              <Link
                                href={`/users/${user.id}`}
                                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                                title="Modifier"
                              >
                                <Pencil className="h-4 w-4" />
                              </Link>
                              <DeleteUserButton
                                userId={user.id}
                                userName={`${user.firstName} ${user.lastName}`}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {users.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-12 text-center text-slate-500"
                        >
                          <Users className="mx-auto h-10 w-10 text-slate-300" />
                          <p className="mt-2 text-sm">
                            Aucun utilisateur trouvé.
                          </p>
                          <p className="text-xs text-slate-400">
                            Invitez des membres de votre équipe pour commencer.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </FadeUp>
      </StaggerContainer>
    </PageWrapper>
  );
}
