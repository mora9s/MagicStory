'use client';

import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { rateStory, getStoryRating } from '@/lib/actions';
import { triggerVibration } from '@/lib/haptics';

interface StarRatingProps {
  storyId: string;
  initialRating?: number | null;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onRate?: (rating: number) => void;
}

export default function StarRating({ 
  storyId, 
  initialRating = null, 
  readOnly = false,
  size = 'md',
  onRate 
}: StarRatingProps) {
  const [rating, setRating] = useState<number | null>(initialRating);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [hasRated, setHasRated] = useState<boolean>(!!initialRating);
  const [loading, setLoading] = useState(false);

  // Charger la note si pas fournie
  useEffect(() => {
    if (!initialRating && !readOnly) {
      loadRating();
    }
  }, [storyId]);

  const loadRating = async () => {
    const result = await getStoryRating(storyId);
    if (result.data?.rating) {
      setRating(result.data.rating);
      setHasRated(true);
    }
  };

  const handleRate = async (value: number) => {
    if (readOnly || loading) return;

    triggerVibration();
    setLoading(true);

    const result = await rateStory(storyId, value);
    
    if (result.data?.success) {
      setRating(value);
      setHasRated(true);
      onRate?.(value);
    }

    setLoading(false);
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const containerClasses = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-3'
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`flex ${containerClasses[size]}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => !readOnly && setHoverRating(star)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            disabled={readOnly || loading}
            className={`transition-all ${
              readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            } ${loading ? 'opacity-50' : ''}`}
          >
            <Star
              className={`${sizeClasses[size]} transition-colors ${
                (hoverRating ? star <= hoverRating : star <= (rating || 0))
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-transparent text-gray-400'
              }`}
            />
          </button>
        ))}
      </div>
      
      {hasRated && !readOnly && (
        <p className="text-amber-400 text-sm font-bold">
          Tu as noté cette histoire {rating}/5 ⭐
        </p>
      )}
      
      {!hasRated && !readOnly && (
        <p className="text-gray-400 text-sm">
          Clique pour noter l'histoire
        </p>
      )}
    </div>
  );
}
