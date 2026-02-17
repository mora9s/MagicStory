'use client';

import React from 'react';
import Link from 'next/link';
import { triggerVibration } from '@/lib/haptics';
import { Sparkles, BookOpen, Star, Users, Wand2 } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-950 via-purple-950 to-indigo-950 text-white font-sans">
      {/* Header minimal */}
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-amber-400" />
          <span className="font-bold text-amber-400">MagicStories</span>
        </div>
        <Link 
          href="/parent" 
          onClick={() => triggerVibration()}
          className="text-sm text-indigo-300 hover:text-white transition-colors"
        >
          Espace Parent
        </Link>
      </header>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8">
        
        {/* Logo/Titre principal */}
        <div className="text-center mb-8 sm:mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1 mb-4 sm:mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs sm:text-sm font-medium text-amber-300">Histoires personnalisées</span>
          </div>
          
          {/* Titre */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-3">
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
              MagicStories
            </span>
          </h1>
          
          {/* Tagline */}
          <p className="text-indigo-200 text-base sm:text-lg max-w-xs sm:max-w-sm mx-auto leading-relaxed">
            Crée des histoires magiques où ton enfant est le héros
          </p>
        </div>

        {/* Illustration ou visuel */}
        <div className="relative mb-8 sm:mb-10">
          <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl bg-gradient-to-br from-indigo-800/50 to-purple-800/50 border border-indigo-700/50 flex items-center justify-center relative overflow-hidden">
            {/* Cercles décoratifs */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-amber-500/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-purple-500/10 rounded-full blur-xl"></div>
            
            {/* Icône centrale */}
            <div className="relative z-10 text-center">
              <Wand2 className="w-16 h-16 sm:w-20 sm:h-20 text-amber-400 mx-auto mb-2" />
              <div className="flex justify-center gap-1">
                <Star className="w-4 h-4 text-amber-300" fill="currentColor" />
                <Star className="w-3 h-3 text-purple-300" fill="currentColor" />
                <Star className="w-4 h-4 text-amber-300" fill="currentColor" />
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="w-full max-w-xs sm:max-w-sm space-y-3">
          <Link 
            href="/choose-hero" 
            onClick={() => triggerVibration()}
            className="group flex items-center justify-center gap-2 w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold py-4 px-6 rounded-xl shadow-lg shadow-amber-500/25 transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-5 h-5" />
            <span>Créer une histoire</span>
          </Link>
          
          <Link 
            href="/library" 
            onClick={() => triggerVibration()}
            className="group flex items-center justify-center gap-2 w-full bg-indigo-800/80 hover:bg-indigo-700/80 text-white font-semibold py-3.5 px-6 rounded-xl border border-indigo-700/50 transition-all active:scale-[0.98]"
          >
            <BookOpen className="w-5 h-5" />
            <span>Mes histoires</span>
          </Link>
        </div>

        {/* Features mini */}
        <div className="mt-8 sm:mt-10 flex flex-wrap justify-center gap-3 text-xs sm:text-sm text-indigo-300">
          <span className="flex items-center gap-1.5 bg-indigo-900/50 px-3 py-1.5 rounded-full">
            <Users className="w-3.5 h-3.5" />
            1 ou 2 héros
          </span>
          <span className="flex items-center gap-1.5 bg-indigo-900/50 px-3 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Illustrations IA
          </span>
          <span className="flex items-center gap-1.5 bg-indigo-900/50 px-3 py-1.5 rounded-full">
            <BookOpen className="w-3.5 h-3.5" />
            PDF gratuit
          </span>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center">
        <p className="text-indigo-400/60 text-xs">
          Propulsé par l'IA · Gratuit · Sans inscription
        </p>
      </footer>
    </main>
  );
}
