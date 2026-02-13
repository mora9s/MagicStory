import React from 'react';
import Link from 'next/link';

const heroes = [
  { id: 1, name: 'Chevalier', emoji: '🛡️' },
  { id: 2, name: 'Magicienne', emoji: '🧙‍♀️' },
  { id: 3, name: 'Explorateur', emoji: '🤠' },
  { id: 4, name: 'Robot', emoji: '🤖' },
];

export default function ChooseHero() {
  return (
    <main className="min-h-screen p-6 bg-[#0f0f1a]">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-10 transform -rotate-1">
          <h1 className="text-amber-500 text-2xl font-black uppercase text-center mb-2 tracking-widest drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            MagicStory
          </h1>
          <h2 className="text-3xl sm:text-4xl font-black text-center text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] uppercase tracking-tighter break-words">
            Choisis ton Héros !
          </h2>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          {heroes.map((hero) => (
            <Link 
              href={`/choose-world?hero=${hero.name}`}
              key={hero.id} 
              className="bg-amber-500 border-4 border-black p-6 flex flex-col items-center hover:bg-amber-400 transition-colors shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none"
            >
              <div className="bg-white p-4 border-4 border-black mb-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <span className="text-5xl">{hero.emoji}</span>
              </div>
              <span className="font-black uppercase tracking-tighter text-black text-xl">
                {hero.name}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="bg-indigo-950 border-4 border-black p-4 text-xl font-black text-white uppercase tracking-tighter inline-block w-full hover:bg-indigo-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none">
            Retour
          </Link>
        </div>
      </div>
    </main>
  );
}
