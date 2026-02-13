import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
      <div className="max-w-md w-full text-center space-y-12">
        <div className="relative transform -rotate-2">
          <div className="absolute inset-0 bg-amber-500 transform rotate-3 border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -z-10"></div>
          <div className="comic-panel">
            <h1 className="magic-title text-white">
              MagicStory
            </h1>
            <div className="mt-4 comic-label">
              Édition Légendaire
            </div>
          </div>
        </div>

        <div className="parchment transform rotate-1">
          <p className="text-xl font-bold italic leading-tight">
            "Où chaque enfant devient le héros de sa propre légende..."
          </p>
        </div>

        <div className="pt-6">
          <Link href="/choose-hero" className="comic-button text-2xl inline-block w-full text-center">
            Commencer l'aventure ⚔️
          </Link>
        </div>
      </div>
    </main>
  );
}
