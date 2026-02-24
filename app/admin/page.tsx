'use client';

import React, { useState, useEffect } from 'react';
import { getAllUsersAdmin, addRunesToUser, AdminUser } from '@/lib/actions';
import { Coins, Users, BookOpen, Plus, RefreshCw, Crown, Search } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [addingRunes, setAddingRunes] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const result = await getAllUsersAdmin();
    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setUsers(result.data);
    }
    setLoading(false);
  };

  const handleAddRunes = async (userId: string) => {
    setAddingRunes(userId);
    const result = await addRunesToUser(userId, 10);
    if (result.error) {
      alert('Erreur: ' + result.error);
    } else {
      // Mettre à jour le solde localement
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, runes_balance: result.data?.newBalance || user.runes_balance + 10 }
          : user
      ));
      alert('✅ 10 runes ajoutées !');
    }
    setAddingRunes(null);
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRunes = users.reduce((sum, user) => sum + user.runes_balance, 0);
  const totalStories = users.reduce((sum, user) => sum + user.stories_count, 0);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-black text-white text-lg">Admin MagicStory</h1>
                <p className="text-white/50 text-xs">Gestion des utilisateurs</p>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-white/50 text-sm">Utilisateurs</p>
                <p className="text-3xl font-black text-white">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Coins className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-white/50 text-sm">Total Runes</p>
                <p className="text-3xl font-black text-white">{totalRunes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-white/50 text-sm">Histoires créées</p>
                <p className="text-3xl font-black text-white">{totalStories}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Refresh */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:border-amber-400 focus:outline-none"
            />
          </div>
          <button
            onClick={loadUsers}
            disabled={loading}
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Users Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-400 rounded-full blur-lg opacity-50 animate-pulse" />
              <RefreshCw className="relative w-10 h-10 text-amber-400 animate-spin" />
            </div>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="text-left py-4 px-6 text-white/60 text-sm font-bold">Utilisateur</th>
                    <th className="text-center py-4 px-6 text-white/60 text-sm font-bold">Runes</th>
                    <th className="text-center py-4 px-6 text-white/60 text-sm font-bold">Histoires</th>
                    <th className="text-left py-4 px-6 text-white/60 text-sm font-bold">Inscription</th>
                    <th className="text-right py-4 px-6 text-white/60 text-sm font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-lg">
                            👤
                          </div>
                          <div>
                            <p className="font-bold text-white">{user.email}</p>
                            <p className="text-white/40 text-xs">{user.id.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1">
                          <Coins className="w-4 h-4 text-amber-400" />
                          <span className="font-black text-amber-400">{user.runes_balance}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-3 py-1">
                          <BookOpen className="w-4 h-4 text-purple-400" />
                          <span className="font-bold text-purple-400">{user.stories_count}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-white/60 text-sm">
                          {new Date(user.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleAddRunes(user.id)}
                          disabled={addingRunes === user.id}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-bold py-2 px-4 rounded-xl transition-all disabled:opacity-50"
                        >
                          {addingRunes === user.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                          +10 runes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-white/40">
                <p>Aucun utilisateur trouvé</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-white/40 text-sm">
          <p>MagicStory Admin • {new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </div>
    </main>
  );
}
