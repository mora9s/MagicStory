'use client';

import React, { useState, useEffect } from 'react';
import { getUserRunes } from '@/lib/actions';
import { Sparkles } from 'lucide-react';

export default function RuneBalance() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    const result = await getUserRunes();
    if (result.data) {
      setBalance(result.data.balance);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-1 text-amber-400">
        <Sparkles className="w-4 h-4 animate-pulse" />
        <span className="text-sm font-bold">...</span>
      </div>
    );
  }

  if (balance === null) {
    return null;
  }

  return (
    <a 
      href="/runes" 
      className="flex items-center gap-1.5 bg-indigo-900/80 hover:bg-indigo-800 border-2 border-amber-500/50 rounded-full px-3 py-1.5 transition-all"
    >
      <Sparkles className="w-4 h-4 text-amber-400" />
      <span className="text-amber-400 font-black text-sm">{balance}</span>
      <span className="text-amber-400/70 text-xs font-bold hidden sm:inline">runes</span>
    </a>
  );
}
