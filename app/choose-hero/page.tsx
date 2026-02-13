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
    <main className="min-h-screen p-6 bg-slate-900">
      <div className="max-w-md mx-auto">
        <div className="mb-10 transform -rotate-1">
          <h2 className="text-4xl font-black text-center text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] uppercase tracking-tighter">
            Choisis ton Héros !
          </h2>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          {heroes.map((hero) => (
            <Link 
              href={`/choose-world?hero=${hero.name}`}
              key={hero.id} 
              className="bg-amber-500 border-4 border-black p-6 flex flex-col items-center hover:bg-amber-400 transition-colors shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
            >
              <div className="bg-white rounded-full p-4 border-4 border-black mb-4">
                <span className="text-5xl">{hero.emoji}</span>
              </div>
              <span className="font-black uppercase tracking-tighter text-black text-xl">
                {hero.name}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="bg-slate-500 border-4 border-black p-4 text-xl font-black text-white uppercase tracking-tighter inline-block w-full hover:bg-slate-400 shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none">
            Retour au menu
          </Link>
        </div>
      </div>
    </main>
  );
}
