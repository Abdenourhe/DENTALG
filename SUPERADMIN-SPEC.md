# DENTALG — Spécification Superadmin Plateforme

> Panneau de contrôle de l'administrateur plateforme pour DENTALG.  
> Accès réservé au rôle `PLATFORM_ADMIN`.  
> URL de base : `/superadmin`

---

## 1. Vision

Le superadmin est le **centre de commande** de DENTALG. Il permet de :

- Gérer le cycle de vie complet des cabinets (inscription → paiement → activation → suivi)
- Surveiller la santé financière de la plateforme (MRR, churn, revenus)
- Communiquer avec tous les cabinets (broadcast, support)
- Contrôler la qualité et la conformité (RGPD/DPDP, données de santé)

---

## 2. Workflow d'Onboarding d'un Cabinet

### 2.1 Diagramme du flux complet

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Formulaire      │────▶│  ClinicRequest   │────▶│  Notification    │
│  public          │     │  (PENDING)       │     │  email superadmin│
│  /request-clinic │     │  en base         │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
                                                          │
                                                          ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Activation      │◀────│  Paiement        │◀────│  Superadmin      │
│  complète        │     │  reçu            │     │  approuve        │
│  (clinic+owner   │     │                  │     │  la demande      │
│   créés)         │     │                  │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
       │
       ▼
