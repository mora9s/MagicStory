'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

function AuthCallbackContent() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connexion en cours...');

  useEffect(() => {
    const handleAuth = async () => {
      const supabase = createClient();
      
      // Le client Supabase gère automatiquement le hash/token dans l'URL
      // On attend juste qu'il traite la réponse et on vérifie la session
      
      // Petite pause pour laisser Supabase traiter le token
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Vérifier la session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        setStatus('error');
        setMessage('Erreur lors de la connexion');
        return;
      }
      
      if (session) {
        setStatus('success');
        setMessage('Connecté avec succès !');
        
        // Redirection
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1000);
      } else {
        // Vérifier si on a une erreur dans l'URL (lien expiré, etc.)
        const url = new URL(window.location.href);
        const errorCode = url.searchParams.get('error_code');
        const errorDesc = url.searchParams.get('error_description');
        
        if (errorCode === 'otp_expired') {
          setStatus('error');
          setMessage('Ce lien a expiré. Demande un nouveau lien magique.');
          return;
        }
        
        // Essayer avec exchangeCodeForSession si on a un code
        const code = url.searchParams.get('code');
        
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('Exchange error:', exchangeError);
            setStatus('error');
            if (exchangeError.message.includes('code verifier')) {
              setMessage('Lien ouvert dans un navigateur différent. Utilise le même navigateur.');
            } else {
              setMessage('Lien invalide ou expiré');
            }
            return;
          }
          
          // Re-vérifier la session
          const { data: { session: newSession } } = await supabase.auth.getSession();
          if (newSession) {
            setStatus('success');
            setMessage('Connecté avec succès !');
            setTimeout(() => {
              router.push('/');
              router.refresh();
            }, 1000);
            return;
          }
        }
        
        setStatus('error');
        setMessage('Lien invalide ou expiré');
      }
    };

    handleAuth();
  }, [router]);

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
