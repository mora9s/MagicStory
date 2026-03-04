-- Migration : Système de Quête RPG
-- Création des tables pour progression, animaux et mondes

-- ============================================
-- 1. TABLE user_progression
-- ============================================
CREATE TABLE IF NOT EXISTS user_progression (
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

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_user_progression_user_id ON user_progression(user_id);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_progression_updated_at ON user_progression;
CREATE TRIGGER update_user_progression_updated_at
  BEFORE UPDATE ON user_progression
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. TABLE pets (animaux disponibles)
-- ============================================
CREATE TABLE IF NOT EXISTS pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('domestic', 'legendary')),
  species TEXT NOT NULL,
  icon_url TEXT,
  unlock_level INTEGER NOT NULL,
  customizable BOOLEAN DEFAULT false,
  description TEXT,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  bonus_xp INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_pets_unlock_level ON pets(unlock_level);

-- ============================================
-- 3. TABLE pet_customizations
-- ============================================
CREATE TABLE IF NOT EXISTS pet_customizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  custom_name TEXT,
  color TEXT DEFAULT '#FFA500',
  accessory TEXT CHECK (accessory IN ('collar', 'bow', 'hat', 'cape', 'crown', null)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, pet_id)
);

CREATE INDEX IF NOT EXISTS idx_pet_customizations_user ON pet_customizations(user_id);
CREATE INDEX IF NOT EXISTS idx_pet_customizations_pet ON pet_customizations(pet_id);

DROP TRIGGER IF EXISTS update_pet_customizations_updated_at ON pet_customizations;
CREATE TRIGGER update_pet_customizations_updated_at
  BEFORE UPDATE ON pet_customizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. TABLE user_pets (animaux possédés)
-- ============================================
CREATE TABLE IF NOT EXISTS user_pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  customization_id UUID REFERENCES pet_customizations(id) ON DELETE SET NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  equipped BOOLEAN DEFAULT false,
  UNIQUE(user_id, pet_id)
);

CREATE INDEX IF NOT EXISTS idx_user_pets_user ON user_pets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_pets_equipped ON user_pets(user_id, equipped) WHERE equipped = true;

-- ============================================
-- 5. TABLE worlds (mondes disponibles)
-- ============================================
CREATE TABLE IF NOT EXISTS worlds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  unlock_level INTEGER NOT NULL,
  theme_color TEXT DEFAULT '#8B5CF6',
  icon_url TEXT,
  bg_gradient_start TEXT DEFAULT '#1a1a2e',
  bg_gradient_end TEXT DEFAULT '#16213e',
  story_prompt_suffix TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_worlds_unlock_level ON worlds(unlock_level);

-- ============================================
-- 6. TABLE user_worlds (mondes débloqués)
-- ============================================
CREATE TABLE IF NOT EXISTS user_worlds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  equipped BOOLEAN DEFAULT false,
  UNIQUE(user_id, world_id)
);

CREATE INDEX IF NOT EXISTS idx_user_worlds_user ON user_worlds(user_id);
CREATE INDEX IF NOT EXISTS idx_user_worlds_equipped ON user_worlds(user_id, equipped) WHERE equipped = true;

-- ============================================
-- 7. SEED DATA - Animaux
-- ============================================
INSERT INTO pets (name, type, species, icon_url, unlock_level, customizable, description, rarity, bonus_xp) VALUES
-- Domestiques
('Chat', 'domestic', 'cat', '🐱', 2, true, 'Un chat curieux et affectueux', 'common', 0),
('Chien', 'domestic', 'dog', '🐶', 4, true, 'Un chien loyal et protecteur', 'common', 0),
('Lapin', 'domestic', 'rabbit', '🐰', 6, true, 'Un lapin rapide et espiègle', 'common', 0),
('Renard', 'domestic', 'fox', '🦊', 8, true, 'Un renard rusé et malin', 'rare', 5),
-- Légendaires
('Dragon', 'legendary', 'dragon', '🐉', 10, false, 'Un dragon majestueux cracheur de feu', 'legendary', 10),
('Phénix', 'legendary', 'phoenix', '🦅', 12, false, 'Un phénix immortel aux plumes de feu', 'legendary', 15),
('Licorne', 'legendary', 'unicorn', '🦄', 14, false, 'Une licorne magique à la corne scintillante', 'legendary', 20);

-- ============================================
-- 8. SEED DATA - Mondes
-- ============================================
INSERT INTO worlds (name, description, unlock_level, theme_color, bg_gradient_start, bg_gradient_end, story_prompt_suffix) VALUES
('Forêt Enchantée', 'Un monde magique peuplé de fées et de créatures parlantes', 5, '#22C55E', '#064E3B', '#065F46', 'dans une forêt enchantée avec des fées et des animaux parlants'),
('Château des Mille Tours', 'Un royaume médiéval avec des chevaliers et des princesses', 11, '#A855F7', '#4C1D95', '#5B21B6', 'dans un château majestueux avec des chevaliers et des dragons'),
('Royaume Éternel', 'Un monde légendaire où tous les rêves deviennent réalité', 15, '#F59E0B', '#78350F', '#92400E', 'dans un royaume magique éternel avec des créatures légendaires');

-- ============================================
-- 9. FONCTION : Créer progression à l'inscription
-- ============================================
CREATE OR REPLACE FUNCTION create_user_progression()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_progression (user_id, current_level, current_xp, total_stories_read, next_level_xp)
  VALUES (NEW.id, 1, 0, 0, 100);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_progression ON auth.users;
CREATE TRIGGER on_auth_user_created_progression
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_progression();

-- ============================================
-- 10. FONCTION : Calculer XP pour niveau
-- ============================================
CREATE OR REPLACE FUNCTION calculate_level_xp(level INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN FLOOR(100 * POWER(1.2, level - 1));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- 11. POLITIQUES RLS
-- ============================================
ALTER TABLE user_progression ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_worlds ENABLE ROW LEVEL SECURITY;

-- user_progression
CREATE POLICY "Users can view own progression"
  ON user_progression FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progression"
  ON user_progression FOR UPDATE USING (auth.uid() = user_id);

-- pet_customizations
CREATE POLICY "Users can view own customizations"
  ON pet_customizations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own customizations"
  ON pet_customizations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own customizations"
  ON pet_customizations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own customizations"
  ON pet_customizations FOR DELETE USING (auth.uid() = user_id);

-- user_pets
CREATE POLICY "Users can view own pets"
  ON user_pets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own pets"
  ON user_pets FOR UPDATE USING (auth.uid() = user_id);

-- user_worlds
CREATE POLICY "Users can view own worlds"
  ON user_worlds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own worlds"
  ON user_worlds FOR UPDATE USING (auth.uid() = user_id);

-- Tables publiques (lecture seule)
CREATE POLICY "Pets are readable by all authenticated users"
  ON pets FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Worlds are readable by all authenticated users"
  ON worlds FOR SELECT USING (auth.role() = 'authenticated');
