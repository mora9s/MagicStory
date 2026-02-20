'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAllChildProfiles } from '@/lib/actions';
import { triggerVibration } from '@/lib/haptics';
import { Users, ArrowLeft, Plus, UserCheck, Sparkles } from 'lucide-react';
// Utilisation de balises img standard pour les images externes

type ChildProfile = {
  id: string;
  first_name: string;
  age: number;
  avatar_url: string | null;
  traits: string[] | null;
};




function ChooseHeroContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Paramètres venant du dashboard parent
  const preselectedId = searchParams.get('childId');
  const preselectedName = searchParams.get('name');
  const preselectedAge = searchParams.get('age');
  const preselectedAvatar = searchParams.get('avatar');
  
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild1, setSelectedChild1] = useState<string | null>(preselectedId);
  const [selectedChild2, setSelectedChild2] = useState<string | null>(null);
  const [mode, setMode] = useState<'select' | 'manual'>('select');
  
  // Manual entry state
  const [manualName1, setManualName1] = useState(preselectedName || '');
  const [manualAge1, setManualAge1] = useState(preselectedAge ? parseInt(preselectedAge) : 6);
  const [manualName2, setManualName2] = useState('');
  const [manualAge2, setManualAge2] = useState(6);
  const [enableSecondHero, setEnableSecondHero] = useState(false);
  // Les relations sont g00e9r00e9es dans l'espace parent // Lien entre les 2 héros
  
  // Random mode
  const [isRandomMode, setIsRandomMode] = useState(false);

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
    
    let hero1Name, hero1Age;
    let hero2Name, hero2Age;
    
    console.log('Mode:', mode);
    
    if (mode === 'select') {
      // Mode sélection depuis profils
      const child1 = profiles.find(p => p.id === selectedChild1);
      if (!child1) {
        alert('Sélectionne au moins un enfant !');
        return;
      }
      hero1Name = child1.first_name;
      hero1Age = child1.age;
      
      console.log('Héros 1 (sélection):', { name: hero1Name, age: hero1Age });
      
      const child2 = enableSecondHero ? profiles.find(p => p.id === selectedChild2) : null;
      if (child2) {
        hero2Name = child2.first_name;
        hero2Age = child2.age;
        console.log('Héros 2 (sélection):', { name: hero2Name, age: hero2Age });
      }
    } else {
      // Mode manuel
      if (!manualName1) {
        alert('Rentre au moins un prénom !');
        return;
      }
      hero1Name = manualName1;
      hero1Age = manualAge1;
      
      console.log('Héros 1 (manuel):', { name: hero1Name, age: hero1Age });
      
      if (enableSecondHero && manualName2) {
        hero2Name = manualName2;
        hero2Age = manualAge2;
        console.log('Héros 2 (manuel):', { name: hero2Name, age: hero2Age });
      }
    }
    
    console.log('URL params:', { hero1Name, hero1Age, hero2Name, hero2Age });
    
    // Construire l'URL
    let url = `/choose-world?hero1Name=${encodeURIComponent(hero1Name)}&hero1Age=${hero1Age}`;
    
    if (hero2Name) {
      url += `&hero2Name=${encodeURIComponent(hero2Name)}&hero2Age=${hero2Age}`;
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
                    {selectedChild1 && (
                      <span className="text-amber-400 text-sm ml-2">
                        ({profiles.find(p => p.id === selectedChild1)?.age} ans)
                      </span>
                    )}
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
                          <div className="w-12 h-12 bg-indigo-100 border-2 border-black rounded overflow-hidden flex-shrink-0">
                            {profile.avatar_url ? (
                              <img src={profile.avatar_url} alt={profile.first_name} className="w-full h-full object-cover" />
                            ) : (
                              <Users className="w-6 h-6 text-indigo-300 m-auto" />
                            )}
                          </div>
                          <div>
                            <p className="font-black text-lg truncate">{profile.first_name}</p>
                            <p className="text-xs font-bold text-gray-600">{profile.age} ans</p>
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
                            <div className="w-12 h-12 bg-indigo-100 border-2 border-black rounded overflow-hidden flex-shrink-0">
                              {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.first_name} className="w-full h-full object-cover" />
                              ) : (
                                <Users className="w-6 h-6 text-indigo-300 m-auto" />
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
            <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] text-black">
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
              <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] text-black">
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
                </div>
              </div>
            )}
          </div>
        )}

        {/* Résumé avant confirmation */}
        <div className="mt-8 bg-indigo-900/70 border-4 border-indigo-500 p-4 rounded-lg">
          <p className="text-white text-center font-bold mb-2">Résumé de l'aventure :</p>
          <div className="flex justify-center gap-4 flex-wrap items-center">
            {mode === 'select' && selectedChild1 ? (
              <div className="bg-amber-500 border-4 border-black px-4 py-2 text-center">
                <p className="font-black text-lg">{profiles.find(p => p.id === selectedChild1)?.first_name}</p>
                <p className="text-sm font-bold">{profiles.find(p => p.id === selectedChild1)?.age} ans</p>
              </div>
            ) : mode === 'manual' && manualName1 ? (
              <div className="bg-amber-500 border-4 border-black px-4 py-2 text-center">
                <p className="font-black text-lg">{manualName1}</p>
                <p className="text-sm font-bold">{manualAge1} ans</p>
              </div>
            ) : null}
            
            {enableSecondHero && (
              <>
                <div className="text-white text-xs font-bold self-center bg-black/30 px-2 py-1 rounded">
                  &
                </div>
                {mode === 'select' && selectedChild2 ? (
                  <div className="bg-purple-500 border-4 border-black px-4 py-2 text-center text-white">
                    <p className="font-black text-lg">{profiles.find(p => p.id === selectedChild2)?.first_name}</p>
                    <p className="text-sm font-bold">{profiles.find(p => p.id === selectedChild2)?.age} ans</p>
                  </div>
                ) : mode === 'manual' && manualName2 ? (
                  <div className="bg-purple-500 border-4 border-black px-4 py-2 text-center text-white">
                    <p className="font-black text-lg">{manualName2}</p>
                    <p className="text-sm font-bold">{manualAge2} ans</p>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>

        {/* Bouton Continuer */}
        <div className="mt-6">
          <button
            onClick={handleContinue}
            disabled={mode === 'select' ? !selectedChild1 : !manualName1}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-gray-500 disabled:cursor-not-allowed text-black font-extrabold py-6 px-10 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-2xl transition-all active:translate-x-2 active:translate-y-2 active:shadow-none uppercase tracking-widest"
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
