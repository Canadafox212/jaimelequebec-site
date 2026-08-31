# J'aime le Québec — Contexte du projet

## Règles de comportement (à appliquer à chaque session)

### Avant toute modification
Ralentis. Analyse le code actuel, rédige un plan étape par étape, auto-vérifie
la logique avant d'écrire la moindre ligne. Ne pas modifier un fichier sans
avoir compris son rôle dans l'architecture existante.

### Mémoire persistante
Agir comme une mémoire de projet persistante : se rappeler de l'architecture,
des règles de style et de l'historique des décisions techniques d'une session
à l'autre.

### Standards de design
Interdiction d'interface générique. Toujours utiliser des structures premium,
espacement rigoureux, transitions fluides, design minimaliste cohérent avec
le style du site existant.

### Validation du code
Forcer la validation du code avant exécution. Imposer des standards visuels
premium. Maintenir l'architecture d'une session à l'autre.

### Auto-calibration
Analyser les corrections fréquentes de Philippe pour identifier ses préférences
et les appliquer silencieusement aux sessions suivantes. Sélectionner
automatiquement les librairies adaptées au projet plutôt que des génériques.

### Ton et style de communication
Supprimer le jargon IA (explorer, synergie, optimiser). Éliminer les formules
du type "ce n'est pas X, c'est Y". Varier la longueur des phrases. Ton direct,
factuel, concis.

---

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
- [x] **Session 5 — Récupération des images**
      Interface admin /admin/images construite (upload fichier + URL + drag-drop).
      198/198 attractions ont une image locale. Photos fallbacks et activités complètes.
      Point d'arrêt : les 198 attractions ont une image locale validée.
- [ ] **Session 6 — Finitions visuelles**
      Design responsive, page d'accueil soignée, cohérence visuelle.
      Point d'arrêt : le site est présentable de bout en bout.
- [x] **Session 7 — Déploiement**
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
- [x] Récupération automatique d'images représentatives par attraction —
      198/198 avec photo locale. Fallbacks et photos d'activités complètes.
- [x] Déploiement Vercel — jaimelequebec.com en ligne (2026-07-01)
- [x] Finitions visuelles session 8 — déployé 2026-07-02
- [x] Session 9 (2026-07-06) — Bugs CSV, carte régions, contact, liens activités, 8 langues
- [x] Bascule DNS Hostinger → Vercel pour jaimelequebec.org (site public)
- [x] Session 10 (2026-07-07) — SEO complet : hreflang 8 langues, sitemap .org, middleware
      corrigé (sitemap.xml/robots.txt), domaine canonique .org, www→.org redirect 308,
      formulaire contact (Resend, honeypot, pays 8 langues), Google Search Console :
      1 824 pages soumises.
- [x] Session 11 (2026-07-07) — Calculateur road trip : API OpenRouteService (route-leg),
      RoadTripBuilder (localStorage, étés/hiver ×1.35, arrêts extra, alerte VE >260 km,
      avertissement >6h), bouton "+ Road trip" sur chaque fiche, badge compteur dans le
      header, page /[lang]/planifier, 8 langues. 1 908 pages statiques générées.
- [x] Session 12 (2026-07-08/09) — Road trip : permutation stops (↑↓), étapes nuit (🌙),
      cache routes (jmlq_routes localStorage), calcul parallèle Promise.all, 40+ villes
      QUICK_CITIES (Rimouski, Gaspé, Matane…). Carte Leaflet (CDN) avec polylines ORS
      (géométrie encodée), marqueurs custom. Traversiers Saint-Laurent : détection auto
      Gaspésie↔rive nord, panel 🚢 Matane↔Baie-Comeau + RDL↔Saint-Siméon, insertion port
      comme étape. Pages /a-propos + /mentions-legales (RGPD, affiliation, hébergeur Vercel).
      Liens footer. lib/routeCache.js partagé entre RoadTripBuilder + AddToRoadTripButton.