┌──────────────────┐
│  Email au médecin│
│  (credentials +  │
│   lien connexion)│
└──────────────────┘
```

### 2.2 Étapes détaillées

#### Étape 1 : Demande publique

Le formulaire `/request-clinic` est accessible sans authentification. Il collecte :

| Champ                     | Obligatoire | Description                                              |
| ------------------------- | ----------- | -------------------------------------------------------- |
| **Nom du cabinet**        | ✅          | Ex: "Cabinet Dentaire Benali"                            |
| **Email cabinet**         | ✅          | Contact officiel                                         |
| **Téléphone**             | ✅          | Format international                                     |
| **Adresse**               | ✅          | Rue, ville                                               |
| **Wilaya**                | ✅          | Liste déroulée des 58 wilayas                            |
| **Spécialité principale** | ✅          | Odontologie générale / Orthodontie / Parodontologie...   |
| **Nombre de dentistes**   | ✅          | 1, 2, 3+ (impact le plan recommandé)                     |
| **Nombre d'assistants**   | ❌          | Optionnel                                                |
| **Nombre de secrétaires** | ❌          | Optionnel                                                |
| **Nom du responsable**    | ✅          | Dr. Prénom Nom                                           |
| **Email du responsable**  | ✅          | Devient le compte OWNER                                  |
| **Mot de passe**          | ✅          | Min 8 caractères, bcrypt côté serveur                    |
| **Numéro d'inscription**  | ❌          | Numéro d'ordre des dentistes (optionnel mais recommandé) |
| **Documents**             | ❌          | Permis d'exercice, extrait KBIS (upload Cloudinary)      |
| **Plan souhaité**         | ❌          | FREE / ESSENTIEL / PRO / PREMIUM                         |

> ⚠️ Le mot de passe du responsable n'est PAS stocké en clair. Il est hashé avec bcrypt(12) mais le compte n'est créé qu'après approbation.

#### Étape 2 : File d'attente superadmin

La demande apparaît dans `/superadmin/clinic-requests` avec :

- Badge de statut : `PENDING` | `REVIEWING` | `APPROVED` | `REJECTED` | `WAITING_PAYMENT`
- Date de soumission
- Wilaya (filtre rapide)
- Nombre de dentistes (indicateur de taille)

#### Étape 3 : Actions du superadmin

| Action                     | Effet                                                         | Email envoyé                                               |
| -------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------- |
| **Approuver**              | Status → APPROVED. Email de paiement envoyé au responsable.   | "Votre demande est approuvée — procédez au paiement"       |
| **Demander complément**    | Status → PENDING. Commentaire obligatoire. Demande retournée. | "Votre demande nécessite des informations complémentaires" |
| **Rejeter**                | Status → REJECTED. Commentaire obligatoire.                   | "Votre demande a été rejetée"                              |
| **Marquer comme en revue** | Status → REVIEWING. Aucun email.                              | —                                                          |

**Modal de décision** (obligatoire pour approuver/rejeter/demander complément) :

```
┌────────────────────────────────────────┐
│  Décision : Demande #CR-2026-0042      │
│                                        │
│  Cabinet : Cabinet Dentaire Benali     │
│  Wilaya : Alger                        │
│  Dentistes : 2                         │
│                                        │
│  [ ] Approuver                         │
│  [ ] Demander complément               │
│  [ ] Rejeter                           │
│                                        │
│  Commentaire (obligatoire si rejeter   │
│  ou complément) :                      │
│  ┌────────────────────────────┐        │
│  │                            │        │
│  └────────────────────────────┘        │
│                                        │
│  [Annuler]          [Confirmer]        │
└────────────────────────────────────────┘
```

#### Étape 4 : Paiement

Une fois approuvée, l'email contient :

- Un lien unique de paiement (valide 7 jours)
- Le montant selon le plan choisi
- Les moyens de paiement (CIB/Edahabia, virement bancaire)

> **Note** : Le paiement en ligne (CIB/Edahabia) nécessite une intégration avec un PSP algérien (Sathoum, Paymee, ou solution bancaire). En V1, on peut accepter le virement bancaire comme preuve de paiement, validé manuellement par le superadmin.

#### Étape 5 : Activation

Après confirmation du paiement :

1. Création du `Clinic` en base
2. Création du `User` OWNER (avec le mot de passe hashé fourni à l'inscription)
3. Création des `Counter` initialisés (PATIENT=0, INVOICE=0...)
4. Création des `PlanDefinition` de référence (si premier cabinet)
5. Email au médecin : credentials + lien `/login`

---

## 3. Modules du Superadmin

### 3.1 Dashboard (`/superadmin`)

**Métriques en temps réel** :

| Widget                          | Valeur       | Évolution         |
| ------------------------------- | ------------ | ----------------- |
| Cabinets actifs                 | 47           | +3 ce mois        |
| MRR (Monthly Recurring Revenue) | 1 250 000 DA | +12%              |
| Demandes en attente             | 5            | 🔴 Action requise |
| Tickets support ouverts         | 3            | —                 |
| Taux de conversion onboarding   | 68%          | +5%               |

**Graphiques** :

- Inscriptions par mois (12 derniers mois)
- Répartition par plan (pie chart : FREE / ESSENTIEL / PRO / PREMIUM)
- Répartition géographique (wilayas)
- Revenus par mois (bar chart)

### 3.2 Gestion des Demandes (`/superadmin/clinic-requests`)

**Tableau avec filtres** :

- Filtre par statut : Tous / En attente / En revue / Approuvées / Rejetées
- Filtre par wilaya
- Filtre par date
- Recherche par nom de cabinet

**Colonnes** :

| #   | Cabinet | Wilaya | Dentistes | Date | Statut | Actions |
| --- | ------- | ------ | --------- | ---- | ------ | ------- |

**Actions par ligne** :

- 👁️ Voir détail (modal avec tous les champs + documents)
- ✓ Approuver
- ✎ Demander complément
- ✗ Rejeter

### 3.3 Gestion des Cabinets (`/superadmin/clinics`)

**Tableau des cabinets actifs** :

| ID  | Cabinet | Plan | Wilaya | Utilisateurs | CA mensuel | Statut | Actions |
| --- | ------- | ---- | ------ | ------------ | ---------- | ------ | ------- |

**Actions par cabinet** :

- 👁️ Voir fiche complète
- ✎ Modifier (plan, features, contact)
- ⏸ Suspendre (temporaire, `isActive=false`)
- 🗑 Supprimer (soft-delete, `deletedAt`)
- 📧 Envoyer message
- 📊 Voir analytics

**Fiche cabinet** :

```
┌────────────────────────────────────────┐
│  Cabinet Dentaire Benali               │
│  Plan : PRO | Wilaya : Alger           │
│                                        │
│  ─── Informations ───                  │
│  Email : contact@benali.dz             │
│  Téléphone : 023456789                 │
│  Adresse : 12 Rue Didouche Mourad      │
│                                        │
│  ─── Abonnement ───                    │
│  Plan actuel : PRO (15000 DA/mois)     │
│  Prochain renouvellement : 15/09/2026  │
│  Statut paiement : ✅ À jour           │
│                                        │
│  ─── Utilisateurs ───                  │
│  Dr. Amine Benali (OWNER)              │
│  Fatima Zerrouki (ASSISTANT)           │
│  Karim Hadji (SECRETARY)               │
│                                        │
│  ─── Activité ───                      │
│  Patients : 142                        │
│  Factures ce mois : 28                 │
│  CA ce mois : 450 000 DA               │
│                                        │
│  [Modifier] [Suspendre] [Supprimer]    │
└────────────────────────────────────────┘
```

### 3.4 Gestion des Utilisateurs Plateforme (`/superadmin/users`)

Gestion des comptes `PLATFORM_ADMIN` uniquement.

| Nom | Email | Rôle | Dernière connexion | Actions |
| --- | ----- | ---- | ------------------ | ------- |

**Actions** : Créer, modifier rôle, révoquer accès, supprimer.

> ⚠️ Un seul `PLATFORM_ADMIN` peut-il supprimer un autre ? Oui, sauf lui-même. Il doit toujours rester au moins un admin actif.

### 3.5 Abonnements & Facturation (`/superadmin/billing`)

**Tableau des paiements** :

| Date | Cabinet | Plan | Montant | Méthode | Statut | Actions |
| ---- | ------- | ---- | ------- | ------- | ------ | ------- |

**Actions** :

- Marquer comme payé (manuel, pour virements)
- Envoyer relance
- Générer facture plateforme

**Plans tarifaires éditables** :

| Plan      | Mensuel  | Annuel    | Features incluses         | Actions    |
| --------- | -------- | --------- | ------------------------- | ---------- |
| FREE      | 0 DA     | 0 DA      | Patients, RDV             | —          |
| ESSENTIEL | 5000 DA  | 50000 DA  | + Facturation             | ✎ Modifier |
| PRO       | 15000 DA | 150000 DA | + Ordonnances, Labo       | ✎ Modifier |
| PREMIUM   | 30000 DA | 300000 DA | + Analytics, Support prio | ✎ Modifier |

> Le superadmin peut modifier les prix et les features de chaque plan. Les changements affectent les nouveaux abonnements ; les existants restent sur leur plan jusqu'au renouvellement.

### 3.6 Communications (`/superadmin/messages`)

**Broadcast** : Envoyer un message à tous les cabinets, ou filtré par plan/wilaya.

```
┌────────────────────────────────────────┐
│  Nouveau message plateforme            │
│                                        │
│  À : [Tous les cabinets ▼]             │
│      [  ] FREE  [✓] ESSENTIEL         │
│      [✓] PRO    [✓] PREMIUM           │
│                                        │
│  Type : [Annonce ▼]                    │
│      (Annonce / Alerte / Maintenance)  │
│                                        │
│  Titre : Mise à jour système           │
│                                        │
│  Contenu :                             │
│  ┌────────────────────────────┐        │
│  │ Une maintenance est        │        │
│  │ prévue le 15 août...       │        │
│  └────────────────────────────┘        │
│                                        │
│  [Prévisualiser] [Envoyer]             │
└────────────────────────────────────────┘
```

**Tickets de support** (`/superadmin/tickets`) :

- Liste des tickets ouverts par les cabinets
- Assignation à un admin
- Statut : OPEN → IN_PROGRESS → RESOLVED → CLOSED
- Réponse avec marquage "interne" (visible admin uniquement)

### 3.7 Audit & Logs (`/superadmin/audit`)

**Journal d'audit** : Toutes les actions sur la plateforme.

| Date             | Utilisateur       | Action  | Entité        | ID          | Clinic         | IP           | Détail |
| ---------------- | ----------------- | ------- | ------------- | ----------- | -------------- | ------------ | ------ |
| 2026-08-07 10:23 | admin@dentalg.dz  | APPROVE | ClinicRequest | CR-0042     | —              | 41.111.22.33 | —      |
| 2026-08-07 09:15 | dr.benali@demo.dz | CREATE  | Patient       | P-2026-0043 | cabinet-benali | 105.235.1.2  | —      |

**Filtres** : par date, par action, par entité, par cabinet, par utilisateur.

### 3.8 Paramètres Plateforme (`/superadmin/settings`)

- **Maintenance mode** : Activer/désactiver (page de maintenance globale)
- **Feature flags globaux** : Activer une nouvelle feature pour tous les cabinets
- **Seuils d'alerte** : Nombre de tickets avant alerte, MRR minimum...
- **Templates d'email** : Personnaliser les emails envoyés (onboarding, relance, maintenance)
- **API & Webhooks** : Gérer les clés API, configurer les webhooks

---

## 4. Propositions Supplémentaires

### 4.1 Analytics avancés (suggéré pour V2)

- **Cohort analysis** : Retention des cabinets par mois d'inscription
- **Churn prediction** : Alerte si un cabinet n'a pas utilisé la plateforme depuis X jours
- **LTV (Lifetime Value)** : Revenu généré par cabinet depuis son inscription
- **CAC (Customer Acquisition Cost)** : Coût d'acquisition (si campagnes marketing)

### 4.2 Système de parrainage

- Un cabinet parraine un autre → crédit sur le prochain mois
- Tracking via code parrain unique

### 4.3 Marketplace admin

- Superadmin valide les annonces `ClinicListing` et `EquipmentListing` avant publication
- Commission sur les ventes (si monétisation)

### 4.4 Multi-superadmin avec rôles affinés

| Rôle                 | Permissions                                          |
| -------------------- | ---------------------------------------------------- |
| `PLATFORM_ADMIN`     | Tout                                                 |
| `PLATFORM_SUPPORT`   | Tickets, messages, voir cabinets (lecture seule)     |
| `PLATFORM_BILLING`   | Abonnements, paiements, factures                     |
| `PLATFORM_MODERATOR` | Valider annonces marketplace, demandes d'inscription |

### 4.5 Export & Conformité

- Export CSV de tous les cabinets (pour déclarations fiscales)
- Export RGPD : suppression complète d'un cabinet sur demande (droit à l'oubli)
- Rapport de sécurité : accès suspects, connexions depuis IPs inhabituelles

### 4.6 Mobile app superadmin (V3)

- Notifications push pour nouvelles demandes
- Approuver/Rejeter depuis mobile
- Dashboard simplifié

---

## 5. Modèle de Données Spécifique au Superadmin

### 5.1 `ClinicRequest` (existant, à enrichir)

```prisma
model ClinicRequest {
  id             String        @id @default(cuid())
  name           String
  slug           String
  email          String
  phone          String?
  address        String?
  city           String?
  wilaya         String
  specialty      String?       // Spécialité principale
  ownerFirstName String
  ownerLastName  String
  ownerEmail     String
  ownerPassword  String?       // Hashé avec bcrypt(12)
  dentistCount   Int           @default(1)
  assistantCount Int           @default(0)
  secretaryCount Int           @default(0)
  licenseNumber  String?       // Numéro d'ordre
  documents      Json?         // [{ url, name, type }]
  requestedPlan  Plan          @default(FREE)
  status         RequestStatus @default(PENDING)
  comment        String?       // Commentaire superadmin (rejet ou complément)
  reviewedById   String?
  reviewedAt     DateTime?
  createdAt      DateTime      @default(now())

  @@index([status])
  @@index([wilaya])
  @@index([createdAt])
}
```

### 5.2 `PlatformMessage` (existant)

Déjà dans le schéma. Le superadmin crée ces messages via l'interface.

### 5.3 `AuditLog` (existant)

Déjà dans le schéma. Toutes les actions superadmin sont loguées.

---

## 6. Intégrations

| Intégration             | Usage                                      | Statut             |
| ----------------------- | ------------------------------------------ | ------------------ |
| **Resend**              | Emails onboarding, relances, notifications | ✅ Déjà intégré    |
| **Stripe/PSP Algérien** | Paiement en ligne des abonnements          | 🟡 À intégrer (V2) |
| **Cloudinary**          | Upload documents (permis, KBIS)            | ✅ Déjà intégré    |
| **Sentry**              | Monitoring erreurs (optionnel)             | 🔴 Pas prioritaire |

### 6.1 Workflow paiement Algérie

Pour la V1, proposition pragmatique :

1. Superadmin approuve la demande
2. Email envoyé au médecin avec **RIB de DENTALG** + montant
3. Médecin effectue un virement
4. Médecin envoie la preuve (reçu, capture) via réponse à l'email ou upload dans un lien dédié
5. Superadmin vérifie et marque le paiement comme reçu dans `/superadmin/billing`
6. Cabinet activé automatiquement

Pour la V2 : intégration CIB/Edahabia via Sathoum, Paymee, ou solution bancaire.

---

## 7. Checklist d'Implémentation

### Phase SA-0 — Fondations (2 jours)

- [ ] Layout superadmin distinct (sidebar sombre, branding différent)
- [ ] Middleware : `PLATFORM_ADMIN` uniquement
- [ ] Page dashboard avec métriques de base

### Phase SA-1 — Demandes d'inscription (3 jours)

- [ ] Tableau des demandes avec filtres
- [ ] Modal de décision (approuver / complément / rejeter)
- [ ] Envoi d'emails automatiques
- [ ] Formulaire public `/request-clinic` enrichi

### Phase SA-2 — Gestion des cabinets (2 jours)

- [ ] Liste des cabinets actifs
- [ ] Fiche cabinet détaillée
- [ ] Actions : suspendre, supprimer, modifier plan

### Phase SA-3 — Facturation & Abonnements (2 jours)

- [ ] Tableau des paiements
- [ ] Édition des plans tarifaires
- [ ] Marquage manuel des paiements

### Phase SA-4 — Communications (2 jours)

- [ ] Broadcast messages
- [ ] Gestion des tickets support
- [ ] Templates d'email

### Phase SA-5 — Polish (1 jour)

- [ ] Audit logs consultables
- [ ] Paramètres plateforme
- [ ] Analytics dashboard

**Total estimé : 12 jours ouvrés (~2 semaines et demie)**

---

_Document version : 1.0  
Dernière mise à jour : 2026-08-07  
Statut : Proposition — en attente de validation_
