'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

/**
 * Composant qui intercepte les codes d'authentification Supabase
 * sur n'importe quelle page et les échange automatiquement.
 * À utiliser dans le layout principal ou les pages d'entrée.
 */
export default function AuthHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleAuthCode = async () => {
      const code = searchParams.get('code');
      const type = searchParams.get('type');
      const redirectTo = searchParams.get('redirect_to') || '/';
      
      // Si on a un code d'authentification
      if (code && (type === 'magiclink' || type === 'signup')) {
        console.log('AuthHandler: Detected auth code, processing...');
        setIsProcessing(true);
        
        const supabase = createClient();
        
        try {
          // Échanger le code contre une session
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('AuthHandler: Error exchanging code:', error);
            // Rediriger vers la page d'erreur
            router.push('/auth/auth-code-error');
            return;
          }
          
          // Vérifier que la session est créée
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            console.log('AuthHandler: Session created successfully');
            // Nettoyer l'URL des paramètres d'auth et rediriger
            const cleanUrl = new URL(window.location.href);
            cleanUrl.searchParams.delete('code');
            cleanUrl.searchParams.delete('type');
            cleanUrl.searchParams.delete('redirect_to');
            
            // Rediriger vers la destination ou la page d'accueil
            router.push(redirectTo);
            router.refresh();
          } else {
            console.error('AuthHandler: No session after exchange');
            router.push('/auth/auth-code-error');
          }
        } catch (err) {
          console.error('AuthHandler: Unexpected error:', err);
          router.push('/auth/auth-code-error');
        } finally {
          setIsProcessing(false);
        }
      }
    };

    handleAuthCode();
  }, [searchParams, router]);

  // Afficher un indicateur de chargement pendant le traitement
  if (isProcessing) {
    return (
      <div className="fixed inset-0 z-50 bg-indigo-950/90 backdrop-blur-md flex items-center justify-center">
        <div className="bg-white rounded-3xl border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Connexion en cours...</h2>
          <p className="text-gray-500 text-sm">Un instant, on vérifie ton lien magique ✨</p>
        </div>
      </div>
    );
  }

  return null;
}
