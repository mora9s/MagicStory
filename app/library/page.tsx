'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllStories, deleteStory } from '@/lib/actions';
import { triggerVibration } from '@/lib/haptics';
import { BookOpen, Sparkles, Calendar, User, ArrowLeft, Wand2, Trash2, Star } from 'lucide-react';

type Story = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  theme: string | null;
  created_at: string | null;
  rating?: number | null;
  profile: {
    first_name: string;
  } | null;
};

export default function LibraryPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

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

  const handleImageError = (storyId: string) => {
    setImageErrors(prev => new Set(prev).add(storyId));
  };

  const handleDelete = async (storyId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Es-tu sûr de vouloir supprimer cette histoire ?')) return;
    
    const result = await deleteStory(storyId);
    if (!result.error) {
      setStories(stories.filter(s => s.id !== storyId));
      triggerVibration();
    } else {
      alert('Erreur lors de la suppression');
    }
  };

  const getThemeIcon = (theme: string | null) => {
    switch(theme) {
      case 'Aventure': return '⚔️';
      case 'Amitié': return '🤝';
      case 'Apprentissage': return '📚';
      default: return '✨';
    }
  };

  const getThemeColor = (theme: string | null) => {
    switch(theme) {
      case 'Aventure': return 'bg-orange-500';
      case 'Amitié': return 'bg-pink-500';
      case 'Apprentissage': return 'bg-blue-500';
      default: return 'bg-amber-500';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-indigo-950">
      {/* Header épuré */}
      <header className="p-4 flex items-center justify-between">
        <Link 
          href="/"
          onClick={() => triggerVibration()}
          className="flex items-center gap-2 text-indigo-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Retour</span>
        </Link>
        
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-white">Mes histoires</span>
        </div>
        
        <Link 
          href="/choose-hero"
          onClick={() => triggerVibration()}
          className="bg-amber-500 hover:bg-amber-400 text-black font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 text-sm transition-colors"
        >
          <Wand2 className="w-4 h-4" />
          <span className="hidden sm:inline">Nouvelle</span>
        </Link>
      </header>

      <div className="max-w-6xl mx-auto px-4 pb-8">
        {/* Titre */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            Bibliothèque
          </h1>
          <p className="text-indigo-300">
            {stories.length} histoire{stories.length > 1 ? 's' : ''} créée{stories.length > 1 ? 's' : ''}
          </p>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-indigo-300 font-medium">Chargement des histoires...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 text-center max-w-md mx-auto">
            <p className="text-red-300 font-medium">{error}</p>
          </div>
        )}

        {!loading && stories.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-indigo-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-indigo-400" />
            </div>
            <p className="text-white font-bold text-xl mb-2">Aucune histoire encore</p>
            <p className="text-indigo-400 mb-6">Crée ta première histoire magique !</p>
            <Link 
              href="/choose-hero"
              onClick={() => triggerVibration()}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 px-6 rounded-xl transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              Commencer ✨
            </Link>
          </div>
        )}

        {/* Grille d'histoires */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {stories.map((story) => (
            <div
              key={story.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative"
            >
              {/* Bouton suppression */}
              <button
                onClick={(e) => handleDelete(story.id, e)}
                className="absolute top-3 right-3 z-20 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                title="Supprimer l'histoire"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <Link
                href={`/read-story?id=${story.id}`}
                onClick={() => triggerVibration()}
                className="block"
              >
              {/* Image Container */}
              <div className="relative aspect-[4/3] bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
                {story.image_url && !imageErrors.has(story.id) ? (
                  <img
                    src={story.image_url}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={() => handleImageError(story.id)}
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-200 to-purple-200">
                    <BookOpen className="w-16 h-16 text-indigo-400 mb-2" />
                    <span className="text-indigo-500 text-sm font-medium">Illustration en cours</span>
                  </div>
                )}
                
                {/* Badge thème */}
                <div className={`absolute top-3 left-3 ${getThemeColor(story.theme)} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg`}>
                  <span>{getThemeIcon(story.theme)}</span>
                  <span className="hidden sm:inline">{story.theme || 'Histoire'}</span>
                </div>

                {/* Overlay au hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
              </div>
              
              {/* Contenu */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                  {story.title}
                </h3>
                
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                  {story.profile && (
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {story.profile.first_name}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {story.created_at
                      ? new Date(story.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                      : 'Date inconnue'
                    }
                  </span>
                  {story.rating && (
                    <span className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-amber-400" />
                      {story.rating}/5
                    </span>
                  )}
                </div>
                
                <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                  {story.content.substring(0, 120)}...
                </p>
                
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <span className="text-amber-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    Lire l'histoire
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </div>
              </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
