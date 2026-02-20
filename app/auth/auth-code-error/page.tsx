'use client'

import Link from 'next/link'
import { Sparkles, AlertTriangle } from 'lucide-react'

export default function AuthCodeErrorPage() {
  return (
    <main className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-black" />
          </div>
          <span className="font-black text-2xl">
            <span className="text-amber-400">Magic</span>
            <span className="text-white">Stories</span>
          </span>
        </div>

        <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-8 mb-6">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-white mb-2">
            Erreur d'authentification
          </h1>
          <p className="text-red-200">
            Le lien de connexion a expiré ou est invalide.
          </p>
        </div>

        <Link
          href="/auth/login"
          className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black py-4 px-8 rounded-xl hover:from-amber-400 hover:to-orange-400 transition-colors"
        >
          Réessayer
        </Link>
      </div>
    </main>
  )
}
