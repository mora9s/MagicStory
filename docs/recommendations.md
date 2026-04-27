# Recommandations MagicStory

Dernière mise à jour : 2026-04-27

Ce document liste les recommandations restantes après le durcissement P0/P1 de MagicStory : retrait des secrets du dépôt, sécurisation admin, RPC runes atomiques, correction hydration, lookup profils par ID, migration Supabase appliquée.

## Priorité P0 — sécurité / exploitation

### 1. Régénérer les secrets anciennement versionnés

`.env.local` a été retiré du tracking Git, mais s'il a déjà été poussé dans l'historique, les clés doivent être considérées comme exposées.

Actions recommandées :

- régénérer les clés/API tokens sensibles exposés dans l'ancien `.env.local` ;
- vérifier les secrets Supabase, Gemini/Google, OAuth et éventuelles clés service ;
- mettre les nouvelles valeurs uniquement dans Vercel Environment Variables et dans des fichiers locaux ignorés.

### 2. Harmoniser les variables d'environnement Vercel

Le déploiement Vercel doit définir explicitement :

- `NEXT_PUBLIC_SUPABASE_URL` ;
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ;
- les clés serveur nécessaires à la génération IA, si utilisées en production ;
- les variables OAuth/redirect requises par Supabase Auth.

À appliquer au minimum sur les scopes Vercel suivants :

- Preview ;
- Production.

Ajouter une vérification de démarrage claire serait utile pour éviter des erreurs génériques côté Supabase.

### 3. Réconcilier le tracking des migrations Supabase

La migration P0/P1 a été appliquée via SQL direct, car le Supabase Access Token fourni retournait `Unauthorized` avec le CLI.

Conséquence : l'état SQL distant est correct, mais l'historique CLI Supabase peut ne pas être synchronisé.

Actions recommandées :

- recréer un token Supabase valide pour le CLI ;
- relier le projet avec `supabase link` ;
- vérifier l'état des migrations distantes ;
- éviter de réappliquer une migration non idempotente via `supabase db push` sans contrôle préalable.

## Priorité P1 — stabilité / maintenabilité

### 4. Découper `lib/actions.ts`

`lib/actions.ts` concentre trop de responsabilités : auth, profils, histoires, runes, admin, génération IA, parsing et persistance.

Découpage recommandé :

- `lib/actions/profile-actions.ts` ;
- `lib/actions/story-actions.ts` ;
- `lib/actions/runes-actions.ts` ;
- `lib/actions/admin-actions.ts` ;
- `lib/ai/story-generation.ts` ;
- `lib/ai/story-parsing.ts` ;
- `lib/auth/require-user.ts` et `lib/auth/require-admin.ts`.

Objectif : réduire les risques de régression et faciliter les tests.

### 5. Valider les sorties IA avec un schéma

Les réponses IA doivent être validées avant persistance.

Actions recommandées :

- introduire Zod ou un validateur équivalent ;
- définir un schema pour histoire linéaire et interactive ;
- ajouter un retry contrôlé si la sortie IA est invalide ;
- journaliser les erreurs sans exposer de données enfant/sensibles.

### 6. Ajouter des tests ciblés sur les flux critiques

Tests à prioriser :

- accès `/admin` non connecté → redirection login ;
- accès `/admin` connecté non-admin → redirection ;
- actions admin refusées pour non-admin ;
- `spend_runes` refuse les montants invalides ;
- double dépense concurrente impossible ;
- génération d'histoire avec deux profils ayant le même prénom ;
- callback auth et magic link redirect.

### 7. Améliorer l'observabilité des générations

Pour diagnostiquer la production sans exposer de données sensibles :

- ajouter un identifiant de génération/story request ;
- logger les étapes : validation, débit runes, appel IA, parsing, sauvegarde ;
- masquer prompts, contenu enfant et clés ;
- distinguer erreurs utilisateur, erreurs IA et erreurs DB.

## Priorité P2 — qualité / UX / dette technique

### 8. Traiter les warnings ESLint existants

Le lint passe, mais il reste des warnings :

- plusieurs `<img>` à remplacer par `next/image` ou à justifier ;
- dépendances `useEffect` manquantes dans certains composants.

Ces warnings ne bloquent pas la release, mais les corriger réduira le bruit CI et améliorera la performance image.

### 9. Extraire davantage de Server Components

Plusieurs pages sont largement client-side. Avec Next.js App Router, déplacer la lecture initiale des données côté serveur peut améliorer :

- performance ;
- sécurité ;
- SEO ;
- simplicité de chargement.

À faire progressivement, page par page.

### 10. Formaliser le workflow de release

Créer une checklist release :

- lint ;
- build ;
- smoke test `/` ;
- smoke test `/auth/login` ;
- smoke test `/admin` ;
- vérification variables Vercel Preview/Production ;
- vérification Supabase migrations ;
- test génération histoire ;
- test débit/crédit runes.

## Recommandation produit

### 11. Préparer une vraie console admin

Maintenant que l'accès admin est sécurisé, la console peut devenir utile pour :

- voir les utilisateurs ;
- voir les générations récentes ;
- ajuster les runes ;
- consulter les erreurs IA ;
- désactiver/supprimer des contenus problématiques ;
- suivre les coûts de génération.

## Synthèse

Les fondations P0/P1 sont désormais beaucoup plus saines. Les prochains meilleurs investissements sont :

1. sécuriser définitivement les secrets et Vercel env ;
2. découper `lib/actions.ts` ;
3. ajouter tests critiques auth/admin/runes ;
4. fiabiliser parsing IA avec schémas ;
5. mettre en place une checklist release.
