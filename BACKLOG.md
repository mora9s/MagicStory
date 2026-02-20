# 📋 Backlog MagicStory

## 🎯 Vision
Créer une plateforme de génération d'histoires personnalisées et interactives pour enfants, propulsée par l'IA.

---

## 🏗️ Sprint 1 : Fondations

- [x] **STORY-1**: Définir la stack technique (Next.js vs Streamlit) ✅
- [x] **STORY-2**: Créer un squelette d'application de base ✅
- [x] **STORY-3**: Configurer l'accès à l'API OpenAI/Anthropic pour la narration ✅

---

## 🔐 Authentification & Sécurité (STORY-AUTH)

### Option 1 : Supabase Auth (Recommandée) ⭐
**Pourquoi ?** Déjà utilisé pour la base de données, intégration native, gratuit pour les petits volumes.

**Avantages :**
- Intégration transparente avec PostgreSQL (RLS policies)
- Authentification sociale (Google, GitHub, Apple)
- Magic links (email sans mot de passe)
- JWT tokens gérés automatiquement
- Gratuit jusqu'à 50k users/mois

**Inconvénients :**
- Dépendance à Supabase (mais déjà utilisé)
- Moins de flexibilité qu'une solution custom

**Implémentation :**
```typescript
// 1. Activer Auth dans Supabase Dashboard
// 2. Créer middleware.ts pour routes protégées
// 3. Créer composant AuthProvider
// 4. Pages : /login, /register, /reset-password
```

**Coût :** Gratuit jusqu'à 50k users/mois

---

### Option 2 : Clerk (Moderne & Developer-friendly)
**Pourquoi ?** UX excellente, composants pré-faits, gestion des sessions optimisée.

**Avantages :**
- Composants UI prêts à l'emploi (<SignIn />, <SignUp />)
- Gestion des rôles (parent/enfant/admin)
- Analytics intégrés
- Support excellent
- Multi-tenancy facile

**Inconvénients :**
- Coût : $0.01/MAU après 10k users
- Vendor lock-in fort

**Prix :** Gratuit jusqu'à 10k MAU, puis $0.01/MAU

---

### Option 3 : Auth.js (Next-Auth) + Prisma
**Pourquoi ?** Open source, full contrôle, pas de vendor lock-in.

**Avantages :**
- 100% open source
- Supporte toutes les stratégies (Credentials, OAuth, Email)
- Intégration Next.js native
- Pas de coût caché

**Inconvénients :**
- Plus complexe à mettre en place
- Nécessite Prisma + base de données séparée
- Maintenance à charge

**Coût :** Gratuit (infrastructure only)

---

### Option 4 : Firebase Auth (Google)
**Pourquoi ?** Écosystème complet, très stable.

**Avantages :**
- Très mature et stable
- Analytics + Crashlytics
- Authentification anonyme (idéal pour démarrer)
- Gratuit jusqu'à 50k users/jour

**Inconvénients :**
- Dépendance Google (fermeture de projet possible)
- SDK lourd
- Moins bien intégré avec Next.js que Supabase

---

## 🎯 Recommandation

| Critère | Supabase | Clerk | Auth.js | Firebase |
|---------|----------|-------|---------|----------|
| **Coût (début)** | Gratuit | Gratuit | Gratuit | Gratuit |
| **Coût (scale)** | $25/mois | $0.01/MAU | Gratuit | Pay-as-you-go |
| **Setup** | Facile | Très facile | Moyen | Moyen |
| **Intégration** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| **Flexibilité** | Moyenne | Faible | Haute | Moyenne |
| **Vendor lock-in** | Moyen | Fort | Aucun | Fort |

### ✅ Notre choix : **Supabase Auth**

**Arguments :**
1. **Déjà utilisé** : La base de données est Supabase → cohérence technique
2. **Prix** : Gratuit pour les premières années (50k users)
3. **Simplicité** : Magic links = pas de gestion de mots de passe
4. **RLS** : Row Level Security intégré avec PostgreSQL
5. **OAuth** : Google/Facebook déjà prêts

### 📋 Tâches d'implémentation Supabase Auth

- [ ] **AUTH-1**: Activer l'authentification dans Supabase Dashboard
- [ ] **AUTH-2**: Créer la page `/login` avec magic link
- [ ] **AUTH-3**: Créer la page `/register` 
- [ ] **AUTH-4**: Créer `middleware.ts` pour protéger les routes
- [ ] **AUTH-5**: Créer composant `<AuthProvider />` pour le contexte
- [ ] **AUTH-6**: Ajouter Google OAuth pour connexion rapide
- [ ] **AUTH-7**: Mettre à jour les RLS policies (utiliser `auth.uid()`)
- [ ] **AUTH-8**: Créer page `/profil` pour gérer son compte
- [ ] **AUTH-9**: Ajouter la déconnexion
- [ ] **AUTH-10**: Migration des données existantes (associer stories à user_id)

---

## 📝 Product Backlog (À venir)

### ✅ Terminé
- [x] **STORY-4**: Système de choix interactifs (A/B)
- [x] **STORY-5**: Génération d'illustrations (DALL-E)
- [x] **STORY-7**: Espace parent avec relations entre héros
- [x] Page d'accueil redesignée
- [x] Navigation améliorée

### 🚧 En cours / À faire
- [ ] **STORY-6**: Mode lecture audio (Text-to-Speech)
- [ ] **STORY-AUTH**: Système d'authentification (Supabase Auth)
- [ ] **STORY-PDF**: Export PDF des histoires
- [ ] **STORY-SHARE**: Partage par lien/email
- [ ] **STORY-SUB**: Système d'abonnement (freemium)

---

## 💡 Idées futures

- [ ] Application mobile (React Native)
- [ ] Mode "histoire du soir" (lecture auto + musique)
- [ ] Personnalisation avancée (traits de caractère, peur...)
- [ ] Multi-langue (EN, ES, DE...)
- [ ] Impression physique (livre relié)
