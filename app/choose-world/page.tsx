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
  
  // Récupérer les infos des héros
  const hero1Name = searchParams.get('hero1Name');
  const hero1Age = searchParams.get('hero1Age');
  const hero1Type = searchParams.get('hero1Type');
  const hero2Name = searchParams.get('hero2Name');
  const hero2Age = searchParams.get('hero2Age');
  const hero2Type = searchParams.get('hero2Type');

  const hasTwoHeroes = !!hero2Name;

  // Construire l'URL de base avec les paramètres des héros
  const buildUrl = (worldName: string) => {
    let url = `/story-settings?hero1Name=${encodeURIComponent(hero1Name || '')}&hero1Age=${hero1Age}&hero1Type=${hero1Type}&world=${encodeURIComponent(worldName)}`;
    if (hero2Name) {
      url += `&hero2Name=${encodeURIComponent(hero2Name)}&hero2Age=${hero2Age}&hero2Type=${hero2Type}`;
    }
    return url;
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto px-4">
      {/* Résumé des héros */}
      <div className="bg-indigo-900 border-4 border-black p-4 mb-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
        <p className="text-white text-center">
          <span className="font-bold text-amber-400">{hero1Name}</span>
          {hasTwoHeroes && (
            <>
              {' '}et <span className="font-bold text-purple-400">{hero2Name}</span>
            </>
          )}
          {' '}partent à l'aventure
        </p>
      </div>

      {worlds.map((world) => (
        <NextLink 
          href={buildUrl(world.name)}
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
