'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
// Utilisation de balises img standard pour les images externes
import { getAllStories } from '@/lib/actions';
import { triggerVibration } from '@/lib/haptics';
import { BookOpen, Sparkles, Calendar, User, ArrowLeft } from 'lucide-react';

type Story = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  theme: string | null;
  created_at: string | null;
  profile: {
    first_name: string;
    favorite_hero: string;
  };
};

export default function LibraryPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    const result = await getAllStories(50);
    if (result.data) {
      setStories(result.data);
    } else {
      setError(result.error || 'Erreur de chargement');
    }
    setLoading(false);
  };

  const getThemeIcon = (theme: string | null) => {
    switch(theme) {
      case 'Aventure': return '⚔️';
      case 'Amitié': return '🤝';
      case 'Apprentissage': return '📚';
      default: return '✨';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0f1a] via-indigo-950 to-purple-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <Link 
            href="/"
            onClick={() => triggerVibration()}
            className="bg-indigo-900 border-4 border-black p-3 text-white font-black uppercase tracking-tighter hover:bg-indigo-800 shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </Link>
          
          <h1 className="text-3xl sm:text-4xl font-black text-amber-400 uppercase tracking-tighter drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            Bibliothèque
          </h1>
          
          <div className="w-20"></div>
        </div>

        {loading && (
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 text-amber-400 animate-spin mx-auto mb-4" />
            <p className="text-white font-bold text-xl">Chargement des histoires...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900 border-4 border-black p-6 text-center shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <p className="text-white font-bold">{error}</p>
          </div>
        )}

        {!loading && stories.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-indigo-900 border-4 border-black p-10 max-w-md mx-auto shadow-[10px_10px_0px_rgba(0,0,0,1)]">
              <BookOpen className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
              <p className="text-white font-bold text-xl mb-2">Aucune histoire encore</p>
              <p className="text-indigo-300 mb-6">Crée ta première histoire magique !</p>
              <Link 
                href="/"
                className="inline-block bg-amber-500 text-black font-black py-3 px-6 border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:bg-amber-400 transition-all"
              >
                Commencer ✨
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <Link
              key={story.id}
              href={`/read-story?id=${story.id}`}
              onClick={() => triggerVibration()}
              className="group bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-all duration-300 overflow-hidden rounded-lg text-black"
            >
              {/* Image */}
              <div className="relative h-48 bg-indigo-100 overflow-hidden">
                {story.image_url ? (
                  <img
                    src={story.image_url}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-indigo-200">
                    <BookOpen className="w-16 h-16 text-indigo-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-amber-500 border-2 border-black px-2 py-1 text-xs font-black">
                  {getThemeIcon(story.theme)} {story.theme || 'Histoire'}
                </div>
              </div>
              
              {/* Contenu */}
              <div className="p-5">
                <h3 className="font-black text-xl text-indigo-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                  {story.title}
                </h3>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {story.profile.first_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {story.created_at ? new Date(story.created_at).toLocaleDateString('fr-FR') : 'Date inconnue'}
                  </span>
                </div>
                
                <p className="text-gray-500 text-sm line-clamp-2">
                  {story.content.substring(0, 100)}...
                </p>
                
                <div className="mt-4 pt-4 border-t-2 border-gray-100">
                  <span className="text-amber-600 font-bold text-sm flex items-center gap-1">
                    Lire l'histoire →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-indigo-300 text-sm">
          <p className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            {stories.length} histoire{stories.length > 1 ? 's' : ''} dans la bibliothèque
            <Sparkles className="w-4 h-4" />
          </p>
        </div>
      </div>
    </main>
  );
}