- [x] Session 13 (2026-07-09/10) — Road trip bugs : URL traversier corrigée, tronçons bloqués
      (autoComputeRef reset + null legs non sauvegardés + bouton ↻ Recalculer), km cumulatif
      depuis départ sur chaque tronçon, lignes droites carte supprimées, seuil détection
      traversier 200→300 km. Même site ajouté 2× dans le trip (slug unique __timestamp).
      Panneau hébergements 🏨 (1 option/gamme + Booking.com) quand étape nuit activée.
      Retours collègue marketing : "Sites" → "Annuaire touristique" partout, bouton rouge
      doublon nav supprimé, emoji road trip retiré, 2 boutons hero (annuaire + activités),
      texte bienvenue sous hero, bouton "Consulter tout l'annuaire" sous coups de cœur,
      bandeau "Planifiez" supprimé, Viator en bas /sites, GetYourGuide en bas /activites.
- [x] Session 14 (2026-07-30) — Refonte accueil : nouveau hero (uppercase + 1 CTA), texte
      bienvenue avec lien Facebook 55k membres, carousel CoupsDeCoeur (3 par page). Footer
      redesigné (logo image, 4 colonnes). Header : barre recherche intégrée. 9e langue —
      italien complet (dictionnaire + InstallPrompt + header + middleware). Nouveau composant
      CoupsDeCoeurCarousel. Page /sources-comprendre-le-quebecois (livre KDP Philippe Goupil)
      + assets livres/ (couverture + registre PDF). lib/citiesQC.js : 399 villes QC pour
      l'autocomplétion road trip. Déployé : 2 151 pages statiques (+243 vs session 13).
      Section expressions québécoises : data/expressions.json (1 985 entrées, CSV CP1252→JSON
      UTF-8), recherche phonétique (lib/phonetic.js) + fuzzy Fuse.js (ExpressionSearch.js),
      pages /[lang]/expressions + /[lang]/expressions/[slug], encart livre KDP sur chaque
      fiche, champ exemple optionnel. Nav header + footer 9 langues. ~20 044 pages statiques.
- [x] Session 15 (2026-07-31) — Road trip : impression PDF (@media print, visibility approach),
      partage URL (encodage UTF-8 base64 corrigé), compteur nuits par étape (0–14, boutons +/−,
      tooltip 🌙), traversier Trois-Pistoles↔Les Escoumins ajouté, correction faux positif
      Québec→Matane (isCoteNord lat>49°), URL CTMA corrigée. Expressions : sous-titre
      "3 000 mots", catégories sans compteur, résultats uniquement sur recherche active (anti-scraping),
      max 20 résultats. Section animaux : data/animaux.json (35 sites pet-friendly), page
      /[lang]/animaux (server component SSG 9 langues + generateMetadata), composant
      AnimauxClient.js (filtres statut + région, cartes dépliables, alerte TRACES, Booking.com),
      badge 🐕/⚠️/🚫 sur fiches /sites/[slug], lien header + footer 9 langues. 20 034 pages
      statiques générées.
- [x] Session 16 (2026-08-01) — Section animaux enrichie : animaux.json 35→86 entrées
      (parcs, musées, stations de ski, spas, marchés, plages, refuges, zoos, archipels).
      61/86 entrées liées à une fiche /sites/[slug] via slug_attraction. Badge 🐕 sur les
      cartes de l'annuaire /sites (NearMeSortedList, top-right photo). Filtre serveur
      "🐕 Avec mon chien" sur /sites (?chien=1, préserve autres filtres actifs). Correction
      architecture animaux/page.js : server component + generateStaticParams (était 'use client').
      Carte Leaflet dans AnimauxClient via AnimauxMap.js (marqueurs colorés OUI/PARTIEL/NON,
      sync avec filtres). Scan systématique des 200 attractions pour mentions animaux/chiens :
      13 nouvelles entrées issues du contenu textuel (Parc des Appalaches OUI explicite,
      Refuge Pageau NON, Parc Safari NON, Fairmont Montebello OUI Fairmont for Pets, etc.).
      Expressions : encart livre KDP retiré des fiches /expressions/[slug]. Sous-titre
      "3 000 mots" → "Des centaines de mots". Recherche corrigée (faux positifs) : Fuse.js
      limité aux champs mot+_phonetic (seuil 0.25, sans ignoreLocation), recherche 3 étapes
      (préfixe exact → fuzzy phonétique → substring définition).
