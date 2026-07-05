# ROADMAP-DATA — Vision produit et modèles de données

Document de référence pour les itérations futures. Aucun code exécutable — seulement des décisions d'architecture et des schémas à implémenter progressivement.

---

## Section 1 — Schéma actuel d'une fiche de site

Observé dans `data/attractions.json` (198 entrées, format JSON pur).

```ts
type Attraction = {
  id: number
  slug: string

  // Contenu bilingue — note : les clés FR/EN ne sont pas unifiées (dette technique)
  fr: {
    titre: string
    resume: string
    texte_complet: string           // Long texte narratif, FR uniquement
    categorie_thematique: string
  }
  en: {
    title: string
    summary: string
    full_text: string               // Traduction du texte_complet (partielle)
    theme_category: string
  }

  localisation: {
    region_touristique: string
    region_num: number              // Identifiant numérique de la région (1-20)
    ville: string
    adresse: string
    latitude: number | null         // null sur 4 fiches (routes/itinéraires sans point central)
    longitude: number | null
  }

  contact: {
    telephone: string | null
    site_web: string | null
    courriel: string | null
  }

  affiliation: {
    potentiel_fr: string            // ex. "Hébergement + activités"
    potentiel_en: string
  }

  hebergement: {
    economique: HebergementItem[]
    confort: HebergementItem[]
    haut_de_gamme: HebergementItem[]
  }

  restaurants: RestaurantItem[]

  activites: {
    ete: ActiviteItem[]
    hiver: ActiviteItem[]
  }
}

type HebergementItem = {
  nom: string
  type: string                      // "Hôtel", "Gîte", "Motel"…
  ville: string
  tel: string | null
  web: string | null
  dist_km: number
}

type RestaurantItem = {
  nom: string
  type: string
  ville: string
  tel: string | null
  web: string | null
  dist_km: number
}

type ActiviteItem = {
  nom: string
  activites: string                 // Liste séparée par " | "
}
```

**Dette technique identifiée** : les champs textuels ne suivent pas la convention `{ fr, en }` unifiée définie pour les itérations futures. Une migration de schéma sera nécessaire avant l'itération 3 (inscription utilisateur) pour homogénéiser.

---

## Section 2 — Distinction ACTIF / PASSIF

Chaque composant d'affichage doit tenir compte du **mode d'usage** dans lequel il est rendu :

- **Mode ACTIF (consultation)** : l'utilisateur a ouvert l'app volontairement. Il est disponible mentalement. Tolérance élevée au contenu riche, aux offres multiples, aux listes longues, aux capsules audio. C'est le mode principal de monétisation.
- **Mode PASSIF (poussé)** : l'app envoie une notification alors que l'utilisateur ne l'a pas ouverte. Il peut conduire, manger, travailler. Chaque notification inutile brûle du capital de confiance. Trois notifications ratées d'affilée = désactivation ou désinstallation.

Ces deux modes doivent être **structurellement distincts** : une offre commerciale ne se présente pas de la même façon selon le mode. Le composant qui rend un `Offer` doit recevoir un prop `displayMode: "active" | "passive"` et adapter son rendu en conséquence. Ne jamais mélanger la logique des deux modes dans un même composant.

---

## Section 3 — Modèle Merchant proposé

```ts
type Merchant = {
  id: string
  type: "independent" | "chain"   // clé structurante — deux marchés, deux logiques

  name: string
  brand_logo_url?: string         // obligatoire pour les chaînes

  category: MerchantCategory      // restauration | hébergement | station-service
                                  // | attraction | boutique | autre

  // Pour les indépendants uniquement
  site_id?: string                // fiche site associée (jaimelequebec.com)

  // Pour les chaînes uniquement
  locations?: ChainLocation[]     // toutes les succursales québécoises

  // Commercial
  contract?: {
    tier: "decouverte" | "regulier" | "yield_master" | "chain_route" | "chain_route_premium"
    valid_from: string            // ISO date YYYY-MM-DD
    valid_to: string
    seasonal_days?: string[]      // indépendants : liste des dates activées
  }
}

type ChainLocation = {
  id: string
  address: string
  lat: number
  lon: number
  hours: { fr: string; en: string }
  drive_thru?: boolean
  phone?: string
}
```

**Distinction indépendants / chaînes** : ce sont deux marchés, deux modèles d'affaires, deux tarifications, deux logiques d'affichage. Le champ `type` est la clé structurante — ne jamais fusionner ces deux cas dans un même rendu.

