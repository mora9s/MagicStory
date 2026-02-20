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
