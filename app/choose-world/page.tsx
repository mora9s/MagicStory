 'use client';
import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const worlds = [
  { id: 1, name: 'Forêt Enchantée', emoji: '🌳', description: 'Des arbres qui parlent.' },
  { id: 2, name: 'Espace Infini', emoji: '🚀', description: 'Des planètes en bonbons.' },
  { id: 3, name: 'Cité des Nuages', emoji: '☁️', description: 'Un château qui flotte.' },
  { id: 4, name: 'Océan Secret', emoji: '🐙', description: 'Des cités de corail.' },
];

export default function ChooseWorld() {
  const searchParams = useSearchParams();
  const hero = searchParams.get('hero') || 'Magicien';

  return (
    <main className="min-h-screen bg-indigo-950 text-white p-6">
      <h2 className="text-3xl font-bold text-center mb-10 text-yellow-400">Où se passe ton aventure ?</h2>
      <div className="space-y-4 max-w-md mx-auto">
        {worlds.map((world) => (
          <Link 
            href={`/story-settings?hero=${hero}&world=${world.name}`}
            key={world.id} 
            className="w-full flex items-center p-4 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
          >
            <span className="text-4xl mr-4">{world.emoji}</span>
            <div>
              <span className="block font-bold text-lg">{world.name}</span>
              <span className="block text-sm text-indigo-200">{world.description}</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
