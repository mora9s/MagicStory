'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { triggerVibration } from '@/lib/haptics';

interface StoryAudioPlayerProps {
  text: string;
  className?: string;
}

export default function StoryAudioPlayer({ text, className = '' }: StoryAudioPlayerProps) {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Vérifier si on est côté client et si l'API est supportée
  useEffect(() => {
    setIsClient(true);
    
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      try {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        
        // Sélectionner la meilleure voix française
        const frenchVoice = availableVoices.find(v => 
          v.lang.includes('fr') && (
            v.name.includes('Google') || 
            v.name.includes('Microsoft') ||
            v.name.includes('Samantha')
          )
        ) || availableVoices.find(v => v.lang.includes('fr'));
        
        setSelectedVoice(frenchVoice || availableVoices[0]);
      } catch (err) {
        console.error('Error loading voices:', err);
        setIsSupported(false);
      }
    };

    loadVoices();
    
    // Chrome charge les voix de manière asynchrone
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      try {
        window.speechSynthesis.cancel();
      } catch (err) {
        // Ignore error on cleanup
      }
    };
  }, []);

  const speak = useCallback(() => {
    if (!selectedVoice || !isSupported || typeof window === 'undefined') return;
    
    try {
      triggerVibration();
      setLoading(true);
      
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = selectedVoice;
      utterance.lang = 'fr-FR';
      utterance.rate = 0.85;
      utterance.pitch = 1.1;
      utterance.volume = 1;
      
      utterance.onstart = () => {
        setSpeaking(true);
        setPaused(false);
        setLoading(false);
      };
      
      utterance.onend = () => {
        setSpeaking(false);
        setPaused(false);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech error:', event);
        setSpeaking(false);
        setPaused(false);
        setLoading(false);
      };
      
      utterance.onpause = () => {
        setPaused(true);
      };
      
      utterance.onresume = () => {
        setPaused(false);
      };
      
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Error starting speech:', err);
      setLoading(false);
      setIsSupported(false);
    }
  }, [text, selectedVoice, isSupported]);

  const pause = () => {
    if (!isSupported || typeof window === 'undefined') return;
    try {
      triggerVibration();
      window.speechSynthesis.pause();
      setPaused(true);
    } catch (err) {
      console.error('Error pausing:', err);
    }
  };

  const resume = () => {
    if (!isSupported || typeof window === 'undefined') return;
    try {
      triggerVibration();
      window.speechSynthesis.resume();
      setPaused(false);
    } catch (err) {
      console.error('Error resuming:', err);
    }
  };

  const stop = () => {
    if (!isSupported || typeof window === 'undefined') return;
    try {
      triggerVibration();
      window.speechSynthesis.cancel();
      setSpeaking(false);
      setPaused(false);
    } catch (err) {
      console.error('Error stopping:', err);
    }
  };

  const togglePlay = () => {
    if (speaking && !paused) {
      pause();
    } else if (speaking && paused) {
      resume();
    } else {
      speak();
    }
  };

  // Ne rien afficher pendant le chargement SSR ou si pas supporté
  if (!isClient || !isSupported || voices.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Bouton Play/Pause principal */}
      <button
        onClick={togglePlay}
        disabled={loading}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm
          transition-all transform active:scale-95
          ${speaking && !paused 
            ? 'bg-amber-500 text-black border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]' 
            : 'bg-white text-indigo-900 border-2 border-indigo-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-indigo-50'
          }
          ${loading ? 'opacity-70 cursor-wait' : ''}
        `}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="hidden sm:inline">Chargement...</span>
          </>
        ) : speaking && !paused ? (
          <>
            <Pause className="w-4 h-4" />
            <span className="hidden sm:inline">Pause</span>
          </>
        ) : speaking && paused ? (
          <>
            <Play className="w-4 h-4" />
            <span className="hidden sm:inline">Reprendre</span>
          </>
        ) : (
          <>
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">Écouter</span>
          </>
        )}
      </button>

      {/* Bouton Stop (visible uniquement si lecture en cours) */}
      {speaking && (
        <button
          onClick={stop}
          className="p-2 bg-red-500 text-white rounded-full border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-red-400 transition-all"
          title="Arrêter"
        >
          <VolumeX className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
