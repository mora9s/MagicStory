'use client';

import React, { useState, Suspense, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { triggerVibration } from '@/lib/haptics';
import { getStoryById, getChaptersByStory, Chapter } from '@/lib/actions';
import { Sparkles, BookOpen, ChevronLeft, ChevronRight, Home, Share2, FileText, GitBranch } from 'lucide-react';

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
    imageUrl: '',
  });
  
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterId, setCurrentChapterId] = useState<number>(1);
  const [choicesHistory, setChoicesHistory] = useState<{chapter: number; choice: 'A' | 'B'}[]>([]);
  
  const [loading, setLoading] = useState(!!storyId);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const bookRef = useRef<HTMLDivElement>(null);

  const hasTwoHeroes = !!storyData.hero2Name;
  const displayTitle = storyData.title || `L'aventure de ${storyData.hero1Name}${storyData.hero2Name ? ` et ${storyData.hero2Name}` : ''}`;

  useEffect(() => {
    if (storyId) {
      const loadStory = async () => {
        const result = await getStoryById(storyId);
        if (result.data) {
          const data = result.data;
          setStoryData(prev => ({
            ...prev,
            hero1Name: data.profile?.first_name || prev.hero1Name,
            theme: data.theme || prev.theme,
            title: data.title,
            content: data.content,
            imageUrl: data.image_url || '',
          }));
          
          if (isInteractive || data.story_type === 'interactive') {
            const chaptersResult = await getChaptersByStory(storyId);
            if (chaptersResult.data) {
              setChapters(chaptersResult.data);
            }
          }
        }
        setLoading(false);
      };
      loadStory();
    } else {
      setLoading(false);
    }
  }, [storyId, isInteractive]);

  const { hero1Name, hero2Name, world, theme, title, content, imageUrl } = storyData;

  const fallbackContent = hasTwoHeroes
    ? `Il était une fois, dans un monde appelé ${world}, deux courageux amis nommés ${hero1Name} et ${hero2Name}. L'aventure ne faisait que commencer...`
    : `Il était une fois, dans un monde appelé ${world}, un courageux héros nommé ${hero1Name}. L'aventure ne faisait que commencer...`;

  const displayContent = content || fallbackContent;

  let pages: { type: string; content: string[] | null; chapter?: Chapter }[] = [];

  if (chapters.length > 0) {
    const currentChapter = chapters.find(c => c.chapter_number === currentChapterId);
    
    if (currentChapter) {
      const hasChoice = currentChapter.has_choice === true;
      const isEnding = currentChapter.is_ending === true;
      
      pages = [
        { type: 'cover', content: null },
        { type: 'chapter', content: [currentChapter.content], chapter: currentChapter },
        ...(hasChoice ? [{ type: 'choice', content: null, chapter: currentChapter }] : []),
        ...(isEnding ? [{ type: 'end', content: null }] : []),
      ];
    }
  } else {
    const paragraphs = displayContent.split('\n\n').filter(p => p.trim());
    pages = [
      { type: 'cover', content: null },
      ...paragraphs.map(p => ({ type: 'content', content: [p] })),
      { type: 'end', content: null }
    ];
  }

  const totalPages = pages.length;
  const currentPageData = pages[currentPage];

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
      setCurrentPage(1); // Commencer directement au chapitre, pas la cover
    }
  };

  const goToNextChapter = () => {
    triggerVibration();
    // Trouver le chapitre suivant (chapter_number supérieur)
    const nextChapter = chapters
      .filter(c => c.chapter_number > currentChapterId)
      .sort((a, b) => a.chapter_number - b.chapter_number)[0];
    
    if (nextChapter) {
      setCurrentChapterId(nextChapter.chapter_number);
      setCurrentPage(1); // Commencer directement au chapitre (page 1), pas la cover (page 0)
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
      <div 
        ref={bookRef}
        className="flex-1 w-full max-w-2xl mx-auto flex flex-col px-2 pb-2"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative bg-amber-800 rounded-r-lg rounded-l-sm shadow-2xl p-1 sm:p-3 flex-1 flex flex-col h-full">
          <div className="absolute inset-0 bg-black/20 rounded-r-lg rounded-l-sm transform translate-x-1 translate-y-1 sm:translate-x-3 sm:translate-y-3 -z-10"></div>
          
          <div className="relative bg-white flex-1 rounded-r-md rounded-l-sm border-l-4 sm:border-l-8 border-amber-700 shadow-inner overflow-hidden h-full">
            <div className="h-full flex flex-col relative">
              
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
                    {imageUrl ? (
                      <img src={imageUrl} alt="Illustration" className="w-full h-full object-cover" />
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
                <div className="flex flex-col h-full overflow-y-auto p-4 sm:p-8">
                  <div className="absolute top-3 right-3 z-20 bg-purple-100 border-2 border-purple-500 px-2 py-1">
                    <span className="font-black text-xs text-purple-700">Ch. {currentPageData.chapter.chapter_number}</span>
                  </div>
                  
                  {currentPageData.chapter.title && (
                    <h2 className="text-xl font-black text-purple-900 mb-4 border-b-2 border-purple-200 pb-2">
                      {currentPageData.chapter.title}
                    </h2>
                  )}
                  
                  <p className="text-lg sm:text-xl leading-relaxed text-gray-800 font-medium" style={{ fontFamily: 'Georgia, serif' }}>
                    {currentPageData.chapter.content}
                  </p>

                  {currentPageData.chapter.has_choice === true && (
                    <div className="mt-6 bg-purple-50 border-4 border-purple-500 p-4 text-center">
                      <p className="text-purple-700 font-bold text-sm">Un choix s'impose... Tourne la page !</p>
                    </div>
                  )}

                  {/* Bouton continuer si pas de choix et pas une fin */}
                  {currentPageData.chapter.has_choice !== true && currentPageData.chapter.is_ending !== true && (
                    <div className="mt-8 flex justify-center">
                      <button 
                        onClick={goToNextChapter}
                        className="bg-gradient-to-r from-amber-400 to-orange-400 text-black font-black py-3 px-8 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center gap-2"
                      >
                        Continuer l'aventure →
                      </button>
                    </div>
                  )}

                  {/* Bouton fin si c'est une fin */}
                  {currentPageData.chapter.is_ending === true && (
                    <div className="mt-8 flex justify-center">
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
                <div className="flex flex-col items-center justify-center h-full p-4 sm:p-8 bg-gradient-to-br from-purple-50 to-pink-50">
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
                <div className="flex flex-col h-full overflow-y-auto p-4 sm:p-8">
                  <div className="absolute top-3 right-3 z-20 bg-gray-100 border-2 border-black px-2 py-1">
                    <span className="font-black text-xs">{currentPage} / {totalPages - 2}</span>
                  </div>
                  <p className="text-lg sm:text-xl leading-relaxed text-gray-800 font-medium" style={{ fontFamily: 'Georgia, serif' }}>
                    {currentPageData.content[0]}
                  </p>
                </div>
              )}

              {/* End Page */}
              {currentPageData?.type === 'end' && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6 p-4 sm:p-8">
                  <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                    <Sparkles className="w-8 h-8 text-black" />
                  </div>
                  
                  <h2 className="text-3xl font-black text-indigo-900 uppercase">
                    {chapters.length > 0 ? 'Ta Fin' : 'Fin'}
                  </h2>
                  
                  {chapters.length > 0 && choicesHistory.length > 0 && (
                    <div className="bg-purple-100 border-4 border-purple-500 p-4">
                      <p className="text-purple-800 font-bold text-sm">🎭 Ton parcours :</p>
                      <div className="flex gap-2 justify-center mt-2">
                        {choicesHistory.map((h, i) => (
                          <span key={i} className={`w-8 h-8 rounded-full border-2 border-black font-black flex items-center justify-center ${h.choice === 'A' ? 'bg-amber-400' : 'bg-purple-400'}`}>
                            {h.choice}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-lg text-gray-600">
                    {hasTwoHeroes ? "Et ils vécurent heureux..." : "Et vécut heureux..."}
                  </p>

                  <div className="bg-indigo-50 border-4 border-indigo-200 p-4">
                    <p className="text-sm text-gray-500">Pour</p>
                    <p className="text-xl font-black text-indigo-900">{hero1Name}{hasTwoHeroes && ` & ${hero2Name}`}</p>
                  </div>

                  {chapters.length > 0 && (
                    <button onClick={restartStory} className="bg-purple-500 text-white font-black py-3 px-6 border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none">
                      🔄 Rejouer
                    </button>
                  )}

                  <div className="flex flex-wrap gap-2 justify-center">
                    <Link href="/" className="bg-indigo-900 border-2 border-black px-4 py-2 text-white font-black text-sm shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center gap-1">
                      <Home className="w-4 h-4" /> Menu
                    </Link>
                    <button className="bg-amber-500 border-2 border-black px-4 py-2 text-black font-black text-sm shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                      <Share2 className="w-4 h-4 inline" /> Partager
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        {currentPageData?.type !== 'choice' && (
          <div className="mt-2 flex items-center justify-center gap-2">
            <button onClick={goToPrevPage} disabled={currentPage === 0 || isFlipping} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-1">
              {pages.map((_, idx) => (
                <button key={idx} onClick={() => !isFlipping && setCurrentPage(idx)} className={`w-1.5 h-1.5 rounded-full ${idx === currentPage ? 'bg-amber-500 w-3' : 'bg-gray-300'}`} />
              ))}
            </div>
            <button onClick={goToNextPage} disabled={currentPage === totalPages - 1 || isFlipping} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">
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
