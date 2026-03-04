'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Gift, Sparkles } from 'lucide-react';

interface LevelUpAnimationProps {
  isOpen: boolean;
  newLevel: number;
  unlockedPets?: { name: string; icon: string }[];
  unlockedWorlds?: { name: string; icon: string }[];
  onClose: () => void;
}

export function LevelUpAnimation({
  isOpen,
  newLevel,
  unlockedPets,
  unlockedWorlds,
  onClose,
}: LevelUpAnimationProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  const hasRewards = (unlockedPets && unlockedPets.length > 0) || 
                     (unlockedWorlds && unlockedWorlds.length > 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          {/* Confettis */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ['#F59E0B', '#8B5CF6', '#EC4899', '#22C55E'][i % 4],
                  left: `${Math.random() * 100}%`,
                  top: -10,
                }}
                animate={{
                  y: window.innerHeight + 20,
                  x: (Math.random() - 0.5) * 200,
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  ease: "easeOut",
                  delay: Math.random() * 0.5,
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="relative bg-gradient-to-br from-slate-900 to-slate-800 border border-amber-500/50 rounded-3xl p-8 max-w-md w-full text-center"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-3xl" />

            <div className="relative z-10">
              {/* Icône level up */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-amber-500/50"
              >
                <Star className="w-12 h-12 text-white" fill="currentColor" />
              </motion.div>

              {/* Texte */}
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-black text-white mb-2"
              >
                LEVEL UP!
              </motion.h2>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-6xl font-black bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 bg-clip-text text-transparent mb-4"
              >
                Niveau {newLevel}
              </motion.p>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-white/70 mb-6"
              >
                Félicitations ! Tu progresses dans ton aventure !
              </motion.p>

              {/* Récompenses débloquées */}
              {hasRewards && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white/5 rounded-2xl p-4 mb-6"
                >
                  <p className="text-sm text-white/60 mb-3 flex items-center justify-center gap-2">
                    <Gift className="w-4 h-4 text-amber-400" />
                    Récompenses débloquées
                  </p>

                  <div className="space-y-2">
                    {unlockedPets?.map((pet, i) => (
                      <motion.div
                        key={i}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.7 + i * 0.1 }}
                        className="flex items-center gap-3 bg-white/5 rounded-xl p-3"
                      >
                        <span className="text-2xl">{pet.icon}</span>
                        <span className="text-white font-bold">{pet.name}</span>
                        <Sparkles className="w-4 h-4 text-amber-400 ml-auto" />
                      </motion.div>
                    ))}

                    {unlockedWorlds?.map((world, i) => (
                      <motion.div
                        key={`w-${i}`}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.8 + i * 0.1 }}
                        className="flex items-center gap-3 bg-white/5 rounded-xl p-3"
                      >
                        <span className="text-2xl">{world.icon}</span>
                        <span className="text-white font-bold">{world.name}</span>
                        <Sparkles className="w-4 h-4 text-purple-400 ml-auto" />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Bouton */}
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                onClick={onClose}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                Continuer l'aventure !
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
