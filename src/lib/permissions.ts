import { Role } from "@prisma/client";

export const PERMISSIONS: Record<string, Role[]> = {
  "patients:read": [Role.OWNER, Role.DENTIST, Role.ASSISTANT, Role.SECRETARY],
  "patients:write": [Role.OWNER, Role.DENTIST, Role.ASSISTANT],
  "appointments:read": [Role.OWNER, Role.DENTIST, Role.ASSISTANT, Role.SECRETARY],
  "appointments:write": [Role.OWNER, Role.DENTIST, Role.SECRETARY],
  "procedures:manage": [Role.OWNER, Role.DENTIST],
  "billing:read": [Role.OWNER, Role.SECRETARY],
  "billing:write": [Role.OWNER, Role.SECRETARY],
  "prescriptions:read": [Role.OWNER, Role.DENTIST, Role.ASSISTANT, Role.SECRETARY],
  "prescriptions:write": [Role.OWNER, Role.DENTIST],
  "lab:read": [Role.OWNER, Role.DENTIST, Role.ASSISTANT, Role.SECRETARY],
  "lab:write": [Role.OWNER, Role.DENTIST, Role.ASSISTANT],
  "users:manage": [Role.OWNER],
  "settings:read": [Role.OWNER],
  "settings:write": [Role.OWNER],
  "reports:read": [Role.OWNER],
  "platform:admin": [Role.PLATFORM_ADMIN],
} as const;

export type Permission = keyof typeof PERMISSIONS;
