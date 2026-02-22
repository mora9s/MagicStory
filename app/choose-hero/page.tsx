'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { getAllChildProfiles, createChildProfile } from '@/lib/actions';
import { triggerVibration } from '@/lib/haptics';
import { 
  Sparkles, ArrowLeft, Plus, User, Crown, RefreshCw,
  Castle, Trees, Waves, Rocket, Mountain, 
  Ghost, Flower2, Cloud, Flame, Shuffle
} from 'lucide-react';
import Link from 'next/link';

// Mondes disponibles
const worlds = [
  { id: 'forest', name: 'Forêt Enchantée', icon: Trees, emoji: '🌲', color: 'from-emerald-400 to-green-600', desc: 'Arbres magiques' },
  { id: 'castle', name: 'Château Royal', icon: Castle, emoji: '🏰', color: 'from-purple-400 to-indigo-600', desc: 'Chevaliers & princesses' },
  { id: 'ocean', name: 'Fonds Marins', icon: Waves, emoji: '🌊', color: 'from-cyan-400 to-blue-600', desc: 'Sirènes & trésors' },
  { id: 'space', name: 'Galaxie Lointaine', icon: Rocket, emoji: '🚀', color: 'from-violet-400 to-purple-600', desc: 'Planètes & aliens' },
  { id: 'mountain', name: 'Montagnes Mystiques', icon: Mountain, emoji: '⛰️', color: 'from-slate-400 to-gray-600', desc: 'Dragons' },
  { id: 'garden', name: 'Jardin Secret', icon: Flower2, emoji: '🌸', color: 'from-pink-400 to-rose-600', desc: 'Fées & papillons' },
  { id: 'cloud', name: 'Royaume des Nuages', icon: Cloud, emoji: '☁️', color: 'from-sky-300 to-blue-400', desc: 'Anges' },
  { id: 'volcano', name: 'Île Volcanique', icon: Flame, emoji: '🌋', color: 'from-orange-400 to-red-600', desc: 'Explorateurs' },
  { id: 'ghost', name: 'Manoir Hanté', icon: Ghost, emoji: '👻', color: 'from-indigo-400 to-purple-500', desc: 'Fantômes amicaux' },
];

type Profile = {
  id: string;
  first_name: string;
  age: number;
  avatar_url: string | null;
};

type Step = 'select-hero' | 'create-hero' | 'select-world';

