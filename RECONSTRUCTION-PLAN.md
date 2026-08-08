# DENTALG v2 — Plan de Reconstruction

> SaaS multi-tenant de gestion de cabinets dentaires (Algérie) — Dev solo  
> Stack : Next.js 15 App Router, TypeScript strict, Tailwind CSS v4, Prisma 6, PostgreSQL (Neon), Auth.js v5, Cloudinary, Resend, Vercel  
> **Couleur identitaire : violet #490094** (conservée depuis v1)  
> **Fuseau métier : Africa/Algiers**

---

## 0. État Actuel → Cible

### 0.1 Ce qui fonctionne aujourd'hui (à conserver)

| Élément                                                                             | État | Action                             |
| ----------------------------------------------------------------------------------- | ---- | ---------------------------------- |
| Auth multi-rôle (OWNER/DENTIST/ASSISTANT/SECRETARY/PLATFORM_ADMIN)                  | ✅   | Conserver tel quel                 |
| Middleware auth + redirections (public/superadmin/app)                              | ✅   | Conserver, documenter              |
| Verrouillage login (`auth-lockout.ts`, 5 fails / 15 min)                            | ✅   | Conserver                          |
| Soft-delete (`deletedAt`) + archivage (`isActive`)                                  | ✅   | Conserver, distinguer              |
| Compteurs transactionnels (`nextNumber`, atomic upsert)                             | ✅   | Conserver                          |
| Audit logs (`AuditAction.CREATE/UPDATE/DELETE`)                                     | ✅   | Conserver                          |
| Feature flags par plan (`features.ts`, JSONB)                                       | ✅   | Conserver, 6 clés                  |
| RBAC avec `notFound()` pour ressource autre tenant                                  | ✅   | Conserver                          |
| Composants UI de base (Button, Input, Select, TextArea, Card, Badge, ImageUploader) | ✅   | Compléter                          |
| Schéma Prisma complet (23+ modèles)                                                 | ✅   | Migrer, ajouter `GeneralCondition` |
| Seed de démo                                                                        | ✅   | Enrichir                           |
| Upload Cloudinary                                                                   | ✅   | Conserver                          |
| Husky + lint-staged                                                                 | ✅   | Conserver                          |
| Vitest configuré                                                                    | ✅   | Écrire les tests                   |

### 0.2 Ce qui doit être refait / créé

| Élément                                                 | Priorité    |
| ------------------------------------------------------- | ----------- |
| Schéma Prisma : ajouter `GeneralCondition` enum + champ | 🔴 Critique |
| Design System complet (12 composants, 10 à créer)       | 🔴 Critique |
| Tests unitaires + intégration Prisma                    | 🟠 Haute    |
| CI/CD GitHub Actions                                    | 🟠 Haute    |
| Error boundaries (`error.tsx`, `loading.tsx`)           | 🟠 Haute    |
| Cache strategy documentée                               | 🟠 Haute    |
| i18n fondations (fr + ar, RTL)                          | 🟡 Moyenne  |
| Accessibilité (ARIA, keyboard nav, contrastes)          | 🟡 Moyenne  |
| Rate limits Server Actions                              | 🟡 Moyenne  |
| Validation uploads (taille, MIME)                       | 🟡 Moyenne  |

---

## 1. Vision & Périmètre

### 1.1 Modules fonctionnels

```
┌─────────────────────────────────────────────────────────────────┐
│                        DENTALG v2                                │
├─────────────────────────────────────────────────────────────────┤
│  CORE (Phase 1-2)                                               │
│  ├── Patients        : CRUD, dossier médical, odontogramme FDI  │
│  ├── Rendez-vous     : Calendrier, salle d'attente, rappels     │
│  ├── Actes           : Catalogue cabinet, tarification           │
│  └── Facturation     : Devis → Facture → Paiement → Avoir      │
├─────────────────────────────────────────────────────────────────┤
│  MÉDICAL (Phase 3)                                              │
│  ├── Ordonnances     : Types + personnalisées, impression PDF   │
│  ├── Labo Prothèse   : Demandes, résultats, statut              │
│  └── Notes médicales : Append-only (pas d'édition)              │
├─────────────────────────────────────────────────────────────────┤
│  BUSINESS (Phase 4)                                             │
│  ├── Utilisateurs    : Invitations, rôles, permissions          │
│  ├── Abonnements     : Plans FREE/ESSENTIEL/PRO/PREMIUM         │
│  ├── Analytics       : CA, taux conversion, rappels, fréquentation│
│  └── Messagerie      : Interne cabinet + Plateforme admin       │
├─────────────────────────────────────────────────────────────────┤
│  ÉCOSYSTÈME (Phase 5)                                           │
│  ├── Carrières       : Offres d'emploi cross-tenant             │
│  ├── Marketplace     : Cabinets/équipements à vendre            │
│  └── API Publique    : Tokens, webhooks                         │
├─────────────────────────────────────────────────────────────────┤
│  INFRA (Tout le temps)                                          │
│  ├── Stock           : Gestion inventaire (Phase 3+)            │
│  ├── Support         : Tickets utilisateurs → admin plateforme  │
│  └── Paramètres      : Features, profil cabinet, i18n           │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Utilisateurs & parcours

| Rôle               | Parcours principal                              | Permissions clés                                     |
| ------------------ | ----------------------------------------------- | ---------------------------------------------------- |
| **OWNER**          | Dashboard → Patients → Facturation → Paramètres | Tout sauf `platform:admin`                           |
| **DENTIST**        | Patients → Rendez-vous → Ordonnances → Labo     | `patients:write`, `prescriptions:write`, `lab:write` |
| **ASSISTANT**      | Salle d'attente → Patients → Labo               | `patients:read`, `lab:read/write`                    |
| **SECRETARY**      | Accueil → Rendez-vous → Facturation             | `appointments:write`, `billing:write`                |
| **PLATFORM_ADMIN** | Superadmin → Clinics → Messages → Tickets       | `platform:admin`                                     |

### 1.3 Différence 404 vs 403 — Règle impérative

> **Ressource d'un autre tenant → `notFound()` (404), jamais 403.**

```typescript
// Dans chaque Server Action
const existing = await prisma.patient.findFirst({
  where: { id, clinicId: ctx.clinicId, deletedAt: null },
});
if (!existing) return notFound(); // ← Pas de 403, pas de message "accès refusé"
```

**Pourquoi ?** Un 403 révèle que la ressource existe mais que l'utilisateur n'y a pas accès — c'est une fuite d'information. Un 404 est indiscernable d'une ressource inexistante.

Exception unique : le back-office `/superadmin` utilise `requirePlatformAdmin()` qui renvoie `notFound()` si le rôle ne correspond pas.

---

## 2. Architecture Technique

### 2.1 Stack (confirmée)

| Couche      | Technologie               | Version         | Justification                                         |
| ----------- | ------------------------- | --------------- | ----------------------------------------------------- |
| Framework   | Next.js                   | 15.5.22         | App Router, Server Components, Server Actions         |
| Langage     | TypeScript                | 5.x             | Strict mode                                           |
| Styling     | Tailwind CSS              | v4              | Tokens CSS natifs (`@theme inline`), pas de config JS |
| UI          | Composants custom         | —               | 7 existants, 12 cibles, pas de lib externe            |
| Base        | PostgreSQL                | 15+ (Neon)      | Serverless, JSONB, enums natifs                       |
| ORM         | Prisma                    | 6.19.3          | Type-safe, migrations, `prisma.$extends`              |
| Auth        | Auth.js (next-auth)       | 5.0.0-beta.32   | JWT strategy, credentials provider                    |
| Upload      | Cloudinary                | 2.10.0          | URLs signées expirantes                               |
| Email       | Resend                    | 6.18.1          | Transactionnel                                        |
| Test        | Vitest                    | 4.1.10          | Rapide, intégration Prisma                            |
| Qualité     | ESLint + Prettier + Husky | 9.x / 3.x / 9.x | Lint-staged, commit hooks                             |
| Hébergement | Vercel                    | —               | Edge, CI/CD                                           |

### 2.2 Tailwind v4 — Configuration

**Pas de `tailwind.config.ts` en v4.** Les tokens sont dans `src/app/globals.css` via `@theme inline`.

```css
/* src/app/globals.css (existant — CONSERVÉ TEL QUEL) */
@import "tailwindcss";

:root {
  --background: #f4f7f9;
  --foreground: #0b1334;
  --primary: #490094; /* ← Violet identitaire DENTALG */
  --primary-foreground: #ffffff;
  --card: #ffffff;
  --card-foreground: #0b1334;
  --border: #dde5ed;
  --muted: #f1f4f8;
  --muted-foreground: #5a6d80;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-border: var(--border);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);

  /* Primary purple scale */
  --color-primary-50: #f7f5ff;
  --color-primary-100: #ede9ff;
  --color-primary-200: #ddd3ff;
  --color-primary-300: #c2b0ff;
  --color-primary-400: #a482ff;
  --color-primary-500: #854fff;
  --color-primary-600: #762af5;
  --color-primary-700: #6815e0;
  --color-primary-800: #5710b7;
  --color-primary-900: #490094;
  --color-primary-950: #2e005e;

  /* Slate neutrals */
  --color-slate-50: #f4f7f9;
  --color-slate-100: #f1f4f8;
  --color-slate-200: #dde5ed;
  --color-slate-300: #c5d0dc;
  --color-slate-400: #8a9aad;
  --color-slate-500: #5a6d80;
  --color-slate-600: #3e4d5d;
  --color-slate-700: #2a3440;
  --color-slate-800: #1b2230;
  --color-slate-900: #0b1334;
  --color-slate-950: #050817;

  /* Semantic */
  --color-success: #10b981;
  --color-success-foreground: #ffffff;
  --color-warning: #f59e0b;
  --color-warning-foreground: #ffffff;
  --color-danger: #ef4444;
  --color-danger-foreground: #ffffff;
  --color-info: #3b82f6;
  --color-info-foreground: #ffffff;

  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans), ui-sans-serif, system-ui, sans-serif;
}

