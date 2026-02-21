'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getUserRunes, getRuneTransactions, type RuneTransaction } from '@/lib/actions';
import { RUNE_COSTS } from '@/lib/types';
import { Sparkles, ArrowLeft, History, Gem, BookOpen, BookText } from 'lucide-react';
import { triggerVibration } from '@/lib/haptics';

export default function RunesPage() {
  const [balance, setBalance] = useState<number>(0);
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [transactions, setTransactions] = useState<RuneTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [runesResult, transactionsResult] = await Promise.all([
      getUserRunes(),
      getRuneTransactions(10),
    ]);

    if (runesResult.data) {
      setBalance(runesResult.data.balance);
      setTotalEarned(runesResult.data.total_earned);
      setTotalSpent(runesResult.data.total_spent);
    }

    if (transactionsResult.data) {
      setTransactions(transactionsResult.data);
    }

    setLoading(false);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'story_creation':
        return <BookOpen className="w-5 h-5 text-purple-400" />;
      case 'bonus':
        return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'refund':
        return <History className="w-5 h-5 text-green-400" />;
      case 'purchase':
        return <Gem className="w-5 h-5 text-blue-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'story_creation':
        return 'Création d\'histoire';
      case 'bonus':
        return 'Bonus';
      case 'refund':
        return 'Remboursement';
      case 'purchase':
        return 'Achat';
      case 'admin_adjust':
        return 'Ajustement';
      default:
        return type;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0f1a] via-indigo-950 to-purple-950 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            onClick={() => triggerVibration()}
            className="bg-indigo-900 border-4 border-black p-3 text-white font-black uppercase tracking-tighter hover:bg-indigo-800 shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </Link>

          <h1 className="text-2xl sm:text-3xl font-black text-amber-400 uppercase tracking-tighter drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center gap-3">
            <Sparkles className="w-8 h-8" />
            Mes Runes
          </h1>

          <div className="w-20"></div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Sparkles className="w-12 h-12 text-amber-400 animate-spin mx-auto" />
          </div>
        ) : (
          <>
            {/* Solde principal */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 border-4 border-black p-8 mb-8 shadow-[10px_10px_0px_rgba(0,0,0,1)] text-center">
              <p className="text-black/70 font-bold uppercase tracking-wider mb-2">Solde actuel</p>
              <div className="flex items-center justify-center gap-4">
                <Sparkles className="w-12 h-12 text-black" />
                <span className="text-6xl font-black text-black">{balance}</span>
                <span className="text-2xl font-black text-black/80">runes</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-indigo-900/50 border-4 border-indigo-700 p-4 text-center rounded-lg">
                <p className="text-indigo-300 text-sm font-bold uppercase">Gagnées</p>
                <p className="text-3xl font-black text-green-400">+{totalEarned}</p>
              </div>
              <div className="bg-indigo-900/50 border-4 border-indigo-700 p-4 text-center rounded-lg">
                <p className="text-indigo-300 text-sm font-bold uppercase">Dépensées</p>
                <p className="text-3xl font-black text-red-400">-{totalSpent}</p>
              </div>
            </div>

            {/* Coûts */}
            <div className="bg-white border-4 border-black p-6 mb-8 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl font-black text-indigo-900 mb-4 flex items-center gap-2">
                <BookText className="w-6 h-6" />
                Coût des histoires
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-100 border-2 border-black">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <span className="font-bold">Histoire classique</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="font-black">{RUNE_COSTS.LINEAR_STORY}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-100 border-2 border-black">
                  <div className="flex items-center gap-3">
                    <BookText className="w-5 h-5 text-purple-600" />
                    <span className="font-bold">Histoire interactive</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="font-black">{RUNE_COSTS.INTERACTIVE_STORY}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Historique */}
            <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl font-black text-indigo-900 mb-4 flex items-center gap-2">
                <History className="w-6 h-6" />
                Historique
              </h2>

              {transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucune transaction</p>
              ) : (
                <div className="space-y-2">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 bg-slate-50 border-2 border-black"
                    >
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(tx.type)}
                        <div>
                          <p className="font-bold text-sm">{getTransactionLabel(tx.type)}</p>
                          {tx.description && (
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">
                              {tx.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className={`font-black ${
                            tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {tx.amount > 0 ? '+' : ''}
                          {tx.amount}
                        </span>
                        <Sparkles className="w-3 h-3 text-amber-500" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bouton acheter (placeholder) */}
            <div className="mt-8 text-center">
              <button
                disabled
                className="w-full bg-gray-400 text-white font-black py-4 px-8 border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 transition-all uppercase tracking-wider"
              >
                💳 Boutique (bientôt disponible)
              </button>
              <p className="text-indigo-300 text-sm mt-2">
                Pour l'instant, tu as 3 runes offertes à l&apos;inscription !
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
