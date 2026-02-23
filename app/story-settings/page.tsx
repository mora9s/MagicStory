'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { generateAndSaveStory, generateAndSaveInteractiveStory, canCreateStory, getAllChildProfiles } from '../../lib/actions';
import { RUNE_COSTS } from '@/lib/types';
import { triggerVibration } from '@/lib/haptics';
import { Sparkles, Wand2, BookOpen, User, Crown, ArrowLeft, Heart, Star, Zap, Flame, Sparkle } from 'lucide-react';
import Link from 'next/link';

type Profile = {
  id: string;
  first_name: string;
  age: number;
  avatar_url: string | null;
};

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Infos du monde depuis l'URL (venant de choose-hero)
  const world = searchParams.get('world') || 'Forêt Enchantée';
  const urlHero1Name = searchParams.get('hero1Name');
  const urlHero1Age = searchParams.get('hero1Age') ? parseInt(searchParams.get('hero1Age')!) : null;
  
  // Liste des héros enregistrés
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  
  // Héros sélectionné (un seul)
  const [hero, setHero] = useState<Profile | null>(null);
  
  // Type d'histoire
  const [storyType, setStoryType] = useState<'linear' | 'interactive'>('linear');
  
  // États de chargement
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [progress, setProgress] = useState('');
  const [canCreate, setCanCreate] = useState<boolean>(true);
  const [runeCost, setRuneCost] = useState<number>(RUNE_COSTS.LINEAR_STORY);
  const [runeBalance, setRuneBalance] = useState<number>(0);
  
  // Charger les profils et initialiser avec l'URL si présent
  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const result = await getAllChildProfiles();
        if (result.error) {
          console.error('Error loading profiles:', result.error);
        } else if (result.data) {
          setProfiles(result.data);
          
          // Si on a un héros dans l'URL, le sélectionner
          if (urlHero1Name && urlHero1Age) {
            const matchedHero = result.data.find(p => 
              p.first_name.toLowerCase() === urlHero1Name.toLowerCase() && 
              p.age === urlHero1Age
            );
            if (matchedHero) {
              setHero(matchedHero);
            } else {
              // Créer un profil temporaire
              setHero({
                id: 'temp',
                first_name: urlHero1Name,
                age: urlHero1Age,
                avatar_url: null
              });
            }
          } else if (result.data.length > 0) {
            // Sélectionner le premier par défaut
            setHero(result.data[0]);
          }
        }
      } catch (err) {
        console.error('Error loading profiles:', err);
      } finally {
        setLoadingProfiles(false);
      }
    };
    loadProfiles();
  }, [urlHero1Name, urlHero1Age]);
  
  // Vérifier les runes quand le type d'histoire change
  useEffect(() => {
    const checkRunes = async () => {
      const result = await canCreateStory(storyType);
      if (result.data) {
        setCanCreate(result.data.canCreate);
        setRuneCost(storyType === 'interactive' ? RUNE_COSTS.INTERACTIVE_STORY : RUNE_COSTS.LINEAR_STORY);
        setRuneBalance(result.data.balance);
      }
    };
    checkRunes();
  }, [storyType]);

  const selectHero = (selectedHero: Profile) => {
    triggerVibration();
    setHero(selectedHero);
  };

  const handleCreateMagic = async () => {
    if (!hero) {
      alert('Sélectionne un héros !');
      return;
    }
    
    if (!canCreate) {
      alert(`Tu n'as pas assez de runes ! Coût: ${runeCost} rune(s).`);
      return;
    }
    
    triggerVibration();
    setLoading(true);
    setGeneratingAI(true);
    setProgress('Préparation de la magie...');
    
    try {
      if (storyType === 'interactive') {
        setProgress('Génération de l\'histoire interactive avec l\'IA...');
        
        const result = await generateAndSaveInteractiveStory(
          hero.first_name,
          hero.age,
          null, // pas de 2ème héros
          null,
          world,
          'Aventure'
        );
        
        if (result.error || !result.data) {
          alert(result.error || 'Erreur de génération');
          setLoading(false);
          setGeneratingAI(false);
          return;
        }

        setProgress('Sauvegarde des chapitres...');
        
        const { title, storyId, coverImageUrl } = result.data;
        
        router.push(`/read-story?id=${storyId}&interactive=true&hero1Name=${encodeURIComponent(hero.first_name)}&world=${encodeURIComponent(world)}&title=${encodeURIComponent(title)}&imageUrl=${coverImageUrl ? encodeURIComponent(coverImageUrl) : ''}`);
      } else {
        setProgress('Génération de l\'histoire avec l\'IA...');
        
        const result = await generateAndSaveStory(
          hero.first_name,
          hero.age,
          null, // pas de 2ème héros
          null,
          world,
          'Aventure'
        );
        
        if (result.error || !result.data) {
          alert(result.error || 'Erreur de génération');
          setLoading(false);
          setGeneratingAI(false);
          return;
        }

        setProgress('Sauvegarde et préparation...');
        
        const { title, content, imageUrl, endingImageUrl, storyId } = result.data;
        
        const encodedTitle = encodeURIComponent(title);
        const encodedContent = encodeURIComponent(content);
        const encodedImageUrl = imageUrl ? encodeURIComponent(imageUrl) : '';
        const encodedEndingImageUrl = endingImageUrl ? encodeURIComponent(endingImageUrl) : '';
        
        router.push(`/read-story?id=${storyId}&hero1Name=${encodeURIComponent(hero.first_name)}&world=${encodeURIComponent(world)}&title=${encodedTitle}&content=${encodedContent}&imageUrl=${encodedImageUrl}&endingImageUrl=${encodedEndingImageUrl || encodedImageUrl}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Oups, la magie a eu un petit raté. Réessaie !');
      setLoading(false);
      setGeneratingAI(false);
    }
  };

  // Configuration des types d'histoires
  const storyTypes = [
    {
      id: 'linear' as const,
      title: 'Aventure Classique',
      subtitle: 'Histoire linéaire',
      description: 'Une histoire magique qui se lit du début à la fin, parfaite pour se faire raconter une belle histoire avant de dormir.',
      icon: BookOpen,
      emoji: '📖',
      color: 'from-amber-400 to-orange-500',
      bgColor: 'bg-amber-500',
      cost: RUNE_COSTS.LINEAR_STORY,
      features: ['Histoire complète', 'Illustrations', 'Mode audio']
    },
    {
      id: 'interactive' as const,
      title: 'Dont tu es le héros',
      subtitle: 'Histoire interactive',
      description: 'Tu fais les choix de l\'aventure ! 2 décisions importantes qui changent le cours de l\'histoire.',
      icon: Sparkles,
      emoji: '🎮',
      color: 'from-purple-400 to-pink-500',
      bgColor: 'bg-purple-500',
      cost: RUNE_COSTS.INTERACTIVE_STORY,
      features: ['Choix multiples', '2 fins différentes', 'Plus immersif']
    }
  ];

  const selectedStoryType = storyTypes.find(t => t.id === storyType)!;

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
            <Link href="/choose-hero" className="p-2 -ml-2 text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h1 className="font-black text-white text-lg">Configure ton aventure</h1>
            </div>
            <div className="w-10" />
          </div>
          
          {/* Progress bar */}
          <div className="flex gap-2 mt-4">
            <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" />
            </div>
            <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-1/2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full" />
            </div>
          </div>
          
          {/* Step indicator */}
          <div className="flex justify-between mt-2 text-xs font-bold">
            <span className="text-amber-400">1. Les Héros ✓</span>
            <span className="text-purple-400">2. Type d'aventure</span>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8 pb-32">
        
        {/* Loading state */}
        {generatingAI && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6">
            <div className="text-center max-w-sm">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse" />
                <Wand2 className="relative w-16 h-16 text-amber-400 animate-bounce" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">
                Magie en cours...
              </h3>
              <p className="text-white/60 mb-4">{progress}</p>
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-400 to-purple-500 h-full rounded-full animate-pulse w-3/4" />
              </div>
              <p className="text-white/40 text-sm mt-4">
                L'IA créé une histoire unique pour {hero?.first_name}
              </p>
            </div>
          </div>
        )}

        {/* Hero Card */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white/60 text-sm font-bold uppercase tracking-wider">Ton héros</h2>
            {loadingProfiles ? (
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            ) : (
              <Link 
                href="/parent" 
                className="text-amber-400 text-xs font-bold hover:text-amber-300"
              >
                Gérer →
              </Link>
            )}
          </div>
          
          {loadingProfiles ? (
            <div className="flex items-center justify-center py-12 bg-white/5 rounded-2xl border border-white/10">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-400 rounded-full blur-lg opacity-50 animate-pulse" />
                <Sparkles className="relative w-8 h-8 text-amber-400 animate-spin" />
              </div>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-8 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-4xl mb-3">🦸</div>
              <p className="text-white/60 mb-4">Aucun héros disponible</p>
              <Link 
                href="/parent"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold py-3 px-6 rounded-xl"
              >
                <User className="w-4 h-4" />
                Créer un héros
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {profiles.map((profile) => {
                const isSelected = hero?.id === profile.id;
                return (
                  <button
                    key={profile.id}
                    onClick={() => selectHero(profile)}
                    className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 text-center ${
                      isSelected
                        ? 'bg-gradient-to-br from-amber-500/30 to-orange-500/30 border-amber-400 shadow-lg scale-[1.02]'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-amber-400/50'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                        <Sparkle className="w-3 h-3 text-slate-950" />
                      </div>
                    )}
                    <div className={`w-14 h-14 mx-auto mb-2 rounded-xl flex items-center justify-center text-2xl overflow-hidden border-2 transition-colors ${
                      isSelected ? 'border-amber-400/50' : 'border-white/10'
                    }`}>
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className={isSelected ? 'scale-110' : ''}>👤</span>
                      )}
                    </div>
                    <p className={`font-bold text-sm truncate ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                      {profile.first_name}
                    </p>
                    <p className="text-white/50 text-xs">{profile.age} ans</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* World Info */}
        <div className="mb-8">
          <h2 className="text-white/60 text-sm font-bold uppercase tracking-wider mb-4">Univers</h2>
          <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-3xl">
              🌍
            </div>
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Monde choisi</p>
              <p className="text-white font-black text-xl">{world}</p>
            </div>
          </div>
        </div>

        {/* Story Type Selection */}
        <div className="mb-8">
          <h2 className="text-white/60 text-sm font-bold uppercase tracking-wider mb-4">Type d'aventure</h2>
          
          <div className="space-y-4">
            {storyTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = storyType === type.id;
              
              return (
                <button
                  key={type.id}
                  onClick={() => setStoryType(type.id)}
                  disabled={loading}
                  className={`group w-full relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                    isSelected
                      ? 'border-white shadow-2xl'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-0 transition-opacity duration-300 ${isSelected ? 'opacity-20' : 'group-hover:opacity-10'}`} />
                  
                  <div className="relative p-6 flex items-start gap-5">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 transition-all ${
                      isSelected 
                        ? `bg-gradient-to-br ${type.color} shadow-lg scale-110` 
                        : 'bg-white/10 group-hover:bg-white/20'
                    }`}>
                      {isSelected ? <Icon className="w-8 h-8 text-white" /> : type.emoji}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-black text-lg ${isSelected ? 'text-white' : 'text-white group-hover:text-white'}`}>
                          {type.title}
                        </h3>
                        {isSelected && (
                          <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-xs font-bold rounded-full">
                            Sélectionné
                          </span>
                        )}
                      </div>
                      <p className={`text-sm mb-3 ${isSelected ? 'text-white/80' : 'text-white/50'}`}>
                        {type.description}
                      </p>
                      
                      {/* Features */}
                      <div className="flex flex-wrap gap-2">
                        {type.features.map((feature, idx) => (
                          <span 
                            key={idx}
                            className={`text-xs px-2 py-1 rounded-lg ${
                              isSelected 
                                ? 'bg-white/20 text-white' 
                                : 'bg-white/5 text-white/50'
                            }`}
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Cost badge */}
                    <div className={`flex flex-col items-end gap-1 ${isSelected ? 'opacity-100' : 'opacity-50'}`}>
                      <div className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-amber-400" />
                        <span className="font-black text-amber-400">{type.cost}</span>
                      </div>
                      <span className="text-white/40 text-xs">runes</span>
                    </div>
                  </div>
                  
                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-slate-950" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Rune Info */}
        <div className="mb-8 bg-white/5 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <span className="text-white/60 text-sm">Coût de l'aventure</span>
            </div>
            <span className="font-black text-amber-400">{runeCost} runes</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-white/40 text-sm">Ton solde</span>
            <span className={`font-bold ${runeBalance >= runeCost ? 'text-green-400' : 'text-red-400'}`}>
              {runeBalance} runes
            </span>
          </div>
          {!canCreate && (
            <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-center">
              <p className="text-red-400 text-sm font-bold">
                ⚠️ Pas assez de runes !
              </p>
              <Link href="/runes" className="text-amber-400 text-xs hover:underline mt-1 inline-block">
                Acheter des runes →
              </Link>
            </div>
          )}
        </div>

        {/* Create Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
          <div className="max-w-lg mx-auto">
            <button
              onClick={handleCreateMagic}
              disabled={!hero || loading || !canCreate}
              className="w-full relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${selectedStoryType.color}`} />
              <div className="relative bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black py-5 rounded-2xl border-2 border-white/20 shadow-2xl flex items-center justify-center gap-3">
                <Wand2 className="w-6 h-6" />
                <span>Créer l'histoire</span>
                <Sparkles className="w-5 h-5" />
              </div>
            </button>
            <p className="text-center text-white/40 text-xs mt-3">
              Une histoire unique sera générée par l'IA
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function StorySettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-amber-400 rounded-full blur-xl opacity-50 animate-pulse" />
            <Sparkles className="relative w-12 h-12 text-amber-400 animate-spin" />
          </div>
          <p className="mt-4 text-white/50">Chargement...</p>
        </div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
