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
  const [progress, setProgress] = useState(0);

  // Charger les voix disponibles
  useEffect(() => {
    const loadVoices = () => {
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
    };

    loadVoices();
    
    // Chrome charge les voix de manière asynchrone
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Découper le texte en phrases pour une meilleure gestion
  const sentences = text.match(/[^.!?]+[.!?]+["']?|\s*\n\s*/g) || [text];

  const speak = useCallback(() => {
    if (!selectedVoice) return;
    
    triggerVibration();
    setLoading(true);
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.lang = 'fr-FR';
    utterance.rate = 0.85; // Un peu plus lent pour les enfants
    utterance.pitch = 1.1; // Légèrement plus aigu pour être plus chaleureux
    utterance.volume = 1;
    
    utterance.onstart = () => {
      setSpeaking(true);
      setPaused(false);
      setLoading(false);
    };
    
    utterance.onend = () => {
      setSpeaking(false);
      setPaused(false);
      setProgress(0);
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
  }, [text, selectedVoice]);

  const pause = () => {
    triggerVibration();
    window.speechSynthesis.pause();
    setPaused(true);
  };

  const resume = () => {
    triggerVibration();
    window.speechSynthesis.resume();
    setPaused(false);
  };

  const stop = () => {
    triggerVibration();
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
    setProgress(0);
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

  // Si pas de voix disponible (navigateur non supporté)
  if (voices.length === 0) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        🔇 Lecture audio non disponible
      </div>
    );
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
            <span>Chargement...</span>
          </>
        ) : speaking && !paused ? (
          <>
            <Pause className="w-4 h-4" />
            <span>Pause</span>
          </>
        ) : speaking && paused ? (
          <>
            <Play className="w-4 h-4" />
            <span>Reprendre</span>
          </>
        ) : (
          <>
            <Volume2 className="w-4 h-4" />
            <span>Écouter</span>
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

      {/* Indicateur de voix */}
      {selectedVoice && (
        <span className="hidden sm:inline text-xs text-gray-500">
          {selectedVoice.name.includes('Google') ? '🔊 Voix Google' : 
           selectedVoice.name.includes('Microsoft') ? '🔊 Voix Microsoft' : 
           '🔊 ' + selectedVoice.name.substring(0, 15)}
        </span>
      )}
    </div>
  );
}
