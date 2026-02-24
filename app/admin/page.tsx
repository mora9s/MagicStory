'use client';

import React, { useState, useEffect } from 'react';
import { getAllStories, getRunesStats } from '@/lib/actions';
import { Coins, Users, BookOpen, TrendingUp, Calendar, Flame, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRunes: 0,
    totalStories: 0,
    todayStories: 0,
    weekStories: 0,
    linearStories: 0,
    interactiveStories: 0,
    avgRunesPerUser: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Récupérer toutes les histoires
      const storiesResult = await getAllStories(1000);
      const stories = storiesResult.data || [];

      // Récupérer les stats runes
      const runesResult = await getRunesStats();
      const runesData = runesResult.data;

      // Calculer les stats
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const todayStories = stories.filter(s => new Date(s.created_at) >= today).length;
      const weekStories = stories.filter(s => new Date(s.created_at) >= weekAgo).length;
      const linearStories = stories.filter(s => s.story_type !== 'interactive').length;
      const interactiveStories = stories.filter(s => s.story_type === 'interactive').length;

      setStats({
        totalUsers: runesData?.totalUsers || 0,
        totalRunes: runesData?.totalRunes || 0,
        totalStories: stories.length,
        todayStories,
        weekStories,
        linearStories,
        interactiveStories,
        avgRunesPerUser: runesData?.totalUsers ? Math.round((runesData.totalRunes / runesData.totalUsers) * 10) / 10 : 0,
      });
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Erreur lors du chargement des statistiques');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-black text-white text-lg">Dashboard MagicStory</h1>
                <p className="text-white/50 text-xs">Statistiques globales</p>
              </div>
            </div>
            <Link 
              href="/" 
              className="text-white/70 hover:text-white font-bold text-sm"
            >
              Retour →
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Info */}
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 mb-8">
          <p className="text-blue-300 text-sm">
            <strong>ℹ️ Informations :</strong> Ce dashboard affiche uniquement des statistiques globales anonymisées. 
            Pour voir les détails des utilisateurs (emails, etc.), utilise le 
            <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-200">dashboard Supabase</a>.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-8 text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-400 rounded-full blur-lg opacity-50 animate-pulse" />
              <Sparkles className="relative w-12 h-12 text-amber-400 animate-spin" />
            </div>
          </div>
        ) : (
          <>
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {/* Total Users */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-white/50 text-sm">Utilisateurs inscrits</p>
                    <p className="text-4xl font-black text-white">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>

              {/* Total Runes */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                    <Coins className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-white/50 text-sm">Total Runes en circulation</p>
                    <p className="text-4xl font-black text-white">{stats.totalRunes}</p>
                    <p className="text-white/40 text-xs mt-1">
                      ~{stats.avgRunesPerUser} par utilisateur
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Stories */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-white/50 text-sm">Histoires créées</p>
                    <p className="text-4xl font-black text-white">{stats.totalStories}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* Story Types */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-white/60 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Types d'histoires
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-sm">
                        📖
                      </div>
                      <div>
                        <p className="font-bold text-white">Classiques</p>
                        <p className="text-white/40 text-xs">Histoires linéaires</p>
                      </div>
                    </div>
                    <span className="text-2xl font-black text-white">{stats.linearStories}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center text-sm">
                        🎮
                      </div>
                      <div>
                        <p className="font-bold text-white">Interactives</p>
                        <p className="text-white/40 text-xs">Dont tu es le héros</p>
                      </div>
                    </div>
                    <span className="text-2xl font-black text-white">{stats.interactiveStories}</span>
                  </div>
                </div>
              </div>

              {/* Activity */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-white/60 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Activité récente
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center justify-center">
                        <Flame className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="font-bold text-white">Aujourd'hui</p>
                        <p className="text-white/40 text-xs">Nouvelles histoires</p>
                      </div>
                    </div>
                    <span className="text-2xl font-black text-green-400">{stats.todayStories}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-bold text-white">Cette semaine</p>
                        <p className="text-white/40 text-xs">Nouvelles histoires</p>
                      </div>
                    </div>
                    <span className="text-2xl font-black text-blue-400">{stats.weekStories}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-white/60 text-sm font-bold uppercase tracking-wider mb-4">
                Actions administrateur
              </h3>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="https://app.supabase.com/project/_/editor" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity"
                >
                  <Users className="w-5 h-5" />
                  Voir les utilisateurs (Supabase)
                </a>
                
                <a 
                  href="https://app.supabase.com/project/_/sql/new" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity"
                >
                  <Coins className="w-5 h-5" />
                  Ajouter des runes (SQL Editor)
                </a>

                <button
                  onClick={loadStats}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  <Sparkles className="w-5 h-5" />
                  Rafraîchir les stats
                </button>
              </div>
            </div>

            {/* Help */}
            <div className="mt-8 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <h4 className="text-amber-400 font-bold mb-2">💡 Comment ajouter des runes ?</h4>
              <ol className="text-amber-200/80 text-sm space-y-1 list-decimal list-inside">
                <li>Clique sur "Voir les utilisateurs (Supabase)"</li>
                <li>Trouve l'utilisateur dans la table <code>auth.users</code> ou <code>user_runes</code></li>
                <li>Note son <code>user_id</code></li>
                <li>Va dans l'onglet "SQL Editor"</li>
                <li>Exécute : <code>UPDATE user_runes SET balance = balance + 10 WHERE user_id = 'ID';</code></li>
              </ol>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-white/40 text-sm">
          <p>MagicStory Dashboard • {new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </div>
    </main>
  );
}
