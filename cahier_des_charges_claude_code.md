# Cahier des charges — jaimelequebec.com (nouvelle version codée)

## Contexte et objectif

Je relance "J'aime le Québec", un site de tourisme québécois que j'ai fondé et
exploité de 2008 à 2022 (jaimelequebec.com, anciennement .org). L'objectif de
cette nouvelle version :

1. **Présenter le Québec aux visiteurs** à travers un guide structuré de 200
   attractions touristiques incontournables, réparties en 20 régions
   touristiques, avec contenu éditorial riche (histoire, contexte culturel).
2. **Monétiser par affiliation** : chaque fiche d'attraction doit pouvoir
   afficher des options d'hébergement, de restauration et d'activités à
   proximité, idéalement reliées à terme à des programmes d'affiliation
   (Booking.com, GetYourGuide, Viator — pas encore intégrés, mais l'architecture
   doit le permettre sans refonte).
3. **Aider à la planification d'itinéraire** : les visiteurs sous-estiment
   systématiquement les distances et temps de trajet au Québec. Le site doit,
   à terme, aider à construire un parcours réaliste sur 1 à 3 semaines à partir
   des attractions choisies — pas juste lister les 200 attractions en vrac.

Je ne suis pas développeur. Je travaille de façon itérative et préfère qu'on
m'explique simplement, étape par étape, plutôt que d'utiliser du jargon non
expliqué.

## Première tâche : diagnostic avant de coder quoi que ce soit

**Avant de choisir une stack technique ou d'écrire la moindre ligne de code**,
merci de :

1. M'aider à déterminer le type d'hébergement Hostinger dont je dispose
   actuellement (mutualisé classique PHP/MySQL pensé pour WordPress, ou
   hébergement supportant Node.js/applications). Je ne suis pas sûr moi-même —
   guide-moi pour le vérifier (panneau de contrôle Hostinger, hPanel, etc.).
