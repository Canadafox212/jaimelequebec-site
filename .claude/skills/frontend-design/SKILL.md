---
name: frontend-design
description: Système de design du site J'aime le Québec (Next.js + Tailwind). À suivre pour toute création ou retouche d'interface — pages, composants, cartes, bannières — afin de garder un rendu cohérent, soigné et bilingue.
---

# Système de design — J'aime le Québec

Suivre ces conventions pour toute UI (nouvelle page, composant, ajustement visuel).
Objectif : cohérence, sobriété élégante, lisibilité, mobile d'abord.

## Couleurs (tailwind.config.js → `quebec`)
- `quebec-blue` #003087 — liens, boutons secondaires, accents
- `quebec-navy` #001a4d — bannières, header/footer, fonds foncés
- `quebec-red` #D42B2B — CTA principal, accents forts (« vrai Québec »)
- `quebec-gold` #C9922A — petites étiquettes/eyebrows, badge ★ « Sélection »
- `quebec-cream` #FDF6EC — fond doux occasionnel
- Gris : palette `slate`/`gray` de Tailwind (texte gris-500, fonds slate-50/100)

## Typographie
- Titres : `font-display` (Playfair Display, serif) — `font-bold`
- Texte courant : `font-sans` (Inter)
- Eyebrow (sur-titre) : `text-xs font-bold uppercase tracking-widest` en `quebec-gold` (sur clair) ou `text-blue-300` (sur navy)

## Patrons récurrents (réutiliser tels quels)
- **Conteneur** : `max-w-6xl mx-auto px-4 py-10` (listes/larges) ; `max-w-4xl`/`max-w-3xl` pour le contenu lisible.
- **Bannière de page** : `bg-gradient-to-r from-quebec-navy to-quebec-blue text-white py-10 px-4` + eyebrow + `h1 font-display text-4xl md:text-5xl font-bold`.
- **Carte** : `bg-white rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200`. Ombres définies dans tailwind.config (`card`, `card-hover`).
- **Image hero** : conteneur `relative h-72 md:h-96`, `<Image fill className="object-cover">`, voile `absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent`, titre blanc superposé en bas avec `drop-shadow-lg`.
- **Grilles** : `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`.
- **Boutons** : CTA principal `bg-quebec-red hover:bg-red-600 text-white font-bold rounded-full px-6 py-3 shadow-lg` ; secondaire `bg-quebec-blue hover:bg-blue-800 text-white font-bold rounded-lg px-4 py-2`.
- **Pastilles/badges** : `rounded-full` ; badge mis en avant = `bg-quebec-gold text-white` avec `★`.
- **Accents saison** : Été = `bg-gradient-to-r from-amber-400 to-orange-500` ; Hiver = `bg-gradient-to-r from-indigo-500 to-blue-700`.

## Règles non négociables
1. **Bilingue toujours** : tout texte visible passe par les dictionnaires `dictionaries/fr.js` et `dictionaries/en.js` (objet `t`), jamais de chaîne en dur sans gérer `lang` (`fr`/`en`). Ajouter les clés dans LES DEUX fichiers.
2. **Images locales uniquement** : stocker dans `public/images/...`, jamais de lien externe (Facebook/Booking cassent). Utiliser `next/image` avec `sizes`. Replis dans `public/images/fallbacks`.
3. **Mobile d'abord** : vérifier le rendu petit écran ; le header a un menu hamburger (`components/Header.js`). Indiquer l'état actif des liens de nav.
4. **Composants partagés** : réutiliser `AttractionCard`, `Header`, `Footer`, `FilterBar`, `Mascot` plutôt que recréer.
5. **Cohérence** : reprendre les patrons ci-dessus (rayons `rounded-2xl`, ombres `shadow-card`, transitions `transition-all duration-200`) au lieu d'inventer de nouveaux styles.

## Détails qui font la qualité
- Survol des cartes : léger soulèvement (`hover:-translate-y-0.5`) + ombre accentuée + image `group-hover:scale-105`.
- Texte tronqué proprement : `line-clamp-2` / `line-clamp-3`.
- Espace blanc généreux ; éviter la surcharge ; un seul CTA fort par bloc.
- Accessibilité : `alt` sur les images, `aria-label` sur les boutons icônes.

## Pour tester un rendu
`npm run dev` → http://localhost:3000/fr (et `/en`). Vérifier FR + EN et la version mobile.