---

## Section 4 — Modèle Offer proposé

```ts
type Offer = {
  id: string
  merchant_id: string

  date: string                    // ISO YYYY-MM-DD (jour d'activation unique)
  label: { fr: string; en: string }

  discount_type: "percent" | "amount" | "combo" | "brand_awareness"
  discount_value?: number         // 15 pour "15 %"

  radius_km: number               // défaut 15 pour un indépendant, 30 pour une chaîne
  active_hours?: {
    start: string                 // format HH:mm
    end: string
  }
}
```

---

## Section 5 — Modèle Story proposé (anecdotes, histoires)

```ts
type Story = {
  id: string
  site_id: string                 // site touristique associé (Attraction.id)

  audience: "adult" | "kids"
  lang: "fr" | "en"

  title: string
  text: string                    // markdown accepté

  audio_url?: string              // MP3/OGG, si narration disponible
  duration_sec?: number           // durée de la narration

  tags?: string[]                 // histoire | patrimoine | faune | gastronomie | …
}
```

**Extensibilité** : préférer ce tableau d'objets à un champ plat `story_kids`. Chaque `Story` est une entité indépendante, ce qui permet d'ajouter des langues, des audiences ou des formats (audio, vidéo) sans modifier le schéma.

---

## Section 6 — Modèle NotificationPrefs et règles de pertinence

```ts
type NotificationPrefs = {
  master_enabled: boolean

  categories: {
    local_offers: boolean         // commerçants indépendants (itération 5a)
    chain_offers: boolean         // A&W, St-Hubert, etc. (itération 5b)
    anecdotes: boolean            // capsules histoire/patrimoine
    kids_content: boolean         // versions enfants
    weather_alerts: boolean
  }

  quiet_hours: {
    start: string                 // défaut "20:00"
    end: string                   // défaut "08:00"
  }

  max_per_day: number             // défaut 2

  radius_km: {
    offers: number                // défaut 15
    anecdotes: number             // défaut 5
  }
}
```

**Règles de pertinence à respecter dans le service de notification (itération 4) :**

1. Maximum 2 notifications par jour, tous types confondus (idéalement 1).
2. Jamais avant 8h ni après 20h, sauf urgence type météo.
3. **Vitesse détectée** : si l'utilisateur roule à plus de 60 km/h (calcul via succession de positions GPS), on ne pousse rien — on met en file d'attente et on relâche au prochain arrêt de plus de 5 minutes.
4. Rayon strict : 15 km max pour une offre indépendante, 30 km pour une chaîne, 5 km pour une anecdote.
5. **Cooldown par marque** : une notif reçue d'une marque bloque toute nouvelle notif de cette marque pendant 72 heures.
6. **Kill switch granulaire** : l'utilisateur désactive par catégorie, pas "tout ou rien".
7. **Feedback loop** : après chaque notif, proposer discrètement 👍 / 👎. Les 👎 réduisent automatiquement le score de pertinence de ce type de contenu.

---

## Section 7 — Recommandations d'infrastructure future

### Où stocker les données utilisateur (`User`, `NotificationPrefs`) ?

**Supabase** est le candidat naturel : PostgreSQL managé, SDK JS/TS, auth intégrée (itération 3), Row Level Security pour la conformité Loi 25. PlanetScale (MySQL serverless) est une alternative mais l'écosystème Supabase est plus adapté à Next.js. Aucune décision engagée avant l'itération 3.

### Comment envoyer les notifications push ?

**Firebase Cloud Messaging (FCM)** couvre Android et iOS (APNs via FCM) avec une seule intégration. OneSignal est plus simple à mettre en place mais ajoute une dépendance tierce avec son propre modèle de données. Un service maison (Web Push + APNs direct) donne le contrôle maximal mais multiplie la complexité. Aucune décision engagée avant l'itération 4.

### Où héberger le service de pertinence contextuelle ?

**Vercel Edge Functions** pour la logique légère (rayon, cooldown, quiet hours) : latence faible, déploiement intégré. Un serveur dédié (Railway, Fly.io) devient nécessaire si le service doit maintenir un état en mémoire (files d'attente, positions GPS en temps réel). L'architecture idéale sépare le calcul de pertinence (Edge) du stockage des tokens push et des préférences (Supabase). Aucune décision engagée avant l'itération 4.
