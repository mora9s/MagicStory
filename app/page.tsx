'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { triggerVibration } from '@/lib/haptics';
import { createClient } from '@/lib/supabase/client';
import { 
  Sparkles, BookOpen, Star, Users, Wand2, Heart, 
  Zap, Crown, ChevronRight, Sparkle, Gift, Moon, Sun,
  Compass, Scroll, ArrowRight, Play, Quote
} from 'lucide-react';
import RuneBalance from './components/RuneBalance';
import AuthHandler from './components/AuthHandler';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setLoading(false);
    };
    checkAuth();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCreateStory = () => {
    triggerVibration();
    if (isAuthenticated) {
      router.push('/choose-hero');
    } else {
      router.push('/auth/login?redirectTo=/choose-hero');
    }
  };

  const testimonials = [
    { name: "Marie", role: "Maman de 2 enfants", text: "Mes enfants adorent entendre des histoires où ils sont les héros !" },
    { name: "Pierre", role: "Papa", text: "Magique ! L'IA crée vraiment des histoires personnalisées et touchantes." },
    { name: "Sophie", role: "Enseignante", text: "J'utilise ça en classe, les enfants sont captivés à chaque fois." },
  ];

  const features = [
    { icon: Wand2, title: "IA Générative", desc: "Des histoires uniques à chaque fois", color: "from-amber-400 to-orange-500" },
    { icon: Users, title: "Héros Personnalisés", desc: "1 ou 2 héros, à vous de choisir", color: "from-purple-400 to-pink-500" },
    { icon: Sparkles, title: "Illustrations Magiques", desc: "Images générées pour chaque histoire", color: "from-cyan-400 to-blue-500" },
    { icon: Compass, title: "Choisissez l'Aventure", desc: "Histoires interactives avec choix", color: "from-green-400 to-emerald-500" },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <Suspense fallback={null}>
        <AuthHandler />
      </Suspense>

      {/* Background Stars Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.8,
            }}
          />
        ))}
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[100px] animate-pulse delay-2000" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 p-4 sm:p-6 backdrop-blur-sm bg-slate-950/50 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-slate-950" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-tight">
                <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  Magic
                </span>
                <span className="text-white">Stories</span>
              </span>
              <span className="text-white/40 text-xs -mt-1">L'IA qui créé tes histoires</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <RuneBalance />
            <Link 
              href="/library" 
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-sm font-medium"
            >
              <Scroll className="w-4 h-4 text-amber-400" />
              Bibliothèque
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-4 sm:px-6 pt-16 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full px-4 py-2 mb-8">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-amber-300">
                  Propulsé par l'Intelligence Artificielle
                </span>
              </div>

              {/* Big Title */}
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black mb-6 leading-[0.9]">
                <span className="block text-white">
                  Magic
                </span>
                <span className="block bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
                  Stories
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-white/70 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Crée des <span className="text-amber-400 font-semibold">histoires magiques</span> où{' '}
                <span className="text-purple-400 font-semibold">ton héros</span> est la star.
                <br />
                <span className="text-base text-white/50">Enfants, parents, amis... tous peuvent devenir légendaires !</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button 
                  onClick={handleCreateStory}
                  disabled={loading}
                  className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-lg py-5 px-10 rounded-2xl shadow-2xl shadow-amber-500/30 transition-all hover:scale-105 hover:shadow-amber-500/50"
                >
                  <Play className="w-5 h-5" fill="currentColor" />
                  {isAuthenticated ? 'Créer une histoire' : 'Commencer gratuitement'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <Link 
                  href="/library" 
                  className="flex items-center justify-center gap-2 text-white/70 hover:text-white font-semibold py-5 px-8 transition-colors"
                >
                  <BookOpen className="w-5 h-5" />
                  Voir mes histoires
                </Link>
              </div>

              {/* Social Proof */}
              <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-white/50 text-sm">
                <div className="flex -space-x-3">
                  {['👧', '👦', '🧒', '👶'].map((emoji, i) => (
                    <div key={i} className="w-10 h-10 bg-slate-800 border-2 border-slate-950 rounded-full flex items-center justify-center text-lg">
                      {emoji}
                    </div>
                  ))}
                </div>
                <p>Rejoint par <span className="text-amber-400 font-bold">1000+ familles</span></p>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="relative z-10 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-sm border border-white/10 rounded-3xl p-8 transform hover:scale-105 transition-transform duration-500">
                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl animate-bounce-slow">
                  <Wand2 className="w-12 h-12 text-slate-950" />
                </div>
                
                <div className="absolute -bottom-4 -left-4 bg-gradient-to-br from-purple-500 to-pink-500 px-4 py-2 rounded-xl shadow-lg">
                  <span className="font-bold text-white">✨ 100% Gratuit</span>
                </div>

                {/* Book Mockup */}
                <div className="aspect-[3/4] bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl shadow-inner overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 to-purple-600/90 flex flex-col items-center justify-center text-white p-6">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                      <Sparkles className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-center mb-2">
                      Ton Histoire
                    </h3>
                    <p className="text-white/80 text-center text-sm">
                      Commence ton aventure magique...
                    </p>
                    <div className="mt-6 flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-amber-400" fill="currentColor" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-2xl font-black text-amber-400">∞</p>
                    <p className="text-xs text-white/50">Possibilités</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-2xl font-black text-purple-400">2</p>
                    <p className="text-xs text-white/50">Types d'histoires</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-2xl font-black text-pink-400">2</p>
                    <p className="text-xs text-white/50">Héros max</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 px-4 sm:px-6 py-24 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Pourquoi Magic Stories ?
              </span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Une expérience unique propulsée par l'IA pour créer des souvenirs magiques
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className="group relative bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all hover:-translate-y-2 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-white/60 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 px-4 sm:px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              Comment ça <span className="text-amber-400">marche</span> ?
            </h2>
            <p className="text-white/60 text-lg">
              Trois étapes simples pour créer ton histoire
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-1/4 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-amber-500/50 via-purple-500/50 to-pink-500/50" />
            
            {[
              { 
                step: "01", 
                icon: Users, 
                title: "Crée tes héros", 
                desc: "Choisis 1 ou 2 personnages, leur nom, âge et apparence. Tout le monde peut devenir héros !",
                color: "from-amber-500 to-orange-500"
              },
              { 
                step: "02", 
                icon: Sparkles, 
                title: "L'IA génère", 
                desc: "Notre intelligence artificielle crée une histoire unique avec des illustrations personnalisées.",
                color: "from-purple-500 to-pink-500"
              },
              { 
                step: "03", 
                icon: BookOpen, 
                title: "Lis & rejoue", 
                desc: "Profite de l'histoire, rejoue avec des choix différents, ou crée une nouvelle aventure !",
                color: "from-cyan-500 to-blue-500"
              },
            ].map((item, i) => (
              <div key={i} className="relative text-center group">
                <div className={`w-20 h-20 mx-auto bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform relative z-10`}>
                  <item.icon className="w-10 h-10 text-white" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-950 border-2 border-white/20 rounded-full flex items-center justify-center text-xs font-black">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Types */}
      <section className="relative z-10 px-4 sm:px-6 py-24 bg-slate-950/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              Deux types d'<span className="text-amber-400">aventures</span>
            </h2>
            <p className="text-white/60 text-lg">
              Choisis l'expérience qui te convient le mieux
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Classique */}
            <div className="group relative bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-3xl p-8 hover:border-amber-500/40 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-colors" />
              
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen className="w-8 h-8 text-slate-950" />
              </div>
              
              <h3 className="text-2xl font-black mb-3">Aventure Classique</h3>
              <p className="text-white/70 mb-6">
                Une histoire complète et linéaire, parfaite pour se faire raconter une belle histoire avant de dormir. Avec illustrations et mode audio.
              </p>
              
              <ul className="space-y-2 mb-6">
                {['Histoire complète', 'Illustrations générées', 'Mode lecture audio', 'Parfaite pour le coucher'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-white/60">
                    <Star className="w-4 h-4 text-amber-400" fill="currentColor" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">1 rune</span>
                <span className="text-white/40">• Gratuit</span>
              </div>
            </div>

            {/* Interactive */}
            <div className="group relative bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-3xl p-8 hover:border-purple-500/40 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors" />
              
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                <Compass className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-black mb-3">Dont tu es le héros</h3>
              <p className="text-white/70 mb-6">
                Une histoire interactive où TU fais les choix ! 2 décisions importantes qui mènent à différentes fins. Plus immersive et engageante.
              </p>
              
              <ul className="space-y-2 mb-6">
                {['Choix multiples', '2 fins différentes', 'Plus immersive', 'Rejouable'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-white/60">
                    <Star className="w-4 h-4 text-purple-400" fill="currentColor" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2">
                <span className="text-purple-400 font-bold">2 runes</span>
                <span className="text-white/40">• Gratuit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 px-4 sm:px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              Ils <span className="text-amber-400">adorent</span> Magic Stories
            </h2>
            <p className="text-white/60 text-lg">
              Des parents, des enfants, des enseignants...
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div 
                key={i} 
                className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl p-6 relative"
              >
                <Quote className="absolute top-4 right-4 w-8 h-8 text-white/10" />
                <p className="text-white/80 mb-4 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center font-bold text-slate-950">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{testimonial.name}</p>
                    <p className="text-white/50 text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 px-4 sm:px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-pink-500/20 border border-amber-500/30 rounded-3xl p-8 sm:p-16 text-center overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
            </div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
                <Sparkles className="w-10 h-10 text-slate-950" />
              </div>
              
              <h2 className="text-4xl sm:text-5xl font-black mb-4">
                Prêt à créer ta première{' '}
                <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  histoire magique
                </span> ?
              </h2>
              
              <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
                Commence gratuitement et offre à ton héros une aventure dont il se souviendra.
              </p>
              
              <button 
                onClick={handleCreateStory}
                disabled={loading}
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-lg py-5 px-12 rounded-2xl shadow-2xl shadow-amber-500/30 transition-all hover:scale-105"
              >
                <Wand2 className="w-6 h-6" />
                {isAuthenticated ? 'Créer mon histoire' : 'Commencer gratuitement'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <p className="mt-4 text-white/40 text-sm">
                ✨ 100% gratuit • Sans inscription obligatoire • Illimité
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-4 sm:px-6 py-12 border-t border-white/10 bg-slate-950/80">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-slate-950" />
              </div>
              <span className="font-black text-xl">
                <span className="text-amber-400">Magic</span>
                <span className="text-white">Stories</span>
              </span>
            </div>
            
            <div className="flex items-center gap-6 text-white/50 text-sm">
              <Link href="/library" className="hover:text-white transition-colors">Bibliothèque</Link>
              <Link href="/parent" className="hover:text-white transition-colors">Mes Héros</Link>
              <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            </div>
            
            <p className="text-white/30 text-sm">
              Propulsé par l'IA • Fait avec ❤️ pour tous les héros
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
