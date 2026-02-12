 'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProfile } from '../../lib/actions';

export default function StorySettings() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [age, setAge] = useState('6-8 ans (Action et Mystère)');
  const [loading, setLoading] = useState(false);

  const handleCreateMagic = async () => {
    if (!firstName) {
      alert('N\'oublie pas le prénom de l\'enfant !');
      return;
    }

    setLoading(true);
    try {
      // Pour l'instant on simule le héros "Magicien" car on ne l'a pas encore passé entre les pages
      const ageInt = parseInt(age.split('-')[0]); 
      await createProfile(firstName, ageInt, 'Magicien');
      
      // On redirige vers la lecture
      router.push('/read-story');
    } catch (error) {
      console.error('Erreur Supabase:', error);
      alert('Oups, la magie a eu un petit raté. Réessaie !');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-indigo-950 text-white p-6">
      <h2 className="text-3xl font-bold text-center mb-10 text-yellow-400">Derniers détails...</h2>
      
      <div className="max-w-md mx-auto space-y-6">
        <div>
          <label className="block text-indigo-200 text-sm font-bold mb-2">Prénom de l'enfant</label>
          <input 
            type="text" 
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Ex: Timéo" 
            className="w-full p-4 rounded-xl bg-white/10 border border-white/20 focus:border-yellow-400 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-indigo-200 text-sm font-bold mb-2">Âge (pour adapter le récit)</label>
          <select 
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full p-4 rounded-xl bg-white/10 border border-white/20 focus:border-yellow-400 outline-none appearance-none bg-indigo-900"
          >
            <option>3-5 ans (Histoires douces)</option>
            <option>6-8 ans (Action et Mystère)</option>
            <option>9-12 ans (Grandes épopées)</option>
          </select>
        </div>

        <div className="pt-6">
          <button 
            onClick={handleCreateMagic}
            disabled={loading}
            className={}
          >
            {loading ? 'PRÉPARATION DE LA MAGIE...' : 'CRÉER LA MAGIE ✨'}
          </button>
        </div>
      </div>
    </main>
  );
}
