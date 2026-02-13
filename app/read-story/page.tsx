import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ReadStory({ searchParams }: { searchParams: { name?: string, hero?: string, world?: string } }) {
  const { name, hero, world } = searchParams;
  const imageUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80"; // Placeholder magic image

  return (
    <main className="min-h-screen pb-12">
      <div className="relative w-full h-80 bg-indigo-900 border-b-[4px] border-black overflow-hidden shadow-2xl">
        <Image 
          src={imageUrl}
          alt="Illustration magique"
          fill
          className="object-cover opacity-70"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center text-indigo-200">
          {!imageUrl && <span className="text-center px-10 italic font-bold magic-glow">L'IA prépare une illustration magique... ✨</span>}
        </div>
        <div className="absolute top-4 left-4">
           <div className="comic-label bg-amber-500">Chapitre 1</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-12 relative z-10">
        <div className="comic-panel mb-8 bg-indigo-900">
          <h1 className="magic-title text-3xl mb-1 text-white">L'aventure de {name || 'ton héros'}</h1>
          <p className="text-amber-400 font-bold italic">{hero} dans le monde de {world}</p>
        </div>

        <div className="parchment mb-10">
          <p className="text-xl leading-relaxed font-serif">
            Il était une fois, dans un monde appelé <span className="font-black underline decoration-amber-600">{world}</span>, 
            un courageux <span className="font-black uppercase">{hero}</span> nommé <span className="font-black">{name}</span>. 
            <br /><br />
            L'aventure ne faisait que commencer. Le vent soufflait doucement entre les arbres alors que notre héros s'apprêtait à vivre une expérience inoubliable...
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Link href="/" className="comic-button bg-slate-700 text-sm">
            Menu
          </Link>
          <button className="comic-button flex-1 text-xl">
            Continuer...
          </button>
        </div>
      </div>
    </main>
  );
}
