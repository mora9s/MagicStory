'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connexion en cours...');

  useEffect(() => {
    const handleAuth = async () => {
      const supabase = createClient();
      
      // Récupérer le redirect
      const redirectTo = searchParams.get('redirectTo') || searchParams.get('redirect_to') || '/';
      
      try {
        // Vérifier d'abord si on a déjà une session (le hash a été traité automatiquement par Supabase)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (session) {
          console.log('Session found!');
          setStatus('success');
          setMessage('Connecté avec succès !');
          setTimeout(() => {
            router.push(redirectTo);
            router.refresh();
          }, 1000);
          return;
        }
        
        // Si pas de session, vérifier si on a un code dans l'URL (PKCE flow)
        const code = searchParams.get('code');
        
        if (code) {
          console.log('PKCE code found, exchanging...');
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('PKCE exchange error:', error);
            setStatus('error');
            if (error.message.includes('code verifier') || error.message.includes('PKCE')) {
              setMessage('Tu as ouvert ce lien dans un navigateur différent. Utilise le même navigateur où tu as demandé le lien.');
            } else {
              setMessage('Erreur de connexion : ' + error.message);
            }
            return;
          }
          
          // Vérifier à nouveau la session
          const { data: { session: newSession } } = await supabase.auth.getSession();
          
          if (newSession) {
            setStatus('success');
            setMessage('Connecté avec succès !');
            setTimeout(() => {
              router.push(redirectTo);
              router.refresh();
            }, 1000);
            return;
          }
        }
        
        // Si on arrive ici, essayer de parser le hash manuellement (pour les liens magiques)
        // Supabase place parfois le token dans le hash
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          console.log('Hash with token found, letting Supabase handle it...');
          // Supabase client gère automatiquement le hash, on attend un peu et on revérifie
          setTimeout(async () => {
            const { data: { session: hashSession } } = await supabase.auth.getSession();
            if (hashSession) {
              setStatus('success');
              setMessage('Connecté avec succès !');
              setTimeout(() => {
                router.push(redirectTo);
                router.refresh();
              }, 1000);
            } else {
              setStatus('error');
              setMessage('Impossible de récupérer la session. Réessaie.');
            }
          }, 1000);
          return;
        }
        
        // Aucun token trouvé
        console.log('No token found in URL');
        setStatus('error');
        setMessage('Lien invalide ou expiré. Demande un nouveau lien.');
        
      } catch (err) {
        console.error('Unexpected error:', err);
        setStatus('error');
        setMessage('Une erreur inattendue est survenue');
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

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-indigo-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-8 max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Chargement...</h1>
          <p className="text-gray-500">Préparation de la connexion...</p>
        </div>
      </main>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
