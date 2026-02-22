'use client';
import React, { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { generateAndSaveStory, generateAndSaveInteractiveStory, canCreateStory, getAllChildProfiles } from '../../lib/actions';
import { RUNE_COSTS } from '@/lib/types';
import { triggerVibration } from '@/lib/haptics';
import { Sparkles, Wand2, BookOpen, GitBranch, Coins, Plus, User, X, Crown } from 'lucide-react';
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
  const [profilesError, setProfilesError] = useState<string | null>(null);
  
  // Héros sélectionnés
  const [hero1, setHero1] = useState<Profile | null>(null);
  const [hero2, setHero2] = useState<Profile | null>(null);
  const [showHero2, setShowHero2] = useState(false);
  
  // Configuration histoire
  const [theme, setTheme] = useState('Aventure');
  const [storyType, setStoryType] = useState<'linear' | 'interactive'>('linear');
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
        console.log('Profiles loaded:', result);
        
        if (result.error) {
          setProfilesError(result.error);
        } else if (result.data) {
          setProfiles(result.data);
          
          // Si on a un héros dans l'URL, le sélectionner
          if (urlHero1Name && urlHero1Age) {
            const matchedHero = result.data.find(p => 
              p.first_name.toLowerCase() === urlHero1Name.toLowerCase() && 
              p.age === urlHero1Age
            );
            if (matchedHero) {
              setHero1(matchedHero);
            } else {
              // Créer un profil temporaire
              setHero1({
                id: 'temp',
                first_name: urlHero1Name,
                age: urlHero1Age,
                avatar_url: null
              });
            }
          } else if (result.data.length > 0) {
            // Sélectionner le premier par défaut
            setHero1(result.data[0]);
          }
        }
      } catch (err) {
        console.error('Error loading profiles:', err);
        setProfilesError('Erreur de chargement des héros');
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

  const selectHero = (hero: Profile, slot: 1 | 2) => {
    triggerVibration();
    if (slot === 1) {
      setHero1(hero);
    } else {
      setHero2(hero);
    }
  };

  const removeHero2 = () => {
    setHero2(null);
    setShowHero2(false);
  };

  const handleCreateMagic = async () => {
    if (!hero1) {
      alert('Sélectionne au moins un héros !');
      return;
    }
    
    triggerVibration();
    setLoading(true);
    setGeneratingAI(true);
    setProgress('Création des profils...');
    
    try {
      if (storyType === 'interactive') {
        setProgress('Génération de l\'histoire interactive avec l\'IA...');
        
        const result = await generateAndSaveInteractiveStory(
          hero1.first_name,
          hero1.age,
          hero2?.first_name || null,
          hero2?.age || null,
          world,
          theme
        );
        
        if (result.error || !result.data) {
          alert(result.error || 'Erreur de génération');
          setLoading(false);
          setGeneratingAI(false);
          return;
        }

        setProgress('Sauvegarde des chapitres...');
        
        const { title, storyId, coverImageUrl } = result.data;
        
        router.push(`/read-story?id=${storyId}&interactive=true&hero1Name=${encodeURIComponent(hero1.first_name)}&hero2Name=${hero2 ? encodeURIComponent(hero2.first_name) : ''}&world=${encodeURIComponent(world)}&theme=${theme}&title=${encodeURIComponent(title)}&imageUrl=${coverImageUrl ? encodeURIComponent(coverImageUrl) : ''}`);
      } else {
        setProgress('Génération de l\'histoire avec l\'IA...');
        
        const result = await generateAndSaveStory(
          hero1.first_name,
          hero1.age,
          hero2?.first_name || null,
          hero2?.age || null,
          world,
          theme
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
        
        router.push(`/read-story?id=${storyId}&hero1Name=${encodeURIComponent(hero1.first_name)}&hero2Name=${hero2 ? encodeURIComponent(hero2.first_name) : ''}&world=${encodeURIComponent(world)}&theme=${theme}&title=${encodedTitle}&content=${encodedContent}&imageUrl=${encodedImageUrl}&endingImageUrl=${encodedEndingImageUrl || encodedImageUrl}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Oups, la magie a eu un petit raté. Réessaie !');
      setLoading(false);
      setGeneratingAI(false);
    }
  };

  const hasTwoHeroes = !!hero2;

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-6 px-4">
      {/* Header */}
      <div className="text-center mb-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Crown className="w-6 h-6 text-amber-400" />
          <span className="font-black text-white text-lg">Nouvelle Histoire</span>
        </div>
        <p className="text-indigo-300 text-sm">Configure ton aventure</p>
      </div>

      {/* Résumé du monde */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-2 border-indigo-700 rounded-xl p-4">
        <span className="text-indigo-400 text-xs font-bold uppercase">Univers</span>
        <p className="text-white font-black text-lg">{world}</p>
      </div>

      {/* Sélection des héros */}
      <div className="space-y-4">
        {/* Héros 1 */}
        <div>
          <label className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-3">
            <User className="w-4 h-4" />
            Héros principal
          </label>
          
          {loadingProfiles ? (
            <div className="flex items-center justify-center py-8 bg-white/5 rounded-xl">
              <Sparkles className="w-6 h-6 text-amber-400 animate-spin" />
            </div>
          ) : profilesError ? (
            <div className="text-center py-6 bg-red-900/30 border border-red-500/50 rounded-xl">
              <p className="text-red-300 mb-2">⚠️ {profilesError}</p>
              <button 
                onClick={() => window.location.reload()}
                className="text-amber-400 hover:text-amber-300 text-sm underline"
              >
                Réessayer
              </button>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-6 bg-white/5 rounded-xl">
              <p className="text-indigo-300 mb-3">Aucun héros enregistré</p>
              <Link 
                href="/parent"
                onClick={() => triggerVibration()}
                className="inline-flex items-center gap-2 bg-amber-500 text-black font-bold py-2 px-4 rounded-xl border-2 border-black"
              >
                <Plus className="w-4 h-4" />
                Créer un héros
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => selectHero(profile, 1)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    hero1?.id === profile.id
                      ? 'bg-amber-500 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]'
                      : 'bg-white/5 border-indigo-800 hover:bg-white/10'
                  }`}
                >
                  <div className="w-10 h-10 mx-auto mb-2 bg-indigo-900 rounded-lg flex items-center justify-center text-xl">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full rounded-lg object-cover" />
                    ) : (
                      '👤'
                    )}
                  </div>
                  <p className={`font-bold text-xs truncate ${hero1?.id === profile.id ? 'text-black' : 'text-white'}`}>
                    {profile.first_name}
                  </p>
                  <p className={`text-xs ${hero1?.id === profile.id ? 'text-black/70' : 'text-indigo-400'}`}>
                    {profile.age} ans
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Héros 2 (optionnel) */}
        <div>
          {!showHero2 ? (
            <button
              onClick={() => { setShowHero2(true); triggerVibration(); }}
              disabled={!hero1}
              className="w-full py-3 border-2 border-dashed border-indigo-700 rounded-xl text-indigo-400 font-bold hover:border-indigo-500 hover:text-indigo-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Ajouter un 2ème héros
            </button>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                  <User className="w-4 h-4" />
                  2ème héros
                </label>
                <button
                  onClick={removeHero2}
                  className="p-1 text-indigo-400 hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {profiles.filter(p => p.id !== hero1?.id).map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => selectHero(profile, 2)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      hero2?.id === profile.id
                        ? 'bg-purple-500 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]'
                        : 'bg-white/5 border-indigo-800 hover:bg-white/10'
                    }`}
                  >
                    <div className="w-10 h-10 mx-auto mb-2 bg-indigo-900 rounded-lg flex items-center justify-center text-xl">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-full h-full rounded-lg object-cover" />
                      ) : (
                        '👤'
                      )}
                    </div>
                    <p className={`font-bold text-xs truncate ${hero2?.id === profile.id ? 'text-white' : 'text-white'}`}>
                      {profile.first_name}
                    </p>
                    <p className={`text-xs ${hero2?.id === profile.id ? 'text-white/70' : 'text-indigo-400'}`}>
                      {profile.age} ans
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Lien vers création */}
        <Link
          href="/parent"
          onClick={() => triggerVibration()}
          className="flex items-center justify-center gap-2 text-amber-400 hover:text-amber-300 text-sm font-bold py-2"
        >
          <Plus className="w-4 h-4" />
          Créer un nouveau héros
        </Link>
      </div>
      
      {generatingAI && (
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 border-4 border-amber-500 p-6 rounded-lg text-center animate-pulse">
          <Wand2 className="w-12 h-12 text-amber-400 mx-auto mb-3 animate-bounce" />
          <p className="text-white font-bold text-lg">
            {storyType === 'interactive' 
              ? `L'IA crée l'histoire interactive ${hasTwoHeroes ? 'des deux héros' : 'de ton héros'}...`
              : `L'IA crée l'histoire ${hasTwoHeroes ? 'des deux héros' : 'de ton héros'}...`
            }
          </p>
          <p className="text-indigo-300 text-sm mt-2">{progress}</p>
          <div className="mt-4 w-full bg-indigo-800 rounded-full h-2">
            <div className="bg-amber-500 h-2 rounded-full animate-pulse w-3/4"></div>
          </div>
          <p className="text-indigo-400 text-xs mt-3">
            {storyType === 'interactive' 
              ? '✨ Génération de l\'arbre narratif avec choix et embranchements ✨' 
              : '✨ Génération du texte et de l\'illustration ✨'
            }
          </p>
        </div>
      )}
      
      {/* Type d'histoire */}
      <div className="flex flex-col gap-2">
        <label className="text-indigo-300 font-bold text-sm">Type d'histoire</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setStoryType('linear')}
            disabled={loading}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              storyType === 'linear' 
                ? 'bg-amber-500 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]' 
                : 'bg-white/5 border-indigo-800 hover:bg-white/10'
            }`}
          >
            <BookOpen className={`w-6 h-6 mb-2 ${storyType === 'linear' ? 'text-black' : 'text-amber-400'}`} />
            <div className={`font-black text-sm ${storyType === 'linear' ? 'text-black' : 'text-white'}`}>Classique</div>
            <div className={`text-xs mt-1 ${storyType === 'linear' ? 'text-black/70' : 'text-indigo-400'}`}>Histoire linéaire</div>
          </button>
          
          <button
            onClick={() => setStoryType('interactive')}
            disabled={loading}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              storyType === 'interactive' 
                ? 'bg-purple-500 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]' 
                : 'bg-white/5 border-indigo-800 hover:bg-white/10'
            }`}
          >
            <GitBranch className={`w-6 h-6 mb-2 ${storyType === 'interactive' ? 'text-white' : 'text-purple-400'}`} />
            <div className={`font-black text-sm ${storyType === 'interactive' ? 'text-white' : 'text-white'}`}>Interactive</div>
            <div className={`text-xs mt-1 ${storyType === 'interactive' ? 'text-white/70' : 'text-indigo-400'}`}>Choix multiples</div>
          </button>
        </div>
      </div>
      
      {/* Thème */}
      <div className="flex flex-col gap-2">
        <label className="text-indigo-300 font-bold text-sm">Thème</label>
        <select 
          value={theme} 
          onChange={(e) => setTheme(e.target.value)} 
          className="w-full p-4 bg-indigo-900/50 text-white border-2 border-indigo-700 rounded-xl font-bold outline-none focus:border-amber-500"
          disabled={loading}
        >
          <option value="Aventure">⚔️ Aventure</option>
          <option value="Amitié">🤝 Amitié</option>
          <option value="Apprentissage">📚 Apprentissage</option>
          <option value="Courage">🦁 Courage</option>
          <option value="Magie">✨ Magie</option>
        </select>
      </div>

      {/* Coût en runes */}
      <div className="bg-indigo-900/30 border-2 border-indigo-700 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <span className="text-indigo-200 font-bold">Coût</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="text-amber-400 font-black text-xl">{runeCost}</span>
            <span className="text-indigo-400 text-sm">runes</span>
          </div>
        </div>
        {!canCreate && !loading && (
          <div className="mt-3 p-3 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-200 text-sm font-bold text-center">
              Pas assez de runes !
            </p>
            <Link 
              href="/runes" 
              className="block text-center text-amber-400 hover:text-amber-300 text-sm mt-1 underline"
            >
              Voir mes runes →
            </Link>
          </div>
        )}
      </div>

      {/* Bouton créer */}
      <div className="pt-4 flex flex-col gap-3">
        <button 
          onClick={handleCreateMagic} 
          disabled={loading || !canCreate || !hero1} 
          className={`w-full py-5 rounded-xl font-black text-lg border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 ${
            storyType === 'interactive' 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
              : 'bg-gradient-to-r from-amber-500 to-orange-500 text-black'
          } ${loading || !canCreate || !hero1 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <>
              <Sparkles className="w-5 h-5 animate-spin" />
              Création...
            </>
          ) : !hero1 ? (
            'Choisir un héros'
          ) : !canCreate ? (
            'Pas assez de runes'
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              {storyType === 'interactive' ? 'Créer l\'aventure 🎭' : 'Créer la magie ✨'}
            </>
          )}
        </button>
        
        <button 
          onClick={() => { triggerVibration(); router.push('/choose-hero'); }}
          disabled={loading}
          className="w-full py-4 bg-indigo-800 hover:bg-indigo-700 text-white font-bold rounded-xl border-2 border-indigo-600 transition-colors"
        >
          ← Retour
        </button>
      </div>
    </div>
  );
}

export default function StorySettings() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-indigo-950 py-6">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Sparkles className="w-10 h-10 text-amber-400 animate-spin" />
        </div>
      }>
        <SettingsContent />
      </Suspense>
    </main>
  );
}
