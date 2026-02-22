'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createChildProfile } from '@/lib/actions';
import { triggerVibration } from '@/lib/haptics';
import { 
  Sparkles, ArrowLeft, ArrowRight, RefreshCw, 
  Castle, Trees, Waves, Rocket, Mountain, 
  Crown, Ghost, Flower2, Cloud, Flame,
  BookOpen, Wand2, Shuffle
} from 'lucide-react';
import Link from 'next/link';

// Mondes disponibles avec icônes et couleurs
const worlds = [
  { id: 'forest', name: 'Forêt Enchantée', icon: Trees, emoji: '🌲', color: 'from-emerald-400 to-green-600', desc: 'Arbres magiques & créatures' },
  { id: 'castle', name: 'Château Royal', icon: Castle, emoji: '🏰', color: 'from-purple-400 to-indigo-600', desc: 'Chevaliers & princesses' },
  { id: 'ocean', name: 'Fonds Marins', icon: Waves, emoji: '🌊', color: 'from-cyan-400 to-blue-600', desc: 'Sirènes & trésors' },
  { id: 'space', name: 'Galaxie Lointaine', icon: Rocket, emoji: '🚀', color: 'from-violet-400 to-purple-600', desc: 'Planètes & aliens' },
  { id: 'mountain', name: 'Montagnes Mystiques', icon: Mountain, emoji: '⛰️', color: 'from-slate-400 to-gray-600', desc: 'Dragons & aventures' },
  { id: 'garden', name: 'Jardin Secret', icon: Flower2, emoji: '🌸', color: 'from-pink-400 to-rose-600', desc: 'Fées & papillons' },
  { id: 'cloud', name: 'Royaume des Nuages', icon: Cloud, emoji: '☁️', color: 'from-sky-300 to-blue-400', desc: 'Anges & célestes' },
  { id: 'volcano', name: 'Île Volcanique', icon: Flame, emoji: '🌋', color: 'from-orange-400 to-red-600', desc: 'Explorateurs & mystères' },
  { id: 'ghost', name: 'Manoir Hanté', icon: Ghost, emoji: '👻', color: 'from-indigo-400 to-purple-500', desc: 'Fantômes amicaux' },
];

// Thèmes disponibles
const themes = [
  { id: 'adventure', name: 'Aventure', emoji: '⚔️', color: 'bg-orange-500' },
  { id: 'friendship', name: 'Amitié', emoji: '🤝', color: 'bg-pink-500' },
  { id: 'discovery', name: 'Découverte', emoji: '🔍', color: 'bg-blue-500' },
  { id: 'courage', name: 'Courage', emoji: '🦁', color: 'bg-red-500' },
  { id: 'magic', name: 'Magie', emoji: '✨', color: 'bg-purple-500' },
  { id: 'mystery', name: 'Mystère', emoji: '🎭', color: 'bg-indigo-500' },
];

type Step = 'hero' | 'world' | 'theme' | 'confirm';

