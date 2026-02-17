'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { triggerVibration } from '@/lib/haptics';
import { Sparkles, BookOpen, Share2, Download } from 'lucide-react';

function StoryContent() {
  const searchParams = useSearchParams();
  
  const name = searchParams.get('name') || 'ton héros';
  const hero = searchParams.get('hero') || 'Magicien';
  const world = searchParams.get('world') || 'Forêt Enchantée';
  const theme = searchParams.get('theme') || 'Aventure';
  const title = searchParams.get('title') || `L'aventure de ${name}`;
  const content = searchParams.get('content') || '';
  const imageUrl = searchParams.get('imageUrl') || '';
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Fallback content si pas de génération IA
  const fallbackContent = `Il était une fois, dans un monde appelé ${world}, 
un courageux ${hero} nommé ${name}. 

L'aventure ne faisait que commencer. Le vent soufflait doucement alors que notre héros s'apprêtait à vivre une expérience inoubliable...

Cette histoire a été créée spécialement pour toi ! 🌟`;

  const displayContent = content || fallbackContent;
  const defaultImageUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80";
  const displayImageUrl = imageUrl || defaultImageUrl;

  return (
    <>
      {/* Header avec l'image */}
      <div className="relative w-full h-80 sm:h-96 bg-indigo-950 border-b-4 border-black overflow-hidden shadow-2xl">
        {displayImageUrl && !imageError ? (
          <Image 
            src={displayImageUrl}
            alt="Illustration de l'histoire"
            fill
            className={`object-cover transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-indigo-900">
            <Sparkles className="w-16 h-16 text-amber-400 animate-pulse" />
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-transparent to-transparent"></div>
        
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center">
              <Sparkles className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-3" />
              <span className="text-center px-10 italic font-black text-xl drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                L'IA prépare une illustration magique... ✨
              </span>
            </div>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-4 left-4">
           <div className="bg-amber-500 border-4 border-black px-4 py-2 font-black uppercase text-black transform -rotate-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center gap-2">
             <BookOpen className="w-5 h-5" />
             Chapitre 1
           </div>
        </div>
        <div className="absolute top-4 right-4">
           <div className="bg-indigo-950 border-4 border-black px-4 py-2 font-black uppercase text-white transform rotate-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] text-xs flex items-center gap-2">
             <Sparkles className="w-4 h-4 text-amber-400" />
             MagicStory
           </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-16 relative z-10 w-full">
        {/* Titre */}
        <div className="mb-8 bg-gradient-to-r from-indigo-900 to-purple-900 border-4 border-black p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] rounded-lg">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 text-white uppercase tracking-tighter drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] break-words">
            {decodeURIComponent(title)}
          </h1>
          <p className="text-amber-400 font-black italic text-lg sm:text-xl uppercase tracking-tight break-words flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
            {hero} dans le monde de {world}
          </p>
        </div>

        {/* Contenu de l'histoire */}
        <div className="bg-white border-4 border-black p-8 mb-10 shadow-[10px_10px_0px_rgba(0,0,0,1)] rounded-lg relative">
          {/* Coin décoratif */}
          <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-500 border-4 border-black transform rotate-12"></div>
          <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-purple-500 border-4 border-black transform -rotate-12"></div>
          
          <div className="prose prose-lg max-w-none">
            {displayContent.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-xl leading-relaxed font-medium text-black mb-4">
                {paragraph}
              </p>
            ))}
          </div>
          
          {/* Badge thème */}
          <div className="mt-8 pt-6 border-t-4 border-dashed border-gray-200">
            <div className="flex items-center justify-center gap-4">
              <span className="bg-amber-100 border-2 border-black px-4 py-2 text-sm font-bold text-amber-900 rounded-full">
                {theme === 'Aventure' ? '⚔️' : theme === 'Amitié' ? '🤝' : '📚'} {theme}
              </span>
              <span className="text-gray-500 text-sm font-bold">
                Créé spécialement pour {name}
              </span>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/" 
            onClick={() => triggerVibration()}
            className="bg-indigo-950 border-4 border-black p-5 text-xl font-black text-white uppercase tracking-tighter text-center hover:bg-indigo-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <span>🏠</span> Menu
          </Link>
          
          {imageUrl && (
            <a 
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => triggerVibration()}
              className="bg-purple-600 border-4 border-black p-5 text-xl font-black text-white uppercase tracking-tighter text-center hover:bg-purple-500 shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" /> Image
            </a>
          )}
          
          <button 
            onClick={() => {
              triggerVibration();
              if (typeof window !== 'undefined') {
                navigator.clipboard.writeText(window.location.href);
                alert('Lien copié ! Partage cette histoire magique 🌟');
              }
            }}
            className="bg-amber-500 border-4 border-black p-5 text-xl font-black text-black uppercase tracking-tighter flex-1 hover:bg-amber-400 shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" /> Partager
          </button>
        </div>
        
        {/* Footer */}
        <div className="mt-12 text-center text-indigo-300 text-sm">
          <p className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Histoire générée par IA · Illustration DALL-E · MagicStory
            <Sparkles className="w-4 h-4" />
          </p>
        </div>
      </div>
    </>
  );
}

export default function ReadStory() {
  return (
    <main className="min-h-screen pb-12 bg-gradient-to-br from-[#0f0f1a] via-indigo-950 to-purple-950">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Sparkles className="w-16 h-16 text-amber-400 animate-spin mx-auto mb-4" />
            <p className="text-white font-bold text-xl">Chargement de l'histoire...</p>
          </div>
        </div>
      }>
        <StoryContent />
      </Suspense>
    </main>
  );
}