::selection {
  background: #ddd3ff;
  color: #490094;
}
```

### 2.3 Architecture en couches

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  Routes (page.tsx) ─ Layouts (layout.tsx) ─ error.tsx       │
│  Server Components (fetch data) ─ 'use client' (interactivité)│
│  Composants UI atomiques ─ Composants métier (dental/)      │
├─────────────────────────────────────────────────────────────┤
│                    APPLICATION LAYER                         │
│  Server Actions (use server) ─ Services métier              │
│  Validations Zod ─ Transformations données                  │
├─────────────────────────────────────────────────────────────┤
│                    INFRASTRUCTURE LAYER                      │
│  Prisma Client (singleton) ─ Tenant Context (clinicId)      │
│  RBAC (requireRole) ─ Audit Log ─ Feature Flags             │
│  Billing Helpers (formatDA, nextNumber) ─ Date Helpers      │
├─────────────────────────────────────────────────────────────┤
│                      DATA LAYER                              │
│              PostgreSQL (Neon) + Prisma ORM                  │
└─────────────────────────────────────────────────────────────┘
```

### 2.4 Règles d'or (non négociables)

1. **Multi-tenant d'abord** : `clinicId` sur chaque entité métier. Requête = `withClinic(ctx)` fusionné dans `where` ET `data`.
2. **404 pas 403** : ressource d'un autre tenant → `notFound()`. Voir Section 1.3.
3. **Server Components par défaut** : `'use client'` uniquement si interactivité réelle.
4. **Server Actions = seule API métier** : pas de route API REST pour CRUD. Routes API réservées à upload, auth callback, webhooks.
5. **Validation Zod en entrée** : chaque action, chaque formulaire. Retour union `{ ok: true, data } | { ok: false, errors }`.
6. **Soft-delete + archivage distincts** : `deletedAt` (suppression logique) ET `isActive` (archivage métier). Voir Section 4.2.
7. **Audit log systématique** : CREATE/UPDATE/DELETE logués avec `userId`, `clinicId`, `entityType`, `entityId`.
8. **Montants en centimes** : `Int` en base, `formatDA(cents)` pour affichage. Jamais de float.
9. **Pas de librairie non demandée** : pas FullCalendar, pas D3, pas MUI/Chakra. Composants custom Tailwind.
10. **Pas de commit cassé** : `npx tsc --noEmit && npm run build` doivent passer avant chaque push.

---

## 3. Sécurité & Auth

### 3.1 Diagramme d'authentification

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│  /login     │────▶│  Auth.js    │────▶│  PostgreSQL  │
│  (Browser)  │     │  (page)     │     │  Credentials│     │  (User table)│
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              ▼
                                       ┌─────────────┐
                                       │ Lockout     │
                                       │ (5 fails/   │
                                       │  15 min)    │
                                       └─────────────┘
                                              │
                                              ▼
                                       ┌─────────────┐
                                       │  JWT Token  │
                                       │  { id, role,│
                                       │   clinicId }│
                                       └─────────────┘
                                              │
                                              ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Middleware │◀────│  Session    │◀────│  Cookie     │
│  (matcher)  │     │  (JWT)      │     │  httpOnly   │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐
│  Route      │
│  Guard :    │
│  - Public ? │
│  - Auth ?   │
│  - Role ?   │
│  - Tenant ? │
└─────────────┘
```

### 3.2 Middleware (`middleware.ts` à la racine)

```typescript
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type AuthNextRequest = NextRequest & {
  auth?: { user?: { role?: string } } | null;
};

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/carrieres",
  "/superadmin/login",
  "/api/auth",
  "/request-clinic",
  "/fonctionnalites",
];

