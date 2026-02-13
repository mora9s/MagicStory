 'use client';
import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const worlds = [
  { id: 1, name: 'Forêt Enchantée', emoji: '🌳', description: 'Des arbres qui parlent.' },
  { id: 2, name: 'Espace Infini', emoji: '🚀', description: 'Des planètes en bonbons.' },
  { id: 3, name: 'Cité des Nuages', emoji: '☁️', description: 'Un château qui flotte.' },
  { id: 4, name: 'Océan Secret', emoji: '🐙', description: 'Des cités de corail.' },
];

function WorldContent() {
  const searchParams = useSearchParams();
  const hero = searchParams.get('hero') || 'Magicien';

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {worlds.map((world) => (
        <Link 
          href={`/story-settings?hero=${hero}&world=${world.name}`}
          key={world.id} 
          className="w-full flex items-center p-4 bg-indigo-900 border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:bg-indigo-800 transition-all group"
        >
          <div className="bg-slate-100 rounded-lg p-2 border-[2px] border-black mr-4 group-hover:rotate-3 transition-transform">
            <span className="text-4xl">{world.emoji}</span>
          </div>
          <div className="text-left">
            <span className="block font-black uppercase tracking-tight text-slate-100">{world.name}</span>
            <span className="block text-sm text-amber-200 font-bold italic">{world.description}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function ChooseWorld() {
  return (
    <main className="min-h-screen p-6">
      <div className="max-w-md mx-auto mb-10 transform rotate-1">
        <h2 className="magic-title text-3xl text-center text-slate-100">Où se passe l'aventure ?</h2>
      </div>
      <Suspense fallback={<div className="text-center font-bold text-amber-200 animate-pulse">Chargement des mondes magiques...</div>}>
        <WorldContent />
      </Suspense>
    </main>
  );
}
