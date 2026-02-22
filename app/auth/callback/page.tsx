'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connexion en cours...');

  useEffect(() => {
    const handleAuth = async () => {
      const supabase = createClient();
      
      // Récupérer le code d'authentification
      const code = searchParams.get('code');
      // Supabase utilise redirect_to (avec underscore) dans certains cas
      const redirectTo = searchParams.get('redirectTo') || searchParams.get('redirect_to') || '/';
      
      if (!code) {
        setStatus('error');
        setMessage('Lien invalide ou expiré');
        return;
      }

      try {
        // Échanger le code contre une session
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          console.error('Auth error:', error);
          setStatus('error');
          setMessage('Erreur de connexion : ' + error.message);
          return;
        }

        // Vérifier que la session est bien créée
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setStatus('success');
          setMessage('Connecté avec succès !');
          
          // Redirection après 1 seconde
          setTimeout(() => {
            router.push(redirectTo);
            router.refresh();
          }, 1000);
        } else {
          setStatus('error');
          setMessage('Session non créée');
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setStatus('error');
        setMessage('Une erreur est survenue');
      }
    };

    handleAuth();
  }, [searchParams, router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-indigo-950 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-8 max-w-sm w-full text-center">
        {status === 'loading' && (
          <>
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">Connexion...</h1>
            <p className="text-gray-500">{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">Connecté !</h1>
            <p className="text-gray-500">{message}</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">Oups !</h1>
            <p className="text-gray-500 mb-4">{message}</p>
            <button
              onClick={() => window.location.href = '/auth/login'}
              className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 rounded-xl border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              Réessayer
            </button>
          </>
        )}
      </div>
    </main>
  );
}
