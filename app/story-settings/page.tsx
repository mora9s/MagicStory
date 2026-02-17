'use client';
import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { generateAndSaveStory } from '../../lib/actions';
import { triggerVibration } from '@/lib/haptics';
import { Sparkles, Wand2, BookOpen } from 'lucide-react';

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Infos des héros
  const hero1Name = searchParams.get('hero1Name') || '';
  const hero1Age = parseInt(searchParams.get('hero1Age') || '6');
  const hero1Type = searchParams.get('hero1Type') || 'Chevalier';
  const hero2Name = searchParams.get('hero2Name');
  const hero2Age = searchParams.get('hero2Age') ? parseInt(searchParams.get('hero2Age')!) : null;
  const hero2Type = searchParams.get('hero2Type');
  const world = searchParams.get('world') || 'Forêt Enchantée';
  
  const hasTwoHeroes = !!hero2Name;
  
  const [theme, setTheme] = useState('Aventure');
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [progress, setProgress] = useState('');

  const handleCreateMagic = async () => {
    triggerVibration();
    setLoading(true);
    setGeneratingAI(true);
    setProgress('Création des profils...');
    
    try {
      setProgress('Génération de l\'histoire avec l\'IA...');
      
      // Générer et sauvegarder l'histoire avec 1 ou 2 héros
      const result = await generateAndSaveStory(
        hero1Name,
        hero1Age,
        hero1Type,
        hero2Name,
        hero2Age,
        hero2Type,
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
      
      const { title, content, imageUrl, storyId } = result.data;
      
      console.log('Story générée:', { title, imageUrl: imageUrl?.substring(0, 50), storyId });
      
      // Encoder les données pour l'URL
      const encodedTitle = encodeURIComponent(title);
      const encodedContent = encodeURIComponent(content);
      const encodedImageUrl = imageUrl ? encodeURIComponent(imageUrl) : '';
      
      if (!storyId) {
        alert('Erreur: L\'histoire n\'a pas été sauvegardée correctement');
        setLoading(false);
        setGeneratingAI(false);
        return;
      }
      
      router.push(`/read-story?id=${storyId}&hero1Name=${encodeURIComponent(hero1Name)}&hero2Name=${hero2Name ? encodeURIComponent(hero2Name) : ''}&world=${encodeURIComponent(world)}&theme=${theme}&title=${encodedTitle}&content=${encodedContent}&imageUrl=${encodedImageUrl}`);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Oups, la magie a eu un petit raté. Réessaie !');
      setLoading(false);
      setGeneratingAI(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 px-4">
      {/* Résumé */}
      <div className="bg-indigo-950 border-4 border-black text-sm p-4 w-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <span className="font-bold text-amber-500 uppercase">AVENTURE :</span>{' '}
        <span className="text-amber-400 font-black">{hero1Name}</span>
        {hasTwoHeroes && (
          <>
            {' '}<span className="text-white">et</span>{' '}
            <span className="text-purple-400 font-black">{hero2Name}</span>
          </>
        )}
        {' '}<span className="text-amber-500">DANS</span>{' '}
        <span className="text-white uppercase font-black">{world}</span>
      </div>
      
      {generatingAI && (
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 border-4 border-amber-500 p-6 rounded-lg text-center animate-pulse">
          <Wand2 className="w-12 h-12 text-amber-400 mx-auto mb-3 animate-bounce" />
          <p className="text-white font-bold text-lg">
            L'IA crée l'histoire {hasTwoHeroes ? 'des deux héros' : 'de ton héros'}...
          </p>
          <p className="text-indigo-300 text-sm mt-2">{progress}</p>
          <div className="mt-4 w-full bg-indigo-800 rounded-full h-2">
            <div className="bg-amber-500 h-2 rounded-full animate-pulse w-3/4"></div>
          </div>
          <p className="text-indigo-400 text-xs mt-3">✨ Génération du texte et de l'illustration ✨</p>
          <p className="text-indigo-500 text-xs mt-1">Cela prend environ 15-20 secondes</p>
        </div>
      )}
      
      {/* Thème */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="bg-amber-500 text-black font-bold py-1 px-3 border-2 border-black uppercase text-xs self-start transform -rotate-1">Thème de l'histoire</label>
          <div className="relative">
            <select 
              value={theme} 
              onChange={(e) => setTheme(e.target.value)} 
              className="w-full p-4 bg-slate-900 text-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] outline-none font-bold appearance-none cursor-pointer"
              disabled={loading}
            >
              <option className="bg-slate-900 text-white" value="Aventure">⚔️ Aventure (Action et Courage)</option>
              <option className="bg-slate-900 text-white" value="Amitié">🤝 Amitié (Entraide et Partage)</option>
              <option className="bg-slate-900 text-white" value="Apprentissage">📚 Apprentissage (Découverte et Sagesse)</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-amber-500 font-black">▼</div>
          </div>
        </div>
      </div>

      <div className="pt-6 flex flex-col gap-4">
        <button 
          onClick={handleCreateMagic} 
          disabled={loading} 
          className={`group bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:via-orange-400 hover:to-amber-400 text-black font-black py-6 px-10 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-2xl w-full transition-all active:translate-x-2 active:translate-y-2 active:shadow-none uppercase tracking-tighter flex items-center justify-center gap-3 ${loading ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <>
              <Sparkles className="w-6 h-6 animate-spin" />
              CRÉATION EN COURS...
            </>
          ) : (
            <>
              <Wand2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              CRÉER LA MAGIE ✨
            </>
          )}
        </button>
        
        <a
          href="/library"
          onClick={() => triggerVibration()}
          className="bg-indigo-800 text-white font-black py-4 px-8 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-xl w-full transition-all active:translate-x-1 active:translate-y-1 active:shadow-none uppercase tracking-tighter flex items-center justify-center gap-2 hover:bg-indigo-700 text-center"
        >
          <BookOpen className="w-5 h-5" />
          Voir mes histoires
        </a>
        
        <button 
          onClick={() => { triggerVibration(); window.history.back(); }}
          disabled={loading}
          className="bg-indigo-950 text-white font-black py-4 px-8 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-xl w-full transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none uppercase tracking-tighter"
        >
          Retour
        </button>
      </div>
    </div>
  );
}

export default function StorySettings() {
  return (
    <main className="min-h-screen p-6 bg-[#0f0f1a]">
      <div className="max-w-2xl mx-auto px-4 mb-10 transform -rotate-1">
        <h1 className="text-amber-500 text-2xl font-black uppercase text-center mb-2 tracking-widest drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
          MagicStory
        </h1>
        <h2 className="text-3xl font-black text-center text-white uppercase drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] break-words">Derniers détails...</h2>
      </div>
      <Suspense fallback={<div className="text-center font-bold text-amber-500 uppercase tracking-widest animate-pulse">Chargement de tes choix...</div>}>
        <SettingsContent />
      </Suspense>
    </main>
  );
}
