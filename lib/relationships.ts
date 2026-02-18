// Constants pour les relations entre héros
// Ce fichier NE doit PAS être un fichier "use server"

export const relationshipTypes = [
  { id: 'frere', emoji: '👬', label: 'Frère de', inverse: 'frere', gendered: true },
  { id: 'soeur', emoji: '👭', label: 'Sœur de', inverse: 'soeur', gendered: true },
  { id: 'frere_soeur', emoji: '👫', label: 'Frère/Sœur de', inverse: 'frere_soeur', gendered: false },
  { id: 'ami', emoji: '🤝', label: 'Ami de', inverse: 'ami', gendered: false },
  { id: 'cousin', emoji: '👨‍👩‍👧‍👦', label: 'Cousin de', inverse: 'cousin', gendered: false },
  { id: 'jumeau', emoji: '👯', label: 'Jumeau de', inverse: 'jumeau', gendered: false },
  { id: 'voisin', emoji: '🏠', label: 'Voisin de', inverse: 'voisin', gendered: false },
  { id: 'camarade', emoji: '🎒', label: 'Camarade de', inverse: 'camarade', gendered: false },
  { id: 'parent', emoji: '👨‍👩‍👧', label: 'Parent de', inverse: 'enfant', gendered: false },
  { id: 'enfant', emoji: '👶', label: 'Enfant de', inverse: 'parent', gendered: false },
  { id: 'tonton', emoji: '🧔', label: 'Tonton de', inverse: 'neveu', gendered: false },
  { id: 'tata', emoji: '👩', label: 'Tata de', inverse: 'neveu', gendered: false },
  { id: 'grandparent', emoji: '👴', label: 'Grand-parent de', inverse: 'petitenfant', gendered: false },
  { id: 'petitenfant', emoji: '👧', label: 'Petit-enfant de', inverse: 'grandparent', gendered: false },
  { id: 'neveu', emoji: '🧒', label: 'Neveu/Nièce de', inverse: 'tonton', gendered: false },
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
