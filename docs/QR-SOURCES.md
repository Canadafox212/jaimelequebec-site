# QR Sources — J'aime le Québec

Chaque code QR physique distribué génère une URL courte `/qr/[source]` qui redirige vers  
`https://jaimelequebec.com/fr?utm_source=qr&utm_campaign=[source]`.

**Règle de nommage** : lettres minuscules, chiffres, tirets uniquement — max 40 caractères.  
**Version anglaise** : ajouter `?lang=en` après l'URL QR pour rediriger vers `/en`.

---

## Format du tableau

| Code source | URL QR complète | Date | Partenaire / emplacement | Notes |
|---|---|---|---|---|
| `bit-tadoussac` | `https://jaimelequebec.com/qr/bit-tadoussac` | 2026-07-05 | Bureau d'information touristique de Tadoussac | Présentoir principal |
| `cafe-saint-leandre` | `https://jaimelequebec.com/qr/cafe-saint-leandre` | 2026-07-05 | Café Saint-Léandre, Québec ville | Carte-postale sur tables |
| `carte-postale-ete2026` | `https://jaimelequebec.com/qr/carte-postale-ete2026` | 2026-07-05 | Mailing groupe Facebook (juillet 2026) | Distribution numérique |

---

## Ajouter un nouveau code

1. Choisir un code source (`mon-partenaire-ville`)
2. Générer le QR code pointant vers `https://jaimelequebec.com/qr/mon-partenaire-ville`
3. Ajouter une ligne au tableau ci-dessus
4. Vérifier la redirection en ouvrant l'URL dans un navigateur

**Aucun déploiement requis** : la route `/qr/[source]` accepte automatiquement tout code valide.
