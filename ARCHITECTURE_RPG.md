# Architecture - Système de Quête RPG MagicStory

## 📊 Schéma SQL Complet

### Table : user_progression
```sql
CREATE TABLE user_progression (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  total_stories_read INTEGER DEFAULT 0,
  next_level_xp INTEGER DEFAULT 100,
  equipped_pet_id UUID,
  equipped_world_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table : pets
```sql
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('domestic', 'legendary')),
  species TEXT NOT NULL, -- 'cat', 'dog', 'rabbit', 'dragon', 'phoenix', 'unicorn'
  icon_url TEXT,
  unlock_level INTEGER NOT NULL,
  customizable BOOLEAN DEFAULT false,
  description TEXT,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  bonus_xp INTEGER DEFAULT 0
);
```

### Table : pet_customizations
```sql
CREATE TABLE pet_customizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  custom_name TEXT,
  color TEXT DEFAULT '#FFA500', -- Couleur hex
  accessory TEXT, -- 'collar', 'bow', 'hat', 'cape', null
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, pet_id)
);
```

### Table : user_pets
```sql
CREATE TABLE user_pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  customization_id UUID REFERENCES pet_customizations(id),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  equipped BOOLEAN DEFAULT false,
  UNIQUE(user_id, pet_id)
);
```

### Table : worlds
```sql
CREATE TABLE worlds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  unlock_level INTEGER NOT NULL,
  theme_color TEXT DEFAULT '#8B5CF6', -- Violet par défaut
  icon_url TEXT,
  bg_gradient_start TEXT DEFAULT '#1a1a2e',
  bg_gradient_end TEXT DEFAULT '#16213e',
  story_prompt_suffix TEXT -- Suffixe ajouté aux prompts d'histoires
);
```

### Table : user_worlds
```sql
CREATE TABLE user_worlds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  equipped BOOLEAN DEFAULT false,
  UNIQUE(user_id, world_id)
);
```

## 🎮 Progression des 15 Niveaux

| Niveau | XP Requis | Récompense Débloquée | Type |
|--------|-----------|---------------------|------|
| 1 | 0 | 🎉 Début de l'aventure | - |
| 2 | 100 | 🐱 Chat (domestique) | Animal |
| 3 | 250 | 🎨 Accessoire "Collier" | Custom |
| 4 | 450 | 🐶 Chien (domestique) | Animal |
| 5 | 700 | 🌲 Monde "Forêt Enchantée" | Monde |
| 6 | 1000 | 🐰 Lapin (domestique) | Animal |
| 7 | 1350 | 🎨 Couleur "Rose Bonbon" | Custom |
| 8 | 1750 | 🦊 Renard (domestique) | Animal |
| 9 | 2200 | 🎨 Accessoire "Nœud Papillon" | Custom |
| 10 | 2700 | 🐉 Dragon Légendaire | Légendaire |
| 11 | 3250 | 🏰 Monde "Château des Mille Tours" | Monde |
| 12 | 3850 | 🦅 Phénix Légendaire | Légendaire |
| 13 | 4500 | 🎨 Accessoire "Couronne Dorée" | Custom |
| 14 | 5200 | 🦄 Licorne Légendaire | Légendaire |
| 15 | 6000 | 👑 Titre "Maître des Contes" + Monde "Royaume Éternel" | Prestige |

## 🐾 Animaux Disponibles

### Domestiques (Customizables)
1. **Chat** (Niv. 2) - Common
2. **Chien** (Niv. 4) - Common
3. **Lapin** (Niv. 6) - Common
4. **Renard** (Niv. 8) - Rare

### Légendaires (Non customizables)
1. **Dragon** (Niv. 10) - Légendaire - +10% XP
2. **Phénix** (Niv. 12) - Légendaire - +15% XP
3. **Licorne** (Niv. 14) - Légendaire - +20% XP

## 🌍 Mondes Débloquables

1. **Forêt Enchantée** (Niv. 5)
   - Thème vert/nature
   - Histoires avec fées, elfes, animaux parlants

2. **Château des Mille Tours** (Niv. 11)
   - Thème violet/or
   - Histoires avec chevaliers, princesses, dragons

3. **Royaume Éternel** (Niv. 15)
   - Thème arc-en-ciel/doré
   - Histoires épiques, finales spectaculaires

## 🎨 Options de Customization

### Couleurs disponibles
- Orange (#FFA500) - Défaut
- Rose Bonbon (#FF69B4) - Débloque Niv. 7
- Bleu Ciel (#87CEEB)
- Vert Menthe (#98FB98)
- Violet Magique (#9370DB)

### Accessoires
- Collier - Débloque Niv. 3
- Nœud Papillon - Débloque Niv. 9
- Couronne Dorée - Débloque Niv. 13
- Cape Héroïque - Débloque Niv. 10

## 📍 Structure Carte RPG (Coordonnées)

```
Carte 800x600px

