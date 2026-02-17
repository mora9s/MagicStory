'use client';

import React, { useState, Suspense, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { triggerVibration } from '@/lib/haptics';
import { getStoryById } from '@/lib/actions';
import { Sparkles, BookOpen, ChevronLeft, ChevronRight, Home, Share2, Download, FileText } from 'lucide-react';

function StoryContent() {
  const searchParams = useSearchParams();
  
  const storyId = searchParams.get('id') || '';
  
  // État pour les données de l'histoire (chargées depuis la DB ou URL)
  const [storyData, setStoryData] = useState({
    hero1Name: searchParams.get('hero1Name') || searchParams.get('name') || 'ton héros',
    hero2Name: searchParams.get('hero2Name') || '',
    world: searchParams.get('world') || 'Forêt Enchantée',
    theme: searchParams.get('theme') || 'Aventure',
    title: searchParams.get('title') || '',
    content: searchParams.get('content') || '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(!!storyId);
  
  // Charger l'histoire depuis la DB si on a un ID
  useEffect(() => {
    if (storyId) {
      getStoryById(storyId).then((result) => {
        if (result.data) {
          setStoryData({
            hero1Name: result.data.profile?.first_name || storyData.hero1Name,
            hero2Name: storyData.hero2Name,
            world: storyData.world,
            theme: result.data.theme || storyData.theme,
            title: result.data.title,
            content: result.data.content,
            imageUrl: result.data.image_url || '',
          });
          console.log('✅ Histoire chargée depuis DB:', result.data.title);
          console.log('🖼️ Image URL:', result.data.image_url ? result.data.image_url.substring(0, 50) + '...' : 'Aucune');
        }
        setLoading(false);
      });
    } else {
      // Pas d'ID, utiliser les données de l'URL
      const rawImageUrl = searchParams.get('imageUrl') || '';
      try {
        const decodedImageUrl = rawImageUrl ? decodeURIComponent(rawImageUrl) : '';
        setStoryData(prev => ({ ...prev, imageUrl: decodedImageUrl }));
      } catch (e) {
        setStoryData(prev => ({ ...prev, imageUrl: rawImageUrl }));
      }
      setLoading(false);
    }
  }, [storyId]);
  
  const { hero1Name, hero2Name, world, theme, title, content, imageUrl } = storyData;
  
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'left' | 'right'>('right');
  const [exporting, setExporting] = useState(false);
  
  // Refs pour la gestion des gestes tactiles
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const bookRef = useRef<HTMLDivElement>(null);

  // Fallback content si pas de génération IA
  const hasTwoHeroes = !!hero2Name;
  const displayTitle = title || `L'aventure de ${hero1Name}${hero2Name ? ` et ${hero2Name}` : ''}`;
  
  const fallbackContent = hasTwoHeroes
    ? `Il était une fois, dans un monde appelé ${world}, 
deux courageux amis nommés ${hero1Name} et ${hero2Name}. 

L'aventure ne faisait que commencer...

Cette histoire a été créée spécialement pour vous ! 🌟`
    : `Il était une fois, dans un monde appelé ${world}, 
un courageux héros nommé ${hero1Name}. 

L'aventure ne faisait que commencer...

Cette histoire a été créée spécialement pour toi ! 🌟`;

  const displayContent = content || fallbackContent;
  
  // Diviser le contenu en pages
  const paragraphs = displayContent.split('\n\n').filter(p => p.trim());
  
  // Créer les pages du livre
  // Page 1: Couverture (image + titre)
  // Page 2+: Directement l'histoire (pas de page titre)
  const pages = [
    // Page de couverture
    {
      type: 'cover',
      content: null,
    },
    // Pages de contenu (1-2 paragraphes par page pour commencer vite)
    ...paragraphs.reduce((acc: { type: string; content: string[] }[], paragraph, index) => {
      const pageIndex = Math.floor(index / 1.5); // 1-2 paragraphes par page
      if (!acc[pageIndex]) {
        acc[pageIndex] = { type: 'content', content: [] };
      }
      acc[pageIndex].content.push(paragraph);
      return acc;
    }, []),
    // Page de fin
    {
      type: 'end',
      content: null,
    }
  ];

  const totalPages = pages.length;

  const goToNextPage = () => {
    if (currentPage < totalPages - 1 && !isFlipping) {
      triggerVibration();
      setFlipDirection('right');
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
      setFlipDirection('left');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(prev => prev - 1);
        setIsFlipping(false);
      }, 300);
    }
  };

  // Gestion des gestes tactiles (swipe)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;
    
    // Vérifier que c'est un swipe horizontal (pas un scroll vertical)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        // Swipe gauche = page suivante
        goToNextPage();
      } else {
        // Swipe droite = page précédente
        goToPrevPage();
      }
    }
    
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Export PDF simple (version texte)
  const exportToPDF = async () => {
    triggerVibration();
    setExporting(true);
    
    try {
      const heroDisplay = hasTwoHeroes 
        ? `${hero1Name} et ${hero2Name}` 
        : hero1Name;
      
      // Créer le contenu du PDF en HTML
      const htmlContent = `
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Georgia&display=swap');
              body { font-family: Georgia, serif; padding: 40px; line-height: 1.8; }
              h1 { color: #4c1d95; text-align: center; font-size: 28px; margin-bottom: 30px; }
              .meta { text-align: center; color: #666; margin-bottom: 40px; font-size: 14px; }
              .content { font-size: 16px; text-align: justify; }
              .page-break { page-break-after: always; }
              .cover { text-align: center; padding-top: 100px; }
              .cover img { max-width: 400px; border: 5px solid #333; }
              .end { text-align: center; padding-top: 150px; font-style: italic; color: #666; }
            </style>
          </head>
          <body>
            <div class="cover">
              <h1>${displayTitle}</h1>
              <p class="meta">Une histoire pour ${heroDisplay}<br>
              dans ${world}<br>
              Thème: ${theme}</p>
              ${imageUrl ? `<img src="${imageUrl}" alt="Illustration">` : ''}
            </div>
            <div class="page-break"></div>
            <div class="content">
              ${paragraphs.map(p => `<p>${p}</p>`).join('')}
            </div>
            <div class="page-break"></div>
            <div class="end">
              <h2>~ Fin ~</h2>
              <p>Histoire créée le ${new Date().toLocaleDateString('fr-FR')} avec MagicStory</p>
            </div>
          </body>
        </html>
      `;
      
      // Ouvrir dans une nouvelle fenêtre pour impression PDF
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    } catch (e) {
      console.error('Erreur export:', e);
      alert('Erreur lors de l\'export. Essaie la fonction Imprimer de ton navigateur (Ctrl+P)');
    }
    
    setExporting(false);
  };

  // Export simple (impression)
  const printStory = () => {
    triggerVibration();
    window.print();
  };

  const currentPageData = pages[currentPage];

  // Écran de chargement
  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-amber-100 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-amber-800 font-bold text-lg">Chargement de l'histoire...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-amber-100 print:bg-white print:p-0 flex flex-col overflow-hidden">
      {/* AUCUN HEADER - Le livre prend tout l'écran */}
      
      {/* Le Livre - Prend tout l'écran avec gestes tactiles */}
      <div 
        ref={bookRef}
        className="flex-1 w-full max-w-2xl mx-auto print:max-w-none flex flex-col px-2 pb-2"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative bg-amber-800 rounded-r-lg rounded-l-sm shadow-2xl p-1 sm:p-3 print:bg-white print:shadow-none print:p-0 flex-1 flex flex-col h-full" style={{ perspective: '1000px' }}>
          {/* Ombre du livre - cachée en print */}
          <div className="absolute inset-0 bg-black/20 rounded-r-lg rounded-l-sm transform translate-x-1 translate-y-1 sm:translate-x-3 sm:translate-y-3 -z-10 print:hidden"></div>
          
          {/* Pages - Prend tout l'espace disponible */}
          <div 
            className={`relative bg-white flex-1 rounded-r-md rounded-l-sm border-l-4 sm:border-l-8 border-amber-700 shadow-inner overflow-hidden transition-transform duration-300 print:border-none print:shadow-none h-full ${
              isFlipping ? (flipDirection === 'right' ? 'transform rotate-y-12' : 'transform -rotate-y-12') : ''
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Contenu de la page */}
            <div className="h-full flex flex-col print:p-0 relative">
              
              {/* Page de couverture - Image pleine page SANS MARGES */}
              {currentPageData.type === 'cover' && (
                <div className="absolute inset-0 w-full h-full flex flex-col">
                  {/* Compteur de page en haut */}
                  <div className="absolute top-3 right-3 z-20 bg-white/90 border-2 border-black px-2 py-1 shadow-[2px_2px_0px_rgba(0,0,0,1)] print:hidden">
                    <span className="font-black text-xs">Couverture</span>
                  </div>
                  
                  {/* Image pleine page - prend tout l'espace */}
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400">
                    {imageUrl ? (
                      <img 
                        src={imageUrl}
                        alt="Illustration de l'histoire"
                        className="w-full h-full object-cover"
                        style={{ objectPosition: 'center center' }}
                        onError={(e) => {
                          console.error('❌ Erreur chargement image:', imageUrl.substring(0, 100));
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log('✅ Image chargée avec succès');
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <BookOpen className="w-24 h-24 sm:w-32 sm:h-32 text-white/50 mb-4" />
                        <p className="text-white/70 text-sm">Illustration en cours de génération...</p>
                      </div>
                    )}
                    {/* Overlay sombre pour lisibilité du texte */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20"></div>
                  </div>
                  
                  {/* Titre superposé sur l'image - adapté mobile */}
                  <div className="relative z-10 mt-auto p-4 sm:p-8 text-center">
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-tighter drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] mb-2 sm:mb-4 print:text-5xl leading-tight">
                      {displayTitle}
                    </h1>
                    <p className="text-lg sm:text-2xl text-amber-300 font-bold drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                      {hasTwoHeroes 
                        ? `Une aventure pour ${hero1Name} & ${hero2Name}`
                        : `Une histoire pour ${hero1Name}`
                      }
                    </p>
                    <div className="flex gap-2 sm:gap-3 justify-center mt-4 sm:mt-6 flex-wrap">
                      <span className="bg-amber-500 border-2 border-black px-2 sm:px-4 py-1 sm:py-2 font-black text-black text-sm sm:text-base">
                        {world}
                      </span>
                      <span className="bg-white border-2 border-black px-2 sm:px-4 py-1 sm:py-2 font-black text-black text-sm sm:text-base">
                        {theme}
                      </span>
                    </div>
                  </div>

                  <p className="relative z-10 text-white/70 text-xs sm:text-sm italic text-center pb-2 sm:pb-4 print:hidden">
                    → Tourne la page pour commencer
                  </p>
                </div>
              )}

              {/* Pages de contenu - directement l'histoire */}
              {currentPageData.type === 'content' && currentPageData.content && (
                <div className="flex flex-col h-full overflow-y-auto p-4 sm:p-8">
                  {/* Compteur de page en haut */}
                  <div className="absolute top-3 right-3 z-20 bg-gray-100 border-2 border-black px-2 py-1 shadow-[2px_2px_0px_rgba(0,0,0,1)] print:hidden">
                    <span className="font-black text-xs text-gray-600">{currentPage} / {totalPages - 2}</span>
                  </div>
                  
                  {/* Contenu - sans en-tête pour démarrer directement l'histoire */}
                  <div className="flex-1 space-y-4 sm:space-y-6 print:space-y-4">
                    {currentPageData.content.map((paragraph, idx) => (
                      <p 
                        key={idx} 
                        className="text-lg sm:text-xl md:text-2xl leading-relaxed text-gray-800 font-medium print:text-base"
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Page de fin */}
              {currentPageData.type === 'end' && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 sm:space-y-8 print:space-y-4 p-4 sm:p-8 relative">
                  {/* Compteur de page en haut */}
                  <div className="absolute top-3 right-3 z-20 bg-gray-100 border-2 border-black px-2 py-1 shadow-[2px_2px_0px_rgba(0,0,0,1)] print:hidden">
                    <span className="font-black text-xs text-gray-600">Fin</span>
                  </div>
                  
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-amber-500 rounded-full flex items-center justify-center border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] print:shadow-none print:w-16 print:h-16">
                    <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-black print:w-8 print:h-8" />
                  </div>
                  
                  <h2 className="text-2xl sm:text-4xl font-black text-indigo-900 uppercase print:text-3xl">
                    Fin
                  </h2>
                  
                  <p className="text-lg sm:text-xl text-gray-600 max-w-md print:text-lg px-2">
                    {hasTwoHeroes 
                      ? "Et ils vécurent heureux... jusqu'à leur prochaine aventure ensemble !"
                      : "Et vécut heureux... jusqu'à la prochaine aventure !"
                    }
                  </p>

                  <div className="bg-indigo-50 border-4 border-indigo-200 p-4 sm:p-6 rounded-lg max-w-sm print:border-2 print:p-4">
                    <p className="text-xs sm:text-sm text-gray-500 mb-2">Histoire créée pour</p>
                    <p className="text-xl sm:text-2xl font-black text-indigo-900 print:text-xl">
                      {hero1Name}{hasTwoHeroes && ` & ${hero2Name}`}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-2">{new Date().toLocaleDateString('fr-FR')}</p>
                  </div>

                  <button
                    onClick={() => setCurrentPage(0)}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-black py-3 px-6 border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none print:hidden"
                  >
                    📖 Relire l'histoire
                  </button>

                  {/* Actions à la fin de l'histoire */}
                  <div className="flex flex-wrap gap-2 justify-center mt-4 print:hidden">
                    <Link 
                      href="/"
                      onClick={() => triggerVibration()}
                      className="bg-indigo-900 border-2 border-black px-4 py-2 text-white font-black uppercase text-sm hover:bg-indigo-800 shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-1"
                    >
                      <Home className="w-4 h-4" />
                      Menu
                    </Link>
                    
                    <button 
                      onClick={exportToPDF}
                      disabled={exporting}
                      className="bg-purple-600 border-2 border-black px-4 py-2 text-white font-black uppercase text-sm hover:bg-purple-500 shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-1 disabled:opacity-50"
                    >
                      <FileText className="w-4 h-4" />
                      {exporting ? '...' : 'PDF'}
                    </button>
                    
                    <button 
                      onClick={() => {
                        triggerVibration();
                        if (typeof window !== 'undefined') {
                          navigator.clipboard.writeText(window.location.href);
                          alert('Lien copié ! 📚');
                        }
                      }}
                      className="bg-amber-500 border-2 border-black px-4 py-2 text-black font-black uppercase text-sm hover:bg-amber-400 shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-1"
                    >
                      <Share2 className="w-4 h-4" />
                      Partager
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Effet de reliure - caché en print */}
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-amber-800 via-amber-600 to-transparent opacity-30 print:hidden"></div>
          </div>
        </div>

        {/* Navigation minimaliste - cachée en print */}
        <div className="mt-2 flex items-center justify-center gap-2 print:hidden">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 0 || isFlipping}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
            aria-label="Page précédente"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Indicateurs de page compacts */}
          <div className="flex gap-1">
            {pages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (!isFlipping) {
                    triggerVibration();
                    setIsFlipping(true);
                    setTimeout(() => {
                      setCurrentPage(idx);
                      setIsFlipping(false);
                    }, 150);
                  }
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentPage 
                    ? 'bg-amber-500 w-3' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages - 1 || isFlipping}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
            aria-label="Page suivante"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Hint pour swipe sur mobile */}
        <p className="text-center mt-1 text-gray-400 text-[10px] font-medium print:hidden sm:hidden">
          ← Swipe pour tourner →
        </p>
      </div>
    </div>
  );
}

export default function ReadStory() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-amber-50">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-amber-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 font-bold text-xl">Ouverture du livre...</p>
        </div>
      </div>
    }>
      <StoryContent />
    </Suspense>
  );
}
