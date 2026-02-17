'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { checkApiKey } from '@/lib/actions';
import { Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';

export default function TestPage() {
  const [result, setResult] = useState<{ configured: boolean; prefix: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    try {
      const status = await checkApiKey();
      setResult(status);
    } catch (e) {
      setResult({ configured: false, prefix: 'Erreur: ' + (e as Error).message });
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#0f0f1a] via-indigo-950 to-purple-950 text-white">
      <div className="max-w-md w-full space-y-8">
        <h1 className="text-4xl font-black text-center text-amber-400 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          🔧 Test Config
        </h1>

        <div className="bg-indigo-900 border-4 border-black p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] rounded-lg">
          <button
            onClick={handleTest}
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 px-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-xl transition-all active:translate-x-1 active:translate-y-1 active:shadow-none uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? 'Test en cours...' : 'Vérifier la clé API'}
          </button>

          {result && (
            <div className={`mt-6 p-4 border-4 border-black rounded-lg ${result.configured ? 'bg-green-800' : 'bg-red-800'}`}>
              <div className="flex items-center gap-3 mb-2">
                {result.configured ? (
                  <CheckCircle className="w-8 h-8 text-green-400" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                )}
                <span className="font-black text-xl">
                  {result.configured ? 'CLÉ DÉTECTÉE' : 'CLÉ NON TROUVÉE'}
                </span>
              </div>
              <p className="font-mono text-sm bg-black/30 p-2 rounded">
                {result.prefix}
              </p>
              
              {!result.configured && (
                <div className="mt-4 text-sm">
                  <p className="font-bold text-red-300">Solutions :</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-white/80">
                    <li>Vérifie que OPENAI_API_KEY est dans Vercel → Settings → Environment Variables</li>
                    <li>Redéploie après avoir ajouté la variable</li>
                    <li>Vérifie qu'il n'y a pas d'espace en début/fin de la clé</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-center">
          <Link 
            href="/"
            className="text-indigo-300 hover:text-white underline"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
