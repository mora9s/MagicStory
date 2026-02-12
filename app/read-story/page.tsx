import React from 'react';

export default function ReadStory() {
  return (
    <main className="min-h-screen bg-indigo-950 text-white pb-12">
      <div className="relative w-full h-80 bg-indigo-900 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 flex items-center justify-center text-indigo-400">
          <span className="text-center px-10 italic">L'IA prépare une illustration magique... ✨</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-indigo-950 to-transparent"></div>
      </div>
      <div className="max-w-2xl mx-auto px-6 -mt-8 relative z-10">
        <h1 className="text-3xl font-bold text-yellow-400 mb-6">L'incroyable secret</h1>
        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
          <p className="text-lg leading-relaxed">Il était une fois...</p>
        </div>
      </div>
    </main>
  );
}
