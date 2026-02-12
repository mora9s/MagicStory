import React from '\''react'\'';

export default function ReadStory() {
  return (
    <main className="min-h-screen bg-indigo-950 text-white pb-12">
      {/* Zone Image / Illustration */}
      <div className="relative w-full h-80 bg-indigo-900 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 flex items-center justify-center text-indigo-400">
          {/* Placeholder pour l'\''image générée par l'\''IA */}
          <span className="text-center px-10 italic">L'\''IA prépare une illustration magique... ✨</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-indigo-950 to-transparent"></div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-8 relative z-10">
        {/* Titre de l'\''histoire */}
        <h1 className="text-3xl font-bold text-yellow-400 mb-6 drop-shadow-md">
          L'\''incroyable secret de la Forêt Enchantée
        </h1>

        {/* Corps du texte - Style livre */}
        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-xl">
          <p className="text-lg leading-relaxed text-indigo-50 first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:text-yellow-400">
            Il était une fois, dans un pays où les nuages avaient le goût de la barbe à papa, un petit garçon nommé Timéo. Ce matin-là, en ouvrant sa fenêtre, il remarqua que les arbres de la forêt ne bruissaient pas comme d'\''habitude. Ils semblaient chuchoter un secret...
          </p>
          
          <p className="mt-6 text-lg leading-relaxed text-indigo-50">
            Accompagné de son fidèle robot, Timéo décida de s'\''enfoncer sous les grands chênes centenaires. Il ne savait pas encore qu'\''une grande aventure l'\''attendait !
          </p>
        </div>

        {/* Contrôles de lecture */}
        <div className="flex justify-between items-center mt-10">
          <button className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-all">
            🔊 Écouter
          </button>
          <button className="px-8 py-4 bg-indigo-600 rounded-2xl font-bold shadow-lg hover:bg-indigo-500">
            Suite de l'\''aventure ➔
          </button>
        </div>
      </div>
    </main>
  );
}
