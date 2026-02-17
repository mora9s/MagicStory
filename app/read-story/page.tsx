'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { triggerVibration } from '@/lib/haptics';
import { Sparkles, BookOpen, ChevronLeft, ChevronRight, Home, Share2, Download, FileText } from 'lucide-react';

function StoryContent() {
  const searchParams = useSearchParams();
  
  const hero1Name = searchParams.get('hero1Name') || searchParams.get('name') || 'ton héros';
  const hero2Name = searchParams.get('hero2Name');
  const world = searchParams.get('world') || 'Forêt Enchantée';
  const theme = searchParams.get('theme') || 'Aventure';
  const title = searchParams.get('title') || `L'aventure de ${hero1Name}${hero2Name ? ` et ${hero2Name}` : ''}`;
  const content = searchParams.get('content') || '';
  const rawImageUrl = searchParams.get('imageUrl') || '';
  
  // Debug
  console.log('Raw imageUrl from URL:', rawImageUrl);
  
  let imageUrl = '';
  try {
    imageUrl = rawImageUrl ? decodeURIComponent(rawImageUrl) : '';
  } catch (e) {
    console.error('Erreur décodage imageUrl:', e);
    imageUrl = rawImageUrl;
  }
  
  console.log('Decoded imageUrl:', imageUrl);
  
  const storyId = searchParams.get('id') || '';
  
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'left' | 'right'>('right');
  const [exporting, setExporting] = useState(false);

  // Fallback content si pas de génération IA
  const hasTwoHeroes = !!hero2Name;
  
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
  const coverImage = imageUrl || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80";
  
  // Diviser le contenu en pages
  const paragraphs = displayContent.split('\n\n').filter(p => p.trim());
  
  // Créer les pages du livre
  const pages = [
    // Page de couverture
    {
      type: 'cover',
      content: null,
    },
    // Pages de contenu (2 paragraphes par page)
    ...paragraphs.reduce((acc: { type: string; content: string[] }[], paragraph, index) => {
      const pageIndex = Math.floor(index / 2);
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
              <h1>${decodeURIComponent(title)}</h1>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-amber-100 p-4 sm:p-8 print:bg-white print:p-0">
      {/* Header - caché en print */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link 
          href="/"
          onClick={() => triggerVibration()}
          className="bg-indigo-900 border-4 border-black p-3 text-white font-black uppercase tracking-tighter hover:bg-indigo-800 shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
        >
          <Home className="w-5 h-5" />
          <span className="hidden sm:inline">Menu</span>
        </Link>
        
        <div className="bg-white border-4 border-black px-4 py-2 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <span className="font-black text-lg">
            Page {currentPage + 1} / {totalPages}
          </span>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={exportToPDF}
            disabled={exporting}
            className="bg-purple-600 border-4 border-black p-3 text-white font-black uppercase tracking-tighter hover:bg-purple-500 shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
            title="Exporter en PDF"
          >
            <FileText className="w-5 h-5" />
            <span className="hidden sm:inline">{exporting ? '...' : 'PDF'}</span>
          </button>
          
          <button 
            onClick={() => {
              triggerVibration();
              if (typeof window !== 'undefined') {
                navigator.clipboard.writeText(window.location.href);
                alert('Lien copié ! 📚');
              }
            }}
            className="bg-amber-500 border-4 border-black p-3 text-black font-black uppercase tracking-tighter hover:bg-amber-400 shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            <span className="hidden sm:inline">Partager</span>
          </button>
        </div>
      </div>

      {/* Le Livre */}
      <div className="max-w-4xl mx-auto print:max-w-none">
        <div className="relative bg-amber-800 rounded-r-lg rounded-l-sm shadow-2xl p-4 sm:p-8 print:bg-white print:shadow-none print:p-0" style={{ perspective: '1000px' }}>
          {/* Ombre du livre - cachée en print */}
          <div className="absolute inset-0 bg-black/20 rounded-r-lg rounded-l-sm transform translate-x-4 translate-y-4 -z-10 print:hidden"></div>
          
          {/* Pages */}
          <div 
            className={`relative bg-white min-h-[500px] sm:min-h-[600px] rounded-r-md rounded-l-sm border-l-8 border-amber-700 shadow-inner overflow-hidden transition-transform duration-300 print:border-none print:shadow-none print:min-h-0 ${
              isFlipping ? (flipDirection === 'right' ? 'transform rotate-y-12' : 'transform -rotate-y-12') : ''
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Contenu de la page */}
            <div className="p-6 sm:p-12 h-full flex flex-col print:p-0">
              
              {/* Page de couverture */}
              {currentPageData.type === 'cover' && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-8 print:space-y-4">
                  <div className="relative w-full h-64 sm:h-80 print:h-96 bg-indigo-100 rounded-lg border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] print:shadow-none overflow-hidden">
                    {coverImage ? (
                      <img 
                        src={coverImage}
                        alt="Illustration de l'histoire"
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="w-20 h-20 text-indigo-300" />
                      </div>
                    )}
                    <div className="absolute -top-4 -right-4 bg-amber-500 border-4 border-black px-4 py-2 transform rotate-12 shadow-[4px_4px_0px_rgba(0,0,0,1)] print:hidden">
                      <Sparkles className="w-6 h-6 text-black" />
                    </div>
                  </div>
                  
                  <div>
                    <h1 className="text-3xl sm:text-5xl font-black text-indigo-900 uppercase tracking-tighter drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)] mb-4 print:text-4xl">
                      {decodeURIComponent(title)}
                    </h1>
                    <p className="text-xl text-gray-600 font-bold">
                      {hasTwoHeroes 
                        ? `Une aventure magique pour ${hero1Name} et ${hero2Name}`
                        : `Une histoire magique pour ${hero1Name}`
                      }
                    </p>
                  </div>

                  <div className="flex gap-4 text-sm font-bold text-gray-500 flex-wrap justify-center print:text-base">
                    {hasTwoHeroes ? (
                      <>
                        <span className="bg-indigo-100 px-3 py-1 rounded-full border-2 border-indigo-300">
                          {hero1Name}
                        </span>
                        <span className="bg-purple-100 px-3 py-1 rounded-full border-2 border-purple-300">
                          {hero2Name}
                        </span>
                      </>
                    ) : null}
                    <span className="bg-amber-100 px-3 py-1 rounded-full border-2 border-amber-300">
                      {world}
                    </span>
                    <span className="bg-pink-100 px-3 py-1 rounded-full border-2 border-pink-300">
                      {theme}
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm italic print:hidden">
                    Appuie sur la flèche → pour commencer la lecture
                  </p>
                </div>
              )}

              {/* Pages de contenu */}
              {currentPageData.type === 'content' && currentPageData.content && (
                <div className="flex flex-col h-full">
                  {/* En-tête de page */}
                  <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-200 print:mb-4">
                    <span className="text-gray-400 font-bold text-sm">{decodeURIComponent(title)}</span>
                    <BookOpen className="w-5 h-5 text-gray-300" />
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 space-y-6 print:space-y-4">
                    {currentPageData.content.map((paragraph, idx) => (
                      <p 
                        key={idx} 
                        className="text-xl sm:text-2xl leading-relaxed text-gray-800 font-medium print:text-base"
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {/* Numéro de page */}
                  <div className="mt-auto pt-6 text-center print:hidden">
                    <span className="text-gray-300 font-bold text-lg">{currentPage}</span>
                  </div>
                </div>
              )}

              {/* Page de fin */}
              {currentPageData.type === 'end' && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-8 print:space-y-4">
                  <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] print:shadow-none print:w-16 print:h-16">
                    <Sparkles className="w-12 h-12 text-black print:w-8 print:h-8" />
                  </div>
                  
                  <h2 className="text-3xl sm:text-4xl font-black text-indigo-900 uppercase print:text-3xl">
                    Fin
                  </h2>
                  
                  <p className="text-xl text-gray-600 max-w-md print:text-lg">
                    {hasTwoHeroes 
                      ? "Et ils vécurent heureux... jusqu'à leur prochaine aventure ensemble !"
                      : "Et vécut heureux... jusqu'à la prochaine aventure !"
                    }
                  </p>

                  <div className="bg-indigo-50 border-4 border-indigo-200 p-6 rounded-lg max-w-sm print:border-2 print:p-4">
                    <p className="text-sm text-gray-500 mb-2">Histoire créée pour</p>
                    <p className="text-2xl font-black text-indigo-900 print:text-xl">
                      {hero1Name}{hasTwoHeroes && ` & ${hero2Name}`}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">{new Date().toLocaleDateString('fr-FR')}</p>
                  </div>

                  <button
                    onClick={() => setCurrentPage(0)}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-black py-3 px-6 border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none print:hidden"
                  >
                    📖 Relire l'histoire
                  </button>
                </div>
              )}
            </div>

            {/* Effet de reliure - caché en print */}
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-amber-800 via-amber-600 to-transparent opacity-30 print:hidden"></div>
          </div>
        </div>

        {/* Navigation - cachée en print */}
        <div className="mt-8 flex items-center justify-center gap-6 print:hidden">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 0 || isFlipping}
            className={`group bg-white border-4 border-black p-4 shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none hover:bg-gray-50 ${
              currentPage === 0 ? '' : 'hover:-translate-x-1'
            }`}
          >
            <ChevronLeft className="w-8 h-8 text-black group-hover:scale-110 transition-transform" />
          </button>

          {/* Indicateurs de page */}
          <div className="flex gap-2">
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
                className={`w-3 h-3 rounded-full border-2 border-black transition-all ${
                  idx === currentPage 
                    ? 'bg-amber-500 scale-125' 
                    : 'bg-white hover:bg-gray-200'
                }`}
              />
            ))}
          </div>

          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages - 1 || isFlipping}
            className={`group bg-amber-500 border-4 border-black p-4 shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none hover:bg-amber-400 ${
              currentPage === totalPages - 1 ? '' : 'hover:translate-x-1'
            }`}
          >
            <ChevronRight className="w-8 h-8 text-black group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Instructions - cachées en print */}
        <p className="text-center mt-4 text-gray-500 text-sm font-medium print:hidden">
          Utilise les flèches ou clique sur les points pour naviguer
        </p>

        {/* Lien vers la bibliothèque */}
        <div className="text-center mt-6 print:hidden">
          <Link 
            href="/library"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold"
          >
            <BookOpen className="w-5 h-5" />
            Voir toutes mes histoires
          </Link>
        </div>
      </div>

      {/* Footer - caché en print */}
      <div className="mt-12 text-center text-gray-400 text-sm print:hidden">
        <p className="flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          Histoire générée par IA · MagicStory
          <Sparkles className="w-4 h-4" />
        </p>
      </div>
    </div>
  );
}

export default function ReadStory() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
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
