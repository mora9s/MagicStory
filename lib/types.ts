// Types partagés entre client et serveur
// Ce fichier ne doit PAS contenir 'use server' ou 'use client'

export type HeroRelationship = {
  id: string;
  from_hero_id: string;
  to_hero_id: string;
  relation_type: string;
  created_at: string;
  to_hero?: {
    id: string;
    first_name: string;
    age: number;
    avatar_url: string | null;
  };
};

// Coûts des runes pour la création d'histoires
export const RUNE_COSTS = {
  LINEAR_STORY: 1,
  INTERACTIVE_STORY: 2,
} as const;
