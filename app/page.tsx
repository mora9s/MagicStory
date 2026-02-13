import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-950 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative">
          <h1 className="text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-yellow-500">
            MagicStory
          </h1>
          <div className="absolute -top-4 -right-4 animate-bounce">✨</div>
        </div>
        <p className="text-xl text-purple-200 font-medium italic">
          "Où chaque enfant devient le héros de sa propre légende..."
        </p>
        <div className="pt-10">
          <Link href="/choose-hero" className="group relative w-full inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-indigo-600 rounded-xl hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.4)]">
            <span className="relative">Commencer l'aventure 🚀</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
