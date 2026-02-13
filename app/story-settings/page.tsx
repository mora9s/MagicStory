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
    <div className="max-w-md mx-auto space-y-6">
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-indigo-200">
         Ton aventure : <span className="text-yellow-400">{hero}</span> dans <span className="text-yellow-400">{world}</span>
      </div>
      <div>
        <label className="block text-indigo-200 text-sm font-bold mb-2">Prénom de l'enfant</label>
        <input 
          type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
          placeholder="Ex: Timéo" 
          className="w-full p-4 rounded-xl bg-white/10 border border-white/20 outline-none"
        />
      </div>
      <div>
        <label className="block text-indigo-200 text-sm font-bold mb-2">Âge</label>
        <select value={age} onChange={(e) => setAge(e.target.value)} className="w-full p-4 rounded-xl bg-white/10 border border-white/20 outline-none bg-indigo-900">
          <option>3-5 ans (Histoires douces)</option>
          <option>6-8 ans (Action et Mystère)</option>
          <option>9-12 ans (Grandes épopées)</option>
        </select>
      </div>
      <div className="pt-6">
        <button onClick={handleCreateMagic} disabled={loading} className={`w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-indigo-950 font-black rounded-2xl shadow-lg ${loading ? 'opacity-50' : ''}`}>
          {loading ? 'PRÉPARATION...' : 'CRÉER LA MAGIE ✨'}
        </button>
      </div>
    </div>
  );
}

export default function StorySettings() {
  return (
    <main className="min-h-screen bg-indigo-950 text-white p-6">
      <h2 className="text-3xl font-bold text-center mb-10 text-yellow-400">Derniers détails...</h2>
      <Suspense fallback={<div className="text-center">Chargement de tes choix...</div>}>
        <SettingsContent />
      </Suspense>
    </main>
  );
}
