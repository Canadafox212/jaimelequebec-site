# J'aime le Québec — Contexte du projet

## Profil du porteur de projet
Fox (Philippe Goupil) — non-programmeur, préfère les explications simples,
étape par étape, en français. Demande confirmation avant les opérations à
grande échelle. Travaille sur Windows.

## Objectif du site
Plateforme touristique présentant les attractions du Québec, destinée
principalement aux visiteurs européens francophones, avec un volet
monétisation par affiliation touristique (Booking.com, GetYourGuide, Viator)
et un volet B2B (abonnements marchands Bronze/Silver/Gold).

Domaine prévu : jaimelequebec.org (enregistré chez Hostinger — le domaine
reste là-bas, seul l'hébergement du site change).
Aucun site n'est actuellement en ligne — pas de contrainte de migration
en direct, le nouveau site se construit sans pression de timing.

## Stack technique retenue
- Next.js 15 + React 19
- Tailwind CSS pour le style
- Hébergement prévu : Vercel (gratuit, fait pour Next.js)
- DNS du domaine Hostinger à pointer vers Vercel une fois le site prêt
  (étape finale uniquement, après validation sur une URL de test
  *.vercel.app)

## Langues
- Français + Anglais (standard Canada) dès le lancement
- Architecture prévue pour extension future (espagnol, allemand) —
  seul le contenu à traduire sera un coût additionnel, pas l'architecture
- Champs courts (titre, résumé, catégories) déjà traduits en EN pour les
  200 attractions ; texte long encore en français uniquement

## Données sources disponibles
### export_final_200_multilingue.json
200 attractions, structure riche par fiche :
- id, slug
- titre_fr/titre_en, resume_fr/resume_en, texte_complet (FR seulement)
- categorie_thematique (traduite FR/EN)
- localisation (avec coordonnées GPS corrigées)
- contact (incluant site_web)
- potentiel d'affiliation
- hébergement à proximité (3 gammes de prix)
- restaurants à proximité
- activités été/hiver

### filtres_recherche.json
Listes prêtes pour les menus déroulants :
- 20 régions touristiques du Québec
- 10 catégories thématiques
- saisons
- statut d'affiliation

### Base WordPress existante (non encore connectée à ce nouveau site)
2 136 lieux importés (custom post type `jmlq_lieu`), ~86% avec image
à la une. Base distincte des 200 attractions du Grand Guide — à
fusionner ou interconnecter plus tard, pas une priorité immédiate.

### Autres actifs
- ~19 800 emails marketing validés (Brevo)
- Groupe Facebook ~55 000 membres
- Bibliothèque de milliers de photos de lieux

## Fonctionnalités prévues (site)
1. Page d'accueil
2. Recherche + filtres (région, catégorie, saison)
3. Pages de résultats (vignette + titre + résumé)
4. Fiche détaillée par attraction (photo, texte complet, carte GPS,
   hébergements proches, restaurants, activités été/hiver, liens
   d'affiliation)
5. Bascule de langue FR/EN
6. Design responsive, mobile d'abord

## Feuille de route des sessions
Chaque session a un objectif et un point d'arrêt net. Mettre à jour la
case correspondante et la section "État d'avancement" en fin de session.

- [x] **Session 1 — Structure du projet**
      Next.js, Tailwind, arborescence des dossiers.
      Point d'arrêt : `npm run dev` affiche une page d'accueil basique.
- [x] **Session 2 — Intégration des données**
      Import de export_final_200_multilingue.json, route dynamique
      /attractions/[slug], fiche complète (texte, contact, GPS).
      Point d'arrêt : au moins une attraction s'affiche correctement.
- [x] **Session 3 — Listes et recherche**
      Page de liste (vignette + titre + résumé), filtres région/
      catégorie/saison à partir de filtres_recherche.json.
      Point d'arrêt : on peut filtrer et retrouver une attraction précise.
- [x] **Session 4 — Bascule de langue FR/EN**
      Système multilingue (ex: next-intl).
      Point d'arrêt : le site fonctionne correctement dans les deux langues.
- [ ] **Session 5 — Récupération des images**
      Script og:image + fallback + rapport de vérification manuelle,
      par lots de 20-30 attractions.
      Point d'arrêt : les 200 attractions ont une image locale validée.
- [ ] **Session 6 — Finitions visuelles**
      Design responsive, page d'accueil soignée, cohérence visuelle.
      Point d'arrêt : le site est présentable de bout en bout.
- [ ] **Session 7 — Déploiement**
      Mise en ligne Vercel (URL de test), validation, puis bascule DNS
      Hostinger vers Vercel.
      Point d'arrêt : jaimelequebec.org est en ligne.

Règle de segmentation : si une session dépasse ~1h-1h30 de travail actif,
ou si les réponses deviennent lentes / le fil semble perdu, compacter
(`/compact`) ou fermer la session même si le point d'arrêt n'est pas
atteint à 100% — reprendre au point exact dans une nouvelle session.

## État d'avancement (mettre à jour à chaque session)
- [x] Choix de la stack (Next.js + Vercel) — validé
- [x] Structure du projet de base (package.json, dossiers) — terminé
- [x] Intégration des données JSON (200 attractions) dans des pages — terminé
- [x] Recherche / filtres fonctionnels — terminé
- [x] Bascule de langue FR/EN — terminé (routing `[lang]`, dictionnaires)
- [ ] Récupération automatique d'images représentatives par attraction
      (via balise og:image du site source en priorité, fallback sur
      plus grande image hors logo/pub ; vérification manuelle ensuite)
- [ ] Déploiement Vercel (URL de test)
- [ ] Bascule DNS Hostinger → Vercel (site public)

## Décisions techniques prises
- Images toujours stockées localement dans le projet, jamais en lien
  externe (Facebook/Airbnb/Booking cassent fréquemment — leçon retenue
  de l'ancien site)
- Traitement par lots (20-30 éléments), jamais tout en un coup, pour
  garder un contrôle manuel et éviter les échecs en cascade coûteux
- Validation manuelle après extraction automatique plutôt que de
  chercher un script parfait à 100%

## Pièges déjà rencontrés (projet global, hors site)
- Les imports WordPress prématurés/mal validés ont dégradé les
  performances serveur (nettoyage SQL nécessaire) — toujours valider
  les CSV avant import à grande échelle
- ~10% des noms d'organismes extraits automatiquement nécessitent une
  correction manuelle — normal, prévoir cette passe systématiquement

## Notes de session

### Session — Recherche globale + corrections visuelles
- Loupe dans le header (icône + libellé « Rechercher », champ pleine largeur)
- Page `/[lang]/recherche?q=...` : résultats groupés par sections (Sites,
  Descriptions, Régions, Catégories), recherche dans titres + résumés +
  textes complets + noms de régions et catégories
- Image fallback `hotel.webp` (Château Frontenac) remplacée par `hotel.svg`
  (immeuble générique bleu nuit, aucun lieu reconnaissable)
- AttractionCard réutilisé dans la page recherche pour assurer l'affichage
  des photos (le composant maison ne chargeait pas les images)
- Problème connu : ERR_MEMORY_ALLOCATION_FAILED sur webpack cache (Windows) —
  nécessite parfois un redémarrage du serveur de dev
