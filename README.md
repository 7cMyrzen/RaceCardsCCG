# Jeu de Cartes Automobile - Next.js

Ce projet est un jeu de cartes automobile multijoueur en temps réel, développé avec Next.js, Prisma, PostgreSQL et Pusher. Il propose une expérience de course stratégique, de collection et de gestion de decks, avec une interface moderne et responsive.

## Fonctionnalités principales

- **Gestion de compte** : inscription, connexion, profil, avatar, statistiques, historique de parties.
- **Decks et cartes** : création, personnalisation, activation, suppression de decks. Collection de cartes véhicules et upgrades.
- **Matchmaking temps réel** : file d'attente, recherche d'adversaire, synchronisation via Pusher.
- **Course 1v1** : choix du véhicule, accélération, freinage, gestion physique réaliste (vitesse, distance, virages, pénalités).
- **Effets et upgrades** : application d'effets permanents ou temporaires sur les véhicules.
- **Économie** : diamants, argent, boutique de boosters, récompenses selon les actions et les victoires.
- **Historique** : suivi des parties, victoires, défaites, adversaires, date.
- **Pages dédiées** : profil, boutique, quêtes, historique, decks.
- **Abandon de partie** : bouton d'abandon avec confirmation, gestion de la défaite immédiate.

## Prérequis

- Node.js >= 18
- PostgreSQL (local ou cloud)
- Un compte Pusher (pour le temps réel)

## Installation

1. **Cloner le dépôt**

   ```bash
   git clone <url-du-repo>
   cd <nom-du-repo>
   ```

2. **Installer les dépendances**

   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   Crée un fichier `.env.local` à la racine avec :

   ```env
   DATABASE_URL=postgresql://user:password@host:port/dbname
   JWT_SECRET=une_chaine_secrete_complexe
   PUSHER_KEY=xxx
   PUSHER_SECRET=xxx
   PUSHER_APP_ID=xxx
   PUSHER_CLUSTER=xxx
   ```

4. **Configurer la base de données**

   - Lancer les migrations Prisma :
     ```bash
     npx prisma migrate deploy
     ```
   - (Optionnel) Générer le client Prisma :
     ```bash
     npx prisma generate
     ```

5. **Lancer le projet en développement**
   ```bash
   npm run dev
   ```
   Le site sera accessible sur [http://localhost:3000](http://localhost:3000)

## Déploiement sur Vercel

1. Pousse le projet sur GitHub.
2. Connecte le repo à Vercel (https://vercel.com/import).
3. Renseigne les variables d'environnement dans le dashboard Vercel.
4. Après le premier déploiement, lance la migration Prisma sur la base distante :
   ```bash
   npx prisma migrate deploy
   ```

## Commandes utiles

- `npm run dev` : démarre le serveur Next.js en mode développement
- `npm run build` : build de l'application pour la production
- `npm start` : démarre le serveur en mode production
- `npx prisma migrate deploy` : applique les migrations sur la base
- `npx prisma studio` : interface d'administration de la base

## Structure du projet

- `src/app/` : pages Next.js (profil, shop, game, etc.)
- `src/components/` : composants UI et jeu (cartes, timeline, etc.)
- `src/lib/` : utilitaires, Prisma, auth
- `src/app/api/` : routes API Next.js (gestion, matchmaking, course, etc.)
- `prisma/schema.prisma` : schéma de la base de données
- `public/images/` : images des cartes, decks, UI

## Notes de sécurité

- Change toujours la valeur de `JWT_SECRET` en production.
- Utilise une base PostgreSQL sécurisée et accessible depuis Vercel.
- Les tokens JWT sont stockés en cookie httpOnly.

## Limitations connues

- Les WebSockets natifs ne sont pas supportés sur Vercel : Pusher est utilisé pour le temps réel.
- Les quêtes sont en cours de développement.

## Contribution

Les contributions sont les bienvenues. Ouvre une issue ou une pull request pour toute suggestion ou amélioration.

## Licence

Ce projet est sous licence MIT.
