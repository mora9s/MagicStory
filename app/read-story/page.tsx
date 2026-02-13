import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ReadStory({ searchParams }: { searchParams: { name?: string, hero?: string, world?: string, theme?: string } }) {
  const { name, hero, world, theme } = searchParams;
  const imageUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80"; // Placeholder magic image

  const getThemeText = () => {
    switch(theme) {
      case 'Amitié':
        return "C'était une journée placée sous le signe de l'entraide. Notre héros savait que rien n'est impossible quand on peut compter sur ses amis.";
      case 'Apprentissage':
        return "Une grande leçon attendait notre héros aujourd'hui. Chaque pas dans ce monde mystérieux était une occasion de découvrir un nouveau secret de la vie.";
      case 'Aventure':
      default:
        return "L'aventure ne faisait que commencer. Le vent soufflait doucement entre les arbres alors que notre héros s'apprêtait à vivre une expérience inoubliable...";
    }
  };

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
           <div className="comic-label">Chapitre 1</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-12 relative z-10">
        <div className="comic-panel mb-8 bg-indigo-900">
          <h1 className="magic-title text-3xl mb-1 text-slate-100">L'aventure de {name || 'ton héros'}</h1>
          <p className="text-amber-200 font-bold italic">{hero} dans le monde de {world} {theme ? `(Thème : ${theme})` : ''}</p>
        </div>

        <div className="parchment mb-10">
          <p className="text-xl leading-relaxed font-serif text-amber-200">
            Il était une fois, dans un monde appelé <span className="font-black underline decoration-amber-600 text-slate-100">{world}</span>, 
            un courageux <span className="font-black uppercase text-slate-100">{hero}</span> nommé <span className="font-black text-slate-100">{name}</span>. 
            <br /><br />
            {getThemeText()}
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