2. En fonction de ce diagnostic, proposer la stack technique la plus adaptée.
   Je n'ai pas de préférence imposée, mais voici mes contraintes connues :
   - Le site doit être **multilingue**, en commençant par français (langue
     principale) et anglais, avec une architecture qui permette d'ajouter
     facilement d'autres langues plus tard (espagnol notamment) sans refonte.
   - Le site doit supporter une **recherche/filtrage** par région touristique,
     catégorie thématique, et éventuellement saison.
   - Je veux pouvoir, à terme, intégrer des liens d'affiliation et des widgets
     tiers (calendriers de réservation GetYourGuide, etc.).
   - Si l'hébergement Hostinger actuel ne convient pas à la stack recommandée,
     dis-le-moi clairement avec les alternatives (changer de plan Hostinger,
     changer d'hébergeur, etc.) — n'essaie pas de forcer une solution
     sous-optimale juste pour rester chez Hostinger.

## Données déjà disponibles (à utiliser, pas à recréer)

J'ai déjà fait un travail substantiel de structuration de données avec Claude
(claude.ai). Les fichiers suivants sont fournis et doivent servir de source de
vérité pour le contenu du site — **ne pas régénérer ce contenu depuis zéro** :

- **`export_final_200_multilingue.json`** — les 200 attractions, structurées
  avec : `id`, `slug`, contenu bilingue `fr`/`en` (titre, résumé, texte complet,
  catégorie thématique), localisation (région touristique, ville, adresse,
  latitude/longitude), contact, statut d'affiliation potentiel, hébergements à
  proximité (3 tranches : économique/confort/haut de gamme), restaurants à
  proximité, activités été/hiver à proximité.
- **`filtres_recherche.json`** — listes prêtes à l'emploi pour les menus de
  recherche/filtre : 20 régions touristiques, 10 catégories thématiques, statuts
  d'affiliation, saisons — en français et anglais.
- **`matrice_distances_top15_voisins.json`** — pour chacune des 196 attractions
  géolocalisées, les 15 attractions les plus proches avec **vraie distance et
  durée de trajet routière** (calculée via OSRM, pas une estimation), utile
  pour des suggestions "à proximité" ou un futur planificateur d'itinéraire.
  Note : 4 des 200 attractions sont des routes thématiques sans point GPS
  unique (Chemin du Roy, Route des Navigateurs, Route des vins, Maison J.A.
  Vachon) et n'apparaissent pas dans cette matrice. Quelques attractions du
  Nord-du-Québec (Nunavik notamment) ont une distance nulle avec une note
  "accès aérien uniquement" — c'est intentionnel, pas un bug.
- **`export_final_200.csv`** — la même donnée que le JSON multilingue, mais en
  format tableau plat (une ligne par attraction), pratique pour une inspection
  rapide ou un import alternatif.

Le texte long (`texte_complet`) n'est traduit qu'en français pour l'instant —
le champ anglais correspondant (`full_text`) est à `null`, à compléter plus
tard. Les champs courts (titre, résumé, catégorie) sont eux bilingues complets.

## Fonctionnalités attendues (version initiale)

### Pages et navigation
- Page d'accueil présentant le concept, mettant en avant quelques attractions
  phares et un accès direct à la recherche.
- Page de liste/recherche des 200 attractions, filtrable par région touristique
  et catégorie thématique au minimum (idéalement aussi par statut
  d'affiliation, pour distinguer plus tard les attractions avec billetterie
  réservable).
- Page de détail pour chaque attraction (route basée sur le `slug`), affichant :
  titre, région, adresse, résumé, texte complet, et — dans des sections
  visuellement distinctes — les hébergements à proximité (par tranche de prix),
  restaurants à proximité, activités été/hiver à proximité.
- Sélecteur de langue (FR/EN) accessible partout, qui swap le contenu sans
  recharger une structure différente (même URL avec préfixe de langue ou
  équivalent — au choix de l'implémentation, mais propre en termes de SEO).

### Recherche et filtres
- Filtrage combinable par région + catégorie thématique au minimum.
- Si raisonnable à ce stade, un tri par proximité géographique en utilisant la
  matrice de distances déjà fournie (ex. "afficher les attractions proches de
  celle-ci" sur une page de détail).

### Ce qui N'EST PAS demandé dans cette première version
- Pas d'intégration réelle des APIs d'affiliation pour l'instant (Booking,
  GetYourGuide, Viator) — l'architecture doit juste ne pas bloquer cet ajout
  futur (par exemple, prévoir un champ ou une zone d'interface où un futur
  widget/lien d'affiliation pourrait s'insérer par attraction).
- Pas de module de paiement, de compte utilisateur, ni de back-office marchand
  B2B pour l'instant (ce volet existe dans un autre projet en parallèle,
  séparé de cette refonte).
- Pas besoin de répliquer le référentiel complet de 2136 lieux du site
  WordPress historique — cette nouvelle version démarre avec les 200
  attractions structurées ci-dessus. L'intégration éventuelle du référentiel
  plus large pourra être envisagée dans une itération ultérieure.

## Préférences de travail

- Explique les choix techniques en langage clair avant de les appliquer
  (je veux comprendre les décisions, pas seulement les voir s'exécuter).
- Travaille de façon itérative : étapes vérifiables, pas un unique gros bloc de
  code livré d'un coup sans points de validation intermédiaires.
- Si une contrainte que j'ai donnée semble mal adaptée techniquement
  (hébergement, choix de structure, etc.), dis-le clairement avec les
  alternatives, plutôt que de forcer une solution sous-optimale pour respecter
  la consigne à la lettre.

## Pour aller plus loin (informations de contexte, pas des tâches immédiates)

- Le projet historique utilisait WordPress avec WP All Import, CPT UI, ACF,
  Polylang (pour le multilingue), WP Grid Builder. Cette refonte vise
  explicitement à s'en affranchir, mais ces outils donnent une idée du type de
  fonctionnalités attendues à terme (import en masse, champs personnalisés,
  grille de recherche avancée).
- Une base de données plus large (référentiel `jmlq_lieu`, environ 2136 lieux
  incluant hébergements, restaurants, activités) existe dans l'écosystème
  WordPress historique et pourrait, dans une itération future, être connectée
  ou migrée — mais ce n'est pas l'objet de cette première phase.
