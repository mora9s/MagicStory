'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Star, Sword } from 'lucide-react';
import { equipPet } from '@/lib/actions';
import { useRouter } from 'next/navigation';

interface Pet {
  id: string;
  name: string;
  species: string;
  icon_url: string | null;
  type: 'domestic' | 'legendary';
  rarity: string;
  customization?: {
    custom_name: string | null;
    color: string;
    accessory: string | null;
  };
}

interface UserPet {
  id: string;
  pet_id: string;
  equipped: boolean;
  pet?: Pet;
  customization?: Pet['customization'];
}

interface PetSelectorProps {
  pets: UserPet[];
  currentEquippedId?: string;
  onClose: () => void;
  onEquipped: () => void;
}

const ACCESSORY_EMOJI: Record<string, string> = {
  collar: '📿',
  bow: '🎀',
  hat: '🎩',
  cape: '🦸',
  crown: '👑',
};

export function PetSelector({ pets, currentEquippedId, onClose, onEquipped }: PetSelectorProps) {
  const [selectedPet, setSelectedPet] = useState<string | null>(currentEquippedId || null);
  const [isEquipping, setIsEquipping] = useState(false);
  const router = useRouter();

  const handleEquip = async () => {
    if (!selectedPet) return;
    
    setIsEquipping(true);
    const pet = pets.find(p => p.pet_id === selectedPet);
    if (pet) {
      await equipPet(selectedPet);
      onEquipped();
    }
    setIsEquipping(false);
  };

  const handleUseAsHero = async (petId: string) => {
    router.push(`/choose-hero?petHeroId=${petId}`);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <span className="text-3xl">🐾</span>
              Mes Compagnons
            </h2>
            <button onClick={onClose} className="text-white/50 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Grille d'animaux */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {pets.filter(up => up.pet).map((userPet) => {
              const pet = userPet.pet!;
              const isSelected = selectedPet === pet.id;
              const isEquipped = userPet.equipped;
              const displayName = userPet.customization?.custom_name || pet.name;
              const bgColor = userPet.customization?.color || '#FFA500';

              return (
                <motion.button
                  key={pet.id}
                  onClick={() => setSelectedPet(pet.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative p-4 rounded-2xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {/* Badge équipé */}
                  {isEquipped && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Icône */}
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-4xl mx-auto mb-3 relative"
                    style={{ 
                      backgroundColor: bgColor + '30',
                      border: `2px solid ${bgColor}`
                    }}
                  >
                    {pet.icon_url || '🐾'}
                    {userPet.customization?.accessory && (
                      <span className="absolute -top-1 -right-1 text-lg">
                        {ACCESSORY_EMOJI[userPet.customization.accessory]}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <p className="font-bold text-white text-center truncate">{displayName}</p>
                  <p className="text-xs text-white/50 text-center">{pet.name}</p>

                  {/* Rareté */}
                  <div className="flex justify-center mt-2">
                    {pet.type === 'legendary' ? (
                      <span className="text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-black px-2 py-0.5 rounded-full font-bold">
                        LÉGENDAIRE
                      </span>
                    ) : (
                      <span className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full">
                        {pet.rarity}
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Actions */}
          {selectedPet && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <button
                onClick={handleEquip}
                disabled={isEquipping}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isEquipping ? 'Équipement...' : 'Équiper comme compagnon'}
              </button>
              <button
                onClick={() => handleUseAsHero(selectedPet)}
                className="flex-1 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
              >
                <Sword className="w-4 h-4" />
                Utiliser comme héros
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
