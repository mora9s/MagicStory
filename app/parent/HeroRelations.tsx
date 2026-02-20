'use client';

import React, { useState, useEffect } from 'react';
import { getHeroRelationships, deleteHeroRelationship } from '@/lib/actions';
import { relationshipTypes } from '@/lib/relationships';
import { triggerVibration } from '@/lib/haptics';
import { Users, Trash2 } from 'lucide-react';
import type { HeroRelationship } from '@/lib/types';

interface HeroRelationsProps {
  profileId: string;
}

export default function HeroRelations({ profileId }: HeroRelationsProps) {
  const [relations, setRelations] = useState<HeroRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadRelations();
  }, [profileId]);
  
  const loadRelations = async () => {
    const result = await getHeroRelationships(profileId);
    if (result.data) {
      setRelations(result.data);
    }
    setLoading(false);
  };

  const handleDelete = async (relationshipId: string) => {
    if (!confirm('Supprimer cette relation ?')) return;
    
    const result = await deleteHeroRelationship(relationshipId);
    if (!result.error) {
      setRelations(relations.filter(r => r.id !== relationshipId));
      triggerVibration();
    }
  };
  
  if (loading || relations.length === 0) return null;
  
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {relations.slice(0, 3).map((rel) => {
        const type = relationshipTypes.find(t => t.id === rel.relation_type);
        return (
          <span 
            key={rel.id}
            className="inline-flex items-center gap-1 bg-indigo-100 border-2 border-indigo-300 px-2 py-0.5 rounded text-xs font-bold text-indigo-800"
            title={`${type?.label} ${rel.to_hero?.first_name}`}
          >
            {type?.emoji} {rel.to_hero?.first_name}
          </span>
        );
      })}
      {relations.length > 3 && (
        <span className="inline-flex items-center gap-1 bg-gray-100 border-2 border-gray-300 px-2 py-0.5 rounded text-xs font-bold text-gray-600">
          +{relations.length - 3}
        </span>
      )}
    </div>
  );
}