Niveau 15 (600, 100) 👑     Niveau 14 (400, 150) 🦄
         ↘                        ↙
    Niveau 13 (500, 250) 🎀
            ↘
       Niveau 12 (350, 300) 🦅
              ↘
         Niveau 11 (200, 350) 🏰
                ↘
           Niveau 10 (300, 450) 🐉
                  ↘
             Niveau 9 (450, 500) 🎀
                    ↘
               Niveau 8 (550, 450) 🦊
                      ↘
                 Niveau 7 (650, 400) 🎨
                        ↘
                   Niveau 6 (600, 350) 🐰
                          ↘
                     Niveau 5 (500, 350) 🌲
                            ↘
                       Niveau 4 (400, 400) 🐶
                              ↘
                         Niveau 3 (300, 450) 🎀
                                ↘
                           Niveau 2 (200, 500) 🐱
                                  ↘
                             Niveau 1 (100, 550) 🎉
```

Chemin en zigzag qui monte vers la récompense finale.

## 🧮 Calcul XP

### Gain XP par histoire
- Histoire classique lue : +20 XP
- Histoire interactive lue : +30 XP
- Avec animal légendaire équipé : +bonus (10-20%)

### Formule Level Up
```javascript
nextLevelXP = Math.floor(100 * Math.pow(1.2, currentLevel - 1))
```

Exemple :
- Niv 1→2 : 100 XP
- Niv 2→3 : 150 XP
- Niv 5→6 : 250 XP
- Niv 10→11 : 619 XP

## 🔌 API Endpoints

### Server Actions (lib/actions.ts)

```typescript
// Progression
addStoryRead(userId: string, storyType: 'classic' | 'interactive'): Promise<LevelUpResult>
getUserProgression(userId: string): Promise<UserProgression>

// Animaux
createPetCustomization(userId: string, petId: string, customization: PetCustomization): Promise<void>
equipPet(userId: string, petId: string): Promise<void>
getUserPets(userId: string): Promise<UserPet[]>
getAvailablePetsAsHeroes(userId: string): Promise<Pet[]>
usePetAsHero(userId: string, petId: string): Promise<Hero>

// Mondes
unlockWorld(userId: string, worldId: string): Promise<void>
equipWorld(userId: string, worldId: string): Promise<void>
getUserWorlds(userId: string): Promise<UserWorld[]>
getEquippedWorld(userId: string): Promise<World | null>
```

## 🔄 Intégration Système Héros

Les animaux sont utilisables comme héros dans les histoires :

```typescript
// Quand on choisit un animal comme héros
// Créer un "Hero" virtuel à partir du pet
{
  id: 'pet_' + pet.id,
  name: petCustomization.custom_name || pet.name,
  type: 'pet',
  species: pet.species,
  icon_url: pet.icon_url,
  color: petCustomization.color,
  accessory: petCustomization.accessory,
  is_legendary: pet.type === 'legendary'
}
```

## 📱 Interface

### Composants React
- `QuestMap` - Carte SVG avec les 15 niveaux
- `ProgressWidget` - Niveau + barre XP (navbar)
- `PetCreator` - Modal création animal
- `PetSelector` - Choisir animal comme héros
- `RewardsPage` - Grille récompenses
- `LevelUpAnimation` - Animation montée niveau

---

**Architecture terminée !** ✅
Prochaine étape : Backend (tables SQL + fonctions)
