'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Gift, Lock, Star, Check, Sparkles, Globe,
  Cat, Dog, Rabbit, Heart, Bird
} from 'lucide-react';
import { 
  getUserPets, getUserWorlds, getAllPets, getAllWorlds,
  getUserProgression, createPetCustomization, equipPet, equipWorld
} from '@/lib/actions';
import { PetCreator } from '../components/PetCreator';
import { PetSelector } from '../components/PetSelector';
import Link from 'next/link';

interface Pet {
  id: string;
  name: string;
  type: 'domestic' | 'legendary';
  species: string;
  icon_url: string | null;
  unlock_level: number;
  customizable: boolean;
  description: string | null;
  rarity: string;
  bonus_xp: number;
}

interface UserPet {
  id: string;
  pet_id: string;
  equipped: boolean;
  unlocked_at: string;
  pet?: Pet;
  customization?: {
    custom_name: string | null;
    color: string;
    accessory: string | null;
  };
}

interface World {
  id: string;
  name: string;
  description: string | null;
  unlock_level: number;
  theme_color: string;
  icon_url: string | null;
  bg_gradient_start?: string;
  bg_gradient_end?: string;
}

interface UserWorld {
  id: string;
  world_id: string;
  equipped: boolean;
  world?: World;
}

const PET_EMOJIS: Record<string, string> = {
  cat: '🐱',
  dog: '🐶',
  rabbit: '🐰',
  fox: '🦊',
  dragon: '🐉',
  phoenix: '🦅',
  unicorn: '🦄',
};

const WORLD_EMOJIS: Record<string, string> = {
  'Forêt Enchantée': '🌲',
  'Château des Mille Tours': '🏰',
  'Royaume Éternel': '👑',
};

