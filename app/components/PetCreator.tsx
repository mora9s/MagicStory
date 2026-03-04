'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Sparkles, Crown } from 'lucide-react';
import { createPetCustomization } from '@/lib/actions';

interface PetCreatorProps {
  petId: string;
  petName: string;
  petEmoji: string;
  onClose: () => void;
  onCreated: () => void;
}

const COLORS = [
  { name: 'Orange', value: '#FFA500' },
  { name: 'Rose', value: '#FF69B4' },
  { name: 'Bleu', value: '#87CEEB' },
  { name: 'Vert', value: '#98FB98' },
  { name: 'Violet', value: '#9370DB' },
  { name: 'Jaune', value: '#FFD700' },
  { name: 'Rouge', value: '#FF6B6B' },
  { name: 'Turquoise', value: '#40E0D0' },
];

const ACCESSORIES = [
  { name: 'Aucun', value: null, emoji: '' },
  { name: 'Collier', value: 'collar', emoji: '📿' },
  { name: 'Nœud', value: 'bow', emoji: '🎀' },
  { name: 'Chapeau', value: 'hat', emoji: '🎩' },
  { name: 'Cape', value: 'cape', emoji: '🦸' },
];

export function PetCreator({ petId, petName, petEmoji, onClose, onCreated }: PetCreatorProps) {
  const [customName, setCustomName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [selectedAccessory, setSelectedAccessory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const result = await createPetCustomization(petId, {
      custom_name: customName || petName,
      color: selectedColor,
      accessory: selectedAccessory || undefined,
    });
    setIsSubmitting(false);

    if (!result.error) {
      onCreated();
      onClose();
    }
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
          className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              Personnaliser {petName}
            </h2>
            <button onClick={onClose} className="text-white/50 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Preview */}
          <div className="flex justify-center mb-8">
            <div 
              className="w-32 h-32 rounded-2xl flex items-center justify-center text-6xl relative"
              style={{ backgroundColor: selectedColor + '30', border: `3px solid ${selectedColor}` }}
            >
              {petEmoji}
              {selectedAccessory && (
                <span className="absolute -top-2 -right-2 text-2xl bg-slate-800 rounded-full p-1">
                  {ACCESSORIES.find(a => a.value === selectedAccessory)?.emoji}
                </span>
              )}
            </div>
          </div>

          {/* Nom */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/70 mb-2">
              Donne-lui un nom
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={petName}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Couleurs */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Choisis une couleur
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-10 h-10 rounded-xl border-2 transition-all ${
                    selectedColor === color.value 
                      ? 'border-white scale-110' 
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Accessoires */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Ajoute un accessoire
            </label>
            <div className="flex flex-wrap gap-2">
              {ACCESSORIES.map((acc) => (
                <button
                  key={acc.name}
                  onClick={() => setSelectedAccessory(acc.value)}
                  className={`px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${
                    selectedAccessory === acc.value
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {acc.emoji && <span>{acc.emoji}</span>}
                  <span className="text-sm">{acc.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bouton */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? 'Création...' : 'Créer mon compagnon'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
