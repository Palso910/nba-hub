# NBA Hub

Application Next.js locale, conçue pour ne nécessiter ni compte, ni clé API, ni abonnement. La page conserve les données de navigation et de basket côté client; les liens vidéo externes ne s'ouvrent qu'à la demande.

## Dossiers

- `app/` : routes App Router, layout et styles globaux.
- `components/` : interface React et interactions.
- `lib/data/` : données NBA locales, séparées par sujet.
- `lib/` : types et utilitaires partagés.
- `public/` : fichiers statiques (logos/illustrations à ajouter).
- `nba-hub (2).html` : version autonome originale conservée.

## Lancer l'application

1. Installer Node.js 20.9 ou supérieur.
2. À la racine du dossier, exécuter `npm install`.
3. Exécuter `npm run dev`, puis ouvrir l'URL locale indiquée dans le terminal.
4. Vérifier la production avec `npm run typecheck` puis `npm run build`.

La connexion Internet n'est requise que pour installer les paquets et ouvrir les sources vidéo. Aucun service Supabase ou API n'est configuré.

## Mettre à jour les données

- Équipes : `lib/data/teams.ts` (30 franchises et conférences).
- Effectifs : `lib/data/players.ts`. Ajouter les joueurs à partir d'un roster contrôlé; associer une saison et vérifier les stats avant de renseigner la source.
- Matchs : `lib/data/games.ts`. Les dates/heures et les scores doivent être recoupés; ne pas créer de scores en direct hors d'une source vérifiée.
- Classements : `lib/data/standings.ts`. Renseigner une date `asOf` à chaque mise à jour.
- Moves, systèmes et ressources gratuites : fichiers dédiés dans `lib/data/`.

Les tableaux `players`, `games` et `standings` restent volontairement vides tant que leurs données n'ont pas été vérifiées. Cela évite d'afficher des effectifs, résultats ou rangs périmés comme s'ils étaient actuels.
