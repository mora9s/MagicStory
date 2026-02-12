import React from '\''react'\'';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-950 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Header avec une touche de magie */}
        <div className="relative">
          <h1 className="text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-yellow-500">
            MagicStory
          </h1>
          <div className="absolute -top-4 -right-4 animate-bounce">✨</div>
        </div>

        <p className="text-xl text-purple-200 font-medium italic">
          "Où chaque enfant devient le héros de sa propre légende..."
        </p>

        {/* Bouton d'\''action principal */}
        <div className="pt-10">
          <button 
            className="group relative w-full inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-indigo-600 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.4)]"
          >
            <span className="absolute inset-0 w-full h-full mt-1 ml-1 transition-all duration-300 ease-in-out bg-purple-600 rounded-xl group-hover:mt-0 group-hover:ml-0"></span>
            <span className="absolute inset-0 w-full h-full bg-indigo-600 rounded-xl"></span>
            <span className="relative">Commencer l'\''aventure 🚀</span>
          </button>
        </div>

        {/* Footer simple */}
        <div className="pt-20 text-indigo-300 text-sm">
          Prêt à créer ton histoire ?
        </div>
      </div>
    </main>
  );
}
