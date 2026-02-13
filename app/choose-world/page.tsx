'use client';
import React, { Suspense } from 'react';
import Link from 'next/navigation';
import { useSearchParams } from 'next/navigation';

// Correction de l'import Link de next/navigation vers next/link
import NextLink from 'next/link';

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
        <NextLink 
          href={`/story-settings?hero=${hero}&world=${world.name}`}
          key={world.id} 
          className="bg-amber-500 border-4 border-black p-4 w-full flex items-center hover:bg-amber-400 transition-colors shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
        >
          <div className="bg-white rounded-lg p-2 border-2 border-black mr-4">
            <span className="text-4xl">{world.emoji}</span>
          </div>
          <div className="text-left">
            <span className="block font-black uppercase tracking-tight text-black text-lg">{world.name}</span>
            <span className="block text-sm text-black font-bold italic">{world.description}</span>
          </div>
        </NextLink>
      ))}
      <div className="pt-4">
        <NextLink href="/choose-hero" className="bg-slate-500 border-4 border-black p-4 text-xl font-black text-white uppercase tracking-tighter inline-block w-full text-center hover:bg-slate-400 shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none">
          Changer de héros
        </NextLink>
      </div>
    </div>
  );
}

export default function ChooseWorld() {
  return (
    <main className="min-h-screen p-6 bg-slate-900">
      <div className="max-w-md mx-auto mb-10 transform rotate-1">
        <h2 className="text-4xl font-black text-center text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] uppercase tracking-tighter">Où se passe l'aventure ?</h2>
      </div>
      <Suspense fallback={<div className="text-center font-bold text-amber-300 animate-pulse text-2xl">Chargement des mondes magiques...</div>}>
        <WorldContent />
      </Suspense>
    </main>
  );
}