- [x] Session 17 (2026-08-02) — Accessibilité PMR : API interne Kéroul découverte (endpoint
      REST api.keroul.qc.ca, X-Api-Key dans bundle CDN script.2d9263f9b7.js), 3 996 établissements
      extraits en un appel, UUIDs cotes décodés (Accessible/Partiellement/Non). Fichiers produits :
      keroul_api_complete.json (3 996 entrées), keroul_accessibles_2775.csv (2 775 certifiés),
      keroul_urls.txt (4 000 URLs sitemap), rapport_extraction_PMR.md mis à jour. data/pmr.json :
      93 attractions matchées (29 Accessible + 64 Partiellement). Badge ♿ sur cartes annuaire
      /sites (NearMeSortedList, top-right), filtre ?pmr=1, bandeau PMR sur fiches /sites/[slug]
      (lien cliquable vers fiche Kéroul). Inventaire PMR CSV initial (30 fiches détaillées 42 cols).
- [x] Session 18 (2026-08-31) — Retours Clémence (suite) : road trip bugs résolus (doublons tronçons,
      PDF 4 pages vides, race condition addStopImpl). Animaux : détails toujours visibles desktop,
      boutons SÉPAQ + MAPAQ. 4 améliorations "rapide" : téléphone cliquable (tel:) sur fiches,
      accordéon "En savoir + sur [Région]" sur fiches → page activités, section partenaires
      expandable (+) sur accueil (Booking/DiscoverCars/GYG/Viator), section "Jamais sans votre
      chien ?" sur pages région /activites/[region]. Fix déploiement Vercel : VERCEL_SUPPORT_LARGE_FUNCTIONS=1
      + readFileSync pour animaux.json (hors bundle serverless).

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

### Session 5 — Gestion des images (admin)
- Interface admin `/admin/images` construite (deux onglets : fallbacks + 200 sites)
- Upload par clic, drag-drop, ou collage d'URL — sauvegarde locale immédiate
- Middleware corrigé : `/admin` exclu du redirect de langue (sinon 404)
- 2 doublons de slugs supprimés de `data/attractions.json` (IDs 28 et 194)
- BOM PowerShell : toujours écrire avec `[System.IO.File]::WriteAllText($path, $content, (New-Object System.Text.UTF8Encoding $false))` — `Set-Content -Encoding UTF8` ajoute un BOM qui casse `JSON.parse`
- jaimelequebec.com est le domaine aliasé sur Vercel (projet `jaimelequebec-site`)
- Déploiement : `vercel deploy --prod` depuis le dossier du projet
- État à la fin : 195/198 attractions avec photo locale

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

### Session 8 — Finitions UX / enrichissement données
- Mascotte (Foxy) : lien direct vers `/[lang]/decouvrir` (plus de panneau slide-up)
- Page `/decouvrir` : carte des régions (carte-regions-quebec.png), 19 régions en
  ordre alphabétique de la légende officielle, 3 raccourcis rapides
- EtabCard : vignette entièrement cliquable (stretched link z-10), bouton
  "Information détaillée ↗" uniquement si `etab.page` existe (z-20)
- Google Maps : tous les liens ouvrent en vue satellite (`?t=h`)
- Hébergements à proximité sur les fiches `/sites/[slug]` : données réelles
  (économique / confort / haut de gamme) issues de `attractions.json`
- Bandeaux photos par région sur `/activites/[region]` : 19 images dans
  `public/images/REGIONS/`, cliquables en lightbox (composant RegionImageBanner)
- Régions triées alphabétiquement dans `/activites`
- Pages nouvelles créées : `/nouvelles`, `/toutes-les-activites`, `/decouvrir`
- Déploiement : `vercel deploy --prod` — 1847 pages statiques générées
