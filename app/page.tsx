import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0f0f1a] text-amber-500 font-sans">
      <div className="max-w-md w-full text-center space-y-12">
        {/* Style Comic */}
        <div className="relative transform -rotate-1">
          <div className="absolute inset-0 bg-amber-500 transform rotate-2 border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -z-10"></div>
          <div className="bg-indigo-950 border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h1 className="text-amber-500 text-6xl font-black tracking-tighter uppercase italic drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              Magic Story
            </h1>
            <div className="mt-4 bg-amber-500 text-black font-bold py-1 px-4 inline-block border-2 border-black uppercase text-sm">
              Deploy Test Clean Build
            </div>
          </div>
        </div>

        <div className="bg-amber-100 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
          <p className="text-xl font-bold italic leading-tight text-black">
            "Où chaque enfant devient le héros de sa propre légende..."
          </p>
        </div>

        <div className="pt-6">
          <Link href="/choose-hero" className="bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold py-6 px-10 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-2xl inline-block w-full text-center transition-all active:translate-x-1 active:translate-y-1 active:shadow-none uppercase tracking-widest">
            Commencer ⚔️
          </Link>
        </div>
      </div>
    </main>
  );
}