export default function RewardsPage() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [userPets, setUserPets] = useState<UserPet[]>([]);
  const [userWorlds, setUserWorlds] = useState<UserWorld[]>([]);
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [allWorlds, setAllWorlds] = useState<World[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPetForCreation, setSelectedPetForCreation] = useState<Pet | null>(null);
  const [showPetSelector, setShowPetSelector] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [progressionRes, petsRes, worldsRes, allPetsRes, allWorldsRes] = await Promise.all([
      getUserProgression(),
      getUserPets(),
      getUserWorlds(),
      getAllPets(),
      getAllWorlds(),
    ]);

    if (progressionRes.data) {
      setCurrentLevel(progressionRes.data.current_level);
    }
    if (petsRes.data) setUserPets(petsRes.data);
    if (worldsRes.data) setUserWorlds(worldsRes.data);
    if (allPetsRes.data) setAllPets(allPetsRes.data);
    if (allWorldsRes.data) setAllWorlds(allWorldsRes.data);

    setLoading(false);
  };

  const isPetUnlocked = (pet: Pet) => {
    return userPets.some(up => up.pet_id === pet.id);
  };

  const isWorldUnlocked = (world: World) => {
    return userWorlds.some(uw => uw.world_id === world.id);
  };

  const handleCustomizePet = (pet: Pet) => {
    setSelectedPetForCreation(pet);
  };

  const handleEquipWorld = async (worldId: string) => {
    await equipWorld(worldId);
    loadData();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin text-amber-400 text-4xl">✨</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Gift className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h1 className="font-black text-xl">Mes Récompenses</h1>
              <p className="text-white/50 text-sm">Niveau {currentLevel}/15</p>
            </div>
          </div>
          <Link 
            href="/"
            className="text-white/70 hover:text-white font-medium"
          >
            Retour →
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        {/* Section Animaux */}
        <section>
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
            <span className="text-3xl">🐾</span>
            Mes Compagnons
            <span className="text-sm font-normal text-white/50">
              ({userPets.length}/{allPets.length})
            </span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {allPets.map((pet, index) => {
              const unlocked = isPetUnlocked(pet);
              const userPet = userPets.find(up => up.pet_id === pet.id);
              const canCustomize = unlocked && pet.customizable && !userPet?.customization;
              const displayName = userPet?.customization?.custom_name || pet.name;
              const bgColor = userPet?.customization?.color || '#FFA500';

              return (
                <motion.div
                  key={pet.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative p-4 rounded-2xl border-2 transition-all ${
                    unlocked
                      ? 'border-white/10 bg-white/5 hover:bg-white/10'
                      : 'border-white/5 bg-white/5 opacity-50'
                  }`}
                >
                  {/* Badge niveau requis */}
                  {!unlocked && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-white/50 bg-black/50 px-2 py-1 rounded-full">
                      <Lock className="w-3 h-3" />
                      Niv. {pet.unlock_level}
                    </div>
                  )}

                  {/* Badge équipé */}
                  {userPet?.equipped && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Icône */}
                  <div
                    className="w-20 h-20 rounded-xl flex items-center justify-center text-4xl mx-auto mb-3 relative"
                    style={{
                      backgroundColor: unlocked ? bgColor + '30' : '#1e293b',
                      border: `2px solid ${unlocked ? bgColor : '#334155'}`,
                    }}
                  >
                    {PET_EMOJIS[pet.species] || '🐾'}
                    {userPet?.customization?.accessory && (
                      <span className="absolute -top-1 -right-1 text-lg bg-slate-800 rounded-full w-6 h-6 flex items-center justify-center">
                        📿
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <p className="font-bold text-center truncate">{displayName}</p>
                  {userPet?.customization?.custom_name && (
                    <p className="text-xs text-white/50 text-center">{pet.name}</p>
                  )}

                  {/* Type */}
                  <div className="flex justify-center mt-2">
                    {pet.type === 'legendary' ? (
                      <span className="text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-black px-2 py-0.5 rounded-full font-bold">
                        ⭐ LÉGENDAIRE
                      </span>
                    ) : (
                      <span className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full">
                        {pet.rarity}
                      </span>
                    )}
                  </div>

                  {/* Bouton personnaliser */}
                  {canCustomize && (
                    <button
                      onClick={() => handleCustomizePet(pet)}
                      className="w-full mt-3 py-2 bg-amber-500/20 border border-amber-500/50 text-amber-400 text-sm font-bold rounded-lg hover:bg-amber-500/30 transition-colors"
                    >
                      ✨ Personnaliser
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Bouton voir tous les animaux */}
          {userPets.length > 0 && (
            <button
              onClick={() => setShowPetSelector(true)}
              className="mt-6 w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10 transition-colors"
            >
              Voir mes compagnons →
            </button>
          )}
        </section>

        {/* Section Mondes */}
        <section>
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
            <Globe className="w-6 h-6 text-purple-400" />
            Mes Mondes
            <span className="text-sm font-normal text-white/50">
              ({userWorlds.length}/{allWorlds.length})
            </span>
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allWorlds.map((world, index) => {
              const unlocked = isWorldUnlocked(world);
              const userWorld = userWorlds.find(uw => uw.world_id === world.id);

              return (
                <motion.div
                  key={world.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-6 rounded-2xl border-2 transition-all ${
                    unlocked
                      ? 'border-white/10 hover:border-purple-500/50'
                      : 'border-white/5 opacity-50'
                  }`}
                  style={{
                    background: unlocked 
                      ? `linear-gradient(135deg, ${world.bg_gradient_start}40, ${world.bg_gradient_end}40)`
                      : undefined,
                  }}
                >
                  {/* Badge niveau requis */}
                  {!unlocked && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 text-sm text-white/50 bg-black/50 px-3 py-1 rounded-full">
                      <Lock className="w-4 h-4" />
                      Niv. {world.unlock_level}
                    </div>
                  )}

                  {/* Badge équipé */}
                  {userWorld?.equipped && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Icône */}
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
                    style={{ backgroundColor: world.theme_color + '30' }}
                  >
                    {WORLD_EMOJIS[world.name] || '🌍'}
                  </div>

                  {/* Info */}
                  <h3 className="font-bold text-xl mb-2">{world.name}</h3>
                  <p className="text-sm text-white/60 mb-4">{world.description}</p>

                  {/* Bouton équiper */}
                  {unlocked && !userWorld?.equipped && (
                    <button
                      onClick={() => handleEquipWorld(world.id)}
                      className="w-full py-2 bg-purple-500/20 border border-purple-500/50 text-purple-400 text-sm font-bold rounded-lg hover:bg-purple-500/30 transition-colors"
                    >
                      🌟 Équiper ce monde
                    </button>
                  )}

                  {userWorld?.equipped && (
                    <div className="w-full py-2 bg-green-500/20 text-green-400 text-sm font-bold rounded-lg text-center">
                      ✓ Monde actif
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Modals */}
      {selectedPetForCreation && (
        <PetCreator
          petId={selectedPetForCreation.id}
          petName={selectedPetForCreation.name}
          petEmoji={PET_EMOJIS[selectedPetForCreation.species] || '🐾'}
          onClose={() => setSelectedPetForCreation(null)}
          onCreated={loadData}
        />
      )}

      {showPetSelector && (
        <PetSelector
          pets={userPets}
          currentEquippedId={userPets.find(p => p.equipped)?.pet_id}
          onClose={() => setShowPetSelector(false)}
          onEquipped={loadData}
        />
      )}
    </main>
  );
}
