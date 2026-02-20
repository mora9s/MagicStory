'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Sparkles, Mail, ArrowLeft } from 'lucide-react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'
  const supabase = createClient()

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)
    setIsError(false)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
      },
    })

    if (error) {
      setMessage(error.message)
      setIsError(true)
    } else {
      setMessage('✉️ Un lien magique a été envoyé à ton email !')
      setIsError(false)
    }

    setIsLoading(false)
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
      },
    })

    if (error) {
      setMessage(error.message)
      setIsError(true)
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>
        
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-black" />
          </div>
          <span className="font-black text-2xl">
            <span className="text-amber-400">Magic</span>
            <span className="text-white">Stories</span>
          </span>
        </div>
        
        <h1 className="text-3xl font-black text-white mb-2">
          Connexion
        </h1>
        <p className="text-indigo-300">
          Accède à tes histoires sauvegardées
        </p>
      </div>

      {/* Card */}
      <div className="bg-indigo-900/50 border border-white/10 rounded-2xl p-6 sm:p-8">
        {/* Message */}
        {message && (
          <div className={`p-4 rounded-xl mb-6 text-center ${
            isError 
              ? 'bg-red-500/20 border border-red-500/50 text-red-300' 
              : 'bg-green-500/20 border border-green-500/50 text-green-300'
          }`}>
            {message}
          </div>
        )}

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-bold py-4 px-6 rounded-xl hover:bg-gray-100 transition-colors mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continuer avec Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-indigo-400 text-sm">ou</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        {/* Magic Link Form */}
        <form onSubmit={handleMagicLink} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-indigo-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ton@email.com"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-900 border-2 border-white/10 rounded-xl text-white placeholder:text-indigo-400/50 focus:border-amber-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Envoi...' : 'Envoyer le lien magique ✨'}
          </button>
        </form>

        <p className="text-center text-indigo-400/60 text-sm mt-6">
          Pas encore de compte ?{' '}
          <Link 
            href={`/auth/register?redirectTo=${encodeURIComponent(redirectTo)}`}
            className="text-amber-400 hover:text-amber-300"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-center p-4">
      <Suspense fallback={
        <div className="w-full max-w-md text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
            <span className="font-black text-2xl">
              <span className="text-amber-400">Magic</span>
              <span className="text-white">Stories</span>
            </span>
          </div>
          <p className="text-indigo-300">Chargement...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </main>
  )
}
