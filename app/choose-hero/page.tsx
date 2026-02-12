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
    <main className="min-h-screen bg-indigo-950 text-white p-6">
      <h2 className="text-3xl font-bold text-center mb-10 text-yellow-400">Qui sera ton héros ?</h2>
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        {heroes.map((hero) => (
          <Link 
            href={`/choose-world?hero=${hero.name}`}
            key={hero.id} 
            className="flex flex-col items-center p-6 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
          >
            <span className="text-5xl mb-4">{hero.emoji}</span>
            <span className="font-bold">{hero.name}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
