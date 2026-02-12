import React from '\''react'\'';

export default function StorySettings() {
  return (
    <main className="min-h-screen bg-indigo-950 text-white p-6">
      <h2 className="text-3xl font-bold text-center mb-10 text-yellow-400">Derniers détails...</h2>
      
      <div className="max-w-md mx-auto space-y-6">
        <div>
          <label className="block text-indigo-200 text-sm font-bold mb-2">Prénom de l'\''enfant</label>
          <input 
            type="text" 
            placeholder="Ex: Timéo" 
            className="w-full p-4 rounded-xl bg-white/10 border border-white/20 focus:border-yellow-400 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-indigo-200 text-sm font-bold mb-2">Âge (pour adapter le récit)</label>
          <select className="w-full p-4 rounded-xl bg-white/10 border border-white/20 focus:border-yellow-400 outline-none appearance-none">
            <option className="bg-indigo-900">3-5 ans (Histoires douces)</option>
            <option className="bg-indigo-900">6-8 ans (Action et Mystère)</option>
            <option className="bg-indigo-900">9-12 ans (Grandes épopées)</option>
          </select>
        </div>

        <div className="pt-6">
          <button className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-indigo-950 font-black rounded-2xl shadow-lg hover:scale-105 transition-transform">
            CRÉER LA MAGIE ✨
          </button>
        </div>
      </div>
    </main>
  );
}
