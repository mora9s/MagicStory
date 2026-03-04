'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  User, Star, LogOut, Gift, BookOpen, ChevronRight,
  Cat, Globe
} from 'lucide-react';
import { QuestMap } from '../components/QuestMap';
import { getUserProgression, getUserPets, getUserWorlds } from '@/lib/actions';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [progression, setProgression] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [worlds, setWorlds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const supabase = createClient();
    
    // Récupérer l'utilisateur
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser);
    
    if (currentUser) {
      // Récupérer progression
      const progResult = await getUserProgression();
      if (progResult.data) {
        setProgression(progResult.data);
      }
      
      // Récupérer animaux et mondes
      const petsResult = await getUserPets();
      const worldsResult = await getUserWorlds();
      
      if (petsResult.data) setPets(petsResult.data);
      if (worldsResult.data) setWorlds(worldsResult.data);
    }
    
    setLoading(false);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-amber-400 text-2xl animate-pulse">Chargement...</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-white mb-4">Tu n&apos;es pas connecté</p>
          <Link 
            href="/auth/login"
            className="px-6 py-3 bg-amber-500 text-black font-bold rounded-xl"
          >
            Se connecter
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-slate-950" />
            </div>
            <span className="font-black text-xl">
              <span className="text-amber-400">Magic</span>
              <span className="text-white">Stories</span>
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-full text-sm font-medium hover:bg-red-500/30"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profil header */}
        <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-3xl p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-3xl">
              <User className="w-10 h-10 text-slate-950" />
            </div>
            <div>
              <h1 className="text-3xl font-black">Mon Profil</h1>
              <p className="text-white/50">{user.email}</p>
            </div>
          </div>
        </div>

        {progression && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <Star className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className="text-3xl font-black">{progression.current_level}</p>
                <p className="text-white/50 text-sm">Niveau</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <span className="text-3xl">⚡</span>
                <p className="text-3xl font-black mt-2">{progression.current_xp}</p>
                <p className="text-white/50 text-sm">XP Total</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <BookOpen className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-3xl font-black">{progression.total_stories_read}</p>
                <p className="text-white/50 text-sm">Histoires lues</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <Cat className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                <p className="text-3xl font-black">{pets.length}</p>
                <p className="text-white/50 text-sm">Compagnons</p>
              </div>
            </div>

            {/* Carte de progression */}
            <div className="mb-8">
              <QuestMap 
                currentLevel={progression.current_level}
                currentXp={progression.current_xp}
                nextLevelXp={progression.next_level_xp}
              />
            </div>

            {/* Prochain niveau */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400" />
                  Progression vers le niveau {progression.current_level + 1}
                </h3>
                <span className="text-amber-400 font-bold">
                  {progression.current_xp} / {progression.next_level_xp} XP
                </span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all"
                  style={{ width: `${(progression.current_xp / progression.next_level_xp) * 100}%` }}
                />
              </div>
            </div>
          </>
        )}

        {/* Liens rapides */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            href="/library"
            className="flex items-center gap-4 p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors"
          >
            <BookOpen className="w-8 h-8 text-amber-400" />
            <div>
              <p className="font-bold">Ma Bibliothèque</p>
              <p className="text-white/50 text-sm">Voir mes histoires</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/30 ml-auto" />
          </Link>
          
          <Link 
            href="/parent"
            className="flex items-center gap-4 p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors"
          >
            <User className="w-8 h-8 text-purple-400" />
            <div>
              <p className="font-bold">Mes Héros</p>
              <p className="text-white/50 text-sm">Gérer mes personnages</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/30 ml-auto" />
          </Link>
          
          <Link 
            href="/rewards"
            className="flex items-center gap-4 p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors"
          >
            <Gift className="w-8 h-8 text-pink-400" />
            <div>
              <p className="font-bold">Mes Récompenses</p>
              <p className="text-white/50 text-sm">Animaux et mondes</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/30 ml-auto" />
          </Link>
          
          <Link 
            href="/"
            className="flex items-center gap-4 p-6 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl hover:opacity-90 transition-colors"
          >
            <span className="text-3xl">✨</span>
            <div>
              <p className="font-bold">Créer une histoire</p>
              <p className="text-white/50 text-sm">Commencer l&apos;aventure</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/30 ml-auto" />
          </Link>
        </div>
      </div>
    </main>
  );
}
