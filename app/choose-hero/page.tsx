'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAllChildProfiles } from '@/lib/actions';
import { triggerVibration } from '@/lib/haptics';
import { Users, ArrowLeft, Plus, UserCheck, Sparkles } from 'lucide-react';
import Image from 'next/image';

type ChildProfile = {
  id: string;
  first_name: string;
  age: number;
  favorite_hero: string | null;
  avatar_url: string | null;
};

const heroTypes = [
  { id: 'Chevalier', emoji: '🛡️', label: 'Chevalier' },
  { id: 'Magicienne', emoji: '🧙‍♀️', label: 'Magicienne' },
  { id: 'Explorateur', emoji: '🤠', label: 'Explorateur' },
  { id: 'Robot', emoji: '🤖', label: 'Robot' },
  { id: 'Princesse', emoji: '👸', label: 'Princesse' },
  { id: 'Pirate', emoji: '🏴‍☠️', label: 'Pirate' },
  { id: 'Astronaute', emoji: '🚀', label: 'Astronaute' },
  { id: 'Dragon', emoji: '🐉', label: 'Dragon' },
];

function ChooseHeroContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Paramètres venant du dashboard parent
  const preselectedId = searchParams.get('childId');
  const preselectedName = searchParams.get('name');
  const preselectedAge = searchParams.get('age');
  const preselectedHero = searchParams.get('hero');
  const preselectedAvatar = searchParams.get('avatar');
  
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild1, setSelectedChild1] = useState<string | null>(preselectedId);
  const [selectedChild2, setSelectedChild2] = useState<string | null>(null);
  const [mode, setMode] = useState<'select' | 'manual'>('select');
  
  // Manual entry state
  const [manualName1, setManualName1] = useState(preselectedName || '');
  const [manualAge1, setManualAge1] = useState(preselectedAge ? parseInt(preselectedAge) : 6);
  const [manualHero1, setManualHero1] = useState(preselectedHero || 'Chevalier');
  const [manualName2, setManualName2] = useState('');
  const [manualAge2, setManualAge2] = useState(6);
  const [manualHero2, setManualHero2] = useState('Chevalier');
  const [enableSecondHero, setEnableSecondHero] = useState(false);

  // Load profiles on mount
  React.useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    const result = await getAllChildProfiles();
    if (result.data) {
      setProfiles(result.data);
    }
    setLoading(false);
  };

  const handleContinue = () => {
    triggerVibration();
    
    let hero1Name, hero1Age, hero1Type;
    let hero2Name, hero2Age, hero2Type;
    
    if (mode === 'select') {
      // Mode sélection depuis profils
      const child1 = profiles.find(p => p.id === selectedChild1);
      if (!child1) {
        alert('Sélectionne au moins un enfant !');
        return;
      }
      hero1Name = child1.first_name;
      hero1Age = child1.age;
      hero1Type = child1.favorite_hero || 'Chevalier';
      
      const child2 = enableSecondHero ? profiles.find(p => p.id === selectedChild2) : null;
      if (child2) {
        hero2Name = child2.first_name;
        hero2Age = child2.age;
        hero2Type = child2.favorite_hero || 'Chevalier';
      }
    } else {
      // Mode manuel
      if (!manualName1) {
        alert('Rentre au moins un prénom !');
        return;
      }
      hero1Name = manualName1;
      hero1Age = manualAge1;
      hero1Type = manualHero1;
      
      if (enableSecondHero && manualName2) {
        hero2Name = manualName2;
        hero2Age = manualAge2;
        hero2Type = manualHero2;
      }
    }
    
    // Construire l'URL
    let url = `/choose-world?hero1Name=${encodeURIComponent(hero1Name)}&hero1Age=${hero1Age}&hero1Type=${hero1Type}`;
    
    if (hero2Name) {
      url += `&hero2Name=${encodeURIComponent(hero2Name)}&hero2Age=${hero2Age}&hero2Type=${hero2Type}`;
    }
    
    router.push(url);
  };

  return (
    <main className="min-h-screen p-6 bg-[#0f0f1a]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link 
            href={preselectedId ? '/parent' : '/'} 
            onClick={() => triggerVibration()}
            className="bg-indigo-900 border-4 border-black p-3 text-white font-black uppercase tracking-tighter hover:bg-indigo-800 shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </Link>
          
          <Link 
            href="/parent"
            onClick={() => triggerVibration()}
            className="bg-amber-600 border-4 border-black p-3 text-black font-black uppercase tracking-tighter hover:bg-amber-500 shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 text-sm"
          >
            <Users className="w-5 h-5" />
            Espace Parent
          </Link>
        </div>

        <div className="mb-10 transform -rotate-1">
          <h1 className="text-amber-500 text-2xl font-black uppercase text-center mb-2 tracking-widest drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            MagicStory
          </h1>
          <h2 className="text-3xl sm:text-4xl font-black text-center text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] uppercase tracking-tighter break-words">
            Qui sont les héros ?
          </h2>
          <p className="text-indigo-300 text-center mt-2">
            Choisis 1 ou 2 enfants pour l'aventure
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setMode('select')}
            className={`flex-1 py-4 border-4 border-black font-black uppercase tracking-tighter transition-all ${
              mode === 'select' 
                ? 'bg-amber-500 shadow-[6px_6px_0px_rgba(0,0,0,1)]' 
                : 'bg-indigo-900 text-white'
            }`}
          >
            <UserCheck className="w-5 h-5 inline mr-2" />
            Mes enfants
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex-1 py-4 border-4 border-black font-black uppercase tracking-tighter transition-all ${
              mode === 'manual' 
                ? 'bg-amber-500 shadow-[6px_6px_0px_rgba(0,0,0,1)]' 
                : 'bg-indigo-900 text-white'
            }`}
          >
            <Plus className="w-5 h-5 inline mr-2" />
            Nouveau
          </button>
        </div>

        {/* Mode Sélection Profils */}
        {mode === 'select' && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-10">
                <Sparkles className="w-10 h-10 text-amber-400 animate-spin mx-auto" />
              </div>
            ) : profiles.length === 0 ? (
              <div className="bg-indigo-900/50 border-4 border-indigo-700 p-8 text-center rounded-lg">
                <p className="text-indigo-200 mb-4">Aucun profil enregistré</p>
                <Link
                  href="/parent"
                  className="inline-block bg-amber-500 text-black font-black py-3 px-6 border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:bg-amber-400 transition-all"
                >
                  Créer un profil
                </Link>
              </div>
            ) : (
              <>
                {/* Premier héros */}
                <div>
                  <h3 className="text-white font-black uppercase mb-3 flex items-center gap-2">
                    <span className="bg-amber-500 text-black w-8 h-8 flex items-center justify-center border-2 border-black">1</span>
                    Premier héros *
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {profiles.map((profile) => (
                      <button
                        key={profile.id}
                        onClick={() => setSelectedChild1(profile.id)}
                        className={`p-4 border-4 border-black text-left transition-all ${
                          selectedChild1 === profile.id 
                            ? 'bg-amber-500 shadow-[6px_6px_0px_rgba(0,0,0,1)]' 
                            : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 bg-indigo-100 border-2 border-black rounded overflow-hidden flex-shrink-0">
                            {profile.avatar_url ? (
                              <Image src={profile.avatar_url} alt={profile.first_name} fill className="object-cover" />
                            ) : (
                              <Users className="w-6 h-6 text-indigo-300 absolute inset-0 m-auto" />
                            )}
                          </div>
                          <div>
                            <p className="font-black text-lg truncate">{profile.first_name}</p>
                            <p className="text-xs font-bold text-gray-600">{profile.age} ans • {profile.favorite_hero}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Option deuxième héros */}
                <div className="bg-indigo-900/50 border-4 border-indigo-700 p-4 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableSecondHero}
                      onChange={(e) => setEnableSecondHero(e.target.checked)}
                      className="w-6 h-6 accent-amber-500"
                    />
                    <span className="text-white font-bold">Ajouter un deuxième héros</span>
                  </label>
                </div>

                {/* Deuxième héros */}
                {enableSecondHero && (
                  <div>
                    <h3 className="text-white font-black uppercase mb-3 flex items-center gap-2">
                      <span className="bg-purple-500 text-white w-8 h-8 flex items-center justify-center border-2 border-black">2</span>
                      Deuxième héros
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {profiles.filter(p => p.id !== selectedChild1).map((profile) => (
                        <button
                          key={profile.id}
                          onClick={() => setSelectedChild2(profile.id)}
                          className={`p-4 border-4 border-black text-left transition-all ${
                            selectedChild2 === profile.id 
                              ? 'bg-purple-500 text-white shadow-[6px_6px_0px_rgba(0,0,0,1)]' 
                              : 'bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 bg-indigo-100 border-2 border-black rounded overflow-hidden flex-shrink-0">
                              {profile.avatar_url ? (
                                <Image src={profile.avatar_url} alt={profile.first_name} fill className="object-cover" />
                              ) : (
                                <Users className="w-6 h-6 text-indigo-300 absolute inset-0 m-auto" />
                              )}
                            </div>
                            <div>
                              <p className="font-black text-lg truncate">{profile.first_name}</p>
                              <p className={`text-xs font-bold ${selectedChild2 === profile.id ? 'text-white/80' : 'text-gray-600'}`}>{profile.age} ans</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Mode Manuel */}
        {mode === 'manual' && (
          <div className="space-y-6">
            {/* Premier héros */}
            <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
              <h3 className="text-indigo-900 font-black uppercase mb-4 flex items-center gap-2">
                <span className="bg-amber-500 text-black w-8 h-8 flex items-center justify-center border-2 border-black">1</span>
                Premier héros *
              </h3>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={manualName1}
                  onChange={(e) => setManualName1(e.target.value)}
                  placeholder="Prénom"
                  className="w-full p-4 bg-slate-100 border-4 border-black font-bold text-lg"
                />
                
                <div>
                  <label className="text-sm font-bold text-gray-600 block mb-2">Âge : {manualAge1} ans</label>
                  <input
                    type="range"
                    min="3"
                    max="12"
                    value={manualAge1}
                    onChange={(e) => setManualAge1(parseInt(e.target.value))}
                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {heroTypes.map((hero) => (
                    <button
                      key={hero.id}
                      onClick={() => setManualHero1(hero.id)}
                      className={`p-2 border-2 border-black text-center transition-all ${
                        manualHero1 === hero.id 
                          ? 'bg-amber-500' 
                          : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                    >
                      <span className="text-xl">{hero.emoji}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Option deuxième héros */}
            <div className="bg-indigo-900/50 border-4 border-indigo-700 p-4 rounded-lg">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableSecondHero}
                  onChange={(e) => setEnableSecondHero(e.target.checked)}
                  className="w-6 h-6 accent-amber-500"
                />
                <span className="text-white font-bold">Ajouter un deuxième héros</span>
              </label>
            </div>

            {/* Deuxième héros */}
            {enableSecondHero && (
              <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                <h3 className="text-indigo-900 font-black uppercase mb-4 flex items-center gap-2">
                  <span className="bg-purple-500 text-white w-8 h-8 flex items-center justify-center border-2 border-black">2</span>
                  Deuxième héros
                </h3>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    value={manualName2}
                    onChange={(e) => setManualName2(e.target.value)}
                    placeholder="Prénom"
                    className="w-full p-4 bg-slate-100 border-4 border-black font-bold text-lg"
                  />
                  
                  <div>
                    <label className="text-sm font-bold text-gray-600 block mb-2">Âge : {manualAge2} ans</label>
                    <input
                      type="range"
                      min="3"
                      max="12"
                      value={manualAge2}
                      onChange={(e) => setManualAge2(parseInt(e.target.value))}
                      className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {heroTypes.map((hero) => (
                      <button
                        key={hero.id}
                        onClick={() => setManualHero2(hero.id)}
                        className={`p-2 border-2 border-black text-center transition-all ${
                          manualHero2 === hero.id 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-slate-100 hover:bg-slate-200'
                        }`}
                      >
                        <span className="text-xl">{hero.emoji}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bouton Continuer */}
        <div className="mt-10">
          <button
            onClick={handleContinue}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-6 px-10 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-2xl transition-all active:translate-x-2 active:translate-y-2 active:shadow-none uppercase tracking-widest"
          >
            {enableSecondHero ? 'Les deux héros sont prêts ⚔️' : 'Le héros est prêt ⚔️'}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ChooseHero() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0f0f1a]"><Sparkles className="w-10 h-10 text-amber-400 animate-spin" /></div>}>
      <ChooseHeroContent />
    </Suspense>
  );
}