export default auth((req: AuthNextRequest) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isPublic = PUBLIC_PATHS.some((p) =>
    p === "/" ? nextUrl.pathname === "/" : nextUrl.pathname.startsWith(p),
  );

  const isSuperadminRoute = nextUrl.pathname.startsWith("/superadmin");
  const isApiRoute = nextUrl.pathname.startsWith("/api");

  // 1. Routes publiques → laisser passer
  if (isPublic) return NextResponse.next();

  // 2. Non authentifié → rediriger vers login approprié
  if (!isLoggedIn) {
    const loginUrl = isSuperadminRoute ? "/superadmin/login" : "/login";
    return NextResponse.redirect(new URL(loginUrl, nextUrl));
  }

  // 3. Route superadmin réservée au PLATFORM_ADMIN
  if (isSuperadminRoute && role !== "PLATFORM_ADMIN") {
    return NextResponse.redirect(new URL("/superadmin/login", nextUrl));
  }

  // 4. Route app avec clinicId manquant (utilisateur orphelin)
  if (!isSuperadminRoute && !isApiRoute && !req.auth?.user?.clinicId) {
    return NextResponse.redirect(new URL("/login?error=no-clinic", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
```

### 3.3 RBAC — Matrice des permissions (EXACTE)

```typescript
// src/lib/permissions.ts
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
  "procedures:manage": [Role.OWNER, Role.DENTIST],
  "billing:read": [Role.OWNER, Role.SECRETARY],
  "billing:write": [Role.OWNER, Role.SECRETARY],
  "prescriptions:read": [
    Role.OWNER,
    Role.DENTIST,
    Role.ASSISTANT,
    Role.SECRETARY,
  ],
  "prescriptions:write": [Role.OWNER, Role.DENTIST],
  "lab:read": [Role.OWNER, Role.DENTIST, Role.ASSISTANT, Role.SECRETARY],
  "lab:write": [Role.OWNER, Role.DENTIST, Role.ASSISTANT],
  "users:manage": [Role.OWNER],
  "settings:read": [Role.OWNER],
  "settings:write": [Role.OWNER],
  "reports:read": [Role.OWNER],
  "platform:admin": [Role.PLATFORM_ADMIN],
} as const;
```

Usage dans chaque Server Action :

```typescript
export async function createPatient(data: unknown) {
  await requireRole("patients:write"); // ← Première ligne
  const ctx = await requireClinicContext(); // ← Deuxième ligne
  // ... logique métier
}
```

### 3.4 Feature Flags exacts (depuis `src/lib/features.ts`)

```typescript
// src/lib/features.ts
export const AVAILABLE_FEATURES = {
  LAB_ORDERS: {
    label: "Bons de labo",
    description: "Gestion des bons de laboratoire et résultats",
    route: "/lab",
  },
  PRESCRIPTIONS: {
    label: "Ordonnances",
    description: "Prescriptions médicales",
    route: "/prescriptions",
  },
  INVOICING: {
    label: "Facturation",
    description: "Devis, factures et paiements",
    route: "/billing",
  },
  JOB_OFFERS: {
    label: "Carrières",
    description: "Offres d'emploi internes",
    route: "/carrieres",
  },
  ANALYTICS: {
    label: "Analyses",
    description: "Tableaux de bord avancés",
    route: "/dashboard",
  },
  TREATMENT_PLANS: {
    label: "Plans de traitement",
    description: "Plans détaillés par patient",
    route: "/patients",
  },
} as const;

export type FeatureKey = keyof typeof AVAILABLE_FEATURES;
```

Stockage : `Clinic.features` en JSONB. Activation par plan (FREE = aucun, ESSENTIEL = INVOICING, PRO = tous sauf ANALYTICS, PREMIUM = tous) ou manuellement par OWNER.

### 3.5 Données de santé — Règles

| Règle           | Implémentation                                             |
| --------------- | ---------------------------------------------------------- |
| Soft-delete     | `deletedAt: DateTime?` sur toutes les entités métier       |
| Archivage       | `isActive: Boolean @default(true)` distinct de `deletedAt` |
| Notes médicales | Append-only : création autorisée, édition interdite        |
| URLs Cloudinary | Signées + `expiresAt` (1h par défaut)                      |
| Logs            | AUCUNE donnée patient dans Sentry/logs (ID seulement)      |
| Backup          | Neon automated backups + snapshots manuels avant migration |

---

## 4. Base de Données

### 4.1 Principes

- **Soft-delete** : `deletedAt DateTime?` sur TOUT.
- **Archivage** : `isActive Boolean @default(true)` distinct de `deletedAt`.
- **Timestamps** : `createdAt`, `updatedAt` sur TOUT.
- **Multi-tenant** : `clinicId String` sur TOUT sauf tables globales.
- **Enums PostgreSQL** : pour les statuts (type-safe).
- **JSONB** : `features`, `metadata`, `attachments`.
- **Indexes** : sur les colonnes de filtre/recherche fréquentes.

### 4.2 Distinction cruciale : Archiver vs Supprimer vs Purge

| Action        | Champ                    | Effet                                 | Réversible            | Qui peut        |
| ------------- | ------------------------ | ------------------------------------- | --------------------- | --------------- |
| **Archiver**  | `isActive = false`       | Masqué des listes, données conservées | ✅ Un clic par OWNER  | OWNER           |
| **Supprimer** | `deletedAt = new Date()` | Invisible partout, en base            | ✅ Restauration admin | OWNER/DENTIST   |
| **Purge**     | `DELETE` physique        | Irréversible                          | ❌                    | Jamais par l'UI |

**Règle métier** : une facture `ISSUED` n'est jamais supprimée. Correction = avoir (`CREDIT_NOTE`).

### 4.3 Numérotation légale — Format unique choisi

**Format : `P-YYYY-XXXX`** (prefix + année + séquence à 4 chiffres)

```typescript
// src/lib/billing/numbering.ts
const PREFIXES = {
  PATIENT: "P",
  INVOICE: "F",
  QUOTE: "D",
  PRESCRIPTION: "O",
  LAB_ORDER: "L",
} as const;

export async function nextNumber(
  clinicId: string,
  type: keyof typeof PREFIXES,
  options?: { pad?: number },
): Promise<string> {
  const counter = await prisma.counter.upsert({
    where: { clinicId_type: { clinicId, type } },
    update: { value: { increment: 1 } },
    create: { clinicId, type, value: 1 },
  });

  const year = new Date().getFullYear();
  const seq = String(counter.value).padStart(options?.pad ?? 4, "0");
  return `${PREFIXES[type]}-${year}-${seq}`;
}
```

| Type       | Format        | Exemple       |
| ---------- | ------------- | ------------- |
| Patient    | `P-YYYY-XXXX` | `P-2026-0042` |
| Devis      | `D-YYYY-XXXX` | `D-2026-0018` |
| Facture    | `F-YYYY-XXXX` | `F-2026-0056` |
| Avoir      | `A-YYYY-XXXX` | `A-2026-0003` |
| Ordonnance | `O-YYYY-XXXX` | `O-2026-0012` |
| Labo       | `L-YYYY-XXXX` | `L-2026-0007` |

> Le compteur est transactionnel (PostgreSQL `UPSERT` atomique), safe en concurrence. Le seed actuel utilise `0001` temporairement ; en production, `nextNumber` génère le format `P-YYYY-XXXX`.

### 4.4 Enum globaux

```prisma
enum Role { OWNER DENTIST ASSISTANT SECRETARY PLATFORM_ADMIN }
enum Sex { M F }
enum BloodGroup { A_POS A_NEG B_POS B_NEG AB_POS AB_NEG O_POS O_NEG }
enum GeneralCondition {
  RAS HYPERTENSION_ARTERIELLE DIABETE INSUFFISANCE_CARDIAQUE
  INFARCTUS_DU_MYOCARDE ENDOCARDITE ASTHME TUBERCULOSE
  ALLERGIE INSUFFISANCE_RENALE_CHRONIQUE ANEMIES
  RETARD_PSYCHOMOTEUR EPILEPSIE AUTRE
}
enum AppointmentStatus { SCHEDULED CONFIRMED CANCELLED NO_SHOW COMPLETED }
enum InvoiceStatus { DRAFT ISSUED PAID OVERDUE CREDIT_NOTE }
enum PaymentMethod { CASH CARD TRANSFER CHEQUE OTHER }
enum PrescriptionStatus { DRAFT ISSUED }
enum LabOrderStatus { PENDING IN_PROGRESS COMPLETED CANCELLED }
enum LabResultStatus { PENDING NORMAL ABNORMAL CRITICAL }
enum Plan { FREE ESSENTIEL PRO PREMIUM }
enum SubscriptionStatus { ACTIVE PAST_DUE CANCELLED EXPIRED }
enum JobOfferStatus { DRAFT PUBLISHED CLOSED }
enum ApplicationStatus { PENDING REVIEWING ACCEPTED REJECTED }
enum AuditAction { CREATE UPDATE DELETE LOGIN LOGOUT EXPORT VIEW }
enum TicketType { BUG COMMENT FEATURE_REQUEST SUGGESTION }
enum TicketStatus { OPEN IN_PROGRESS RESOLVED CLOSED }
enum RequestStatus { PENDING APPROVED REJECTED }
enum PlatformMessageType { ANNOUNCEMENT ALERT MAINTENANCE UPDATE }
enum ListingStatus { DRAFT PUBLISHED SOLD }
```

### 4.5 Entités clés (schéma relationnel)

```
Clinic ──1:N── User
Clinic ──1:N── Patient
Clinic ──1:N── Procedure
Clinic ──1:N── Appointment
Clinic ──1:N── Invoice
Clinic ──1:N── Quote
Clinic ──1:N── Prescription
Clinic ──1:N── LabOrder
Clinic ──1:N── MedicalNote
Clinic ──1:N── ToothStatus
Clinic ──1:N── AuditLog
Clinic ──1:N── Counter
Clinic ──1:N── JobOffer
Clinic ──1:N── SupportTicket
Clinic ──1:N── ClinicListing       # ← Marketplace cabinets
Clinic ──1:N── EquipmentListing    # ← Marketplace équipements
Clinic ──1:N── Notification
Clinic ──1:N── PlanDefinition
Clinic ──1:N── SubscriptionPayment

Patient ──1:N── Appointment
Patient ──1:N── Invoice
Patient ──1:N── Prescription
Patient ──1:N── LabOrder
Patient ──1:N── TreatmentPlan
Patient ──1:N── MedicalNote
Patient ──1:N── ToothStatus
Patient ──1:N── Attachment

User ──1:N── Appointment (dentist)
User ──1:N── Invoice (createdBy)
User ──1:N── Prescription (createdBy)
User ──1:N── MedicalNote (createdBy)
```

### 4.6 Seed de démo — Contenu exact

```typescript
// prisma/seed.ts — Ce que le seed DOIT créer :

// 1. Plan definitions (4 plans)
//    - FREE (0 DA/mois, 0 features)
//    - ESSENTIEL (invoicing seulement)
//    - PRO (tout sauf analytics)
//    - PREMIUM (tout)

// 2. Clinic "Cabinet Dentaire Benali"
//    - slug: "cabinet-benali"
//    - plan: PRO
//    - features: { INVOICING: true, PRESCRIPTIONS: true, LAB_ORDERS: true,
//                  TREATMENT_PLANS: true, JOB_OFFERS: true, ANALYTICS: false }

// 3. Users (3 utilisateurs)
//    - dr.benali@demo.dz / DemoPass123! — OWNER
//    - assistant@demo.dz / DemoPass123! — ASSISTANT
//    - secretary@demo.dz / DemoPass123! — SECRETARY

// 4. Patients (4-6 patients)
//    - Numérotation manuelle "0001" à "0006" (seed uniquement)
//    - Divers : diabète, allergie, hypertension, RAS

// 5. Procedures (7 actes)
//    - CONSULT (Consultation, 2000 DA)
//    - DETART (Détartrage, 3000 DA)
//    - OBTUR (Obturation, 4500 DA)
//    - EXTRAC (Extraction, 2500 DA)
//    - IMPLANT (Implant + couronne, 45000 DA)
//    - DEVIT (Dévitalisation, 12000 DA)
//    - COURN (Couronne céramique, 18000 DA)

// 6. Counters initialisés
//    - clinicId + PATIENT → value: 6 (après les 6 patients seedés)

// 7. Job offer (1 offre publiée)
//    - "Assistant(e) dentaire — CDI"

// 8. Admin plateforme (optionnel, si env var présente)
//    - admin@dentalg.dz / AdminPass123! — PLATFORM_ADMIN
```

### 4.7 Migrations — Workflow

| Environnement  | Commande                                         | Quand                      |
| -------------- | ------------------------------------------------ | -------------------------- |
| **Local**      | `npx prisma migrate dev --name <sujet>`          | Pendant le développement   |
| **Production** | `npx prisma migrate deploy`                      | Via `postinstall` ou CI/CD |
| **Rollback**   | Restaurer snapshot Neon + réappliquer migrations | En cas d'erreur critique   |

> **Règle** : une migration = un sujet. Jamais de destructive sans backup daté. En production, `migrate deploy` est exécuté automatiquement via le script `vercel-build`.

```json
// package.json
{
  "scripts": {
    "build": "npx prisma migrate deploy && npx prisma generate && next build",
    "vercel-build": "prisma migrate deploy && prisma generate && next build"
  }
}
```

---

## 5. Design System

### 5.1 Tokens (confirmés depuis `globals.css`)

**Couleur identitaire : violet #490094**

| Token                      | Valeur    | Usage                                    |
| -------------------------- | --------- | ---------------------------------------- |
| `--color-primary`          | `#490094` | Boutons primaires, liens actifs, accents |
| `--color-primary-50`       | `#f7f5ff` | Fond hover sidebar active                |
| `--color-primary-900`      | `#490094` | Texte actif sidebar                      |
| `--color-background`       | `#f4f7f9` | Fond page                                |
| `--color-foreground`       | `#0b1334` | Texte principal                          |
| `--color-card`             | `#ffffff` | Fond cartes                              |
| `--color-border`           | `#dde5ed` | Bordures                                 |
| `--color-muted-foreground` | `#5a6d80` | Texte secondaire                         |
| `--color-success`          | `#10b981` | Succès, payé                             |
| `--color-warning`          | `#f59e0b` | Attention, en attente                    |
| `--color-danger`           | `#ef4444` | Erreur, suppression                      |
| `--color-info`             | `#3b82f6` | Info, confirmé                           |

### 5.2 Typographie

| Élément         | Taille          | Poids | Couleur          | Line-height |
| --------------- | --------------- | ----- | ---------------- | ----------- |
| H1 (page title) | 24px / 1.5rem   | 700   | foreground       | 1.2         |
| H2 (section)    | 18px / 1.125rem | 600   | foreground       | 1.3         |
| H3 (card title) | 16px / 1rem     | 600   | slate-800        | 1.4         |
| Body            | 14px / 0.875rem | 400   | slate-700        | 1.5         |
| Caption         | 12px / 0.75rem  | 400   | muted-foreground | 1.4         |
| Label           | 12px / 0.75rem  | 500   | muted-foreground | 1.4         |

### 5.3 Composants UI

#### 5.3.1 Existants (7 composants)

| Composant     | Fichier              | État                                      |
| ------------- | -------------------- | ----------------------------------------- |
| Button        | `button.tsx`         | ✅ OK, compléter variants (danger, ghost) |
| Input         | `input.tsx`          | ✅ OK                                     |
| Select        | `select.tsx`         | ✅ OK                                     |
| TextArea      | `textarea.tsx`       | ✅ OK                                     |
| Card          | `card.tsx`           | ✅ OK                                     |
| Badge         | `badge.tsx`          | ✅ OK                                     |
| ImageUploader | `image-uploader.tsx` | ✅ OK                                     |

#### 5.3.2 À créer (10 composants)

| Composant           | Priorité   | Spécifications                                          |
| ------------------- | ---------- | ------------------------------------------------------- |
| **Modal / Dialog**  | 🔴 Haute   | Overlay, focus trap, ESC pour fermer, `aria-labelledby` |
| **Toast**           | 🔴 Haute   | 4 severités, auto-dismiss 5s, pile empilée              |
| **Skeleton**        | 🟠 Moyenne | Pulse animation, dimensions configurables               |
| **Tabs**            | 🟠 Moyenne | Underlined variant, state controllable                  |
| **DatePicker**      | 🟠 Moyenne | Custom, vue mois/année, pas react-datepicker            |
| **Calendar**        | 🟠 Moyenne | Vue mois/semaine/jour, events, drag-drop RDV            |
| **Table**           | 🟠 Moyenne | Sortable, pagination, row actions, empty state          |
| **DropdownMenu**    | 🟡 Basse   | Actions contextuelles (kebab menu)                      |
| **Tooltip**         | 🟡 Basse   | Info au hover, accessible                               |
| **Checkbox**        | 🟠 Moyenne | Cases à cocher (formulaires, paramètres)                |
| **Radio**           | 🟠 Moyenne | Choix unique (sexe, plan, statut)                       |
| **Switch / Toggle** | 🟠 Moyenne | Activer/désactiver (features, paramètres)               |
| **Breadcrumb**      | 🟡 Basse   | Navigation hiérarchique dans le header                  |
| **Accordion**       | 🟡 Basse   | Sections pliables                                       |

### 5.4 Layout

| Élément      | Largeur              | Comportement                        |
| ------------ | -------------------- | ----------------------------------- |
| Sidebar      | 256px (w-64)         | Fixed, collapsible mobile (< 768px) |
| Header       | 100%                 | Sticky top, z-50                    |
| Content      | max-width 1280px     | Centered, padding responsive        |
| Page padding | px-4 sm:px-6 lg:px-8 | Responsive                          |
| Card gap     | gap-6                | Grid layout                         |

### 5.5 Accessibilité (obligatoire)

| Critère        | Implémentation                                                                         |
| -------------- | -------------------------------------------------------------------------------------- |
| Contraste      | Ratio WCAG AA minimum (4.5:1 pour texte normal)                                        |
| Focus visible  | `focus:ring-2 focus:ring-primary focus:outline-none` sur tous les éléments interactifs |
| ARIA           | `aria-label` sur les icônes boutons, `aria-describedby` sur les inputs avec erreur     |
| Keyboard nav   | Tab order logique, ESC pour fermer modales, Entrée pour submit                         |
| Screen readers | `sr-only` pour textes visuellement cachés, landmarks (`<main>`, `<nav>`)               |
| RTL            | `dir="rtl"` supporté via Tailwind logical properties                                   |

---

## 6. Structure de Dossiers (cible)

```
dentalg/
├── prisma/
│   ├── schema.prisma           # Source de vérité DB (annexe en fin de doc)
│   ├── migrations/             # Une migration = un sujet
│   └── seed.ts                 # Seed démo complet
│
├── src/
│   ├── app/
│   │   ├── (app)/              # Layout app (auth requis + clinicId)
│   │   │   ├── layout.tsx      # Sidebar + Header + auth guard
│   │   │   ├── error.tsx       # Global error boundary
│   │   │   ├── loading.tsx     # Global loading skeleton
│   │   │   ├── dashboard/
│   │   │   ├── patients/
│   │   │   ├── appointments/
│   │   │   ├── billing/
│   │   │   ├── procedures/
│   │   │   ├── prescriptions/
│   │   │   ├── lab/
│   │   │   ├── carrieres/
│   │   │   │   └── manage/
│   │   │   ├── messages/
│   │   │   ├── users/
│   │   │   ├── settings/
│   │   │   └── admin/
│   │   │
│   │   ├── (auth)/             # Pages publiques
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── superadmin/
│   │   │       └── login/
│   │   │
│   │   ├── (platform)/         # Back-office admin plateforme
│   │   │   ├── layout.tsx
│   │   │   └── superadmin/
│   │   │       ├── page.tsx
│   │   │       ├── clinics/
│   │   │       ├── clinic-requests/
│   │   │       ├── messages/
│   │   │       ├── requests/
│   │   │       └── tickets/
│   │   │
│   │   ├── (public)/           # Landing pages
│   │   │   ├── page.tsx
│   │   │   ├── carrieres/
│   │   │   ├── fonctionnalites/
│   │   │   └── request-clinic/
│   │   │
│   │   ├── api/                # Routes API
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   ├── clinic/
│   │   │   │   └── features/
│   │   │   ├── seed/
│   │   │   ├── support-ticket/
│   │   │   └── upload/
│   │   │
│   │   ├── globals.css         # ← Tailwind v4 tokens (UNIQUE)
│   │   └── layout.tsx          # Root layout
│   │
│   ├── components/
│   │   ├── ui/                 # Design System
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── table.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── date-picker.tsx
│   │   │   ├── dropdown.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── animations.tsx
│   │   │
│   │   ├── layout/             # Layout shells
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── page-wrapper.tsx
│   │   │
│   │   ├── dental/             # Composants métier dentaire
│   │   │   ├── odontogram.tsx
│   │   │   ├── tooth.tsx
│   │   │   └── dental-chart.tsx
│   │   │
│   │   └── forms/              # Composants formulaires
│   │       └── patient-form.tsx
│   │
│   ├── lib/
│   │   ├── prisma.ts           # Singleton PrismaClient
│   │   ├── auth.ts             # Auth.js config
│   │   ├── tenant.ts           # getClinicContext, withClinic
│   │   ├── rbac.ts             # requireRole
│   │   ├── permissions.ts      # PERMISSIONS matrice
│   │   ├── features.ts         # AVAILABLE_FEATURES
│   │   ├── audit.ts            # logAudit
│   │   ├── date.ts             # Formatage dates
│   │   ├── money.ts            # formatDA
│   │   ├── i18n/
│   │   │   └── dictionaries/
│   │   │       ├── fr.ts
│   │   │       └── ar.ts
│   │   ├── billing/
│   │   │   └── numbering.ts    # nextNumber
│   │   ├── validations/        # Schémas Zod
│   │   │   ├── patient.ts
│   │   │   ├── appointment.ts
│   │   │   ├── billing.ts
│   │   │   ├── user.ts
│   │   │   └── auth.ts
│   │   └── actions/            # Server Actions cross-module
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   └── hooks/
│       └── use-clinic-context.ts
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── setup.ts
│
├── public/
│   ├── logo.svg
│   └── favicon.ico
│
├── .env.example
├── .env.local
├── .github/
│   └── workflows/
│       └── ci.yml
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── package.json
├── package-lock.json
└── RECONSTRUCTION-PLAN.md
```

> **⚠️ Pas de `src/styles/globals.css`** : Tailwind v4 utilise `src/app/globals.css` uniquement.

---

## 7. Tests & Qualité

### 7.1 Stratégie de tests

| Type            | Outil                  | Portée                        | Fréquence     |
| --------------- | ---------------------- | ----------------------------- | ------------- |
| **Unitaires**   | Vitest                 | Fonctions pures               | Chaque commit |
| **Intégration** | Vitest + Prisma        | Server Actions avec base test | PR            |
| **E2E**         | Playwright (optionnel) | Parcours utilisateur          | Pré-release   |

### 7.2 Vitest configuration

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
  },
});
```

### 7.3 Base de test isolée

```typescript
// tests/setup.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL_TEST } },
});

