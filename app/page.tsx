import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0f0f1a] border-8 border-pink-500">
      <div className="max-w-md w-full text-center space-y-12">
        <div className="relative transform -rotate-2">
          <div className="absolute inset-0 bg-amber-500 transform rotate-3 border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -z-10"></div>
          <div className="bg-indigo-900 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h1 className="text-red-600 text-9xl bg-white p-10 font-black tracking-tighter uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              TEST VERCEL ROUGE
            </h1>
            <div className="mt-4 bg-amber-500 text-black font-bold py-1 px-4 inline-block border-2 border-black uppercase text-sm">
              Édition Légendaire
            </div>
          </div>
        </div>

        <div className="bg-amber-100 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
          <p className="text-xl font-bold italic leading-tight text-black">
            "Où chaque enfant devient le héros de sa propre légende..."
          </p>
        </div>

        <div className="pt-6">
          <Link href="/choose-hero" className="bg-amber-500 text-black font-bold py-6 px-10 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-2xl inline-block w-full text-center transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none">
            Commencer l'aventure ⚔️
          </Link>
        </div>
      </div>
    </main>
  );
}
