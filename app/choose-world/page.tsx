'use client';
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import NextLink from 'next/link';
import { triggerVibration } from '@/lib/haptics';

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
    <div className="space-y-6 max-w-2xl mx-auto px-4">
      {worlds.map((world) => (
        <NextLink 
          href={`/story-settings?hero=${hero}&world=${world.name}`}
          key={world.id} 
          onClick={() => triggerVibration()}
          className="bg-amber-500 border-4 border-black p-4 w-full flex items-center hover:bg-amber-400 transition-colors shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none"
        >
          <div className="bg-white p-2 border-2 border-black mr-4 shadow-[3px_3px_0px_rgba(0,0,0,1)]">
            <span className="text-4xl">{world.emoji}</span>
          </div>
          <div className="text-left">
            <span className="block font-black uppercase tracking-tight text-black text-lg">{world.name}</span>
            <span className="block text-sm text-black font-bold italic">{world.description}</span>
          </div>
        </NextLink>
      ))}
      <div className="pt-4">
        <NextLink 
          href="/choose-hero" 
          onClick={() => triggerVibration()}
          className="bg-indigo-950 border-4 border-black p-4 text-xl font-black text-white uppercase tracking-tighter inline-block w-full text-center hover:bg-indigo-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none"
        >
          Retour
        </NextLink>
      </div>
    </div>
  );
}

export default function ChooseWorld() {
  return (
    <main className="min-h-screen p-6 bg-[#0f0f1a]">
      <div className="max-w-2xl mx-auto px-4 mb-10 transform rotate-1">
        <h1 className="text-amber-500 text-2xl font-black uppercase text-center mb-2 tracking-widest drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
          MagicStory
        </h1>
        <h2 className="text-3xl sm:text-4xl font-black text-center text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] uppercase tracking-tighter break-words">
          Où se passe l'aventure ?
        </h2>
      </div>
      <Suspense fallback={<div className="text-center font-bold text-amber-500 animate-pulse text-2xl uppercase tracking-widest">Ouverture du portail...</div>}>
        <WorldContent />
      </Suspense>
    </main>
  );
}
