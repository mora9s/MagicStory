import React from 'react';
import Image from 'next/image';

export default function ReadStory({ searchParams }: { searchParams: { name?: string, hero?: string, world?: string } }) {
  const { name, hero, world } = searchParams;
  const imageUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80"; // Placeholder magic image

  return (
    <main className="min-h-screen bg-indigo-950 text-white pb-12">
      <div className="relative w-full h-80 bg-indigo-900 overflow-hidden shadow-2xl">
        <Image 
          src={imageUrl}
          alt="Illustration magique"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center text-indigo-400">
          {!imageUrl && <span className="text-center px-10 italic">L'IA prépare une illustration magique... ✨</span>}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-indigo-950 to-transparent"></div>
      </div>
      <div className="max-w-2xl mx-auto px-6 -mt-8 relative z-10">
        <h1 className="text-3xl font-bold text-yellow-400 mb-2">L'aventure de {name || 'ton héros'}</h1>
        <p className="text-indigo-300 italic mb-6">{hero} dans le monde de {world}</p>
        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
          <p className="text-lg leading-relaxed text-indigo-50">
            Il était une fois, dans un monde appelé {world}, un courageux {hero} nommé {name}. 
            L'aventure ne faisait que commencer...
          </p>
        </div>
      </div>
    </main>
  );
}
