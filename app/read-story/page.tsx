'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { triggerVibration } from '@/lib/haptics';

export default function ReadStory({ searchParams }: { searchParams: { name?: string, hero?: string, world?: string, theme?: string } }) {
  const { name, hero, world, theme } = searchParams;
  const imageUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80";

  const getThemeText = () => {
    switch(theme) {
      case 'Amitié':
        return "C'était une journée placée sous le signe de l'entraide. Notre héros savait que rien n'est impossible quand on peut compter sur ses amis.";
      case 'Apprentissage':
        return "Une grande leçon attendait notre héros aujourd'hui. Chaque pas dans ce monde mystérieux était une occasion de découvrir un nouveau secret de la vie.";
      case 'Aventure':
      default:
        return "L'aventure ne faisait que commencer. Le vent soufflait doucement entre les arbres alors que notre héros s'apprêtait à vivre une expérience inoubliable...";
    }
  };

  return (
    <main className="min-h-screen pb-12 bg-[#0f0f1a]">
      <div className="relative w-full h-80 bg-indigo-950 border-b-4 border-black overflow-hidden shadow-2xl">
        <Image 
          src={imageUrl}
          alt="Illustration magique"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center text-white">
          {!imageUrl && <span className="text-center px-10 italic font-black text-2xl drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">L'IA prépare une illustration magique... ✨</span>}
        </div>
        <div className="absolute top-4 left-4">
           <div className="bg-amber-500 border-4 border-black px-4 py-1 font-black uppercase text-black transform -rotate-2 shadow-[4px_4px_0px_rgba(0,0,0,1)]">Chapitre 1</div>
        </div>
        <div className="absolute top-4 right-4">
           <div className="bg-indigo-950 border-4 border-black px-4 py-1 font-black uppercase text-white transform rotate-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] text-xs">
             MagicStory
           </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-12 relative z-10 w-full">
        <div className="mb-8 bg-indigo-900 border-4 border-black p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
          <h1 className="text-3xl sm:text-4xl font-black mb-1 text-white uppercase tracking-tighter drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] break-words">L'aventure de {name || 'ton héros'}</h1>
          <p className="text-amber-500 font-black italic text-lg sm:text-xl uppercase tracking-tight break-words">{hero} dans le monde de {world}</p>
        </div>

        <div className="bg-white border-4 border-black p-8 mb-10 shadow-[8px_8px_0px_rgba(0,0,0,1)] relative">
          <p className="text-2xl leading-relaxed font-bold text-black">
            Il était une fois, dans un monde appelé <span className="font-black underline decoration-amber-500 text-amber-600">{world}</span>, 
            un courageux <span className="font-black uppercase text-black">{hero}</span> nommé <span className="font-black text-black underline decoration-4 decoration-amber-500">{name}</span>. 
            <br /><br />
            {getThemeText()}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link 
            href="/" 
            onClick={() => triggerVibration()}
            className="bg-indigo-950 border-4 border-black p-6 text-xl font-black text-white uppercase tracking-tighter text-center hover:bg-indigo-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none"
          >
            Menu
          </Link>
          <button 
            onClick={() => triggerVibration()}
            className="bg-amber-500 border-4 border-black p-6 text-2xl font-black text-black uppercase tracking-tighter flex-1 hover:bg-amber-400 shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none"
          >
            Continuer...
          </button>
        </div>
      </div>
    </main>
  );
}
