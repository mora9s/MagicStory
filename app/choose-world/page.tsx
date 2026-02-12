import React from '\''react'\'';

const worlds = [
  { id: 1, name: '\''Forêt Enchantée'\'', emoji: '\''🌳'\'', description: '\''Des arbres qui parlent et des fées cachées.'\'' },
  { id: 2, name: '\''Espace Infini'\'', emoji: '\''🚀'\'', description: '\''Des planètes en bonbons et des étoiles filantes.'\'' },
  { id: 3, name: '\''Cité des Nuages'\'', emoji: '\''☁️'\'', description: '\''Un château qui flotte au-dessus des orages.'\'' },
  { id: 4, name: '\''Océan Secret'\'', emoji: '\''🐙'\'', description: '\''Des cités de corail et des baleines chanteuses.'\'' },
];

export default function ChooseWorld() {
  return (
    <main className="min-h-screen bg-indigo-950 text-white p-6">
      <h2 className="text-3xl font-bold text-center mb-10 text-yellow-400">Où se passe ton aventure ?</h2>
      
      <div className="space-y-4 max-w-md mx-auto">
        {worlds.map((world) => (
          <button
            key={world.id}
            className="w-full flex items-center p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-left"
          >
            <span className="text-4xl mr-4">{world.emoji}</span>
            <div>
              <span className="block font-bold text-lg">{world.name}</span>
              <span className="block text-sm text-indigo-200">{world.description}</span>
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}
