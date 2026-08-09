import { Role } from "@prisma/client";

export const PERMISSIONS: Record<string, Role[]> = {
  "patients:read": [Role.OWNER, Role.DENTIST, Role.ASSISTANT, Role.SECRETARY],
  "patients:write": [Role.OWNER, Role.DENTIST, Role.ASSISTANT],
  "appointments:read": [
    Role.OWNER,
    Role.DENTIST,
    Role.ASSISTANT,
    Role.SECRETARY,
  ],
  "appointments:write": [Role.OWNER, Role.DENTIST, Role.SECRETARY],
  "waiting_room:read": [
    Role.OWNER,
    Role.DENTIST,
    Role.ASSISTANT,
    Role.SECRETARY,
  ],
  "waiting_room:write": [
    Role.OWNER,
    Role.DENTIST,
    Role.ASSISTANT,
    Role.SECRETARY,
  ],
  "billing:read": [Role.OWNER, Role.SECRETARY],
  "billing:write": [Role.OWNER, Role.SECRETARY],
  "procedures:manage": [Role.OWNER, Role.DENTIST],
  "users:manage": [Role.OWNER],
  "rooms:manage": [Role.OWNER],
  "prescriptions:read": [
    Role.OWNER,
    Role.DENTIST,
    Role.ASSISTANT,
    Role.SECRETARY,
  ],
  "prescriptions:write": [Role.OWNER, Role.DENTIST],
  "lab:read": [Role.OWNER, Role.DENTIST, Role.ASSISTANT, Role.SECRETARY],
  "lab:write": [Role.OWNER, Role.DENTIST, Role.ASSISTANT],
  "platform:admin": [Role.PLATFORM_ADMIN],
};