export default function ChooseHeroPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('hero');
  const [loading, setLoading] = useState(false);
  
  // Données du formulaire
  const [heroName, setHeroName] = useState('');
  const [heroAge, setHeroAge] = useState(6);
  const [selectedWorld, setSelectedWorld] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<string>('adventure');

  const handleRandomWorld = () => {
    triggerVibration();
    const randomIndex = Math.floor(Math.random() * worlds.length);
    setSelectedWorld(worlds[randomIndex].id);
  };

  const handleRandomTheme = () => {
    triggerVibration();
    const randomIndex = Math.floor(Math.random() * themes.length);
    setSelectedTheme(themes[randomIndex].id);
  };

  const handleCreate = async () => {
    if (!heroName || !selectedWorld) return;
    
    triggerVibration();
    setLoading(true);
    
    // Créer le profil si nouveau
    await createChildProfile(heroName, heroAge);
    
    // Rediriger vers les paramètres
    const worldName = worlds.find(w => w.id === selectedWorld)?.name || 'Forêt Enchantée';
    const params = new URLSearchParams({
      hero1Name: heroName,
      hero1Age: heroAge.toString(),
      world: worldName,
      theme: selectedTheme,
    });
    
    router.push(`/story-settings?${params.toString()}`);
  };

  // Animation des étapes
  const stepAnimation = (current: Step) => {
    const steps: Step[] = ['hero', 'world', 'theme', 'confirm'];
    const index = steps.indexOf(current);
    return index <= steps.indexOf(step) ? 'opacity-100' : 'opacity-40';
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-indigo-950">
      {/* Header avec progression */}
      <header className="sticky top-0 z-50 bg-indigo-950/90 backdrop-blur-md border-b border-indigo-800/50">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="p-2 -ml-2 text-indigo-300 hover:text-white">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="font-black text-white text-lg">Nouvelle Histoire</h1>
            <div className="w-10" />
          </div>
          
          {/* Barre de progression */}
          <div className="flex gap-2">
            {(['hero', 'world', 'theme'] as Step[]).map((s, i) => (
              <div 
                key={s}
                className={`flex-1 h-2 rounded-full transition-all ${
                  step === s ? 'bg-amber-400' : 
                  ['hero', 'world', 'theme'].indexOf(step) > i ? 'bg-amber-400/50' : 'bg-indigo-800'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 pb-32">
        {/* ÉTAPE 1 : LE HÉROS */}
        {step === 'hero' && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl mx-auto mb-4 flex items-center justify-center border-4 border-black shadow-lg">
                <Crown className="w-10 h-10 text-black" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">
                Qui est ton héros ?
              </h2>
              <p className="text-indigo-300 text-sm">
                Ajoute un prénom et un âge
              </p>
            </div>

            <div className="space-y-6">
              {/* Prénom */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <label className="block text-indigo-300 text-sm font-bold mb-2">
                  Prénom du héros
                </label>
                <input
                  type="text"
                  value={heroName}
                  onChange={(e) => setHeroName(e.target.value)}
                  placeholder="Ex: Emma, Lucas..."
                  className="w-full bg-indigo-900/50 border-2 border-indigo-700 rounded-xl px-4 py-3 text-white font-bold text-lg placeholder-indigo-500 focus:border-amber-400 focus:outline-none transition-colors"
                />
              </div>

              {/* Âge */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-indigo-300 text-sm font-bold">
                    Âge du héros
                  </label>
                  <span className="text-3xl font-black text-amber-400">
                    {heroAge} ans
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  value={heroAge}
                  onChange={(e) => setHeroAge(parseInt(e.target.value))}
                  className="w-full h-3 bg-indigo-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <div className="flex justify-between text-xs text-indigo-500 mt-2">
                  <span>3 ans</span>
                  <span>12 ans</span>
                </div>
              </div>

              {/* Bouton continuer */}
              <button
                onClick={() => { triggerVibration(); setStep('world'); }}
                disabled={!heroName.trim()}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-black font-black py-4 rounded-2xl border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
              >
                <span>Continuer</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 : LE MONDE */}
        {step === 'world' && (
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-white mb-2">
                Où se déroule l'histoire ?
              </h2>
              <p className="text-indigo-300 text-sm">
                Choisis un univers magique
              </p>
            </div>

            {/* Bouton aléatoire */}
            <button
              onClick={handleRandomWorld}
              className="w-full mb-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold py-3 rounded-xl border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <Shuffle className="w-5 h-5" />
              <span>🎲 Monde aléatoire</span>
            </button>

            {/* Grille des mondes */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {worlds.map((world) => {
                const Icon = world.icon;
                const isSelected = selectedWorld === world.id;
                
                return (
                  <button
                    key={world.id}
                    onClick={() => { triggerVibration(); setSelectedWorld(world.id); }}
                    className={`relative p-4 rounded-2xl border-4 transition-all text-left ${
                      isSelected 
                        ? 'bg-gradient-to-br ' + world.color + ' border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] scale-105' 
                        : 'bg-white/5 border-indigo-800 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-4xl mb-2">{world.emoji}</div>
                    <h3 className={`font-black text-sm ${isSelected ? 'text-white' : 'text-white'}`}>
                      {world.name}
                    </h3>
                    <p className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-indigo-400'}`}>
                      {world.desc}
                    </p>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep('hero')}
                className="flex-1 bg-indigo-800 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl border-4 border-indigo-900 transition-all"
              >
                ← Retour
              </button>
              <button
                onClick={() => { triggerVibration(); setStep('theme'); }}
                disabled={!selectedWorld}
                className="flex-[2] bg-gradient-to-r from-amber-500 to-orange-500 disabled:from-gray-600 disabled:to-gray-700 text-black font-black py-4 rounded-2xl border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 : LE THÈME */}
        {step === 'theme' && (
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-white mb-2">
                Quel est le thème ?
              </h2>
              <p className="text-indigo-300 text-sm">
                Choisis l'ambiance de l'histoire
              </p>
            </div>

            {/* Bouton aléatoire */}
            <button
              onClick={handleRandomTheme}
              className="w-full mb-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold py-3 rounded-xl border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <Shuffle className="w-5 h-5" />
              <span>🎲 Thème aléatoire</span>
            </button>

            {/* Liste des thèmes */}
            <div className="space-y-3 mb-6">
              {themes.map((theme) => {
                const isSelected = selectedTheme === theme.id;
                
                return (
                  <button
                    key={theme.id}
                    onClick={() => { triggerVibration(); setSelectedTheme(theme.id); }}
                    className={`w-full p-4 rounded-2xl border-4 transition-all flex items-center gap-4 ${
                      isSelected 
                        ? theme.color + ' border-black shadow-[6px_6px_0px_rgba(0,0,0,1)]' 
                        : 'bg-white/5 border-indigo-800 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-3xl">{theme.emoji}</span>
                    <span className={`font-black text-lg ${isSelected ? 'text-white' : 'text-white'}`}>
                      {theme.name}
                    </span>
                    {isSelected && (
                      <Sparkles className="w-5 h-5 text-white ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Résumé */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
              <h3 className="text-indigo-300 text-sm font-bold mb-3">Résumé</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">👤</span>
                  <span className="text-white font-bold">{heroName}</span>
                  <span className="text-indigo-400">({heroAge} ans)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">🌍</span>
                  <span className="text-white">{worlds.find(w => w.id === selectedWorld)?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">📖</span>
                  <span className="text-white">{themes.find(t => t.id === selectedTheme)?.name}</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep('world')}
                className="flex-1 bg-indigo-800 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl border-4 border-indigo-900 transition-all"
              >
                ← Retour
              </button>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="flex-[2] bg-gradient-to-r from-amber-500 to-orange-500 disabled:from-gray-600 disabled:to-gray-700 text-black font-black py-4 rounded-2xl border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    <span>Créer l'histoire ✨</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
