// Constants pour les relations entre héros
// Ce fichier NE doit PAS être un fichier "use server"

export const relationshipTypes = [
  { id: 'frere', emoji: '👬', label: 'Frère de' },
  { id: 'soeur', emoji: '👭', label: 'Sœur de' },
  { id: 'frere_soeur', emoji: '👫', label: 'Frère/Sœur de' },
  { id: 'ami', emoji: '🤝', label: 'Ami de' },
  { id: 'cousin', emoji: '👨‍👩‍👧‍👦', label: 'Cousin de' },
  { id: 'jumeau', emoji: '👯', label: 'Jumeau de' },
  { id: 'voisin', emoji: '🏠', label: 'Voisin de' },
  { id: 'camarade', emoji: '🎒', label: 'Camarade de' },
  { id: 'parent', emoji: '👨‍👩‍👧', label: 'Parent de' },
  { id: 'enfant', emoji: '👶', label: 'Enfant de' },
  { id: 'tonton', emoji: '🧔', label: 'Tonton de' },
  { id: 'tata', emoji: '👩', label: 'Tata de' },
  { id: 'grandparent', emoji: '👴', label: 'Grand-parent de' },
  { id: 'petitenfant', emoji: '👧', label: 'Petit-enfant de' },
  { id: 'neveu', emoji: '🧒', label: 'Neveu/Nièce de' },
] as const;

export type RelationshipType = typeof relationshipTypes[number]['id'];

/**
 * Récupère le label formaté d'une relation
 */
export function getRelationshipLabel(relationType: string, toHeroName: string): string {
  const type = relationshipTypes.find(r => r.id === relationType);
  if (!type) return `Lié à ${toHeroName}`;
  return `${type.label} ${toHeroName}`;
}
