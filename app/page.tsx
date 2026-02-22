'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { triggerVibration } from '@/lib/haptics';
import { 
  Sparkles, BookOpen, Star, Users, Wand2, Heart, 
  Zap, Crown, ChevronRight, Sparkle, Gift
} from 'lucide-react';
import RuneBalance from './components/RuneBalance';

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a1a] text-white overflow-x-hidden">
      {/* Background animé */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Cercles lumineux animés */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-600/15 rounded-full blur-[100px] animate-pulse delay-2000" />
          
          {/* Étoiles scintillantes */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              <BookOpen className="w-5 h-5 text-black" />
            </div>
            <span className="font-black text-xl tracking-tight">
              <span className="text-amber-400">Magic</span>
              <span className="text-white">Stories</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <RuneBalance />
            
            <Link 
              href="/parent" 
              onClick={() => triggerVibration()}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-sm font-medium"
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Mes Héros</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-4 sm:px-6 pt-8 pb-16">
        <div className="max-w-5xl mx-auto text-center">
          
          {/* Badge animé */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full px-4 py-2 mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
            <span className="text-sm font-semibold text-amber-300">
              ✨ L'IA qui crée des histoires uniques
            </span>
          </div>

          {/* Titre principal avec effet */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
            <span className="block bg-gradient-to-r from-white via-amber-200 to-amber-400 bg-clip-text text-transparent">
              Crée ton
            </span>
            <span className="block mt-2">
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
                héros légendaire
              </span>
            </span>
          </h1>

          {/* Sous-titre */}
          <p className="text-lg sm:text-xl text-indigo-200/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Des histoires magiques et personnalisées où{' '}
            <span className="text-amber-400 font-semibold">ton héros</span> est le protagoniste. 
            Enfants, parents, animaux... tous peuvent devenir héros !
          </p>

          {/* CTA Principal */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link 
              href="/choose-hero" 
              onClick={() => triggerVibration()}
              className="group relative flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-lg py-5 px-10 rounded-2xl shadow-2xl shadow-amber-500/30 transition-all hover:scale-105 hover:shadow-amber-500/50 overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
              <Sparkles className="w-6 h-6 relative z-10" />
              <span className="relative z-10">Créer une histoire</span>
              <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              href="/library" 
              onClick={() => triggerVibration()}
              className="flex items-center gap-2 text-indigo-300 hover:text-white font-semibold py-5 px-8 rounded-2xl border border-white/10 hover:bg-white/5 transition-all"
            >
              <BookOpen className="w-5 h-5" />
              Voir mes histoires
            </Link>
          </div>

          {/* Illustration principale */}
          <div className="relative max-w-lg mx-auto mb-16">
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl" />
            
            <div className="relative bg-gradient-to-br from-indigo-900/80 to-purple-900/80 backdrop-blur-sm border border-white/10 rounded-3xl p-8 overflow-hidden">
              {/* Décoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
              
              {/* Contenu visuel */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/30 mb-4 animate-bounce-slow">
                  <Wand2 className="w-12 h-12 text-black" />
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="w-5 h-5 text-amber-400 animate-pulse" 
                      style={{ animationDelay: `${i * 200}ms` }}
                      fill="currentColor" 
                    />
                  ))}
                </div>
                
                <p className="text-indigo-200 text-sm">
                  Plus de <span className="text-amber-400 font-bold">1 000</span> histoires créées
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-4 sm:px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Comment ça marche ?
            </span>
          </h2>
          <p className="text-indigo-300 text-center mb-12 max-w-xl mx-auto">
            En 3 étapes simples, créez une histoire magique et unique
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Étape 1 */}
            <div className="group relative bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-amber-500/30 transition-all hover:-translate-y-1">
              <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center font-black text-black text-lg shadow-lg">
                1
              </div>
              <div className="w-14 h-14 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Choisis les héros</h3>
              <p className="text-indigo-300/80 text-sm leading-relaxed">
                Sélectionne 1 ou 2 héros, leur âge, et leurs caractéristiques.
              </p>
            </div>

            {/* Étape 2 */}
            <div className="group relative bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all hover:-translate-y-1">
              <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-lg">
                2
              </div>
              <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">L'IA crée l'histoire</h3>
              <p className="text-indigo-300/80 text-sm leading-relaxed">
                Notre intelligence artificielle génère une histoire unique avec illustrations.
              </p>
            </div>

            {/* Étape 3 */}
            <div className="group relative bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-pink-500/30 transition-all hover:-translate-y-1">
              <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-lg">
                3
              </div>
              <div className="w-14 h-14 bg-pink-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Lisez et partagez</h3>
              <p className="text-indigo-300/80 text-sm leading-relaxed">
                Profitez de l'histoire, rejouez avec des choix différents, ou téléchargez en PDF.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fonctionnalités Section */}
      <section className="relative z-10 px-4 sm:px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Heart, text: "Histoires avec liens familiaux", color: "text-pink-400", bg: "bg-pink-500/10" },
              { icon: Zap, text: "Choisissez votre aventure", color: "text-amber-400", bg: "bg-amber-500/10" },
              { icon: Crown, text: "Illustrations générées par IA", color: "text-purple-400", bg: "bg-purple-500/10" },
              { icon: Gift, text: "Gratuit et sans inscription", color: "text-green-400", bg: "bg-green-500/10" },
            ].map((feature, i) => (
              <div 
                key={i} 
                className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
              >
                <div className={`w-10 h-10 ${feature.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <span className="text-sm font-medium text-indigo-200">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative z-10 px-4 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-3xl p-8 sm:p-12 text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black mb-4">
                Prêt à créer une{' '}
                <span className="text-amber-400">histoire magique</span> ?
              </h2>
              <p className="text-indigo-200 mb-8 max-w-lg mx-auto">
                En quelques clics, offre à ton héros une aventure dont il sera la star.
              </p>
              
              <Link 
                href="/choose-hero" 
                onClick={() => triggerVibration()}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-lg py-4 px-10 rounded-2xl shadow-xl shadow-amber-500/30 transition-all hover:scale-105"
              >
                <Sparkle className="w-6 h-6" />
                Commencer l'aventure
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-4 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-lg">
            <span className="text-amber-400">Magic</span>
            <span className="text-white">Stories</span>
          </span>
        </div>
        <p className="text-indigo-400/60 text-sm">
          Propulsé par l'IA · Gratuit · Fait avec ❤️ pour tous les héros
        </p>
      </footer>
    </main>
  );
}
