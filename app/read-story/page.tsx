'use client';

import React, { useState, Suspense, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { triggerVibration } from '@/lib/haptics';
import { getStoryById, getChaptersByStory, Chapter } from '@/lib/actions';
import { getStoryImages } from '@/lib/storage';
import { Sparkles, BookOpen, ChevronLeft, ChevronRight, Home, GitBranch } from 'lucide-react';
import StarRating from '@/app/components/StarRating';
import StoryAudioPlayer from '@/app/components/StoryAudioPlayer';

// Fonction pour diviser le contenu en pages de taille raisonnable
function splitContentIntoPages(content: string, charsPerPage: number = 800): string[] {
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  const pages: string[] = [];
  let currentPage = '';
  
  for (const paragraph of paragraphs) {
    if ((currentPage + paragraph).length > charsPerPage && currentPage.length > 200) {
      pages.push(currentPage.trim());
      currentPage = paragraph + '\n\n';
    } else {
      currentPage += paragraph + '\n\n';
    }
  }
  
  if (currentPage.trim()) {
    pages.push(currentPage.trim());
  }
  
  return pages.length > 0 ? pages : [content];
}

type PageType = 
  | { type: 'cover'; content: null }
  | { type: 'chapter'; content: string[]; chapter: Chapter }
  | { type: 'choice'; content: null; chapter: Chapter }
  | { type: 'content'; content: string[] }
  | { type: 'end'; content: null };

function StoryContent() {
  const searchParams = useSearchParams();
  
  const storyId = searchParams.get('id') || '';
  const isInteractive = searchParams.get('interactive') === 'true';
  
  const [storyData, setStoryData] = useState({
    hero1Name: searchParams.get('hero1Name') || searchParams.get('name') || 'ton héros',
    hero2Name: searchParams.get('hero2Name') || '',
    world: searchParams.get('world') || 'Forêt Enchantée',
    theme: searchParams.get('theme') || 'Aventure',
    title: searchParams.get('title') || '',
    content: searchParams.get('content') || '',
    coverImageUrl: searchParams.get('imageUrl') || '',
    endingImageUrl: searchParams.get('endingImageUrl') || '',
  });
  
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterId, setCurrentChapterId] = useState<number>(1);
  const [choicesHistory, setChoicesHistory] = useState<{chapter: number; choice: 'A' | 'B'}[]>([]);
  
  const [loading, setLoading] = useState(!!storyId);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [audioSupported, setAudioSupported] = useState(false);
  
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const bookRef = useRef<HTMLDivElement>(null);

  const hasTwoHeroes = !!storyData.hero2Name;
  const displayTitle = storyData.title || `L'aventure de ${storyData.hero1Name}${storyData.hero2Name ? ` et ${storyData.hero2Name}` : ''}`;

  useEffect(() => {
    if (storyId) {
      const loadStory = async () => {
        // Charger l'histoire
        const result = await getStoryById(storyId);
        if (result.data) {
          const data = result.data;
          setStoryData(prev => ({
            ...prev,
            hero1Name: data.profile?.first_name || prev.hero1Name,
            theme: data.theme || prev.theme,
            title: data.title,
            content: data.content,
          }));
          
          if (isInteractive || data.story_type === 'interactive') {
            const chaptersResult = await getChaptersByStory(storyId);
            if (chaptersResult.data) {
              setChapters(chaptersResult.data);
            }
          }
        }
        
        // Charger les images depuis Supabase Storage
        const imagesResult = await getStoryImages(storyId);
        if (imagesResult.images && imagesResult.images.length > 0) {
          const coverImage = imagesResult.images.find(img => img.image_type === 'cover');
          const endingImage = imagesResult.images.find(img => img.image_type === 'ending');
          
          setStoryData(prev => ({
            ...prev,
            coverImageUrl: coverImage?.url || prev.coverImageUrl,
            endingImageUrl: endingImage?.url || coverImage?.url || prev.endingImageUrl,
          }));
        }
        
        setLoading(false);
      };
      loadStory();
    } else {
      setLoading(false);
    }
    
    // Vérifier si l'API audio est supportée
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setAudioSupported(true);
    }
  }, [storyId, isInteractive]);

  const { hero1Name, hero2Name, world, theme, title, content, coverImageUrl, endingImageUrl } = storyData;

  // Générer les pages en mémoire
  const pages: PageType[] = useMemo(() => {
    if (chapters.length > 0) {
      const currentChapter = chapters.find(c => c.chapter_number === currentChapterId);
      
      if (currentChapter) {
        const hasChoice = currentChapter.has_choice === true;
        const isEnding = currentChapter.is_ending === true;
        
        const result: PageType[] = [
          { type: 'cover', content: null },
          { type: 'chapter', content: [currentChapter.content], chapter: currentChapter },
        ];
        if (hasChoice) {
          result.push({ type: 'choice', content: null, chapter: currentChapter });
        }
        if (isEnding) {
          result.push({ type: 'end', content: null });
        }
        return result;
      }
    } else {
      // Histoire linéaire - diviser le contenu intelligemment
      const contentPages = splitContentIntoPages(content || '', 900);
      const result: PageType[] = [{ type: 'cover', content: null }];
      contentPages.forEach(p => {
        result.push({ type: 'content', content: [p] });
      });
      result.push({ type: 'end', content: null });
      return result;
    }
    return [{ type: 'cover', content: null }];
  }, [chapters, currentChapterId, content]);

  const totalPages = pages.length;
  const currentPageData: PageType | undefined = pages[currentPage];

  const goToNextPage = () => {
    if (currentPage < totalPages - 1 && !isFlipping) {
      triggerVibration();
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setIsFlipping(false);
      }, 300);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0 && !isFlipping) {
      triggerVibration();
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(prev => prev - 1);
        setIsFlipping(false);
      }, 300);
    }
  };

  const handleChoice = (choice: 'A' | 'B') => {
    triggerVibration();
    const currentChapter = chapters.find(c => c.chapter_number === currentChapterId);
    if (!currentChapter || currentChapter.has_choice !== true) return;

    const nextChapterId = choice === 'A' 
      ? currentChapter.choice_option_a_next_chapter 
      : currentChapter.choice_option_b_next_chapter;

    if (nextChapterId && nextChapterId > 0) {
      setChoicesHistory(prev => [...prev, { chapter: currentChapterId, choice }]);
      setCurrentChapterId(nextChapterId);
      setCurrentPage(1);
    }
  };

  const goToNextChapter = () => {
    triggerVibration();
    
    const currentChapter = chapters.find(c => c.chapter_number === currentChapterId);
    
    if (currentPage === 2) {
      return;
    }
    
    if (currentPage === 1 && currentChapter?.has_choice) {
      setCurrentPage(2);
      return;
    }
    
    const futureChapters = chapters
      .filter(c => c.chapter_number > currentChapterId)
      .sort((a, b) => a.chapter_number - b.chapter_number);
    
    if (futureChapters.length === 0) return;
    
    let nextChapter = futureChapters[0];
    
    for (const chapter of futureChapters) {
      let isAlternativeBranch = false;
      
      for (const prevChapter of chapters) {
        if (!prevChapter.has_choice) continue;
        
        const isBranchA = prevChapter.choice_option_a_next_chapter === chapter.chapter_number;
        const isBranchB = prevChapter.choice_option_b_next_chapter === chapter.chapter_number;
        
        if ((isBranchA || isBranchB) && prevChapter.chapter_number < currentChapterId) {
          const choice = choicesHistory.find(h => h.chapter === prevChapter.chapter_number);
          
          if (choice) {
            if ((isBranchA && choice.choice !== 'A') || (isBranchB && choice.choice !== 'B')) {
              isAlternativeBranch = true;
              break;
            }
          }
        }
      }
      
      if (!isAlternativeBranch) {
        nextChapter = chapter;
        break;
      }
    }
    
    if (nextChapter) {
      setCurrentChapterId(nextChapter.chapter_number);
      setCurrentPage(1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;
    
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      diffX > 0 ? goToNextPage() : goToPrevPage();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const restartStory = () => {
    triggerVibration();
    setCurrentChapterId(1);
    setChoicesHistory([]);
    setCurrentPage(0);
  };

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-amber-100 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-amber-800 font-bold text-lg">Chargement de l'histoire...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-amber-100 flex flex-col overflow-hidden">
      {/* Header avec titre, navigation et lecteur audio */}
      <div className="bg-amber-800 text-white px-4 py-3 flex items-center justify-between shadow-lg z-10 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2 hover:text-amber-200 transition-colors">
          <Home className="w-5 h-5" />
          <span className="hidden sm:inline font-bold">Accueil</span>
        </Link>
        
        <h1 className="font-bold text-sm sm:text-base truncate max-w-[120px] sm:max-w-xs">
          {title || 'Histoire'}
        </h1>
        
        <div className="flex items-center gap-3">
          {/* Lecteur audio compact en haut */}
          {audioSupported && currentPageData?.type !== 'cover' && currentPageData?.type !== 'choice' && currentPageData?.type !== 'end' && (
            <StoryAudioPlayer 
              text={currentPageData?.content?.[0] || ''} 
              className="scale-75 origin-right"
            />
          )}
          
          <span className="bg-amber-700 px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap">
            {currentPage + 1} / {totalPages}
          </span>
        </div>
      </div>

      <div 
        ref={bookRef}
        className="flex-1 w-full max-w-3xl mx-auto flex flex-col px-2 sm:px-4 py-2"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Book container */}
        <div className="relative bg-amber-800 rounded-r-lg rounded-l-sm shadow-2xl p-1 sm:p-2 flex-1 flex flex-col h-full">
          <div className="absolute inset-0 bg-black/20 rounded-r-lg rounded-l-sm transform translate-x-1 translate-y-1 sm:translate-x-2 sm:translate-y-2 -z-10"></div>
          
          <div className="relative bg-white flex-1 rounded-r-md rounded-l-sm border-l-4 sm:border-l-8 border-amber-700 shadow-inner overflow-hidden h-full">
            
            {/* Cover */}
            {currentPageData?.type === 'cover' && (
              <div className="absolute inset-0 w-full h-full flex flex-col">
                {choicesHistory.length > 0 && (
                  <div className="absolute top-3 left-3 z-20 bg-purple-500 border-2 border-black px-2 py-1 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    <span className="font-black text-xs text-white flex items-center gap-1">
                      <GitBranch className="w-3 h-3" />
                      {choicesHistory.length} choix
                    </span>
                  </div>
                )}
                
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400">
                  {coverImageUrl ? (
                    <img src={coverImageUrl} alt="Illustration" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-24 h-24 text-white/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20"></div>
                </div>
                
                <div className="relative z-10 mt-auto p-4 sm:p-8 text-center">
                  <h1 className="text-3xl sm:text-5xl font-black text-white uppercase drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] mb-2">
                    {displayTitle}
                  </h1>
                  
                  {chapters.length > 0 && (
                    <div className="inline-block bg-purple-500 border-2 border-black px-3 py-1 mb-3">
                      <span className="font-black text-white text-sm">🎭 INTERACTIVE</span>
                    </div>
                  )}
                  
                  <p className="text-lg sm:text-2xl text-amber-300 font-bold">
                    {hasTwoHeroes ? `${hero1Name} & ${hero2Name}` : hero1Name}
                  </p>
                  <div className="flex gap-2 justify-center mt-4">
                    <span className="bg-amber-500 border-2 border-black px-3 py-1 font-black text-black text-sm">{world}</span>
                    <span className="bg-white border-2 border-black px-3 py-1 font-black text-black text-sm">{theme}</span>
                  </div>
                </div>

                <p className="relative z-10 text-white/70 text-xs text-center pb-4">
                  → Tourne la page pour commencer
                </p>
              </div>
            )}

            {/* Chapter */}
            {currentPageData?.type === 'chapter' && currentPageData.chapter && (
              <div className="flex flex-col h-full p-4 sm:p-8 overflow-y-auto">
                <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-purple-200">
                  <span className="bg-purple-100 border-2 border-purple-500 px-3 py-1 font-black text-sm text-purple-700">
                    Chapitre {currentPageData.chapter.chapter_number}
                  </span>
                </div>
                
                {currentPageData.chapter.title && (
                  <h2 className="text-2xl font-black text-purple-900 mb-6">
                    {currentPageData.chapter.title}
                  </h2>
                )}
                
                <div className="flex-1">
                  <p className="text-lg sm:text-xl leading-relaxed text-gray-800 font-medium" style={{ fontFamily: 'Georgia, serif' }}>
                    {currentPageData.chapter.content}
                  </p>
                </div>

                {currentPageData.chapter.has_choice === true && (
                  <div className="mt-6 bg-purple-50 border-4 border-purple-500 p-4 text-center">
                    <p className="text-purple-700 font-bold">Un choix s'impose... Tourne la page !</p>
                  </div>
                )}

                {currentPageData.chapter.has_choice !== true && currentPageData.chapter.is_ending !== true && (
                  <div className="mt-6 flex justify-center">
                    <button 
                      onClick={goToNextChapter}
                      className="bg-gradient-to-r from-amber-400 to-orange-400 text-black font-black py-3 px-8 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center gap-2"
                    >
                      Continuer l'aventure →
                    </button>
                  </div>
                )}

                {currentPageData.chapter.is_ending === true && (
                  <div className="mt-6 flex justify-center">
                    <button 
                      onClick={goToNextPage}
                      className="bg-gradient-to-r from-purple-400 to-pink-400 text-black font-black py-3 px-8 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center gap-2"
                    >
                      Voir la fin ✨
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Choice Page */}
            {currentPageData?.type === 'choice' && currentPageData.chapter && (
              <div className="flex flex-col items-center justify-center min-h-full p-4 sm:p-8 bg-gradient-to-br from-purple-50 to-pink-50 overflow-y-auto">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] mb-6">
                  <GitBranch className="w-8 h-8 text-white" />
                </div>
                
                <h2 className="text-2xl font-black text-purple-900 text-center mb-4">Que fais-tu ?</h2>
                
                <p className="text-lg text-gray-700 text-center mb-8 max-w-md">
                  {currentPageData.chapter.choice_question}
                </p>
                
                <div className="flex flex-col gap-4 w-full max-w-md">
                  {currentPageData.chapter.choice_option_a && (
                    <button onClick={() => handleChoice('A')} className="bg-gradient-to-r from-amber-400 to-orange-400 text-black font-black py-4 px-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none text-lg">
                      🅰️ {currentPageData.chapter.choice_option_a}
                    </button>
                  )}
                  
                  {currentPageData.chapter.choice_option_b && (
                    <button onClick={() => handleChoice('B')} className="bg-gradient-to-r from-purple-400 to-pink-400 text-black font-black py-4 px-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none text-lg">
                      🅱️ {currentPageData.chapter.choice_option_b}
                    </button>
                  )}
                </div>
                
                {choicesHistory.length > 0 && (
                  <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm">Choix précédents :</p>
                    <div className="flex gap-2 justify-center mt-2">
                      {choicesHistory.map((h, i) => (
                        <span key={i} className={`w-8 h-8 rounded-full border-2 border-black font-black flex items-center justify-center ${h.choice === 'A' ? 'bg-amber-400' : 'bg-purple-400'}`}>
                          {h.choice}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Content (linear) */}
            {currentPageData?.type === 'content' && currentPageData.content && (
              <div className="flex flex-col h-full p-4 sm:p-8 overflow-y-auto">
                <div className="flex-1">
                  <p className="text-lg sm:text-xl leading-relaxed text-gray-800 font-medium" style={{ fontFamily: 'Georgia, serif' }}>
                    {currentPageData.content[0]}
                  </p>
                </div>
              </div>
            )}

            {/* End Page */}
            {currentPageData?.type === 'end' && (
              <div className="relative w-full h-full">
                {endingImageUrl ? (
                  <>
                    <img 
                      src={endingImageUrl} 
                      alt="La fin de l'aventure" 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-4 sm:p-6 overflow-y-auto">
                      <div className="text-center space-y-3 mb-4">
                        <h2 className="text-3xl sm:text-5xl font-black text-white uppercase drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                          Fin
                        </h2>
                        
                        <p className="text-lg sm:text-xl text-amber-300 font-bold drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                          {hasTwoHeroes ? "Et ils vécurent heureux..." : "Et vécut heureux..."}
                        </p>
                        
                        <p className="text-base text-white/90">
                          Pour {hero1Name}{hasTwoHeroes && ` & ${hero2Name}`}
                        </p>
                        
                        {chapters.length > 0 && choicesHistory.length > 0 && (
                          <div className="bg-white/20 backdrop-blur-sm border-4 border-white/50 p-3 inline-block">
                            <p className="text-white font-bold text-sm mb-1">🎭 Ton parcours :</p>
                            <div className="flex gap-2 justify-center">
                              {choicesHistory.map((h, i) => (
                                <span key={i} className={`w-8 h-8 rounded-full border-2 border-black font-black flex items-center justify-center ${h.choice === 'A' ? 'bg-amber-400' : 'bg-purple-400'}`}>
                                  {h.choice}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {storyId && (
                        <div className="bg-white/20 backdrop-blur-sm border-4 border-white/50 p-3 mb-4">
                          <p className="text-white font-bold text-sm mb-2">⭐ Comment était l'histoire ?</p>
                          <StarRating storyId={storyId} size="md" />
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 justify-center">
                        <Link 
                          href="/library" 
                          onClick={() => triggerVibration()}
                          className="bg-green-500 text-black font-black py-2 px-4 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none text-sm"
                        >
                          💾 Sauvegarder
                        </Link>
                        {chapters.length > 0 && (
                          <button onClick={restartStory} className="bg-purple-500 text-white font-black py-2 px-4 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none text-sm">
                            🔄 Rejouer
                          </button>
                        )}
                        <Link href="/" className="bg-indigo-900 border-4 border-black px-4 py-2 text-white font-black shadow-[4px_4px_0px_rgba(0,0,0,1)] text-sm">
                          Menu
                        </Link>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col h-full items-center justify-center text-center space-y-4 p-4 sm:p-6 bg-gradient-to-br from-amber-100 via-orange-50 to-amber-100 overflow-y-auto">
                    <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                      <Sparkles className="w-8 h-8 text-black" />
                    </div>
                    
                    <h2 className="text-3xl font-black text-indigo-900 uppercase">Fin</h2>
                    
                    <p className="text-lg text-gray-600">
                      {hasTwoHeroes ? "Et ils vécurent heureux..." : "Et vécut heureux..."}
                    </p>

                    <div className="bg-indigo-50 border-4 border-indigo-200 p-3">
                      <p className="text-sm text-gray-500">Pour</p>
                      <p className="text-xl font-black text-indigo-900">{hero1Name}{hasTwoHeroes && ` & ${hero2Name}`}</p>
                    </div>

                    {storyId && (
                      <div className="bg-white border-4 border-indigo-200 p-3">
                        <p className="text-indigo-900 font-bold text-sm mb-1">⭐ Comment était l'histoire ?</p>
                        <StarRating storyId={storyId} size="md" />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 justify-center">
                      <Link 
                        href="/library" 
                        onClick={() => triggerVibration()}
                        className="bg-green-500 text-black font-black py-2 px-4 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] text-sm"
                      >
                        💾 Sauvegarder
                      </Link>
                      {chapters.length > 0 && (
                        <button onClick={restartStory} className="bg-purple-500 text-white font-black py-2 px-4 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] text-sm">
                          🔄 Rejouer
                        </button>
                      )}
                      <Link href="/" className="bg-indigo-900 border-4 border-black px-4 py-2 text-white font-black shadow-[4px_4px_0px_rgba(0,0,0,1)] text-sm">
                        Menu
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation du bas */}
        {currentPageData?.type !== 'choice' && currentPageData?.type !== 'end' && (
          <div className="mt-3 flex items-center justify-between px-2">
            <button 
              onClick={goToPrevPage} 
              disabled={currentPage === 0 || isFlipping} 
              className="flex items-center gap-1 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Précédent</span>
            </button>
            
            <div className="flex gap-1.5">
              {pages.map((_, idx) => (
                <button 
                  key={idx} 
                  onClick={() => !isFlipping && setCurrentPage(idx)} 
                  className={`w-2 h-2 rounded-full transition-all ${idx === currentPage ? 'bg-amber-500 w-6' : 'bg-gray-300 hover:bg-gray-400'}`} 
                />
              ))}
            </div>
            
            <button 
              onClick={goToNextPage} 
              disabled={currentPage === totalPages - 1 || isFlipping} 
              className="flex items-center gap-1 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <span className="hidden sm:inline">Suivant</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReadStory() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-amber-50">
        <BookOpen className="w-16 h-16 text-amber-600 animate-pulse" />
      </div>
    }>
      <StoryContent />
    </Suspense>
  );
}
