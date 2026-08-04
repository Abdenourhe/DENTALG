# Analyse comparative : DENTALG vs HB Dental
## Plan d'amélioration pour atteindre un logiciel dentaire complet

---

## 🎯 Vue d'ensemble

| Logiciel | Type | Force | Faiblesse |
|----------|------|-------|-----------|
| **HB Dental** | Desktop (offline) | Ultra-complet, odontogramme, CNAS, stock | Pas cloud, pas multi-cabinet, pas SaaS |
| **DENTALG** | SaaS cloud | Multi-cabinet, cloud, responsive, carrières | Manque modules cliniques avancés |

**Opportunité** : DENTALG peut devenir le **HB Dental du cloud** — même richesse fonctionnelle + avantages SaaS.

---

## 📊 Matrice de comparaison par module

### ✅ Déjà sur DENTALG (ne pas recréer)

| Module | DENTALG | HB Dental |
|--------|---------|-----------|
| Gestion patients | ✅ | ✅ |
| Rendez-vous | ✅ | ✅ |
| Facturation (devis/factures/avoirs) | ✅ | ✅ |
| Prescriptions / ordonnances | ✅ | ✅ |
| Multi-utilisateurs / rôles | ✅ | ✅ |
| Cloud / backup auto | ✅ | ❌ |
| Multi-cabinet (SaaS) | ✅ | ❌ |
| Carrières & Annonces publiques | ✅ | ❌ |
| Superadmin back-office | ✅ | ❌ |
| Support / signalement de bugs | ✅ | ❌ |

---

### ❌ Manquant sur DENTALG (à développer)

#### 🔴 CRITIQUE — Impact métier immédiat

| # | Module | Description | Priorité | Effort |
|---|--------|-------------|----------|--------|
| 1 | **Odontogramme interactif (FDI ISO 3950)** | Schéma 32 dents cliquable, dents traitées colorées, lié aux actes | 🔴 P0 | 3-4 j |
| 2 | **Paiements partiels + Suivi des dettes** | Montant payé < honoraires, liste des patients endettés | 🔴 P0 | 1-2 j |
| 3 | **Codification CNAS / CASNOS** | Table de codes actes assurance algérienne (D30, D85...) | 🔴 P0 | 2-3 j |
| 4 | **Labo Prothèse** | Suivi envois labo, date livraison, paiement labo | 🟠 P1 | 2-3 j |

#### 🟠 IMPORTANT — Différenciant concurrentiel

| # | Module | Description | Priorité | Effort |
|---|--------|-------------|----------|--------|
| 5 | **Gestion de Stock** | Inventaire, code-barres, péremption, alertes, consommation | 🟠 P1 | 3-4 j |
| 6 | **Dépenses du cabinet** | Charges, recettes vs dépenses, rentabilité nette | 🟠 P1 | 2-3 j |
| 7 | **Rapports & Statistiques** | Camemberts par acte/sexe/âge, histogrammes annuels | 🟠 P1 | 2-3 j |
| 8 | **Ordonnances Types (Templates)** | Modèles prédéfinis par pathologie (abcès, cellulite...) | 🟠 P1 | 1-2 j |
| 9 | **Ordonnances en Arabe** | Génération RTL, typographie arabe médicale | 🟠 P1 | 2-3 j |

#### 🟡 NICE TO HAVE — Confort et professionnalisme

| # | Module | Description | Priorité | Effort |
|---|--------|-------------|----------|--------|
| 10 | **Aide à la décision clinique** | Alertes contextuelles selon comorbidités (HTA, diabète...) | 🟡 P2 | 3-4 j |
| 11 | **Calculateur dose pédiatrique** | Amoxicilline et autres par poids d'enfant | 🟡 P2 | 1 j |
| 12 | **Examen mandibulaire** | ATM, douleurs, bruit articulaire, amplitude ouverture | 🟡 P2 | 1-2 j |
| 13 | **Certificats médicaux** | Agression, repos, contre-indication... | 🟡 P2 | 1-2 j |
| 14 | **File d'attente / Salle d'attente** | Liste patients du jour, appel suivant | 🟡 P2 | 1-2 j |
| 15 | **Corbeille (soft-delete avancé)** | Récupération données supprimées | 🟡 P2 | 1 j |
| 16 | **Multi-praticiens / répartition gains** | Gestion médecins, % par praticien | 🟡 P2 | 2-3 j |

---

## 🗺️ Roadmap recommandée (4 sprints)

### Sprint 1 — Fondations cliniques (Semaine 1)
- [ ] Odontogramme interactif FDI ISO 3950
- [ ] Paiements partiels + suivi dettes
- [ ] Codification CNAS/CASNOS (base de codes)

### Sprint 2 — Opérations cabinet (Semaine 2)
- [ ] Labo Prothèse (envois, livraisons, labos)
- [ ] Gestion de Stock (produits, alertes, entrées/sorties)
- [ ] Dépenses vs Recettes (tableau de bord financier)

### Sprint 3 — Productivité médecin (Semaine 3)
- [ ] Ordonnances Types (templates par pathologie)
- [ ] Ordonnances en Arabe (RTL)
- [ ] Rapports & Statistiques (camemberts, histogrammes)

### Sprint 4 — Polish & différenciants (Semaine 4)
- [ ] Aide décision clinique (alertes comorbidités)
- [ ] Calculateur dose pédiatrique
- [ ] Certificats médicaux
- [ ] File d'attente / salle d'attente

---

## 💡 Avantages DENTALG vs HB Dental

| Avantage DENTALG | Détails |
|-----------------|---------|
| **Cloud / SaaS** | Accès de n'importe où, pas d'installation |
| **Multi-cabinet** | Gestion centralisée de plusieurs cabinets |
| **Carrières publiques** | Marketplace emploi/cabinets/matériel intégré |
| **Superadmin** | Contrôle plateforme, messages, tickets |
| **Mobile-friendly** | Responsive, pas besoin d'ordinateur dédié |
| **Mises à jour auto** | Pas de mise à jour manuelle à installer |

---

## 🎓 Conclusion

HB Dental est une **référence desktop très complète** mais figée dans un modèle local.
DENTALG a l'architecture SaaS moderne. Il manque ~16 modules cliniques pour atteindre la parité fonctionnelle.

**Focus immédiat** : Odontogramme + CNAS + Paiements partiels = 80% de la valeur perçue par les dentistes algériens.

---
*Analyse générée le 2026-08-04 — Basée sur étude comparative HB Dental*
