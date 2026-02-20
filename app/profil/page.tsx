'use client'

import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, LogOut, User, BookOpen, Mail } from 'lucide-react'

export default function ProfilPage() {
  const { user, isLoading, signOut } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    router.push('/auth/login?redirectTo=/profil')
    return null
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      {/* Header */}
      <header className="bg-indigo-900/50 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <span className="font-black text-xl">
              <span className="text-amber-400">Magic</span>
              <span className="text-white">Stories</span>
            </span>
          </Link>
          
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-indigo-300 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-indigo-900/30 border border-white/10 rounded-2xl p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">
                {user.user_metadata?.full_name || 'Parent'}
              </h1>
              <div className="flex items-center gap-2 text-indigo-300">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href="/library"
            className="bg-indigo-900/50 border border-white/10 rounded-xl p-6 hover:bg-indigo-900/70 transition-colors"
          >
            <BookOpen className="w-8 h-8 text-amber-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Bibliothèque</h3>
            <p className="text-indigo-300 text-sm">Voir toutes les histoires sauvegardées</p>
          </Link>

          <Link
            href="/"
            className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-6 hover:from-amber-400 hover:to-orange-400 transition-colors"
          >
            <Sparkles className="w-8 h-8 text-black mb-3" />
            <h3 className="text-lg font-bold text-black mb-1">Créer une histoire</h3>
            <p className="text-black/70 text-sm">Générer une nouvelle aventure</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
