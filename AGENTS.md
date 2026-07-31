# AGENTS.md — DENTALG (règles permanentes)

## Projet
SaaS multi-tenant de gestion de cabinets dentaires (Algérie). Dev solo.
Stack : Next.js 15 App Router (Server Components + Server Actions), TypeScript
strict, Tailwind CSS, Prisma 6 + PostgreSQL (Neon), Cloudinary, Resend, Vercel.

## Règle d'or n°1 : multi-tenant d'abord
- clinicId sur CHAQUE entité métier ; JAMAIS de requête métier sans
  withClinic(ctx) fusionné dans where ET data.
- Exception voulue et unique : le listing public /carrieres (cross-tenant).
- Ressource d'un autre tenant → notFound() (404), jamais 403.
- Back-office /admin : requirePlatformAdmin() en tête, realm "platform" sans
  clinicId, chaque action écrit un AuditLog.

## Sécurité et conformité
- Chaque Server Action : requireRole("<permission>") en première ligne,
  validation Zod (schémas dans lib/validations/), retour union
  { ok: true, … } | { ok: false, errors } — jamais d'exception vers le client.
- Données de santé : soft-delete (deletedAt), notes médicales append-only,
  URL Cloudinary signées expirantes, AUCUNE donnée patient dans Sentry/logs.
- Auth : Auth.js v5 (auth.ts racine), bcrypt, verrouillage login, middleware.ts
  en périmètre + helpers serveur en défense en profondeur.

## Conventions code
- Projet initialisé avec --src-dir : tous les chemins app/ et lib/ sont
  relatifs à src/ (src/app/…, src/lib/…) ; prisma/ et tests/ à la racine.
- Helpers permanents : src/lib/tenant.ts (getClinicContext, withClinic,
  TenantError) et src/lib/rbac.ts (PERMISSIONS, requireRole) — ne jamais les
  recréer, les contourner ni les dupliquer.
- lib/prisma.ts est le SEUL PrismaClient (singleton).
- Montants : Int en centimes de DA ; affichage via formatDA() (lib/money.ts).
- Numérotations légales (patients, devis, factures, avoirs) : compteur
  transactionnel scopé au cabinet (lib/billing/numbering.ts) ; une facture
  ISSUED n'est jamais supprimée ni renumérotée (correction = avoir).
- Server Components par défaut ; 'use client' seulement si interactivité réelle ;
  params/searchParams sont des Promises (await params).
- i18n : toute chaîne UI via les dictionnaires lib/i18n/dictionaries (fr source
  de vérité, ar mêmes clés) ; penser RTL (dir="rtl").
- Fuseau métier : Africa/Algiers. Dentisterie : FDI ISO 3950.

## Process
- Interdiction de commit si npx tsc --noEmit ou npm run build échoue.
- Migrations : prisma migrate dev en local, migrate deploy en prod, une
  migration = un sujet, jamais de destructive sans backup daté.
- Ne jamais ajouter de librairie non demandée (calendrier et odontogramme sont
  volontairement custom, sans FullCalendar ni D3).
