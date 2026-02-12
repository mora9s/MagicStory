import React from 'react';

export default function StorySettings() {
  return (
    <main className="min-h-screen bg-indigo-950 text-white p-6">
      <h2 className="text-3xl font-bold text-center mb-10 text-yellow-400">Derniers détails...</h2>
      <div className="max-w-md mx-auto space-y-6">
        <div>
          <label className="block text-indigo-200 text-sm font-bold mb-2">Prénom de l'enfant</label>
          <input type="text" placeholder="Ex: Timéo" className="w-full p-4 rounded-xl bg-white/10 border border-white/20 outline-none" />
        </div>
        <div className="pt-6">
          <a href="/read-story" className="block w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-indigo-950 text-center font-black rounded-2xl shadow-lg">
            CRÉER LA MAGIE ✨
          </a>
        </div>
      </div>
    </main>
  );
}
