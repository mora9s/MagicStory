'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { getAllChildProfiles, createChildProfile } from '@/lib/actions';
import { triggerVibration } from '@/lib/haptics';
import { 
  Sparkles, ArrowLeft, Plus, Crown, RefreshCw,
  Castle, Trees, Waves, Rocket, Mountain, 
  Ghost, Flower2, Cloud, Flame, Shuffle, Star, Heart, Zap
} from 'lucide-react';
import Link from 'next/link';

// Mondes disponibles avec des couleurs plus vibrantes
const worlds = [
  { id: 'forest', name: 'Forêt Enchantée', icon: Trees, emoji: '🌲', color: 'from-emerald-400 to-green-600', bgColor: 'bg-emerald-500', desc: 'Arbres magiques & créatures' },
  { id: 'castle', name: 'Château Royal', icon: Castle, emoji: '🏰', color: 'from-purple-400 to-indigo-600', bgColor: 'bg-purple-500', desc: 'Chevaliers & princesses' },
  { id: 'ocean', name: 'Fonds Marins', icon: Waves, emoji: '🌊', color: 'from-cyan-400 to-blue-600', bgColor: 'bg-cyan-500', desc: 'Sirènes & trésors' },
  { id: 'space', name: 'Galaxie Lointaine', icon: Rocket, emoji: '🚀', color: 'from-violet-400 to-purple-600', bgColor: 'bg-violet-500', desc: 'Planètes & aliens' },
  { id: 'mountain', name: 'Montagnes Mystiques', icon: Mountain, emoji: '⛰️', color: 'from-slate-400 to-gray-600', bgColor: 'bg-slate-500', desc: 'Dragons & aventures' },
  { id: 'garden', name: 'Jardin Secret', icon: Flower2, emoji: '🌸', color: 'from-pink-400 to-rose-600', bgColor: 'bg-pink-500', desc: 'Fées & papillons' },
  { id: 'cloud', name: 'Royaume des Nuages', icon: Cloud, emoji: '☁️', color: 'from-sky-300 to-blue-400', bgColor: 'bg-sky-400', desc: 'Anges & rêves' },
  { id: 'volcano', name: 'Île Volcanique', icon: Flame, emoji: '🌋', color: 'from-orange-400 to-red-600', bgColor: 'bg-orange-500', desc: 'Explorateurs & trésors' },
  { id: 'ghost', name: 'Manoir Hanté', icon: Ghost, emoji: '👻', color: 'from-indigo-400 to-purple-500', bgColor: 'bg-indigo-500', desc: 'Fantômes amicaux' },
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
  const [selectedHeroType, setSelectedHeroType] = useState<'adventurer' | 'princess' | 'knight' | 'wizard'>('adventurer');

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

  // Types de héros pour le design
  const heroTypes = [
    { id: 'adventurer', emoji: '🧭', label: 'Aventurier', color: 'from-amber-400 to-orange-500' },
    { id: 'princess', emoji: '👑', label: 'Princesse', color: 'from-pink-400 to-rose-500' },
    { id: 'knight', emoji: '⚔️', label: 'Chevalier', color: 'from-blue-400 to-indigo-500' },
    { id: 'wizard', emoji: '🔮', label: 'Magicien', color: 'from-purple-400 to-violet-500' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 via-purple-950 to-slate-900">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-amber-400 rounded-full animate-pulse opacity-50" />
        <div className="absolute top-40 right-20 w-1 h-1 bg-purple-400 rounded-full animate-ping opacity-30" />
        <div className="absolute bottom-40 left-1/4 w-2 h-2 bg-pink-400 rounded-full animate-pulse opacity-40" />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-ping opacity-50" />
        <div className="absolute bottom-20 right-10 w-2 h-2 bg-amber-300 rounded-full animate-pulse opacity-40" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="p-2 -ml-2 text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h1 className="font-black text-white text-lg">Nouvelle Aventure</h1>
            </div>
            <div className="w-10" />
          </div>
          
          {/* Progress bar améliorée */}
          <div className="flex gap-2 mt-4">
            <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  step === 'select-hero' ? 'w-1/2 bg-gradient-to-r from-amber-400 to-orange-500' :
                  step === 'create-hero' ? 'w-1/2 bg-gradient-to-r from-amber-400 to-orange-500' :
                  'w-full bg-gradient-to-r from-amber-400 to-orange-500'
                }`}
              />
            </div>
            <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  step === 'select-world' ? 'w-full bg-gradient-to-r from-purple-400 to-pink-500' : 'w-0'
                }`}
              />
            </div>
          </div>
          
          {/* Step indicator */}
          <div className="flex justify-between mt-2 text-xs font-bold">
            <span className={step === 'select-hero' || step === 'create-hero' ? 'text-amber-400' : 'text-white/50'}>
              {step === 'create-hero' ? '✨ Création' : '1. Le Héros'}
            </span>
            <span className={step === 'select-world' ? 'text-purple-400' : 'text-white/50'}>
              2. L'Univers
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8 pb-32">
        {/* ÉTAPE 1 : SÉLECTIONNER UN HÉROS */}
        {step === 'select-hero' && (
          <div className="animate-fade-in">
            {/* Hero title card */}
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl blur-xl opacity-50 animate-pulse" />
                <div className="relative w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl mx-auto mb-4 flex items-center justify-center border-4 border-white/20 shadow-2xl">
                  <Crown className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-black text-white mb-3">
                Qui est ton héros ?
              </h2>
              <p className="text-white/60 text-base">
                Choisis un héros pour ton histoire
              </p>
            </div>

            {loadingProfiles ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-400 rounded-full blur-lg opacity-50 animate-pulse" />
                  <Sparkles className="relative w-12 h-12 text-amber-400 animate-spin" />
                </div>
                <p className="mt-4 text-white/50 text-sm">Chargement des héros...</p>
              </div>
            ) : profiles.length === 0 ? (
              // Aucun héros - proposer création directe
              <div className="text-center py-8">
                <div className="mb-8">
                  <div className="text-6xl mb-4">🦸</div>
                  <p className="text-white/60 mb-2">Tu n'as pas encore de héros</p>
                  <p className="text-white/40 text-sm">Crée ton premier personnage !</p>
                </div>
                <button
                  onClick={handleCreateNewHero}
                  className="group relative w-full overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 transition-transform group-hover:scale-105" />
                  <div className="relative bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black py-5 rounded-2xl border-2 border-white/20 shadow-xl flex items-center justify-center gap-3">
                    <Plus className="w-6 h-6" />
                    <span>Créer mon premier héros</span>
                    <Sparkles className="w-5 h-5" />
                  </div>
                </button>
              </div>
            ) : (
              // Liste des héros existants - design amélioré
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {profiles.map((profile, index) => (
                    <button
                      key={profile.id}
                      onClick={() => handleSelectHero(profile)}
                      className="group relative p-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl hover:bg-white/10 hover:border-amber-400/50 hover:scale-[1.02] transition-all duration-300 text-center overflow-hidden"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/0 to-orange-500/0 group-hover:from-amber-400/10 group-hover:to-orange-500/10 transition-all duration-300" />
                      
                      <div className="relative w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center text-4xl overflow-hidden border-2 border-white/10 group-hover:border-amber-400/30 transition-colors shadow-lg">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="group-hover:scale-110 transition-transform">👤</span>
                        )}
                      </div>
                      <p className="relative font-black text-white text-lg mb-1 group-hover:text-amber-300 transition-colors">{profile.first_name}</p>
                      <div className="relative flex items-center justify-center gap-1 text-white/50 text-sm">
                        <Star className="w-3 h-3 text-amber-400" />
                        <span>{profile.age} ans</span>
                      </div>
                    </button>
                  ))}
                  
                  {/* Bouton créer nouveau - design amélioré */}
                  <button
                    onClick={handleCreateNewHero}
                    className="group relative p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-dashed border-amber-400/30 rounded-3xl hover:border-amber-400 hover:bg-amber-500/20 transition-all text-center"
                  >
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-amber-400/10 group-hover:bg-amber-400/20 transition-colors">
                      <Plus className="w-10 h-10 text-amber-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="font-bold text-amber-400 text-lg mb-1">Nouveau</p>
                    <p className="text-amber-400/60 text-sm">Créer un héros</p>
                  </button>
                </div>
                
                <Link
                  href="/parent"
                  onClick={() => triggerVibration()}
                  className="flex items-center justify-center gap-2 text-white/40 hover:text-white/70 text-sm py-4 transition-colors"
                >
                  <span>Gérer mes héros</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              </>
            )}
          </div>
        )}

        {/* ÉTAPE 1b : CRÉER UN NOUVEAU HÉROS */}
        {step === 'create-hero' && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl mx-auto mb-4 flex items-center justify-center border-4 border-white/20 shadow-xl">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">
                Créer un héros
              </h2>
              <p className="text-white/60 text-sm">
                Donne vie à un nouveau personnage
              </p>
            </div>

            {/* Type de héros */}
            <div className="mb-6">
              <label className="block text-white/60 text-sm font-bold mb-3 text-center">Quel type de héros ?</label>
              <div className="grid grid-cols-4 gap-2">
                {heroTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedHeroType(type.id as any)}
                    className={`p-3 rounded-2xl border-2 transition-all ${
                      selectedHeroType === type.id
                        ? `bg-gradient-to-br ${type.color} border-white/40 shadow-lg scale-105`
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.emoji}</div>
                    <div className={`text-xs font-bold ${selectedHeroType === type.id ? 'text-white' : 'text-white/60'}`}>
                      {type.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                <label className="block text-amber-400 text-sm font-bold mb-3">Prénom du héros</label>
                <input
                  type="text"
                  value={newHeroName}
                  onChange={(e) => setNewHeroName(e.target.value)}
                  placeholder="Ex: Emma, Lucas, Zoé..."
                  className="w-full bg-slate-950/50 border-2 border-white/10 rounded-xl px-4 py-4 text-white font-bold text-lg placeholder-white/30 focus:border-amber-400 focus:outline-none transition-colors"
                />
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-amber-400 text-sm font-bold">Âge</label>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-400" />
                    <span className="text-3xl font-black text-white">{newHeroAge}</span>
                    <span className="text-white/50">ans</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  value={newHeroAge}
                  onChange={(e) => setNewHeroAge(parseInt(e.target.value))}
                  className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <div className="flex justify-between text-xs text-white/40 mt-3">
                  <span>3 ans</span>
                  <span>7 ans</span>
                  <span>12 ans</span>
                </div>
              </div>

              {/* Résumé */}
              {newHeroName && (
                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-400/20 rounded-2xl p-4 text-center">
                  <p className="text-white/60 text-sm mb-1">Ton nouveau héros :</p>
                  <p className="text-xl font-black text-white">
                    {heroTypes.find(t => t.id === selectedHeroType)?.emoji} {newHeroName}, {newHeroAge} ans
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep('select-hero')}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl border-2 border-white/10 transition-all"
                >
                  ← Retour
                </button>
                <button
                  onClick={handleSaveNewHero}
                  disabled={creating || !newHeroName.trim()}
                  className="flex-[2] relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500" />
                  <div className="relative bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black py-4 rounded-2xl border-2 border-white/20 shadow-xl flex items-center justify-center gap-2">
                    {creating ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>Créer et continuer</span>
                        <Zap className="w-5 h-5" />
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 : CHOISIR LE MONDE */}
        {step === 'select-world' && selectedHero && (
          <div className="animate-fade-in">
            {/* Hero summary card */}
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-400/20 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-3xl border-2 border-white/20">
                  {selectedHero.avatar_url ? (
                    <img src={selectedHero.avatar_url} alt="" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    '👤'
                  )}
                </div>
                <div>
                  <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">Héros choisi</p>
                  <p className="text-xl font-black text-white">{selectedHero.first_name}</p>
                  <p className="text-white/60 text-sm">{selectedHero.age} ans</p>
                </div>
                <button
                  onClick={() => setStep('select-hero')}
                  className="ml-auto text-white/40 hover:text-white text-sm font-bold px-3 py-1 bg-white/5 rounded-lg"
                >
                  Changer
                </button>
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-white mb-2">
                Choisis l'univers
              </h2>
              <p className="text-white/60 text-sm">
                Où se déroule l'aventure de {selectedHero.first_name} ?
              </p>
            </div>

            {/* Bouton aléatoire */}
            <button
              onClick={handleRandomWorld}
              className="w-full mb-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-white font-bold py-4 rounded-2xl border-2 border-purple-400/30 transition-all flex items-center justify-center gap-2"
            >
              <Shuffle className="w-5 h-5 text-purple-400" />
              <span>Surprends-moi !</span>
            </button>

            {/* Grille des mondes - design amélioré */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {worlds.map((world, index) => {
                const Icon = world.icon;
                const isSelected = selectedWorld === world.id;
                return (
                  <button
                    key={world.id}
                    onClick={() => handleSelectWorld(world.id)}
                    className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                      isSelected
                        ? 'bg-white border-white shadow-2xl scale-[1.02]'
                        : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Gradient background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${world.color} opacity-0 group-hover:opacity-10 transition-opacity ${isSelected ? 'opacity-20' : ''}`} />
                    
                    <div className="relative">
                      <div className={`w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center text-3xl transition-all ${
                        isSelected 
                          ? 'bg-gradient-to-br ' + world.color + ' shadow-lg scale-110' 
                          : 'bg-white/10 group-hover:bg-white/20'
                      }`}>
                        {isSelected ? <Icon className="w-7 h-7 text-white" /> : <span className="group-hover:scale-110 transition-transform">{world.emoji}</span>}
                      </div>
                      <p className={`font-bold text-sm mb-1 ${isSelected ? 'text-slate-950' : 'text-white group-hover:text-white'}`}>
                        {world.name}
                      </p>
                      <p className={`text-xs ${isSelected ? 'text-slate-600' : 'text-white/50'}`}>
                        {world.desc}
                      </p>
                    </div>
                    
                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-slate-950 rounded-full flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bouton continuer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
              <div className="max-w-lg mx-auto">
                <button
                  onClick={handleContinue}
                  disabled={!selectedWorld}
                  className="w-full relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${selectedWorld ? 'from-amber-400 to-orange-500' : 'from-gray-600 to-gray-700'}`} />
                  <div className="relative bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black py-5 rounded-2xl border-2 border-white/20 shadow-2xl flex items-center justify-center gap-3">
                    <span>Continuer l'aventure</span>
                    <Sparkles className="w-6 h-6" />
                  </div>
                </button>
              </div>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-amber-400 rounded-full blur-xl opacity-50 animate-pulse" />
            <Sparkles className="relative w-12 h-12 text-amber-400 animate-spin" />
          </div>
          <p className="mt-4 text-white/50">Préparation de l'aventure...</p>
        </div>
      </div>
    }>
      <ChooseHeroContent />
    </Suspense>
  );
}