function ChooseHeroContent() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('select-hero');
  
  // Héros existants
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  
  // Sélections
  const [selectedHero, setSelectedHero] = useState<Profile | null>(null);
  const [selectedWorld, setSelectedWorld] = useState<string>('');
  
  // Création nouveau héros
  const [newHeroName, setNewHeroName] = useState('');
  const [newHeroAge, setNewHeroAge] = useState(6);
  const [creating, setCreating] = useState(false);

  // Charger les profils
  useEffect(() => {
    const loadProfiles = async () => {
      const result = await getAllChildProfiles();
      if (result.data) {
        setProfiles(result.data);
      }
      setLoadingProfiles(false);
    };
    loadProfiles();
  }, []);

  const handleSelectHero = (hero: Profile) => {
    triggerVibration();
    setSelectedHero(hero);
    setStep('select-world');
  };

  const handleCreateNewHero = () => {
    triggerVibration();
    setStep('create-hero');
  };

  const handleSaveNewHero = async () => {
    if (!newHeroName.trim()) return;
    
    setCreating(true);
    const result = await createChildProfile(newHeroName.trim(), newHeroAge);
    setCreating(false);
    
    if (result.data) {
      setSelectedHero(result.data);
      setStep('select-world');
      // Ajouter à la liste
      setProfiles(prev => [result.data!, ...prev]);
    }
  };

  const handleSelectWorld = (worldId: string) => {
    triggerVibration();
    setSelectedWorld(worldId);
  };

  const handleRandomWorld = () => {
    triggerVibration();
    const randomIndex = Math.floor(Math.random() * worlds.length);
    setSelectedWorld(worlds[randomIndex].id);
  };

  const handleContinue = () => {
    if (!selectedHero || !selectedWorld) return;
    
    const world = worlds.find(w => w.id === selectedWorld);
    router.push(`/story-settings?hero1Name=${encodeURIComponent(selectedHero.first_name)}&hero1Age=${selectedHero.age}&world=${encodeURIComponent(world?.name || 'Forêt')}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-indigo-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-indigo-950/90 backdrop-blur-md border-b border-indigo-800/50">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="p-2 -ml-2 text-indigo-300 hover:text-white">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="font-black text-white text-lg">Nouvelle Histoire</h1>
            <div className="w-10" />
          </div>
          
          {/* Barre de progression */}
          <div className="flex gap-2 mt-4">
            {['select-hero', 'select-world'].map((s, i) => (
              <div 
                key={s}
                className={`flex-1 h-2 rounded-full transition-all ${
                  step === s ? 'bg-amber-400' : 
                  (step === 'select-world' && s === 'select-hero') ? 'bg-amber-400/50' : 'bg-indigo-800'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 pb-32">
        {/* ÉTAPE 1 : SÉLECTIONNER UN HÉROS */}
        {step === 'select-hero' && (
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl mx-auto mb-4 flex items-center justify-center border-4 border-black shadow-lg">
                <Crown className="w-10 h-10 text-black" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">
                Qui est ton héros ?
              </h2>
              <p className="text-indigo-300 text-sm">
                Choisis un héros existant ou crée-en un nouveau
              </p>
            </div>

            {loadingProfiles ? (
              <div className="flex justify-center py-12">
                <Sparkles className="w-10 h-10 text-amber-400 animate-spin" />
              </div>
            ) : profiles.length === 0 ? (
              // Aucun héros - proposer création directe
              <div className="text-center py-8">
                <p className="text-indigo-300 mb-6">Tu n'as pas encore de héros</p>
                <button
                  onClick={handleCreateNewHero}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black py-4 rounded-2xl border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-6 h-6" />
                  Créer mon premier héros
                </button>
              </div>
            ) : (
              // Liste des héros existants
              <>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {profiles.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => handleSelectHero(profile)}
                      className="p-4 bg-white/5 border-2 border-indigo-800 rounded-2xl hover:bg-white/10 hover:border-amber-500/50 transition-all text-center"
                    >
                      <div className="w-16 h-16 mx-auto mb-3 bg-indigo-900 rounded-xl flex items-center justify-center text-3xl overflow-hidden">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          '👤'
                        )}
                      </div>
                      <p className="font-black text-white text-sm truncate">{profile.first_name}</p>
                      <p className="text-indigo-400 text-xs">{profile.age} ans</p>
                    </button>
                  ))}
                  
                  {/* Bouton créer nouveau */}
                  <button
                    onClick={handleCreateNewHero}
                    className="p-4 bg-indigo-900/30 border-2 border-dashed border-indigo-700 rounded-2xl hover:border-amber-500 hover:bg-indigo-900/50 transition-all text-center"
                  >
                    <div className="w-16 h-16 mx-auto mb-3 rounded-xl flex items-center justify-center">
                      <Plus className="w-8 h-8 text-amber-400" />
                    </div>
                    <p className="font-bold text-amber-400 text-sm">Nouveau</p>
                    <p className="text-indigo-500 text-xs">Créer</p>
                  </button>
                </div>
                
                <Link
                  href="/parent"
                  onClick={() => triggerVibration()}
                  className="block text-center text-indigo-400 hover:text-amber-400 text-sm py-2"
                >
                  Gérer mes héros →
                </Link>
              </>
            )}
          </div>
        )}

        {/* ÉTAPE 1b : CRÉER UN NOUVEAU HÉROS */}
        {step === 'create-hero' && (
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-white mb-2">
                Créer un héros
              </h2>
              <p className="text-indigo-300 text-sm">
                Ajoute un nouveau personnage
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <label className="block text-indigo-300 text-sm font-bold mb-2">Prénom</label>
                <input
                  type="text"
                  value={newHeroName}
                  onChange={(e) => setNewHeroName(e.target.value)}
                  placeholder="Ex: Emma"
                  className="w-full bg-indigo-900/50 border-2 border-indigo-700 rounded-xl px-4 py-3 text-white font-bold text-lg placeholder-indigo-500 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-indigo-300 text-sm font-bold">Âge</label>
                  <span className="text-3xl font-black text-amber-400">{newHeroAge} ans</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  value={newHeroAge}
                  onChange={(e) => setNewHeroAge(parseInt(e.target.value))}
                  className="w-full h-3 bg-indigo-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <div className="flex justify-between text-xs text-indigo-500 mt-2">
                  <span>3 ans</span>
                  <span>12 ans</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep('select-hero')}
                  className="flex-1 bg-indigo-800 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl border-4 border-indigo-900 transition-all"
                >
                  ← Retour
                </button>
                <button
                  onClick={handleSaveNewHero}
                  disabled={creating || !newHeroName.trim()}
                  className="flex-[2] bg-gradient-to-r from-amber-500 to-orange-500 disabled:from-gray-600 disabled:to-gray-700 text-black font-black py-4 rounded-2xl border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                >
                  {creating ? (
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    'Continuer →'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 : CHOISIR LE MONDE */}
        {step === 'select-world' && selectedHero && (
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-white mb-2">
                Où se déroule l'histoire ?
              </h2>
              <p className="text-indigo-300 text-sm">
                Choisis un univers magique pour {selectedHero.first_name}
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
                    onClick={() => handleSelectWorld(world.id)}
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
                onClick={() => setStep('select-hero')}
                className="flex-1 bg-indigo-800 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl border-4 border-indigo-900 transition-all"
              >
                ← Retour
              </button>
              <button
                onClick={handleContinue}
                disabled={!selectedWorld}
                className="flex-[2] bg-gradient-to-r from-amber-500 to-orange-500 disabled:from-gray-600 disabled:to-gray-700 text-black font-black py-4 rounded-2xl border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
              >
                Continuer →
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ChooseHeroPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-indigo-950 flex items-center justify-center">
        <Sparkles className="w-10 h-10 text-amber-400 animate-spin" />
      </div>
    }>
      <ChooseHeroContent />
    </Suspense>
  );
}