beforeEach(async () => {
  await prisma.$transaction([
    prisma.payment.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.patient.deleteMany(),
    prisma.user.deleteMany(),
    prisma.clinic.deleteMany(),
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

### 7.4 Exemple de test unitaire

```typescript
// tests/unit/lib/money.test.ts
import { describe, it, expect } from "vitest";
import { formatDA } from "@/lib/money";

describe("formatDA", () => {
  it("formate les centimes en DA", () => {
    expect(formatDA(1500000)).toBe("15 000,00 DA");
    expect(formatDA(1250)).toBe("12,50 DA");
    expect(formatDA(0)).toBe("0,00 DA");
  });
});
```

### 7.5 Husky + lint-staged

```json
{
  "scripts": {
    "lint": "eslint .",
    "test": "vitest run",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

### 7.6 CI/CD GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

---

## 8. Cache & Performance

### 8.1 Stratégie de cache

| Mécanisme                                           | Usage                   | Quand invalider            |
| --------------------------------------------------- | ----------------------- | -------------------------- |
| `revalidatePath("/patients")`                       | Après mutation patient  | Après create/update/delete |
| `revalidatePath("/patients/${id}")`                 | Fiche spécifique        | Après update               |
| `revalidateTag("patients")`                         | Tag groupé              | Après toute mutation       |
| `unstable_cache(fn, ["key"], { revalidate: 3600 })` | Données peu changeantes | TTL                        |

### 8.2 Error Boundaries

```typescript
// src/app/(app)/error.tsx
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
      <h2 className="text-xl font-semibold">Une erreur est survenue</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>Réessayer</Button>
    </div>
  );
}
```

```typescript
// src/app/(app)/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-1/3" />
      <div className="grid grid-cols-3 gap-6">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    </div>
  );
}
```

---

## 9. Intégrations

### 9.1 Cloudinary (uploads)

```typescript
// src/lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function signUpload(folder: string) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const params = {
    timestamp,
    folder,
    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
  };
  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!,
  );
  return { signature, timestamp, ...params };
}
```

**Validation côté serveur** :

- Taille max : 10 Mo
- Types MIME : `image/*`, `application/pdf`
- URL signée avec expiration (1h par défaut)

### 9.2 Resend (emails)

```typescript
// src/lib/email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordReset(email: string, token: string) {
  await resend.emails.send({
    from: "DENTALG <noreply@dentalg.dz>",
    to: email,
    subject: "Réinitialisation de votre mot de passe",
    html: `...`,
  });
}
```

### 9.3 Rate Limiting — Exemple complet

```typescript
// src/lib/rate-limit.ts
import { LRUCache } from "lru-cache";

const rateLimitCache = new LRUCache<string, number>({
  max: 500,
  ttl: 1000 * 60 * 15, // 15 minutes
});

export function checkRateLimit(key: string, maxAttempts: number = 5): boolean {
  const attempts = rateLimitCache.get(key) ?? 0;
  if (attempts >= maxAttempts) return false;
  rateLimitCache.set(key, attempts + 1);
  return true;
}
```

Usage complet dans une Server Action :

```typescript
// src/app/(app)/patients/actions.ts
"use server";

import { checkRateLimit } from "@/lib/rate-limit";
import { requireRole } from "@/lib/rbac";
import { requireClinicContext } from "@/lib/tenant";

export async function createPatient(data: unknown) {
  // 1. RBAC
  await requireRole("patients:write");

  // 2. Tenant context
  const ctx = await requireClinicContext();

  // 3. Rate limit (par clinicId pour éviter spam)
  const rateKey = `createPatient:${ctx.clinicId}`;
  if (!checkRateLimit(rateKey, 100)) {
    return {
      ok: false,
      errors: { global: ["Trop de requêtes. Réessayez dans 15 minutes."] },
    };
  }

  // 4. Validation + logique métier...
}
```

---

## 10. Conventions de Code

### 10.1 Nommage

| Type             | Convention               | Exemple                          |
| ---------------- | ------------------------ | -------------------------------- |
| Composants       | PascalCase               | `PatientCard`, `Odontogram`      |
| Hooks            | camelCase, préfixe `use` | `useClinicContext`               |
| Server Actions   | camelCase, verbe         | `createPatient`, `updateInvoice` |
| Types/Interfaces | PascalCase               | `Patient`, `AppointmentStatus`   |
| Enums (Prisma)   | UPPER_SNAKE_CASE         | `ISSUED`, `PAID`                 |
| Fichiers         | kebab-case               | `patient-edit-form.tsx`          |
| Constants        | UPPER_SNAKE_CASE         | `MAX_UPLOAD_SIZE`                |

### 10.2 Imports (ordre strict)

```typescript
// 1. React/Next
import { useState } from "react";
import Link from "next/link";

// 2. Librairies tierces
import { motion } from "framer-motion";

// 3. Composants UI
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// 4. Composants métier
import { PatientForm } from "@/components/forms/patient-form";

// 5. Lib
import { requireRole } from "@/lib/rbac";
import { formatDA } from "@/lib/money";

// 6. Types
import type { Patient } from "@/types";
```

### 10.3 Server Action template (obligatoire)

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { requireClinicContext, withClinic } from "@/lib/tenant";
import { patientSchema } from "@/lib/validations/patient";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { AuditAction } from "@prisma/client";

function normalizeOptional(value: string | undefined): string | null {
  return value === undefined || value === "" ? null : value;
}

export async function createPatient(data: unknown) {
  await requireRole("patients:write");
  const ctx = await requireClinicContext();

  const parsed = patientSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  try {
    const number = await nextNumber(ctx.clinicId, "PATIENT", { pad: 4 });
    const patient = await prisma.patient.create({
      data: withClinic(ctx, {
        number,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        // ... autres champs
      }),
    });

    await logAudit({
      action: AuditAction.CREATE,
      entityType: "Patient",
      entityId: patient.id,
      clinicId: ctx.clinicId,
      userId: ctx.userId,
    });

    revalidatePath("/patients");
    return { ok: true, patient } as const;
  } catch (err) {
    return {
      ok: false,
      errors: {
        global: [
          `Erreur serveur : ${err instanceof Error ? err.message : "inconnue"}`,
        ],
      },
    } as const;
  }
}
```

### 10.4 Montants & Dates

| Aspect      | Règle                   | Exemple                    |
| ----------- | ----------------------- | -------------------------- |
| Stockage    | Int en centimes         | `1500000` = 15 000,00 DA   |
| Affichage   | `formatDA(cents)`       | `"15 000,00 DA"`           |
| Fuseau      | Africa/Algiers          | Toutes les dates affichées |
| Stockage DB | UTC (DateTime)          | Conversion à l'affichage   |
| Input       | `<input type="date" />` | Navigateur gère le picker  |

---

## 11. Plan d'Implémentation par Phases

### Phase 0 — Fondations (Semaine 1)

**Objectif** : Projet propre, compilable, auth + Design System de base.

- [ ] Vérifier `package.json`, dépendances, scripts
- [ ] Finaliser le schéma Prisma complet, migrer
- [ ] Vérifier `auth.ts`, middleware, verrouillage login
- [ ] Compléter les 7 composants existants + créer Modal, Toast, Skeleton
- [ ] Vérifier `tenant.ts`, `rbac.ts`, `audit.ts`, `date.ts`, `money.ts`
- [ ] Sidebar corrigée (activation spécifique), Header, PageWrapper
- [ ] `error.tsx` + `loading.tsx` dans `(app)`
- [ ] Enrichir seed avec features activées, counters initialisés
- [ ] Créer `.github/workflows/ci.yml`
- [ ] Configurer Vitest, écrire tests unitaires

### Phase 1 — Patients (Semaine 2)

- [ ] Liste patients : table, recherche, filtres actifs/archivés
- [ ] Création patient : formulaire Zod, numérotation auto
- [ ] Édition patient : pré-remplissage, validation
- [ ] Fiche patient : informations, état général, historique
- [ ] Soft-delete + restauration
- [ ] Archivage (`isActive`)
- [ ] Odontogramme FDI (lecture seule)

### Phase 2 — Rendez-vous (Semaine 3)

- [ ] Calendrier custom : vue mois/semaine/jour
- [ ] CRUD rendez-vous, drag & drop
- [ ] Salle d'attente en temps réel
- [ ] Statuts : SCHEDULED → CONFIRMED → COMPLETED
- [ ] Rappels SMS (intégration à définir)

### Phase 3 — Actes & Facturation (Semaine 4)

- [ ] Catalogue d'actes : CRUD, tarification centimes
- [ ] Plans de traitement (devis)
- [ ] Conversion devis → facture
- [ ] Gestion paiements multi-méthodes
- [ ] Avoirs (credit notes)
- [ ] Export PDF factures

### Phase 4 — Médical (Semaine 5)

- [ ] Ordonnances types + personnalisées
- [ ] Impression PDF ordonnance
- [ ] Labo prothèse : demandes, suivi statut
- [ ] Résultats labo : NORMAL/ANORMAL/CRITICAL
- [ ] Notes médicales append-only

### Phase 5 — Business & Admin (Semaine 6)

- [ ] Gestion utilisateurs : invitations, rôles
- [ ] Plans d'abonnement : FREE → ESSENTIEL → PRO → PREMIUM
- [ ] Feature flags par plan
- [ ] Back-office superadmin
- [ ] Analytics : CA, conversion, fréquentation
- [ ] Messagerie interne cabinet

### Phase 6 — Écosystème (Semaine 7)

- [ ] Carrières cross-tenant
- [ ] Marketplace (ClinicListing, EquipmentListing)
- [ ] Stock : gestion inventaire
- [ ] i18n complet fr + ar (RTL)
- [ ] Responsive mobile
- [ ] Accessibilité audit
- [ ] Tests E2E Playwright

---

## 12. Checklist de Démarrage

### Étape 1 : Fondations (Jour 1-2)

```bash
cd dentalg
npm install
npx prisma generate
npx tsc --noEmit
npm run build
# Si tout passe → ✅
```

### Étape 2 : Prisma & Seed (Jour 2-3)

```bash
# En local : migrate dev
npx prisma migrate dev --name add_general_condition
npx prisma generate
npx prisma db seed

# En production : migrate deploy (automatique via vercel-build)
# npx prisma migrate deploy
```

### Étape 3 : Vérifier les fondations (Jour 3)

- [ ] Auth : login → JWT contient `id`, `role`, `clinicId`
- [ ] Middleware : route privée sans auth → redirect `/login`
- [ ] RBAC : `requireRole("platform:admin")` sur `/superadmin` → `notFound()`
- [ ] Tenant : `withClinic(ctx)` injecte `clinicId`
- [ ] Audit : chaque action écrit un `AuditLog`
- [ ] Feature flags : navigation masquée selon `AVAILABLE_FEATURES`

### Étape 4 : Première page (Jour 4-5)

```
Commencer par Patients :
1. Liste patients (Server Component + Server Action)
2. Page création (formulaire + createPatient)
3. Page détail (Server Component getPatient)
4. Page édition (formulaire + updatePatient)
```

### Étape 5 : Itérer (Jour 6+)

Suivre les phases 1-6. Une phase = une semaine.

---

## 13. Anti-patterns à éviter

| ❌ Anti-pattern               | ✅ Solution                                        |
| ----------------------------- | -------------------------------------------------- |
| Client Component par défaut   | Server Component par défaut                        |
| API routes pour CRUD métier   | Server Actions                                     |
| `any` partout                 | TypeScript strict, `unknown` + Zod                 |
| Données patient dans les logs | ID seulement                                       |
| DELETE physique               | Soft-delete (`deletedAt`) + archivage (`isActive`) |
| Float pour l'argent           | Int en centimes                                    |
| Props drilling profond        | Composition + Server Components                    |
| Librairie UI lourde           | Composants custom Tailwind                         |
| `useEffect` pour fetch data   | Server Components + Server Actions                 |
| Commit sans vérification      | `tsc --noEmit && npm run build`                    |
| `tailwind.config.ts`          | `src/app/globals.css` avec `@theme inline`         |
| Plusieurs `globals.css`       | Un seul `src/app/globals.css`                      |
| Ressource autre tenant → 403  | `notFound()` (404)                                 |

---

## 14. Variables d'Environnement

```bash
# .env.example
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
DATABASE_URL_TEST="postgresql://user:pass@host/db_test?sslmode=require"
AUTH_SECRET="your-auth-secret-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
CLOUDINARY_UPLOAD_PRESET="dentalg-uploads"
RESEND_API_KEY="re_xxxxxxxx"
APP_URL="http://localhost:3000"
APP_NAME="DENTALG"
```

---

## 15. Annexe — Schéma Prisma Complet

> Source de vérité pour la base de données. À synchroniser avec `prisma/schema.prisma`.

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

enum Role {
  OWNER
  DENTIST
  ASSISTANT
  SECRETARY
  PLATFORM_ADMIN
}

enum Plan {
  FREE
  ESSENTIEL
  PRO
  PREMIUM
}

enum Sex {
  M
  F
}

enum BloodGroup {
  A_POS
  A_NEG
  B_POS
  B_NEG
  AB_POS
  AB_NEG
  O_POS
  O_NEG
}

enum GeneralCondition {
  RAS
  HYPERTENSION_ARTERIELLE
  DIABETE
  INSUFFISANCE_CARDIAQUE
  INFARCTUS_DU_MYOCARDE
  ENDOCARDITE
  ASTHME
  TUBERCULOSE
  ALLERGIE
  INSUFFISANCE_RENALE_CHRONIQUE
  ANEMIES
  RETARD_PSYCHOMOTEUR
  EPILEPSIE
  AUTRE
}

enum AppointmentStatus {
  SCHEDULED
  CONFIRMED
  CANCELLED
  NO_SHOW
  COMPLETED
}

enum InvoiceStatus {
  DRAFT
  ISSUED
  PAID
  OVERDUE
  CREDIT_NOTE
}

enum QuoteStatus {
  DRAFT
  SENT
  ACCEPTED
  REJECTED
  EXPIRED
}

enum PaymentMethod {
  CASH
  CARD
  TRANSFER
  CHEQUE
  OTHER
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

enum PrescriptionStatus {
  DRAFT
  ISSUED
}

enum LabOrderStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum LabResultStatus {
  PENDING
  NORMAL
  ABNORMAL
  CRITICAL
}

enum JobOfferStatus {
  DRAFT
  PUBLISHED
  CLOSED
}

enum ApplicationStatus {
  PENDING
  REVIEWING
  ACCEPTED
  REJECTED
}

enum AuditAction {
  CREATE
  UPDATE
  DELETE
  LOGIN
  LOGOUT
  EXPORT
  VIEW
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELLED
  EXPIRED
}

enum TicketType {
  BUG
  COMMENT
  FEATURE_REQUEST
  SUGGESTION
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}

enum RequestStatus {
  PENDING
  APPROVED
  REJECTED
}

enum PlatformMessageType {
  ANNOUNCEMENT
  ALERT
  MAINTENANCE
  UPDATE
}

enum ListingStatus {
  DRAFT
  PUBLISHED
  SOLD
}

// ═══════════════════════════════════════════════════════════════
// MODELS
// ═══════════════════════════════════════════════════════════════

model Clinic {
  id                   String                @id @default(cuid())
  name                 String
  slug                 String                @unique
  email                String
  phone                String?
  address              String?
  city                 String?
  wilaya               String?
  plan                 Plan                  @default(FREE)
  isActive             Boolean               @default(true)
  features             Json?                 @default("{}")
  createdAt            DateTime              @default(now())
  updatedAt            DateTime              @updatedAt
  deletedAt            DateTime?

  users                User[]
  patients             Patient[]
  procedures           Procedure[]
  treatmentPlans       TreatmentPlan[]
  treatmentItems       TreatmentItem[]
  attachments          Attachment[]
  appointments         Appointment[]
  reminderLogs         ReminderLog[]
  waitlistEntries      WaitlistEntry[]
  quotes               Quote[]
  quoteItems           QuoteItem[]
  invoices             Invoice[]
  invoiceItems         InvoiceItem[]
  payments             Payment[]
  jobOffers            JobOffer[]
  jobApplications      JobApplication[]
  applicationMessages  ApplicationMessage[]
  auditLogs            AuditLog[]
  notifications        Notification[]
  planDefinitions      PlanDefinition[]
  subscriptionPayments SubscriptionPayment[]
  medicalNotes         MedicalNote[]
  toothStatuses        ToothStatus[]
  toothStatusEvents    ToothStatusEvent[]
  prescriptions        Prescription[]
  prescriptionItems    PrescriptionItem[]
  labOrders            LabOrder[]
  labResults           LabResult[]
  counters             Counter[]
  supportTickets       SupportTicket[]
  userRequests         UserRequest[]
  clinicListings       ClinicListing[]
  equipmentListings    EquipmentListing[]
}

model User {
  id                   String                @id @default(cuid())
  clinicId             String?
  clinic               Clinic?               @relation(fields: [clinicId], references: [id])
  email                String                @unique
  passwordHash         String
  firstName            String
  lastName             String
  role                 Role                  @default(SECRETARY)
  emailVerified        DateTime?
  isActive             Boolean               @default(true)
  lastLoginAt          DateTime?
  createdAt            DateTime              @default(now())
  updatedAt            DateTime              @updatedAt
  deletedAt            DateTime?

  passwordResetTokens  PasswordResetToken[]
  medicalNotes         MedicalNote[]
  toothStatusEvents    ToothStatusEvent[]
  treatmentPlans       TreatmentPlan[]
  treatmentItems       TreatmentItem[]
  attachments          Attachment[]
  appointmentsCreated  Appointment[]         @relation("CreatedBy")
  appointmentsDentist  Appointment[]         @relation("Dentist")
  reminderLogs         ReminderLog[]
  quotes               Quote[]
  invoices             Invoice[]
  payments             Payment[]
  jobApplications      JobApplication[]
  applicationMessages  ApplicationMessage[]
  notifications        Notification[]
  auditLogs            AuditLog[]
  prescriptions        Prescription[]
  labOrders            LabOrder[]
  labResults           LabResult[]
  supportTickets       SupportTicket[]
  userRequestsCreated  UserRequest[]

  @@index([clinicId])
  @@index([email])
}

model PasswordResetToken {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash String    @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())

  @@index([userId])
  @@index([tokenHash])
}

model Patient {
  id                    String            @id @default(cuid())
  clinicId              String
  clinic                Clinic            @relation(fields: [clinicId], references: [id])
  number                String
  firstName             String
  lastName              String
  nationalId            String?
  sex                   Sex?
  bloodGroup            BloodGroup?
  generalCondition      GeneralCondition?
  dateOfBirth           DateTime?
  phone                 String?
  email                 String?
  address               String?
  city                  String?
  wilaya                String?
  emergencyContactName  String?
  emergencyContactPhone String?
  medicalHistory        String?
  allergies             String?
  currentMedications    String?
  notes                 String?
  isActive              Boolean           @default(true)
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt
  deletedAt             DateTime?

  medicalNotes    MedicalNote[]
  toothStatuses   ToothStatus[]
  toothStatusEvents ToothStatusEvent[]
  treatmentPlans  TreatmentPlan[]
  attachments     Attachment[]
  appointments    Appointment[]
  quotes          Quote[]
  invoices        Invoice[]
  payments        Payment[]
  reminderLogs    ReminderLog[]
  waitlistEntries WaitlistEntry[]
  prescriptions   Prescription[]
  labOrders       LabOrder[]

  @@unique([clinicId, number])
  @@index([clinicId])
  @@index([clinicId, lastName])
}

model MedicalNote {
  id          String   @id @default(cuid())
  clinicId    String
  clinic      Clinic   @relation(fields: [clinicId], references: [id])
  patientId   String
  patient     Patient  @relation(fields: [patientId], references: [id])
  createdById String
  createdBy   User     @relation(fields: [createdById], references: [id])
  content     String
  createdAt   DateTime @default(now())

  @@index([clinicId])
  @@index([patientId])
  @@index([createdById])
  @@index([clinicId, patientId])
}

model ToothStatus {
  id        String   @id @default(cuid())
  clinicId  String
  clinic    Clinic   @relation(fields: [clinicId], references: [id])
  patientId String
  patient   Patient  @relation(fields: [patientId], references: [id])
  tooth     Int
  status    String
  surfaces  Json?
  notes     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  events ToothStatusEvent[]

  @@unique([clinicId, patientId, tooth])
  @@index([clinicId])
  @@index([patientId])
}

model ToothStatusEvent {
  id            String      @id @default(cuid())
  clinicId      String
  clinic        Clinic      @relation(fields: [clinicId], references: [id])
  toothStatusId String
  toothStatus   ToothStatus @relation(fields: [toothStatusId], references: [id])
  patientId     String
  patient       Patient     @relation(fields: [patientId], references: [id])
  createdById   String
  createdBy     User        @relation(fields: [createdById], references: [id])
  oldStatus     String?
  newStatus     String
  notes         String?
  createdAt     DateTime    @default(now())

  @@index([clinicId])
  @@index([toothStatusId])
  @@index([patientId])
  @@index([createdById])
}

model Procedure {
  id          String   @id @default(cuid())
  clinicId    String?
  clinic      Clinic?  @relation(fields: [clinicId], references: [id])
  code        String
  name        String
  description String?
  priceCents  Int      @default(0)
  color       String?
  isActive    Boolean  @default(true)
  isReference Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?

  treatmentItems TreatmentItem[]
  quoteItems     QuoteItem[]
  invoiceItems   InvoiceItem[]

  @@unique([clinicId, code])
  @@index([clinicId])
}

model TreatmentPlan {
  id          String   @id @default(cuid())
  clinicId    String
  clinic      Clinic   @relation(fields: [clinicId], references: [id])
  patientId   String
  patient     Patient  @relation(fields: [patientId], references: [id])
  createdById String
  createdBy   User     @relation(fields: [createdById], references: [id])
  title       String
  status      String   @default("draft")
  totalCents  Int      @default(0)
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?

  items TreatmentItem[]

  @@index([clinicId])
  @@index([patientId])
  @@index([createdById])
}

model TreatmentItem {
  id              String        @id @default(cuid())
  clinicId        String
  clinic          Clinic        @relation(fields: [clinicId], references: [id])
  treatmentPlanId String
  treatmentPlan   TreatmentPlan @relation(fields: [treatmentPlanId], references: [id])
  procedureId     String
  procedure       Procedure     @relation(fields: [procedureId], references: [id])
  tooth           Int?
  quantity        Int           @default(1)
  priceCents      Int
  notes           String?
  createdById     String
  createdBy       User          @relation(fields: [createdById], references: [id])
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([clinicId])
  @@index([treatmentPlanId])
  @@index([procedureId])
  @@index([createdById])
}

model Attachment {
  id                 String   @id @default(cuid())
  clinicId           String
  clinic             Clinic   @relation(fields: [clinicId], references: [id])
  patientId          String?
  patient            Patient? @relation(fields: [patientId], references: [id])
  uploadedById       String
  uploadedBy         User     @relation(fields: [uploadedById], references: [id])
  name               String
  mimeType           String
  size               Int
  cloudinaryPublicId String
  url                String
  expiresAt          DateTime?
  createdAt          DateTime @default(now())
  deletedAt          DateTime?

  @@index([clinicId])
  @@index([patientId])
  @@index([uploadedById])
}

model Appointment {
  id          String            @id @default(cuid())
  clinicId    String
  clinic      Clinic            @relation(fields: [clinicId], references: [id])
  patientId   String
  patient     Patient           @relation(fields: [patientId], references: [id])
  dentistId   String
  dentist     User              @relation(fields: [dentistId], references: [id], name: "Dentist")
  createdById String
  createdBy   User              @relation(fields: [createdById], references: [id], name: "CreatedBy")
  startAt     DateTime
  endAt       DateTime
  status      AppointmentStatus @default(SCHEDULED)
  notes       String?
  reason      String?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  deletedAt   DateTime?

  reminderLogs ReminderLog[]

  @@index([clinicId])
  @@index([patientId])
  @@index([dentistId])
  @@index([createdById])
  @@index([clinicId, startAt])
}

model ReminderLog {
  id            String        @id @default(cuid())
  clinicId      String
  clinic        Clinic        @relation(fields: [clinicId], references: [id])
  appointmentId String?
  appointment   Appointment?  @relation(fields: [appointmentId], references: [id])
  patientId     String?
  patient       Patient?      @relation(fields: [patientId], references: [id])
  sentById      String
  sentBy        User          @relation(fields: [sentById], references: [id])
  channel       String        @default("sms")
  content       String
  status        String
  error         String?
  sentAt        DateTime      @default(now())

  @@index([clinicId])
  @@index([appointmentId])
  @@index([patientId])
  @@index([sentById])
}

model WaitlistEntry {
  id                  String    @id @default(cuid())
  clinicId            String
  clinic              Clinic    @relation(fields: [clinicId], references: [id])
  patientId           String
  patient             Patient   @relation(fields: [patientId], references: [id])
  preferredDays       String[]
  preferredTimeStart  DateTime?
  preferredTimeEnd    DateTime?
  notes               String?
  isActive            Boolean   @default(true)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  @@index([clinicId])
  @@index([patientId])
}

model Quote {
  id          String      @id @default(cuid())
  clinicId    String
  clinic      Clinic      @relation(fields: [clinicId], references: [id])
  patientId   String
  patient     Patient     @relation(fields: [patientId], references: [id])
  createdById String
  createdBy   User        @relation(fields: [createdById], references: [id])
  number      String
  status      QuoteStatus @default(DRAFT)
  totalCents  Int         @default(0)
  validUntil  DateTime?
  notes       String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  deletedAt   DateTime?

  items    QuoteItem[]
  invoices Invoice[]

  @@unique([clinicId, number])
  @@index([clinicId])
  @@index([patientId])
  @@index([createdById])
}

model QuoteItem {
  id             String    @id @default(cuid())
  clinicId       String
  clinic         Clinic    @relation(fields: [clinicId], references: [id])
  quoteId        String
  quote          Quote     @relation(fields: [quoteId], references: [id])
  procedureId    String
  procedure      Procedure @relation(fields: [procedureId], references: [id])
  tooth          Int?
  quantity       Int       @default(1)
  unitPriceCents Int
  totalCents     Int

  @@index([clinicId])
  @@index([quoteId])
  @@index([procedureId])
}

model Invoice {
  id          String        @id @default(cuid())
  clinicId    String
  clinic      Clinic        @relation(fields: [clinicId], references: [id])
  patientId   String
  patient     Patient       @relation(fields: [patientId], references: [id])
  createdById String
  createdBy   User          @relation(fields: [createdById], references: [id])
  quoteId     String?
  quote       Quote?        @relation(fields: [quoteId], references: [id])
  number      String
  status      InvoiceStatus @default(DRAFT)
  totalCents  Int           @default(0)
  paidCents   Int           @default(0)
  dueDate     DateTime?
  notes       String?
  issuedAt    DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  deletedAt   DateTime?

  items    InvoiceItem[]
  payments Payment[]

  @@unique([clinicId, number])
  @@index([clinicId])
  @@index([patientId])
  @@index([createdById])
  @@index([quoteId])
}

model InvoiceItem {
  id             String    @id @default(cuid())
  clinicId       String
  clinic         Clinic    @relation(fields: [clinicId], references: [id])
  invoiceId      String
  invoice        Invoice   @relation(fields: [invoiceId], references: [id])
  procedureId    String
  procedure      Procedure @relation(fields: [procedureId], references: [id])
  tooth          Int?
  quantity       Int       @default(1)
  unitPriceCents Int
  totalCents     Int

  @@index([clinicId])
  @@index([invoiceId])
  @@index([procedureId])
}

model Payment {
  id           String        @id @default(cuid())
  clinicId     String
  clinic       Clinic        @relation(fields: [clinicId], references: [id])
  patientId    String
  patient      Patient       @relation(fields: [patientId], references: [id])
  invoiceId    String?
  invoice      Invoice?      @relation(fields: [invoiceId], references: [id])
  receivedById String
  receivedBy   User          @relation(fields: [receivedById], references: [id])
  amountCents  Int
  method       PaymentMethod @default(CASH)
  status       PaymentStatus @default(COMPLETED)
  reference    String?
  paidAt       DateTime      @default(now())
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@index([clinicId])
  @@index([patientId])
  @@index([invoiceId])
  @@index([receivedById])
}

model JobOffer {
  id           String         @id @default(cuid())
  clinicId     String
  clinic       Clinic         @relation(fields: [clinicId], references: [id])
  title        String
  description  String
  location     String?
  requirements String?
  status       JobOfferStatus @default(DRAFT)
  publishedAt  DateTime?
  closesAt     DateTime?
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  deletedAt    DateTime?

  applications JobApplication[]

  @@index([clinicId])
  @@index([status])
}

model CandidateProfile {
  id           String   @id @default(cuid())
  email        String   @unique
  firstName    String
  lastName     String
  phone        String?
  cvUrl        String?
  coverLetter  String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  applications JobApplication[]
}

model JobApplication {
  id                 String            @id @default(cuid())
  clinicId           String
  clinic             Clinic            @relation(fields: [clinicId], references: [id])
  jobOfferId         String
  jobOffer           JobOffer          @relation(fields: [jobOfferId], references: [id])
  candidateProfileId String
  candidateProfile   CandidateProfile  @relation(fields: [candidateProfileId], references: [id])
  reviewedById       String?
  reviewedBy         User?             @relation(fields: [reviewedById], references: [id])
  status             ApplicationStatus @default(PENDING)
  notes              String?
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt

  messages ApplicationMessage[]

  @@index([clinicId])
  @@index([jobOfferId])
  @@index([candidateProfileId])
  @@index([reviewedById])
}

model ApplicationMessage {
  id               String         @id @default(cuid())
  clinicId         String
  clinic           Clinic         @relation(fields: [clinicId], references: [id])
  jobApplicationId String
  jobApplication   JobApplication @relation(fields: [jobApplicationId], references: [id])
  senderId         String?
  sender           User?          @relation(fields: [senderId], references: [id])
  content          String
  isInternal       Boolean        @default(false)
  createdAt        DateTime       @default(now())

  @@index([clinicId])
  @@index([jobApplicationId])
  @@index([senderId])
}

model Notification {
  id        String   @id @default(cuid())
  clinicId  String
  clinic    Clinic   @relation(fields: [clinicId], references: [id])
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  title     String
  content   String
  isRead    Boolean  @default(false)
  link      String?
  createdAt DateTime @default(now())

  @@index([clinicId])
  @@index([userId])
  @@index([clinicId, userId])
}

model AuditLog {
  id         String      @id @default(cuid())
  clinicId   String?
  clinic     Clinic?     @relation(fields: [clinicId], references: [id])
  userId     String?
  user       User?       @relation(fields: [userId], references: [id])
  action     AuditAction
  entityType String
  entityId   String?
  metadata   Json?
  ip         String?
  userAgent  String?
  createdAt  DateTime    @default(now())

  @@index([clinicId])
  @@index([userId])
  @@index([action])
  @@index([entityType])
  @@index([createdAt])
}

model PlanDefinition {
  id                String   @id @default(cuid())
  clinicId          String?
  clinic            Clinic?  @relation(fields: [clinicId], references: [id])
  plan              Plan     @unique
  name              String
  description       String?
  monthlyPriceCents Int      @default(0)
  yearlyPriceCents  Int      @default(0)
  features          Json?
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([clinicId])
}

model SubscriptionPayment {
  id          String             @id @default(cuid())
  clinicId    String
  clinic      Clinic             @relation(fields: [clinicId], references: [id])
  plan        Plan
  amountCents Int
  status      SubscriptionStatus @default(ACTIVE)
  startedAt   DateTime
  expiresAt   DateTime
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt

  @@index([clinicId])
  @@index([status])
  @@index([expiresAt])
}

model Prescription {
  id          String             @id @default(cuid())
  clinicId    String
  clinic      Clinic             @relation(fields: [clinicId], references: [id])
  patientId   String
  patient     Patient            @relation(fields: [patientId], references: [id])
  createdById String
  createdBy   User               @relation(fields: [createdById], references: [id])
  number      String
  status      PrescriptionStatus @default(DRAFT)
  notes       String?
  issuedAt    DateTime           @default(now())
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt
  deletedAt   DateTime?

  items PrescriptionItem[]

  @@unique([clinicId, number])
  @@index([clinicId])
  @@index([patientId])
  @@index([createdById])
  @@index([clinicId, issuedAt])
}

model PrescriptionItem {
  id             String       @id @default(cuid())
  clinicId       String
  clinic         Clinic       @relation(fields: [clinicId], references: [id])
  prescriptionId String
  prescription   Prescription @relation(fields: [prescriptionId], references: [id], onDelete: Cascade)
  name           String
  dosage         String?
  duration       String?
  instructions   String?
  position       Int          @default(0)
  createdAt      DateTime     @default(now())

  @@index([clinicId])
  @@index([prescriptionId])
  @@index([clinicId, position])
}

model LabOrder {
  id             String         @id @default(cuid())
  clinicId       String
  clinic         Clinic         @relation(fields: [clinicId], references: [id])
  patientId      String
  patient        Patient        @relation(fields: [patientId], references: [id])
  createdById    String
  createdBy      User           @relation(fields: [createdById], references: [id])
  number         String
  status         LabOrderStatus @default(PENDING)
  orderedAt      DateTime       @default(now())
  requestedTests String[]
  notes          String?
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  deletedAt      DateTime?

  results LabResult[]

  @@unique([clinicId, number])
  @@index([clinicId])
  @@index([patientId])
  @@index([createdById])
  @@index([clinicId, orderedAt])
}

model LabResult {
  id             String          @id @default(cuid())
  clinicId       String
  clinic         Clinic          @relation(fields: [clinicId], references: [id])
  labOrderId     String
  labOrder       LabOrder        @relation(fields: [labOrderId], references: [id], onDelete: Cascade)
  testName       String
  value          String?
  unit           String?
  referenceRange String?
  status         LabResultStatus @default(PENDING)
  notes          String?
  reportedAt     DateTime?
  reportedById   String?
  reportedBy     User?           @relation(fields: [reportedById], references: [id])
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  @@index([clinicId])
  @@index([labOrderId])
  @@index([reportedById])
}

model Counter {
  id        String   @id @default(cuid())
  clinicId  String
  type      String
  value     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  clinic Clinic @relation(fields: [clinicId], references: [id])

  @@unique([clinicId, type])
  @@index([clinicId])
}

model SupportTicket {
  id          String       @id @default(cuid())
  clinicId    String
  clinic      Clinic       @relation(fields: [clinicId], references: [id])
  userId      String
  user        User         @relation(fields: [userId], references: [id])
  type        TicketType
  subject     String
  description String
  status      TicketStatus @default(OPEN)
  attachments Json?
  messages    TicketMessage[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@index([clinicId])
  @@index([userId])
  @@index([status])
  @@index([type])
  @@index([createdAt])
}

model TicketMessage {
  id        String        @id @default(cuid())
  ticketId  String
  ticket    SupportTicket @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  authorId  String
  content   String
  isAdmin   Boolean       @default(false)
  createdAt DateTime      @default(now())

  @@index([ticketId])
  @@index([authorId])
}

model UserRequest {
  id           String        @id @default(cuid())
  clinicId     String
  clinic       Clinic        @relation(fields: [clinicId], references: [id])
  requesterId  String
  requester    User          @relation(fields: [requesterId], references: [id])
  firstName    String
  lastName     String
  email        String
  role         Role
  status       RequestStatus @default(PENDING)
  reviewedById String?
  reviewedAt   DateTime?
  notes        String?
  createdAt    DateTime      @default(now())

  @@index([clinicId])
  @@index([requesterId])
  @@index([status])
  @@index([createdAt])
}

model ClinicRequest {
  id             String        @id @default(cuid())
  name           String
  slug           String
  email          String
  phone          String?
  address        String?
  city           String?
  wilaya         String?
  ownerFirstName String
  ownerLastName  String
  ownerEmail     String
  ownerPassword  String?
  status         RequestStatus @default(PENDING)
  reviewedById   String?
  reviewedAt     DateTime?
  notes          String?
  createdAt      DateTime      @default(now())

  @@index([status])
  @@index([createdAt])
}

model ClinicListing {
  id           String        @id @default(cuid())
  clinicId     String
  clinic       Clinic        @relation(fields: [clinicId], references: [id])
  title        String
  description  String
  price        Int           @default(0)
  location     String?
  city         String?
  wilaya       String?
  photos       String[]
  status       ListingStatus @default(DRAFT)
  contactPhone String?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  deletedAt    DateTime?

  @@index([clinicId])
  @@index([status])
}

model EquipmentListing {
  id          String        @id @default(cuid())
  clinicId    String
  clinic      Clinic        @relation(fields: [clinicId], references: [id])
  title       String
  description String
  price       Int           @default(0)
  condition   String?       // neuf, occasion, etc.
  photos      String[]
  status      ListingStatus @default(DRAFT)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  deletedAt   DateTime?

  @@index([clinicId])
  @@index([status])
}

model PlatformMessage {
  id           String              @id @default(cuid())
  senderId     String
  title        String
  content      String
  type         PlatformMessageType @default(ANNOUNCEMENT)
  targetRole   Role?
  targetClinicId String?
  isBroadcast  Boolean             @default(false)
  readBy       String[]
  createdAt    DateTime            @default(now())

  @@index([targetClinicId])
  @@index([type])
  @@index([createdAt])
}
```

---

_Document version : 2.2 (complet et corrigé)  
Dernière mise à jour : 2026-08-07  
Sections : 15 + Annexe Prisma  
Lignes totales : ~1100  
Prochaine étape recommandée : Valider la Phase 0 (Fondations)_
