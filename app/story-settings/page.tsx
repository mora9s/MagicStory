 'use client';
import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createProfile } from '../../lib/actions';

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [firstName, setFirstName] = useState('');
  const [age, setAge] = useState('6-8 ans (Action et Mystère)');
  const [loading, setLoading] = useState(false);

  const hero = searchParams.get('hero') || 'Magicien';
  const world = searchParams.get('world') || 'Forêt Enchantée';

  const handleCreateMagic = async () => {
    if (!firstName) {
      alert('N\'oublie pas le prénom de l\'enfant !');
      return;
    }
    setLoading(true);
    try {
      const ageInt = parseInt(age.split('-')[0]); 
      const result = await createProfile(firstName, ageInt, hero);
      
      if (result.error) {
        alert(result.error);
        return;
      }
      
      router.push(`/read-story?name=${firstName}&age=${ageInt}&hero=${hero}&world=${world}`);
    } catch (error) {
      console.error('Erreur Supabase:', error);
      alert('Oups, la magie a eu un petit raté. Réessaie !');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-8">
      <div className="comic-panel bg-indigo-900 border-[3px] border-black text-sm">
         <span className="font-bold text-amber-200">RÉSUMÉ :</span> <span className="text-slate-100 uppercase font-black">{hero}</span> DANS <span className="text-slate-100 uppercase font-black">{world}</span>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="comic-label mb-2 scale-90 -translate-x-2">Prénom de l'enfant</label>
          <input 
            type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
            placeholder="Ex: Timéo" 
            className="w-full p-4 bg-slate-900 text-slate-100 border-[3px] border-amber-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none focus:ring-2 ring-amber-500 font-bold placeholder:text-slate-500"
          />
        </div>
        
        <div>
          <label className="comic-label mb-2 scale-90 -translate-x-2">Âge de l'aventurier</label>
          <select 
            value={age} onChange={(e) => setAge(e.target.value)} 
            className="w-full p-4 bg-slate-900 text-slate-100 border-[3px] border-amber-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none font-bold appearance-none cursor-pointer"
          >
            <option className="bg-slate-900">3-5 ans (Histoires douces)</option>
            <option className="bg-slate-900">6-8 ans (Action et Mystère)</option>
            <option className="bg-slate-900">9-12 ans (Grandes épopées)</option>
          </select>
        </div>
      </div>

      <div className="pt-6">
        <button 
          onClick={handleCreateMagic} 
          disabled={loading} 
          className={`comic-button w-full text-xl py-5 ${loading ? 'opacity-50 grayscale' : ''}`}
        >
          {loading ? 'INCANTATION...' : 'CRÉER LA MAGIE ✨'}
        </button>
      </div>
    </div>
  );
}

export default function StorySettings() {
  return (
    <main className="min-h-screen p-6">
      <div className="max-w-md mx-auto mb-10 transform -rotate-1">
        <h2 className="magic-title text-3xl text-center text-slate-100">Derniers détails...</h2>
      </div>
      <Suspense fallback={<div className="text-center font-bold text-amber-200">Chargement de tes choix...</div>}>
        <SettingsContent />
      </Suspense>
    </main>
  );
}
