'use client';

import React from 'react';
import Link from 'next/link';
import { triggerVibration } from '@/lib/haptics';
import { Sparkles, BookOpen, Star, Users } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-950 via-[#0f0f1a] to-purple-950 text-white font-sans overflow-hidden relative">
      {/* Étoiles décoratives en arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Star className="absolute top-20 left-10 w-8 h-8 text-amber-400 animate-pulse opacity-60" />
        <Star className="absolute top-32 right-20 w-6 h-6 text-purple-400 animate-pulse opacity-40" style={{ animationDelay: '0.5s' }} />
        <Star className="absolute bottom-40 left-20 w-10 h-10 text-amber-300 animate-pulse opacity-50" style={{ animationDelay: '1s' }} />
        <Star className="absolute bottom-32 right-10 w-5 h-5 text-pink-400 animate-pulse opacity-60" style={{ animationDelay: '1.5s' }} />
        <Sparkles className="absolute top-1/4 left-1/4 w-12 h-12 text-amber-200 animate-bounce opacity-30" />
        <Sparkles className="absolute bottom-1/3 right-1/4 w-8 h-8 text-purple-300 animate-bounce opacity-30" style={{ animationDelay: '0.7s' }} />
      </div>

      <div className="max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl w-full text-center space-y-10 px-4 relative z-10">
        {/* Logo avec effet flottant */}
        <div className="relative transform hover:scale-105 transition-transform duration-300 max-w-full">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 transform rotate-2 border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -z-10 rounded-lg"></div>
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 border-4 border-black p-6 sm:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-lg relative overflow-hidden">
            {/* Effet de brillance */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent"></div>
            
            <div className="flex items-center justify-center gap-3 mb-2">
              <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 text-amber-400" />
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-amber-300 animate-pulse" />
            </div>
            
            <h1 className="text-amber-400 text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter uppercase italic drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] break-words bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
              MagicStory
            </h1>
            
            <p className="text-indigo-200 text-sm sm:text-base font-bold uppercase tracking-widest mt-2">
              L'aventure commence ici ✨
            </p>
          </div>
        </div>

        {/* Carte de tagline avec plus de style */}
        <div className="bg-white border-4 border-black p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transform -rotate-1 hover:rotate-0 transition-transform duration-300 relative">
          <div className="absolute -top-3 -left-3 bg-amber-500 border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-wider text-black transform -rotate-6">
            Nouveau !
          </div>
          <p className="text-2xl font-bold italic leading-relaxed text-black">
            "Où chaque enfant devient le héros de sa propre légende..."
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <span className="bg-indigo-100 border-2 border-black px-3 py-1 text-sm font-bold text-indigo-900">🎭 Personnages uniques</span>
            <span className="bg-amber-100 border-2 border-black px-3 py-1 text-sm font-bold text-amber-900">✨ Histoires magiques</span>
          </div>
        </div>

        {/* Boutons */}
        <div className="pt-4 space-y-4">
          <Link 
            href="/choose-hero" 
            onClick={() => triggerVibration()}
            className="group relative bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:via-orange-400 hover:to-amber-400 text-black font-extrabold py-7 px-12 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-2xl sm:text-3xl inline-block w-full text-center transition-all active:translate-x-2 active:translate-y-2 active:shadow-none uppercase tracking-widest rounded-lg overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              Commencer l'aventure
              <span className="text-3xl group-hover:rotate-12 transition-transform">⚔️</span>
            </span>
            {/* Effet de brillance au hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </Link>
          
          <Link 
            href="/library" 
            onClick={() => triggerVibration()}
            className="group bg-indigo-800 hover:bg-indigo-700 text-white font-extrabold py-5 px-12 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-xl inline-block w-full text-center transition-all active:translate-x-1 active:translate-y-1 active:shadow-none uppercase tracking-widest rounded-lg flex items-center justify-center gap-3"
          >
            <BookOpen className="w-6 h-6 group-hover:scale-110 transition-transform" />
            Mes histoires
          </Link>
          
          <Link 
            href="/parent" 
            onClick={() => triggerVibration()}
            className="group bg-purple-700 hover:bg-purple-600 text-white font-extrabold py-4 px-12 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-lg inline-block w-full text-center transition-all active:translate-x-1 active:translate-y-1 active:shadow-none uppercase tracking-widest rounded-lg flex items-center justify-center gap-3"
          >
            <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Espace Parent
          </Link>
        </div>

        {/* Footer avec info */}
        <div className="pt-8 text-indigo-300 text-sm">
          <p className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Propulsé par l'IA · Gratuit · Sans inscription
            <Sparkles className="w-4 h-4" />
          </p>
        </div>
      </div>
    </main>
  );
}
