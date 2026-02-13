import React from 'react';
import Link from 'next/link';

const heroes = [
  { id: 1, name: 'Chevalier', emoji: '🛡️', color: 'bg-blue-700' },
  { id: 2, name: 'Magicienne', emoji: '🧙‍♀️', color: 'bg-purple-800' },
  { id: 3, name: 'Explorateur', emoji: '🤠', color: 'bg-emerald-800' },
  { id: 4, name: 'Robot', emoji: '🤖', color: 'bg-slate-700' },
];

export default function ChooseHero() {
  return (
    <main className="min-h-screen p-6">
      <div className="max-w-md mx-auto">
        <div className="mb-10 transform -rotate-1">
          <h2 className="magic-title text-3xl text-center text-slate-100">
            Choisis ton Héros !
          </h2>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          {heroes.map((hero) => {
            const buttonColorClass = 
              hero.id === 1 ? 'comic-button-indigo' : 
              hero.id === 2 ? 'comic-button-indigo' : 
              hero.id === 3 ? 'comic-button-emerald' : 
              'comic-button-slate';
            
            return (
              <Link 
                href={`/choose-world?hero=${hero.name}`}
                key={hero.id} 
                className={`${buttonColorClass} flex flex-col items-center p-6 !p-6`}
              >
                <div className="bg-slate-100 rounded-full p-4 border-[2px] border-black mb-4 group-hover:rotate-12 transition-transform">
                  <span className="text-5xl">{hero.emoji}</span>
                </div>
                <span className="font-black uppercase tracking-tighter text-slate-100 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] text-lg">
                  {hero.name}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="comic-button-slate inline-block w-full !p-4 !text-xl">
            Retour au menu
          </Link>
        </div>
      </div>
    </main>
  );
}
