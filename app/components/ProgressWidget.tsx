'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Zap } from 'lucide-react';

interface ProgressWidgetProps {
  currentLevel: number;
  currentXp: number;
  nextLevelXp: number;
  equippedPetEmoji?: string;
}

export function ProgressWidget({ 
  currentLevel, 
  currentXp, 
  nextLevelXp,
  equippedPetEmoji 
}: ProgressWidgetProps) {
  const progressPercent = Math.min((currentXp / nextLevelXp) * 100, 100);

  return (
    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
      {/* Niveau */}
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 text-amber-400" fill="currentColor" />
        <span className="font-bold text-white">{currentLevel}</span>
      </div>

      {/* Barre de progression */}
      <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* XP */}
      <div className="flex items-center gap-1 text-xs text-white/60">
        <Zap className="w-3 h-3" />
        <span>{currentXp}/{nextLevelXp}</span>
      </div>

      {/* Animal équipé */}
      {equippedPetEmoji && (
        <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm border border-white/20">
          {equippedPetEmoji}
        </div>
      )}
    </div>
  );
}
