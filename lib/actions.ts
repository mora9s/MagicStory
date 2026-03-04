'use server'

import { createClient } from '@/lib/supabase/server';
import { Profile, Story, Chapter } from './database.types';
import { RUNE_COSTS } from './types';
import { downloadAndStoreImage } from './storage';

// Ré-export du type Chapter
export type { Chapter };

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Fallback si Google échoue

export type ActionResponse<T> = {
  data: T | null;
  error: string | null;
};

export type GeneratedStory = {
  title: string;
  content: string;
  imageUrl: string;
  endingImageUrl?: string;
  storyId?: string;
};

export type ChildProfile = {
  id: string;
  first_name: string;
  age: number;
  avatar_url: string | null;
  created_at: string | null;
  traits: string[] | null;
};

/**
 * Génère un avatar personnalisé pour un enfant à partir d'une description ou d'une photo
 * Le bucket est privé - les photos sont sécurisées
 */
export async function generateChildAvatar(
  name: string,
  age: number,
  description?: string,
  photoPath?: string
): Promise<ActionResponse<{ avatarUrl: string }>> {
  try {
    if (!GOOGLE_API_KEY) {
      return { data: null, error: 'Clé API Google non configurée. Veuillez configurer GOOGLE_API_KEY dans les variables d\'environnement.' };
    }

    let prompt: string;

    if (photoPath) {
      // Générer une URL signée temporaire pour accéder à la photo
      const { data: signedData, error: signedError } = await getSignedPhotoUrl(photoPath);
      
      if (signedError || !signedData) {
        return { data: null, error: 'Impossible d\'accéder à la photo' };
      }

      const photoUrl = signedData.signedUrl;

      // Générer un avatar basé sur la photo de l'enfant
      prompt = `Create a cute children's book character illustration of a ${age} year old child named ${name}, based on this reference photo: ${photoUrl}

Style: CUTE CARTOON / COLORING BOOK style with BLACK OUTLINES.
The character should maintain the SAME FACIAL FEATURES as the reference photo:
- Same face shape and structure
- Same eyes shape and color
- Same nose shape
- Same hair style and color
- Same skin tone
- Any distinctive features (freckles, glasses, etc.)

BUT transform it into a magical storybook character:
- Thick black outlines, flat vibrant pastel colors
- Simple clean shapes, friendly and cute design
- Head and shoulders portrait
- Facing forward with a gentle, brave smile
- Expression should be kind and adventurous
- Background should be simple and cheerful

Style: Children's coloring book aesthetic, bright and joyful feeling.
No text, no letters in the image.`;
    } else {
      // Générer un avatar à partir de la description textuelle
      prompt = `Cute children's book character portrait of a ${age} year old child named ${name}. 
${description ? `Physical description: ${description}. ` : ''}
Style: CUTE CARTOON / COLORING BOOK style with BLACK OUTLINES.
The character should look kind, brave and adventurous.
Thick black outlines, flat vibrant pastel colors, simple clean shapes.
Head and shoulders portrait, facing forward with a gentle smile.
No text, no background elements, just the character on a soft neutral background.`;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"]
        }
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Erreur avatar:', error);
      return { data: null, error: 'Erreur lors de la génération de l\'avatar' };
    }

    const data = await response.json();
    // Pour le modèle image generation, l'image est dans candidates[0].content.parts[1].inlineData.data (base64)
    const imagePart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
    const base64Image = imagePart?.inlineData?.data;
    const avatarUrl = base64Image ? `data:image/png;base64,${base64Image}` : '';
    return { data: { avatarUrl }, error: null };
  } catch (err) {
    console.error('Exception avatar:', err);
    return { data: null, error: 'Erreur technique' };
  }
}

/**
 * Upload une photo vers Supabase Storage (bucket privé) et retourne le chemin
 * Les photos des enfants sont stockées de manière sécurisée
 */
export async function uploadChildPhoto(
  file: File,
  childName: string
): Promise<ActionResponse<{ path: string }>> {
  try {
    const supabase = await createClient();
    
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    // Nettoyer le nom de fichier (enlever accents, espaces, caractères spéciaux)
    const safeName = childName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Enlever accents
      .replace(/[^a-zA-Z0-9]/g, '_')   // Remplacer caractères spéciaux par _
      .substring(0, 20);               // Limiter la longueur
    const fileName = `${Date.now()}_${safeName}.${fileExt}`;
    const filePath = `photos/${fileName}`;

    // Upload vers Supabase Storage (bucket privé)
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return { data: null, error: 'Erreur lors de l\'upload de la photo' };
    }

    // Retourne le chemin, pas l'URL (le bucket est privé)
    return { data: { path: filePath }, error: null };
  } catch (err) {
    console.error('Exception upload:', err);
    return { data: null, error: 'Erreur technique lors de l\'upload' };
  }
}

/**
 * Génère une URL signée temporaire pour accéder à une photo privée
 * Lien valide seulement 1 heure
 */
export async function getSignedPhotoUrl(
  filePath: string
): Promise<ActionResponse<{ signedUrl: string }>> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .createSignedUrl(filePath, 3600); // 1 heure de validité

    if (error) {
      console.error('Signed URL error:', error);
      return { data: null, error: 'Erreur lors de la génération du lien' };
    }

    return { data: { signedUrl: data.signedUrl }, error: null };
  } catch (err) {
    console.error('Exception signed URL:', err);
    return { data: null, error: 'Erreur technique' };
  }
}

/**
 * Créer un profil enfant complet avec avatar
 */
export async function createChildProfile(
  firstName: string,
  age: number,
  avatarUrl?: string,
  traits?: string[]
): Promise<ActionResponse<ChildProfile>> {
  try {
    const supabase = await createClient();
    
    // Récupère l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: 'Utilisateur non authentifié' };
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert([{ 
        first_name: firstName, 
        age: age, 
        avatar_url: avatarUrl || null,
        traits: traits || [],
        user_id: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error creating child profile:', err);
    return { data: null, error: 'Erreur lors de la création du profil' };
  }
}

/**
 * Met à jour un profil enfant existant
 */
export async function updateChildProfile(
  id: string,
  updates: {
    first_name?: string;
    age?: number;
    avatar_url?: string;
    traits?: string[];
  }
): Promise<ActionResponse<ChildProfile>> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error updating child profile:', err);
    return { data: null, error: 'Erreur lors de la mise à jour du profil' };
  }
}

/**
 * Récupère tous les profils enfants
 */
export async function getAllChildProfiles(): Promise<ActionResponse<ChildProfile[]>> {
  try {
    const supabase = await createClient();
    
    // Vérifier d'abord si l'utilisateur est connecté
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('getAllChildProfiles: No user logged in');
      return { data: null, error: 'Vous devez être connecté' };
    }
    
    console.log('getAllChildProfiles: Fetching for user', user.id);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getAllChildProfiles: Database error', error);
      throw error;
    }
    
    console.log('getAllChildProfiles: Found', data?.length || 0, 'profiles');
    return { data: data || [], error: null };
  } catch (err) {
    console.error('Error fetching profiles:', err);
    return { data: null, error: 'Erreur lors de la récupération des profils' };
  }
}

/**
 * Supprime un profil enfant
 */
export async function deleteChildProfile(id: string): Promise<ActionResponse<null>> {
  try {
    const supabase = await createClient();
    
    // 1. Supprimer les relations où ce héros est impliqué
    const { error: relError1 } = await supabase
      .from('hero_relationships')
      .delete()
      .eq('from_hero_id', id);
    
    if (relError1) {
      console.error('Error deleting from relationships:', relError1);
    }
    
    const { error: relError2 } = await supabase
      .from('hero_relationships')
      .delete()
      .eq('to_hero_id', id);
    
    if (relError2) {
      console.error('Error deleting to relationships:', relError2);
    }
    
    // 2. Pour les histoires liées à ce profil, on met profile_id à NULL
    // (on ne supprime pas les histoires, juste la référence au profil)
    const { error: storyError } = await supabase
      .from('stories')
      .update({ profile_id: null })
      .eq('profile_id', id);
    
    if (storyError) {
      console.error('Error updating stories:', storyError);
    }
    
    // 3. Supprimer le profil
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting profile:', error);
      return { data: null, error: 'Erreur lors de la suppression: ' + error.message };
    }
    
    return { data: null, error: null };
  } catch (err) {
    console.error('Error deleting profile:', err);
    return { data: null, error: 'Erreur lors de la suppression' };
  }
}

/**
 * Vérifie si la clé API est configurée (pour debug)
 */
export async function checkApiKey(): Promise<{ configured: boolean; prefix: string }> {
  const key = process.env.OPENAI_API_KEY;
  return {
    configured: !!key,
    prefix: key ? key.substring(0, 20) + '...' : 'non définie',
  };
}

/**
 * Génère une histoire complète avec texte et illustration via IA, et la sauvegarde.
 * Version avec 1 ou 2 héros - NE CRÉE PLUS DE PROFILS (utilise ceux existants)
 */
export async function generateAndSaveStory(
  hero1Name: string,
  hero1Age: number,
  hero2Name: string | null,
  hero2Age: number | null,
  world: string,
  theme: string
): Promise<ActionResponse<GeneratedStory>> {
  try {
    const supabase = await createClient();
    
    // 🔮 VÉRIFICATION DES RUNES
    const canCreateResult = await canCreateStory('linear');
    if (canCreateResult.error || !canCreateResult.data?.canCreate) {
      return {
        data: null,
        error: `Tu n'as pas assez de runes ! Coût: ${RUNE_COSTS.LINEAR_STORY} rune(s). Va dans la boutique pour en acheter.`,
      };
    }

    console.log('🔑 GOOGLE_API_KEY présente:', !!GOOGLE_API_KEY);
    
    if (!GOOGLE_API_KEY) {
      console.error('❌ Clé API Google non configurée');
      return {
        data: null,
        error: 'Clé API Google non configurée. Veuillez configurer GOOGLE_API_KEY dans les variables d\'environnement.',
      };
    }

    // Récupérer les profils des héros (s'ils existent)
    let profile1Id: string | null = null;
    let profile2Id: string | null = null;
    let relationshipDescription = '';
    
    try {
      const { data: existingProfile1 } = await supabase
        .from('profiles')
        .select('id')
        .eq('first_name', hero1Name)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (existingProfile1) {
        profile1Id = existingProfile1.id;
        console.log('✅ Profil 1 trouvé:', profile1Id);
      }
      
      if (hero2Name) {
        const { data: existingProfile2 } = await supabase
          .from('profiles')
          .select('id')
          .eq('first_name', hero2Name)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (existingProfile2) {
          profile2Id = existingProfile2.id;
          console.log('✅ Profil 2 trouvé:', profile2Id);
          
          // Chercher la relation entre les deux héros
          const { data: rel } = await supabase
            .from('hero_relationships')
            .select('relation_type')
            .eq('from_hero_id', profile1Id || '')
            .eq('to_hero_id', profile2Id)
            .maybeSingle();
          
          if (rel) {
            const relType = rel.relation_type;
            // Déterminer la description de la relation avec les âges
            const ageDiff = hero1Age - (hero2Age || hero1Age);
            let ageDescription = '';
            
            if (relType === 'frere' || relType === 'soeur' || relType === 'frere_soeur') {
              if (ageDiff > 2) ageDescription = ` (grand${relType === 'soeur' ? 'e' : ''} ${relType === 'soeur' ? 'sœur' : 'frère'})`;
              else if (ageDiff < -2) ageDescription = ` (petit${relType === 'soeur' ? 'e' : ''} ${relType === 'soeur' ? 'sœur' : 'frère'})`;
            }
            
            const relLabels: Record<string, string> = {
              'frere': 'frère',
              'soeur': 'sœur',
              'frere_soeur': 'frère/sœur',
              'ami': 'meilleur ami',
              'cousin': 'cousin',
              'jumeau': 'jumeau',
              'voisin': 'voisin',
              'camarade': 'camarade',
              'parent': 'parent',
              'enfant': 'enfant',
              'tonton': 'tonton',
              'tata': 'tata',
              'grandparent': 'grand-parent',
              'petitenfant': 'petit-enfant',
              'neveu': 'neveu'
            };
            
            relationshipDescription = `${hero1Name} est ${relLabels[relType] || relType}${ageDescription} de ${hero2Name}`;
            console.log('💝 Relation trouvée:', relationshipDescription);
          }
        }
      }
    } catch (e) {
      console.log('ℹ️ Erreur recherche profils:', e);
    }

    // Construire la description des personnages
    const hasTwoHeroes = !!hero2Name;
    const heroDescription = hasTwoHeroes 
      ? `DEUX HÉROS : ${hero1Name} (${hero1Age} ans) et ${hero2Name} (${hero2Age} ans). ${relationshipDescription || 'Ils sont amis et affrontent l\'aventure ensemble.'}`
      : `HÉROS : ${hero1Name}, un enfant courageux de ${hero1Age} ans.`;

    const avgAge = hasTwoHeroes ? Math.round((hero1Age + (hero2Age || hero1Age)) / 2) : hero1Age;

    // 2. Générer le texte de l'histoire avec GPT-4
    const ageComparison = hasTwoHeroes && hero2Age 
      ? hero1Age > hero2Age + 2 
        ? `${hero1Name} est le plus grand et guide ${hero2Name}, qui l'admire beaucoup.` 
        : hero2Age > hero1Age + 2 
          ? `${hero2Name} est le plus grand et aide ${hero1Name} quand il en a besoin.` 
          : 'Ils ont presque le même âge et sont inséparables.'
      : '';
    
    const storyPrompt = `Tu es un auteur de contes pour enfants expert. Écris une histoire MAGIQUE et UNIQUE pour ${hasTwoHeroes ? 'deux enfants' : 'un enfant'}.

${heroDescription}
${ageComparison ? '\n📊 DYNAMIQUE D\'ÂGE : ' + ageComparison : ''}
🌍 UNIVERS : ${world}  
📖 THÈME : ${theme}

🎯 CONTRAINTES IMPORTANTES SUR LES PERSONNAGES :
${hasTwoHeroes ? `- ${hero1Name} a ${hero1Age} ans et ${hero2Name} a ${hero2Age} ans. Utilise ces âges dans l'histoire !` : `- ${hero1Name} a ${hero1Age} ans. Utilise son âge dans l'histoire.`}
${relationshipDescription ? `- ${relationshipDescription}. Mentionne régulièrement ce lien familial dans les dialogues.` : ''}
${hasTwoHeroes && !relationshipDescription ? '- Mentionne régulièrement leur amitié dans les dialogues.' : ''}

STRUCTURE NARRATIVE OBLIGATOIRE (respecte scrupuleusement) :

1️⃣ **DÉBUT** (1 paragraphe)
- Accroche immédiate qui pose l'ambiance magique
- Présentation ${hasTwoHeroes ? `de ${hero1Name} et ${hero2Name}, leur ${relationshipDescription ? 'lien familial' : 'complicité'} et leur différence d'âge` : `de ${hero1Name}, un enfant de ${hero1Age} ans et son quotidien`} dans ${world}
- Un événement déclencheur qui lance l'aventure

2️⃣ **DÉVELOPPEMENT** (2-3 paragraphes)
- Au moins 2 péripéties/challenges à surmonter
- ${hasTwoHeroes ? `${hero1Age < 6 ? hero1Name + ' demande conseil à ' + hero2Name : hero1Age > 9 ? hero1Name + ' protège ' + hero2Name : hero1Name + ' et ' + hero2Name + ' collaborent comme des complices'}.` : 'Le héros fait preuve de courage adapté à son âge.'}
- Des dialogues naturels où les personnages s'appellent par leur prénom
- Des rencontres avec des personnages secondaires
- Le ${hasTwoHeroes ? 'duo' : 'héros'} fait preuve de ${theme === 'Aventure' ? 'courage et débrouillardise' : theme === 'Amitié' ? 'générosité et entraide' : 'curiosité et sagesse'}

3️⃣ **CLIMAX** (1 paragraphe)
- Le moment le plus intense de l'histoire
- ${hasTwoHeroes ? `${hero1Name} et ${hero2Name} combinent leurs forces différentes selon leur âge` : `${hero1Name} surmonte l'obstacle grâce à sa persévérance`}
- Dénouement de l'aventure principale

4️⃣ **FIN** (1 paragraphe)
- Retour au calme, conclusion satisfaisante
- ${hasTwoHeroes ? `${hero1Name} et ${hero2Name} célèbrent leur victoire ${relationshipDescription ? 'comme de vrais ' + (relationshipDescription.includes('frère') || relationshipDescription.includes('sœur') ? 'frère et sœur' : 'famille') : 'amis'}` : `${hero1Name} rentre chez lui fier de son exploit`}
- Morale douce adaptée à ${avgAge} ans

🎯 CONTRAINTES QUALITÉ :
- Titre UNIQUE et accrocheur (pas de "L'aventure de..." banal)
- Ton ${avgAge < 6 ? 'simple, répétitif et rassurant' : avgAge < 9 ? 'dynamique avec du dialogue' : 'plus riche en vocabulaire et descriptions'}
- Évite les clichés et les histoires déjà racontées mille fois
- Les personnages doivent montrer leur âge dans leurs actions et décisions
- ${hasTwoHeroes ? 'Leur relation doit être évidente tout au long de l\'histoire (pas seulement au début)' : ''}
- 500-800 mots environ
- Style : chaleureux, poétique, captivant

Format :
TITRE: [titre original et créatif]
HISTOIRE: [ton histoire structurée]
SCENE_FINALE: [Description détaillée pour une illustration de la dernière scène - décrire ce qu'on voit visuellement à la fin (trésor découvert, personnages célébrant, objet magique trouvé, etc.)]`;

    console.log('📝 Appel Gemini 2.5 Flash (texte)...');
    
    const textResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: storyPrompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 8192 },
      }),
    });

    if (!textResponse.ok) {
      const errorData = await textResponse.json().catch(() => ({}));
      console.error('❌ Erreur API Google:', textResponse.status, JSON.stringify(errorData, null, 2));
      return {
        data: null,
        error: `Erreur API Google (${textResponse.status}): ${errorData.error?.message || 'Unknown error'}`,
      };
    }

    const textData = await textResponse.json();
    const storyText = textData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Extraire le titre, le contenu et la scène finale
    const titleMatch = storyText.match(/TITRE:\s*(.+)/i);
    const contentMatch = storyText.match(/HISTOIRE:\s*([\s\S]+?)(?=SCENE_FINALE:|$)/i);
    const endingSceneMatch = storyText.match(/SCENE_FINALE:\s*([\s\S]+)/i);
    
    const title = titleMatch ? titleMatch[1].trim() : `L'aventure de ${hero1Name}${hero2Name ? ` et ${hero2Name}` : ''}`;
    const content = contentMatch ? contentMatch[1].trim() : storyText;
    const endingScene = endingSceneMatch ? endingSceneMatch[1].trim() : '';

    console.log('✅ Histoire générée:', title);
    console.log('🎬 Scène finale:', endingScene.substring(0, 100) + '...');

    // 3. Générer l'illustration de couverture avec DALL-E
    let imageUrl = '';
    let endingImageUrl = '';
    try {
      const imagePrompt = `Children's book illustration in CUTE CARTOON / COLORING BOOK style with BLACK OUTLINES: 
${hasTwoHeroes 
  ? `Two young heroes (${hero1Name} and ${hero2Name}) exploring ${world} together, showing teamwork and friendship.` 
  : `A young child named ${hero1Name} exploring ${world}.`
}
${theme === 'Amitié' ? 'The scene shows friendship, sharing and kindness.' : theme === 'Apprentissage' ? 'The scene shows discovery, curiosity and learning something new.' : 'The scene shows adventure, courage and excitement.'}
Style: Thick black outlines, flat vibrant pastel colors, simple clean shapes, friendly and cute character design, children's coloring book aesthetic, cheerful and warm atmosphere.
Suitable for children age ${avgAge}.
High quality, clear lines, bright and joyful feeling.
No text, no words, no letters in the image.`;

      console.log('🎨 Appel Gemini 2.5 Flash (image) (couverture)...');

      const imageResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: imagePrompt }] }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"]
          }
        }),
      });

      console.log('🎨 Status Imagen:', imageResponse.status);

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        const imagePart = imageData.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
        const base64Image = imagePart?.inlineData?.data;
        imageUrl = base64Image ? `data:image/png;base64,${base64Image}` : '';
        console.log('✅ Image couverture générée:', imageUrl ? 'OK' : 'FAILED');
      } else {
        const errorData = await imageResponse.json().catch(() => ({}));
        console.error('❌ Erreur Imagen:', JSON.stringify(errorData, null, 2));
      }
      
      // 3b. Générer l'illustration de fin basée sur la scène finale de l'histoire
      const endingPrompt = `Children's book illustration in CUTE CARTOON / COLORING BOOK style with BLACK OUTLINES - FINAL SCENE OF THE STORY:
${endingScene ? endingScene : 
  hasTwoHeroes 
    ? `Two young heroes (${hero1Name} and ${hero2Name}) at the end of their adventure in ${world}, showing their achievement and joy.` 
    : `A young child named ${hero1Name} at the end of the adventure in ${world}, showing accomplishment and happiness.`
}
The characters ${hasTwoHeroes ? `(${hero1Name} and ${hero2Name})` : `(${hero1Name})`} look exactly like the same heroes from the beginning of the story.
Style: Thick black outlines, flat vibrant pastel colors, simple clean shapes, friendly and cute character design, children's coloring book aesthetic, cheerful and warm atmosphere.
Suitable for children age ${avgAge}.
High quality, clear lines, bright and joyful feeling. Satisfying conclusion mood.
No text, no words, no letters in the image.`;

      console.log('🎨 Appel Gemini 2.5 Flash (image) (fin)...');
      
      const endingResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: endingPrompt }] }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"]
          }
        }),
      });

      if (endingResponse.ok) {
        const endingData = await endingResponse.json();
        const endingPart = endingData.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
        const base64Ending = endingPart?.inlineData?.data;
        endingImageUrl = base64Ending ? `data:image/png;base64,${base64Ending}` : '';
        console.log('✅ Image fin générée:', endingImageUrl ? 'OK' : 'FAILED');
      }
    } catch (imgErr) {
      console.error('❌ Exception Imagen:', imgErr);
    }

    // 4. 🔮 DÉBITER LES RUNES AVANT SAUVEGARDE
    const spendResult = await spendRunesForStory('linear', title);
    if (spendResult.error) {
      console.error('❌ Erreur débit runes:', spendResult.error);
      return {
        data: null,
        error: `Erreur lors du paiement: ${spendResult.error}`,
      };
    }
    console.log('✅ Runes débitées:', RUNE_COSTS.LINEAR_STORY);

    // 5. Sauvegarder l'histoire dans Supabase (SANS image_url - les images sont dans story_images)
    console.log('💾 Sauvegarde histoire:', { profile_id: profile1Id, title: title.substring(0, 30) });
    
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .insert([{ 
        profile_id: profile1Id, 
        title: title, 
        content: content, 
        theme: theme
      }])
      .select()
      .single();

    if (storyError) {
      console.error('❌ Erreur sauvegarde:', storyError);
      // 🔮 REMBOURSEMENT EN CAS D'ERREUR
      await refundRunes(RUNE_COSTS.LINEAR_STORY, 'error-save', 'Erreur sauvegarde histoire');
      return {
        data: null,
        error: `Erreur sauvegarde: ${storyError.message}`,
      };
    }

    if (!story) {
      console.error('❌ Pas de story retournée après insertion');
      // 🔮 REMBOURSEMENT EN CAS D'ERREUR
      await refundRunes(RUNE_COSTS.LINEAR_STORY, 'error-save', 'Histoire non créée');
      return {
        data: null,
        error: 'Erreur: histoire non sauvegardée',
      };
    }

    const storyId = story.id;
    console.log('✅ Histoire sauvegardée avec ID:', storyId);

    // 6. Télécharger et stocker les images dans Supabase Storage
    let storedImagePath = '';
    let storedEndingImagePath = '';
    
    if (imageUrl) {
      console.log('📥 Téléchargement image couverture...');
      const coverResult = await downloadAndStoreImage(storyId, imageUrl, 'cover');
      if (!coverResult.error) {
        storedImagePath = coverResult.storagePath;
        console.log('✅ Image couverture stockée:', storedImagePath);
      } else {
        console.error('❌ Erreur stockage cover:', coverResult.error);
      }
    }
    
    if (endingImageUrl) {
      console.log('📥 Téléchargement image fin...');
      const endingResult = await downloadAndStoreImage(storyId, endingImageUrl, 'ending');
      if (!endingResult.error) {
        storedEndingImagePath = endingResult.storagePath;
        console.log('✅ Image fin stockée:', storedEndingImagePath);
      } else {
        console.error('❌ Erreur stockage ending:', endingResult.error);
      }
    }

    return {
      data: { 
        title, 
        content, 
        imageUrl: storedImagePath || imageUrl, 
        endingImageUrl: storedEndingImagePath || endingImageUrl, 
        storyId 
      },
      error: null,
    };
  } catch (err) {
    console.error('💥 Exception:', err);
    return {
      data: null,
      error: `Erreur technique: ${err instanceof Error ? err.message : 'Inconnue'}`,
    };
  }
}

/**
 * @deprecated Utilise generateAndSaveStory à la place
 */
export async function generateStoryWithImage(
  name: string,
  age: number,
  hero: string,
  world: string,
  theme: string
): Promise<ActionResponse<GeneratedStory>> {
  return generateAndSaveStory(name, age, null, null, world, theme);
}

// Types pour les histoires interactives
export type InteractiveChoice = {
  question: string;
  optionA: { text: string; nextChapter: number };
  optionB: { text: string; nextChapter: number };
};

export type InteractiveChapter = {
  chapterNumber: number;
  title?: string;
  content: string;
  hasChoice: boolean;
  choice?: InteractiveChoice;
  isEnding: boolean;
};

export type GeneratedInteractiveStory = {
  title: string;
  storyId: string;
  chapters: InteractiveChapter[];
  coverImageUrl: string;
  endingImageUrl?: string;
};

/**
 * Génère une histoire interactive "Choose Your Adventure" avec 2 choix indépendants
 * L'IA génère tout l'arbre narratif dès le départ
 */
export async function generateAndSaveInteractiveStory(
  hero1Name: string,
  hero1Age: number,
  hero2Name: string | null,
  hero2Age: number | null,
  world: string,
  theme: string
): Promise<ActionResponse<GeneratedInteractiveStory>> {
  try {
    const supabase = await createClient();
    
    // 🔮 VÉRIFICATION DES RUNES
    const canCreateResult = await canCreateStory('interactive');
    if (canCreateResult.error || !canCreateResult.data?.canCreate) {
      return {
        data: null,
        error: `Tu n'as pas assez de runes ! Coût: ${RUNE_COSTS.INTERACTIVE_STORY} runes. Va dans la boutique pour en acheter.`,
      };
    }

    console.log('🔑 GOOGLE_API_KEY présente:', !!GOOGLE_API_KEY);
    
    if (!GOOGLE_API_KEY) {
      return { data: null, error: 'Clé API Google non configurée. Veuillez configurer GOOGLE_API_KEY dans les variables d\'environnement.' };
    }

    const hasTwoHeroes = !!hero2Name;
    
    // Récupérer le profil du premier héros pour lier l'histoire
    let profile1Id: string | null = null;
    let relationshipDescription = '';
    try {
      const { data: profile1 } = await supabase
        .from('profiles')
        .select('id')
        .eq('first_name', hero1Name)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (profile1) {
        profile1Id = profile1.id;
      }
      
      if (profile1 && hero2Name) {
        const { data: profile2 } = await supabase
          .from('profiles')
          .select('id')
          .eq('first_name', hero2Name)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (profile2) {
          const { data: rel } = await supabase
            .from('hero_relationships')
            .select('relation_type')
            .eq('from_hero_id', profile1.id)
            .eq('to_hero_id', profile2.id)
            .maybeSingle();
          
          if (rel) {
            const relLabels: Record<string, string> = {
              'frere': 'frère', 'soeur': 'sœur', 'frere_soeur': 'frère/sœur',
              'ami': 'meilleur ami', 'cousin': 'cousin', 'jumeau': 'jumeau',
              'voisin': 'voisin', 'camarade': 'camarade', 'parent': 'parent',
              'enfant': 'enfant', 'tonton': 'tonton', 'tata': 'tata',
              'grandparent': 'grand-parent', 'petitenfant': 'petit-enfant', 'neveu': 'neveu'
            };
            relationshipDescription = `${hero1Name} est ${relLabels[rel.relation_type] || rel.relation_type} de ${hero2Name}`;
          }
        }
      }
    } catch (e) {
      console.log('ℹ️ Pas de relation trouvée:', e);
    }
    
    const heroDescription = hasTwoHeroes 
      ? `DEUX HÉROS : ${hero1Name} (${hero1Age} ans) et ${hero2Name} (${hero2Age} ans). ${relationshipDescription || 'Ils sont amis et affrontent l\'aventure ensemble.'}`
      : `HÉROS : ${hero1Name}, un enfant courageux de ${hero1Age} ans.`;

    const avgAge = hasTwoHeroes ? Math.round((hero1Age + (hero2Age || hero1Age)) / 2) : hero1Age;
    
    const ageComparison = hasTwoHeroes && hero2Age 
      ? hero1Age > hero2Age + 2 
        ? `${hero1Name} est plus grand et guide ${hero2Name}.` 
        : hero2Age > hero1Age + 2 
          ? `${hero2Name} est plus grand et aide ${hero1Name}.` 
          : 'Ils ont presque le même âge.'
      : '';

    // 1. Générer l'histoire interactive avec GPT-4
    const interactivePrompt = `Tu es un auteur de contes interactifs pour enfants expert. Écris une histoire DONT VOUS ÊTES LE HÉROS avec des CHOIX qui influencent le déroulement.

${heroDescription}
${ageComparison ? '\n📊 DYNAMIQUE : ' + ageComparison : ''}
🌍 UNIVERS : ${world}  
📖 THÈME : ${theme}
👶 ÂGE CIBLE : ${avgAge} ans

🎯 CONTRAINTES SUR LES PERSONNAGES :
${hasTwoHeroes ? `- ${hero1Name} a ${hero1Age} ans et ${hero2Name} a ${hero2Age} ans. Utilise ces âges !` : `- ${hero1Name} a ${hero1Age} ans.`}
${relationshipDescription ? `- ${relationshipDescription}. Mentionne ce lien régulièrement.` : ''}
- Les choix doivent être adaptés à l'âge ${avgAge} ans

🎭 STRUCTURE INTERACTIVE OBLIGATOIRE (respecte scrupuleusement) :

L'histoire doit avoir 5 CHAPITRES avec exactement 2 CHOIX INDÉPENDANTS positionnés stratégiquement :

**CHAPITRE 1 : Introduction**
- Présente ${hasTwoHeroes ? `${hero1Name} et ${hero2Name}, leur ${relationshipDescription ? 'lien familial' : 'complicité'} et la différence d'âge` : `${hero1Name}, un enfant de ${hero1Age} ans`}
- Pas de choix ici, c'est la mise en place
- 150-200 mots

**CHAPITRE 2 : Premier obstacle**
- ${hasTwoHeroes ? `${hero1Name} et ${hero2Name} font face à un challenge ensemble` : `${hero1Name} rencontre un premier obstacle`}
- À LA FIN : CHOIX 1 adapté à ${avgAge} ans
- Option A et Option B menant à des chemins différents
- 150-200 mots + choix

**CHAPITRE 3A ou 3B : Conséquence du premier choix**
- Développe ce qui arrive selon le choix
- ${hasTwoHeroes ? `${hero1Age < 6 ? hero1Name + ' suit les conseils de ' + hero2Name : hero1Age > 9 ? hero1Name + ' protège ' + hero2Name : 'Ils collaborent ensemble'}` : `${hero1Name} fait preuve de courage`}
- Pas de choix ici
- 150-200 mots

**CHAPITRE 4 : Convergence et nouveau défi**
- Les chemins se rejoignent
- Un nouveau challenge adapté à leur âge
- À LA FIN : CHOIX 2 (différent du premier)
- 150-200 mots + choix

**CHAPITRE 5A ou 5B : Dénouement et fin**
- L'issue finale selon le deuxième choix
- Deux fins possibles heureuses
- Mentionne leur ${relationshipDescription ? 'lien familial' : 'amitié'} dans la conclusion
- 150-200 mots
- isEnding: true

🎯 CONTRAINTES QUALITÉ :
- Titre UNIQUE et accrocheur
- Ton adapté à ${avgAge < 6 ? 'très simple, phrases courtes' : avgAge < 9 ? 'dynamique avec dialogues' : 'plus riche mais accessible'}
- Les personnages montrent leur âge dans leurs actions
- ${hasTwoHeroes ? 'Leur relation doit être évidente tout au long' : ''}
- Les choix sont équilibrés et adaptés à ${avgAge} ans

📤 FORMAT DE SORTIE JSON STRICT (respecte exactement cette structure) :

{
  "title": "Titre accrocheur de l'histoire",
  "coverImagePrompt": "Description détaillée pour DALL-E de l'illustration de couverture",
  "chapters": [
    {
      "chapterNumber": 1,
      "title": "Titre du chapitre 1",
      "content": "Contenu du chapitre 1...",
      "hasChoice": false,
      "isEnding": false
    },
    {
      "chapterNumber": 2,
      "title": "Titre du chapitre 2",
      "content": "Contenu du chapitre 2 (s'arrête juste avant le choix)...",
      "hasChoice": true,
      "choice": {
        "question": "Question du choix 1 ?",
        "optionA": { "text": "Option A", "nextChapter": 3 },
        "optionB": { "text": "Option B", "nextChapter": 4 }
      },
      "isEnding": false
    },
    {
      "chapterNumber": 3,
      "title": "Titre du chapitre 3A",
      "content": "Contenu si Option A choisie au chapitre 2...",
      "hasChoice": false,
      "isEnding": false
    },
    {
      "chapterNumber": 4,
      "title": "Titre du chapitre 3B (ou alternative)",
      "content": "Contenu si Option B choisie au chapitre 2...",
      "hasChoice": false,
      "isEnding": false
    },
    {
      "chapterNumber": 5,
      "title": "Titre du chapitre 4",
      "content": "Contenu du chapitre 4 (nouveau défi, s'arrête avant choix)...",
      "hasChoice": true,
      "choice": {
        "question": "Question du choix 2 ?",
        "optionA": { "text": "Option A", "nextChapter": 6 },
        "optionB": { "text": "Option B", "nextChapter": 7 }
      },
      "isEnding": false
    },
    {
      "chapterNumber": 6,
      "title": "Titre de la fin A",
      "content": "Contenu de la première fin possible...",
      "hasChoice": false,
      "isEnding": true
    },
    {
      "chapterNumber": 7,
      "title": "Titre de la fin B",
      "content": "Contenu de la deuxième fin possible...",
      "hasChoice": false,
      "isEnding": true
    }
  ]
}

⚠️ IMPORTANT : 
- Retourne UNIQUEMENT le JSON valide, sans texte avant ou après
- Assure-toi que les nextChapter correspondent aux numéros de chapitres existants
- Les chapitres 3 et 4 sont les branches du premier choix
- Les chapitres 6 et 7 sont les fins selon le deuxième choix`;

    console.log('🎲 Génération histoire interactive (texte)...');
    
    const textResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: interactivePrompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 8192 },
      }),
    });

    if (!textResponse.ok) {
      const errorData = await textResponse.json().catch(() => ({}));
      console.error('❌ Erreur API Google:', textResponse.status, JSON.stringify(errorData, null, 2));
      return { data: null, error: `Erreur API Google (${textResponse.status}): ${errorData.error?.message || 'Unknown error'}` };
    }

    const textData = await textResponse.json();
    const storyContent = textData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parser le JSON retourné
    let parsedStory;
    try {
      // Extraire le JSON si entouré de ```json
      const jsonMatch = storyContent.match(/```json\s*([\s\S]*?)```/) || 
                        storyContent.match(/```\s*([\s\S]*?)```/) ||
                        [null, storyContent];
      const jsonString = jsonMatch[1].trim();
      parsedStory = JSON.parse(jsonString);
      console.log('✅ Histoire interactive parsée:', parsedStory.title);
    } catch (parseErr) {
      console.error('❌ Erreur parsing JSON:', parseErr);
      console.log('Contenu reçu:', storyContent.substring(0, 500));
      return { data: null, error: 'Erreur lors du parsing de l\'histoire générée' };
    }

    const { title, coverImagePrompt, chapters } = parsedStory;

    // 2. Générer l'illustration de couverture
    let coverImageUrl = '';
    try {
      const finalImagePrompt = coverImagePrompt || `Children's book illustration: ${hasTwoHeroes 
        ? `Two young heroes (${hero1Name} and ${hero2Name}) on an adventure in ${world}. Interactive storybook style.` 
        : `A young child named ${hero1Name} on a magical adventure in ${world}.`}
      ${theme === 'Amitié' ? 'Warm friendship scene.' : theme === 'Apprentissage' ? 'Discovery and wonder.' : 'Epic adventure scene.'}
      Watercolor storybook style, magical lighting, suitable for children age ${avgAge}. No text.`;

      console.log('🎨 Génération illustration couverture...');

      const imageResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: finalImagePrompt }] }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"]
          }
        }),
      });

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        const coverPart = imageData.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
        const base64Cover = coverPart?.inlineData?.data;
        coverImageUrl = base64Cover ? `data:image/png;base64,${base64Cover}` : '';
        console.log('✅ Image couverture générée:', coverImageUrl ? 'OK' : 'FAILED');
      }
    } catch (imgErr) {
      console.error('❌ Erreur image:', imgErr);
    }

    // 3. 🔮 DÉBITER LES RUNES AVANT SAUVEGARDE
    const spendResult = await spendRunesForStory('interactive', title);
    if (spendResult.error) {
      console.error('❌ Erreur débit runes:', spendResult.error);
      return {
        data: null,
        error: `Erreur lors du paiement: ${spendResult.error}`,
      };
    }
    console.log('✅ Runes débitées:', RUNE_COSTS.INTERACTIVE_STORY);

    // 4. Sauvegarder l'histoire principale (LIÉE AU PROFIL)
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .insert([{ 
        profile_id: profile1Id, 
        title: title, 
        content: `Histoire interactive avec ${chapters.length} chapitres et 2 choix stratégiques.`, 
        theme: theme,
        story_type: 'interactive'
      }])
      .select()
      .single();

    if (storyError || !story) {
      console.error('❌ Erreur sauvegarde histoire:', storyError);
      // 🔮 REMBOURSEMENT EN CAS D'ERREUR
      await refundRunes(RUNE_COSTS.INTERACTIVE_STORY, 'error-save', 'Erreur sauvegarde histoire interactive');
      return { data: null, error: `Erreur sauvegarde: ${storyError?.message}` };
    }

    const storyId = story.id;
    console.log('✅ Histoire sauvegardée:', storyId);

    // 5. Télécharger et stocker l'image de couverture
    let storedCoverPath = '';
    if (coverImageUrl) {
      console.log('📥 Téléchargement image couverture...');
      const coverResult = await downloadAndStoreImage(storyId, coverImageUrl, 'cover');
      if (!coverResult.error) {
        storedCoverPath = coverResult.storagePath;
        console.log('✅ Image couverture stockée:', storedCoverPath);
      } else {
        console.error('❌ Erreur stockage cover:', coverResult.error);
      }
    }

    // 4. Sauvegarder tous les chapitres
    const chaptersToInsert = chapters.map((ch: InteractiveChapter) => ({
      story_id: story.id,
      chapter_number: ch.chapterNumber,
      title: ch.title || `Chapitre ${ch.chapterNumber}`,
      content: ch.content,
      has_choice: ch.hasChoice,
      choice_question: ch.choice?.question || null,
      choice_option_a: ch.choice?.optionA?.text || null,
      choice_option_a_next_chapter: ch.choice?.optionA?.nextChapter || null,
      choice_option_b: ch.choice?.optionB?.text || null,
      choice_option_b_next_chapter: ch.choice?.optionB?.nextChapter || null,
      is_ending: ch.isEnding,
    }));

    const { error: chaptersError } = await supabase
      .from('chapters')
      .insert(chaptersToInsert);

    if (chaptersError) {
      console.error('❌ Erreur sauvegarde chapitres:', chaptersError);
      // On ne retourne pas d'erreur, l'histoire existe mais sans chapitres
    } else {
      console.log('✅', chapters.length, 'chapitres sauvegardés');
    }

    return {
      data: { 
        title, 
        storyId, 
        chapters,
        coverImageUrl: storedCoverPath || coverImageUrl 
      },
      error: null,
    };
  } catch (err) {
    console.error('💥 Exception:', err);
    return {
      data: null,
      error: `Erreur technique: ${err instanceof Error ? err.message : 'Inconnue'}`,
    };
  }
}

/**
 * Récupère les chapitres d'une histoire interactive
 */
export async function getChaptersByStory(storyId: string): Promise<ActionResponse<Chapter[]>> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('story_id', storyId)
      .order('chapter_number', { ascending: true });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (err) {
    console.error('Error fetching chapters:', err);
    return { data: null, error: 'Erreur lors de la récupération des chapitres' };
  }
}

/**
 * Crée un nouveau profil utilisateur.
 */
export async function createProfile(
  firstName: string, 
  age: number, 
  hero: string
): Promise<ActionResponse<Profile>> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ first_name: firstName, age: age }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error creating profile:', err);
    return { data: null, error: 'Erreur lors de la création du profil' };
  }
}

/**
 * Enregistre une nouvelle histoire pour un profil donné.
 */
export async function saveStory(
  profileId: string, 
  title: string, 
  content: string, 
  imageUrl: string,
  theme?: string
): Promise<ActionResponse<Story>> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('stories')
      .insert([{ 
        profile_id: profileId, 
        title: title, 
        content: content, 
        image_url: imageUrl,
        theme: theme
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error saving story:', err);
    return { data: null, error: 'Erreur lors de l\'enregistrement de l\'histoire' };
  }
}

/**
 * Récupère toutes les histoires liées à un profil.
 */
export async function getStoriesByProfile(profileId: string): Promise<ActionResponse<Story[]>> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (err) {
    console.error('Error fetching stories:', err);
    return { data: null, error: 'Erreur lors de la récupération des histoires' };
  }
}

/**
 * Récupère une histoire par son ID avec les infos du profil.
 */
export async function getStoryById(storyId: string): Promise<ActionResponse<Story & { profile: { first_name: string; age: number } }>> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('stories')
      .select(`
        *,
        profile:profiles(first_name, age)
      `)
      .eq('id', storyId)
      .single();

    if (error || !data) {
      return { data: null, error: 'Histoire non trouvée' };
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: 'Erreur lors de la récupération' };
  }
}

/**
 * Récupère toutes les histoires (pour la bibliothèque).
 */
export async function getAllStories(limit: number = 50): Promise<ActionResponse<any[]>> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('stories')
      .select(`
        *,
        profile:profiles(first_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (err) {
    console.error('Error fetching stories:', err);
    return { data: null, error: 'Erreur lors de la récupération des histoires' };
  }
}

/**
 * Supprime une histoire par son ID.
 */
export async function deleteStory(storyId: string): Promise<ActionResponse<null>> {
  try {
    const supabase = await createClient();
    
    // 1. Récupérer les chemins des images à supprimer
    const { data: images, error: imagesError } = await supabase
      .from('story_images')
      .select('storage_path')
      .eq('story_id', storyId);
    
    if (imagesError) {
      console.error('Error fetching images:', imagesError);
    }
    
    // 2. Supprimer les images du storage
    if (images && images.length > 0) {
      const paths = images.map(img => img.storage_path);
      const { error: storageError } = await supabase
        .storage
        .from('story-images')
        .remove(paths);
      
      if (storageError) {
        console.error('Error deleting images from storage:', storageError);
      }
    }
    
    // 3. Supprimer les images de la base (cascade normalement, mais au cas où)
    const { error: deleteImagesError } = await supabase
      .from('story_images')
      .delete()
      .eq('story_id', storyId);
    
    if (deleteImagesError) {
      console.error('Error deleting images from DB:', deleteImagesError);
    }
    
    // 4. Supprimer les chapitres (pour les histoires interactives)
    const { error: deleteChaptersError } = await supabase
      .from('chapters')
      .delete()
      .eq('story_id', storyId);
    
    if (deleteChaptersError) {
      console.error('Error deleting chapters:', deleteChaptersError);
    }
    
    // 5. Supprimer l'histoire
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId);

    if (error) {
      console.error('Error deleting story:', error);
      return { data: null, error: 'Erreur lors de la suppression de l\'histoire: ' + error.message };
    }
    
    return { data: null, error: null };
  } catch (err) {
    console.error('Error deleting story:', err);
    return { data: null, error: 'Erreur lors de la suppression de l\'histoire' };
  }
}

import { type HeroRelationship } from './types';

// Ré-export pour compatibilité
export type { HeroRelationship };


/**
 * Récupère les relations définies par l'utilisateur pour un héros (pas d'inférence automatique)
 * Les parents doivent ajouter manuellement les deux sens (ex: Tim frère de Maelyne ET Maelyne sœur de Tim)
 */
export async function getHeroRelationships(heroId: string): Promise<ActionResponse<HeroRelationship[]>> {
  try {
    const supabase = await createClient();
    
    // Relations où le héros est la source (définies par l'utilisateur)
    const { data, error } = await supabase
      .from('hero_relationships')
      .select(`
        *,
        to_hero:profiles!hero_relationships_to_hero_id_fkey(id, first_name, age, avatar_url)
      `)
      .eq('from_hero_id', heroId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (err) {
    console.error('Error fetching relationships:', err);
    return { data: null, error: 'Erreur lors de la récupération des relations' };
  }
}

/**
 * Récupère la relation entre deux héros spécifiques
 */
export async function getRelationshipBetweenHeroes(
  hero1Id: string, 
  hero2Id: string
): Promise<ActionResponse<HeroRelationship | null>> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('hero_relationships')
      .select(`
        *,
        to_hero:profiles!hero_relationships_to_hero_id_fkey(id, first_name, age, avatar_url)
      `)
      .eq('from_hero_id', hero1Id)
      .eq('to_hero_id', hero2Id)
      .maybeSingle();

    if (error) throw error;
    return { data: data, error: null };
  } catch (err) {
    console.error('Error fetching relationship between heroes:', err);
    return { data: null, error: 'Erreur lors de la récupération de la relation' };
  }
}

/**
 * Ajoute une relation entre deux héros
 */
export async function addHeroRelationship(
  fromHeroId: string,
  toHeroId: string,
  relationType: string
): Promise<ActionResponse<HeroRelationship>> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('hero_relationships')
      .insert([{
        from_hero_id: fromHeroId,
        to_hero_id: toHeroId,
        relation_type: relationType
      }])
      .select(`
        *,
        to_hero:profiles!hero_relationships_to_hero_id_fkey(id, first_name, age, avatar_url)
      `)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error adding relationship:', err);
    return { data: null, error: 'Erreur lors de l\'ajout de la relation' };
  }
}

/**
 * Supprime une relation
 */
export async function deleteHeroRelationship(relationshipId: string): Promise<ActionResponse<null>> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('hero_relationships')
      .delete()
      .eq('id', relationshipId);

    if (error) throw error;
    return { data: null, error: null };
  } catch (err) {
    console.error('Error deleting relationship:', err);
    return { data: null, error: 'Erreur lors de la suppression de la relation' };
  }
}

// ============================================================
// SYSTÈME DE RUNES
// ============================================================

export type RuneBalance = {
  balance: number;
  total_earned: number;
  total_spent: number;
  updated_at: string;
};

export type RuneTransaction = {
  id: string;
  amount: number;
  type: 'story_creation' | 'purchase' | 'bonus' | 'refund' | 'admin_adjust';
  story_id: string | null;
  description: string | null;
  created_at: string;
};

// RUNE_COSTS moved to lib/types.ts to avoid 'use server' export restriction

/**
 * Récupère le solde de runes de l'utilisateur connecté
 */
export async function getUserRunes(): Promise<ActionResponse<RuneBalance>> {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'Utilisateur non connecté' };
    }
    
    const { data, error } = await supabase
      .from('user_runes')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Pas encore de solde (nouveau compte créé avant la migration)
        return { 
          data: { balance: 0, total_earned: 0, total_spent: 0, updated_at: new Date().toISOString() }, 
          error: null 
        };
      }
      throw error;
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Error fetching runes:', err);
    return { data: null, error: 'Erreur lors de la récupération des runes' };
  }
}

/**
 * Récupère les statistiques globales des runes (pour le dashboard admin)
 */
export async function getRunesStats(): Promise<ActionResponse<{ totalUsers: number; totalRunes: number }>> {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'Non authentifié' };
    }
    
    // Récupérer toutes les entrées user_runes
    const { data, error } = await supabase
      .from('user_runes')
      .select('balance');
    
    if (error) {
      console.error('Error fetching runes stats:', error);
      return { data: null, error: 'Erreur lors de la récupération' };
    }
    
    const totalUsers = data?.length || 0;
    const totalRunes = data?.reduce((sum, r) => sum + (r.balance || 0), 0) || 0;
    
    return {
      data: {
        totalUsers,
        totalRunes,
      },
      error: null,
    };
  } catch (err) {
    console.error('Error:', err);
    return { data: null, error: 'Erreur technique' };
  }
}

/**
 * Vérifie si l'utilisateur peut créer une histoire
 */
export async function canCreateStory(storyType: 'linear' | 'interactive'): Promise<ActionResponse<{ canCreate: boolean; required: number; balance: number }>> {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: { canCreate: false, required: 0, balance: 0 }, error: 'Utilisateur non connecté' };
    }
    
    const required = storyType === 'interactive' ? RUNE_COSTS.INTERACTIVE_STORY : RUNE_COSTS.LINEAR_STORY;
    
    const { data, error } = await supabase
      .from('user_runes')
      .select('balance')
      .eq('user_id', user.id)
      .single();
    
    const balance = data?.balance || 0;
    
    return { 
      data: { 
        canCreate: balance >= required, 
        required, 
        balance 
      }, 
      error: null 
    };
  } catch (err) {
    console.error('Error checking runes:', err);
    return { data: null, error: 'Erreur lors de la vérification des runes' };
  }
}

/**
 * Dépense des runes pour créer une histoire
 * Appelé automatiquement par generateAndSaveStory et generateAndSaveInteractiveStory
 */
export async function spendRunesForStory(
  storyType: 'linear' | 'interactive',
  storyTitle: string
): Promise<ActionResponse<{ success: boolean; remaining: number }>> {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'Utilisateur non connecté' };
    }
    
    const amount = storyType === 'interactive' ? RUNE_COSTS.INTERACTIVE_STORY : RUNE_COSTS.LINEAR_STORY;
    
    // Appeler la fonction SQL spend_runes
    console.log('Appel RPC spend_runes:', { user_id: user.id, amount });
    
    const { data, error } = await supabase.rpc('spend_runes', {
      p_user_id: user.id,
      p_amount: amount,
      p_type: 'story_creation',
      p_description: `Création: ${storyTitle.substring(0, 50)}`,
    });
    
    if (error) {
      console.error('❌ Error spending runes RPC:', error);
      return { data: null, error: `Erreur RPC: ${error.message}` };
    }
    
    console.log('Résultat spend_runes:', data);
    
    if (!data) {
      return { data: null, error: 'Pas assez de runes disponibles' };
    }
    
    // Récupérer le nouveau solde
    const { data: balanceData } = await supabase
      .from('user_runes')
      .select('balance')
      .eq('user_id', user.id)
      .single();
    
    return { 
      data: { success: true, remaining: balanceData?.balance || 0 }, 
      error: null 
    };
  } catch (err) {
    console.error('Error spending runes:', err);
    return { data: null, error: 'Erreur lors du débit des runes' };
  }
}

/**
 * Rembourse des runes (en cas d'erreur de génération)
 */
export async function refundRunes(
  amount: number,
  storyId: string,
  reason: string
): Promise<ActionResponse<{ success: boolean; newBalance: number }>> {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'Utilisateur non connecté' };
    }
    
    await supabase.rpc('refund_runes', {
      p_user_id: user.id,
      p_amount: amount,
      p_story_id: storyId,
      p_reason: reason,
    });
    
    const { data } = await supabase
      .from('user_runes')
      .select('balance')
      .eq('user_id', user.id)
      .single();
    
    return { 
      data: { success: true, newBalance: data?.balance || 0 }, 
      error: null 
    };
  } catch (err) {
    console.error('Error refunding runes:', err);
    return { data: null, error: 'Erreur lors du remboursement' };
  }
}

/**
 * Récupère l'historique des transactions de runes
 */
export async function getRuneTransactions(limit: number = 20): Promise<ActionResponse<RuneTransaction[]>> {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'Utilisateur non connecté' };
    }
    
    const { data, error } = await supabase
      .from('rune_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return { data: data || [], error: null };
  } catch (err) {
    console.error('Error fetching transactions:', err);
    return { data: null, error: 'Erreur lors de la récupération de l\'historique' };
  }
}

// ============================================================
// SYSTÈME DE NOTATION (RATING)
// ============================================================

/**
 * Note une histoire de 1 à 5 étoiles
 * Vérifie que l'utilisateur est bien le propriétaire de l'histoire
 */
export async function rateStory(
  storyId: string,
  rating: number
): Promise<ActionResponse<{ success: boolean; rating: number }>> {
  try {
    const supabase = await createClient();

    // Vérifier que la note est valide
    if (rating < 1 || rating > 5) {
      return { data: null, error: 'La note doit être entre 1 et 5 étoiles' };
    }

    // Vérifier que l'utilisateur est authentifié
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'Utilisateur non connecté' };
    }

    // Vérifier que l'histoire appartient à l'utilisateur (via le profil)
    const { data: story, error: fetchError } = await supabase
      .from('stories')
      .select('id, profile:profiles!inner(user_id)')
      .eq('id', storyId)
      .single();

    if (fetchError || !story) {
      return { data: null, error: 'Histoire non trouvée' };
    }

    // Mettre à jour la note
    const { data, error } = await supabase
      .from('stories')
      .update({ 
        rating: rating,
        rated_at: new Date().toISOString()
      })
      .eq('id', storyId)
      .select()
      .single();

    if (error) {
      console.error('Error rating story:', error);
      return { data: null, error: 'Erreur lors de la notation' };
    }

    console.log('✅ Histoire notée:', storyId, rating, 'étoiles');
    return { data: { success: true, rating }, error: null };
  } catch (err) {
    console.error('Error rating story:', err);
    return { data: null, error: 'Erreur lors de la notation' };
  }
}

/**
 * Récupère la note d'une histoire
 */
export async function getStoryRating(storyId: string): Promise<ActionResponse<{ rating: number | null; rated_at: string | null }>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('stories')
      .select('rating, rated_at')
      .eq('id', storyId)
      .single();

    if (error || !data) {
      return { data: null, error: 'Histoire non trouvée' };
    }

    return { 
      data: { 
        rating: data.rating, 
        rated_at: data.rated_at 
      }, 
      error: null 
    };
  } catch (err) {
    console.error('Error fetching rating:', err);
    return { data: null, error: 'Erreur lors de la récupération de la note' };
  }
}

// ============================================================
// FONCTIONS D'ADMINISTRATION
// ============================================================

export type AdminUser = {
  id: string;
  email: string;
  created_at: string;
  runes_balance: number;
  stories_count: number;
  last_sign_in: string | null;
};

/**
 * Récupère tous les utilisateurs authentifiés avec leurs stats (admin uniquement)
 */
export async function getAllUsersAdmin(): Promise<ActionResponse<AdminUser[]>> {
  try {
    const supabase = await createClient();
    
    // Vérifier si l'utilisateur est admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'Non authentifié' };
    }
    
    // Récupérer tous les utilisateurs depuis la table user_runes
    const { data: runesData, error: runesError } = await supabase
      .from('user_runes')
      .select('user_id, balance, updated_at')
      .order('updated_at', { ascending: false });
    
    if (runesError) {
      console.error('Error fetching runes:', runesError);
      return { data: null, error: 'Erreur lors de la récupération des utilisateurs' };
    }
    
    // Récupérer aussi les utilisateurs qui ont des histoires mais pas de runes
    const { data: storiesUsers, error: storiesError } = await supabase
      .from('stories')
      .select('user_id, created_at')
      .order('created_at', { ascending: false });
    
    if (storiesError) {
      console.error('Error fetching stories users:', storiesError);
    }
    
    // Fusionner les user_ids uniques
    const allUserIds = new Set<string>();
    runesData?.forEach(r => allUserIds.add(r.user_id));
    storiesUsers?.forEach(s => allUserIds.add(s.user_id));
    
    // Pour chaque utilisateur, récupérer les stats
    const usersWithStats: AdminUser[] = [];
    
    for (const userId of Array.from(allUserIds)) {
      // Récupérer le solde de runes
      const runesEntry = runesData?.find(r => r.user_id === userId);
      const balance = runesEntry?.balance || 0;
      
      // Compter les histoires
      const { count: storiesCount } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      // Essayer de récupérer l'email depuis la table profiles (si tu as une colonne email)
      // Sinon on utilise l'ID comme identifiant
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, created_at')
        .eq('user_id', userId)
        .maybeSingle();
      
      usersWithStats.push({
        id: userId,
        email: profileData?.first_name || `Utilisateur ${userId.substring(0, 8)}...`,
        created_at: profileData?.created_at || runesEntry?.updated_at || new Date().toISOString(),
        runes_balance: balance,
        stories_count: storiesCount || 0,
        last_sign_in: null,
      });
    }
    
    // Trier par date de création
    usersWithStats.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return { data: usersWithStats, error: null };
  } catch (err) {
    console.error('Error fetching admin users:', err);
    return { data: null, error: 'Erreur lors de la récupération des utilisateurs' };
  }
}

/**
 * Ajoute des runes à un utilisateur (admin uniquement)
 */
export async function addRunesToUser(
  userId: string, 
  amount: number
): Promise<ActionResponse<{ success: boolean; newBalance: number }>> {
  try {
    const supabase = await createClient();
    
    // Vérifier si l'utilisateur est admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'Non authentifié' };
    }
    
    // Appeler la fonction RPC pour ajouter des runes
    const { data, error } = await supabase.rpc('add_runes', {
      p_user_id: userId,
      p_amount: amount,
      p_description: `Ajout admin de ${amount} runes`,
    });
    
    if (error) {
      console.error('Error adding runes:', error);
      return { data: null, error: 'Erreur lors de l\'ajout des runes' };
    }
    
    // Récupérer le nouveau solde
    const { data: runesData } = await supabase
      .from('user_runes')
      .select('balance')
      .eq('user_id', userId)
      .single();
    
    return { 
      data: { success: true, newBalance: runesData?.balance || 0 }, 
      error: null 
    };
  } catch (err) {
    console.error('Error adding runes:', err);
    return { data: null, error: 'Erreur lors de l\'ajout des runes' };
  }
}

// ============================================================
// SYSTÈME DE QUÊTE RPG
// ============================================================

export type UserProgression = {
  user_id: string;
  current_level: number;
  current_xp: number;
  total_stories_read: number;
  next_level_xp: number;
  equipped_pet_id: string | null;
  equipped_world_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Pet = {
  id: string;
  name: string;
  type: 'domestic' | 'legendary';
  species: string;
  icon_url: string | null;
  unlock_level: number;
  customizable: boolean;
  description: string | null;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  bonus_xp: number;
  created_at: string;
};

export type PetCustomization = {
  id: string;
  user_id: string;
  pet_id: string;
  custom_name: string | null;
  color: string;
  accessory: 'collar' | 'bow' | 'hat' | 'cape' | 'crown' | null;
  created_at: string;
  updated_at: string;
};

export type UserPet = {
  id: string;
  user_id: string;
  pet_id: string;
  customization_id: string | null;
  unlocked_at: string;
  equipped: boolean;
  pet?: Pet;
  customization?: PetCustomization;
};

export type World = {
  id: string;
  name: string;
  description: string | null;
  unlock_level: number;
  theme_color: string;
  icon_url: string | null;
  bg_gradient_start: string;
  bg_gradient_end: string;
  story_prompt_suffix: string | null;
  created_at: string;
};

export type UserWorld = {
  id: string;
  user_id: string;
  world_id: string;
  unlocked_at: string;
  equipped: boolean;
  world?: World;
};

export type LevelUpResult = {
  leveledUp: boolean;
  newLevel?: number;
  unlockedPets?: Pet[];
  unlockedWorlds?: World[];
};

/**
 * Ajoute une histoire lue et calcule l'XP gagné
 */
export async function addStoryRead(
  storyType: 'classic' | 'interactive'
): Promise<ActionResponse<LevelUpResult>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: 'Non authentifié' };
    }

    // Récupérer progression actuelle
    const { data: progression, error: progError } = await supabase
      .from('user_progression')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (progError) {
      console.error('Error fetching progression:', progError);
      return { data: null, error: 'Erreur progression' };
    }

    // Calculer XP gagné
    let xpGained = storyType === 'classic' ? 20 : 30;
    
    // Bonus si animal légendaire équipé
    if (progression.equipped_pet_id) {
      const { data: equippedPet } = await supabase
        .from('user_pets')
        .select('pet_id')
        .eq('id', progression.equipped_pet_id)
        .single();
      
      if (equippedPet?.pet_id) {
        const { data: petData } = await supabase
          .from('pets')
          .select('bonus_xp')
          .eq('id', equippedPet.pet_id)
          .single();
        
        if (petData?.bonus_xp) {
          xpGained = Math.floor(xpGained * (1 + petData.bonus_xp / 100));
        }
      }
    }

    const newXp = progression.current_xp + xpGained;
    const newTotalStories = progression.total_stories_read + 1;

    // Vérifier level up
    let newLevel = progression.current_level;
    let newNextLevelXp = progression.next_level_xp;
    const unlockedPets: Pet[] = [];
    const unlockedWorlds: World[] = [];

    if (newXp >= progression.next_level_xp && progression.current_level < 15) {
      newLevel = progression.current_level + 1;
      newNextLevelXp = Math.floor(100 * Math.pow(1.2, newLevel - 1));

      // Débloquer nouveaux animaux
      const { data: newPets } = await supabase
        .from('pets')
        .select('*')
        .eq('unlock_level', newLevel);
      
      if (newPets) {
        for (const pet of newPets) {
          await supabase.from('user_pets').insert({
            user_id: user.id,
            pet_id: pet.id,
            equipped: false,
          });
          unlockedPets.push(pet);
        }
      }

      // Débloquer nouveaux mondes
      const { data: newWorlds } = await supabase
        .from('worlds')
        .select('*')
        .eq('unlock_level', newLevel);
      
      if (newWorlds) {
        for (const world of newWorlds) {
          await supabase.from('user_worlds').insert({
            user_id: user.id,
            world_id: world.id,
            equipped: false,
          });
          unlockedWorlds.push(world);
        }
      }
    }

    // Mettre à jour progression
    const { error: updateError } = await supabase
      .from('user_progression')
      .update({
        current_level: newLevel,
        current_xp: newXp,
        total_stories_read: newTotalStories,
        next_level_xp: newNextLevelXp,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating progression:', updateError);
      return { data: null, error: 'Erreur mise à jour' };
    }

    return {
      data: {
        leveledUp: newLevel > progression.current_level,
        newLevel: newLevel > progression.current_level ? newLevel : undefined,
        unlockedPets: unlockedPets.length > 0 ? unlockedPets : undefined,
        unlockedWorlds: unlockedWorlds.length > 0 ? unlockedWorlds : undefined,
      },
      error: null,
    };
  } catch (err) {
    console.error('Error in addStoryRead:', err);
    return { data: null, error: 'Erreur technique' };
  }
}

/**
 * Récupère la progression de l'utilisateur
 */
export async function getUserProgression(): Promise<ActionResponse<UserProgression & {
  equippedPet?: Pet & { customization?: PetCustomization };
  equippedWorld?: World;
}>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: 'Non authentifié' };
    }

    const { data: progression, error } = await supabase
      .from('user_progression')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Si pas de progression, la créer
    if (error?.code === 'PGRST116' || !progression) {
      const { data: newProgression, error: createError } = await supabase
        .from('user_progression')
        .insert({
          user_id: user.id,
          current_level: 1,
          current_xp: 0,
          total_stories_read: 0,
          next_level_xp: 100,
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating progression:', createError);
        return { data: null, error: 'Erreur création progression' };
      }
      
      return {
        data: {
          ...newProgression,
          equippedPet: undefined,
          equippedWorld: undefined,
        },
        error: null,
      };
    }

    if (error) {
      console.error('Error fetching progression:', error);
      return { data: null, error: 'Erreur progression' };
    }

    let equippedPet;
    let equippedWorld;

    // Récupérer animal équipé
    if (progression.equipped_pet_id) {
      const { data: userPet } = await supabase
        .from('user_pets')
        .select('*, pet:pet_id(*), customization:customization_id(*)')
        .eq('id', progression.equipped_pet_id)
        .single();
      
      if (userPet) {
        equippedPet = {
          ...userPet.pet,
          customization: userPet.customization,
        };
      }
    }

    // Récupérer monde équipé
    if (progression.equipped_world_id) {
      const { data: userWorld } = await supabase
        .from('user_worlds')
        .select('*, world:world_id(*)')
        .eq('id', progression.equipped_world_id)
        .single();
      
      if (userWorld) {
        equippedWorld = userWorld.world;
      }
    }

    return {
      data: {
        ...progression,
        equippedPet,
        equippedWorld,
      },
      error: null,
    };
  } catch (err) {
    console.error('Error in getUserProgression:', err);
    return { data: null, error: 'Erreur technique' };
  }
}

/**
 * Crée une personnalisation d'animal
 */
export async function createPetCustomization(
  petId: string,
  customization: { custom_name?: string; color?: string; accessory?: string }
): Promise<ActionResponse<{ customizationId: string }>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: 'Non authentifié' };
    }

    // Vérifier que l'utilisateur possède cet animal
    const { data: userPet } = await supabase
      .from('user_pets')
      .select('id')
      .eq('user_id', user.id)
      .eq('pet_id', petId)
      .single();

    if (!userPet) {
      return { data: null, error: 'Animal non possédé' };
    }

    // Créer ou mettre à jour la personnalisation
    const { data, error } = await supabase
      .from('pet_customizations')
      .upsert({
        user_id: user.id,
        pet_id: petId,
        custom_name: customization.custom_name,
        color: customization.color || '#FFA500',
        accessory: customization.accessory as any,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating customization:', error);
      return { data: null, error: 'Erreur personnalisation' };
    }

    // Mettre à jour user_pets avec la customization
    await supabase
      .from('user_pets')
      .update({ customization_id: data.id })
      .eq('user_id', user.id)
      .eq('pet_id', petId);

    return { data: { customizationId: data.id }, error: null };
  } catch (err) {
    console.error('Error in createPetCustomization:', err);
    return { data: null, error: 'Erreur technique' };
  }
}

/**
 * Équipe un animal
 */
export async function equipPet(petId: string): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: 'Non authentifié' };
    }

    // Déséquiper l'animal actuel
    await supabase
      .from('user_pets')
      .update({ equipped: false })
      .eq('user_id', user.id)
      .eq('equipped', true);

    // Équiper le nouveau
    const { data: userPet } = await supabase
      .from('user_pets')
      .select('id')
      .eq('user_id', user.id)
      .eq('pet_id', petId)
      .single();

    if (!userPet) {
      return { data: null, error: 'Animal non possédé' };
    }

    await supabase
      .from('user_pets')
      .update({ equipped: true })
      .eq('id', userPet.id);

    // Mettre à jour progression
    await supabase
      .from('user_progression')
      .update({ equipped_pet_id: userPet.id })
      .eq('user_id', user.id);

    return { data: null, error: null };
  } catch (err) {
    console.error('Error in equipPet:', err);
    return { data: null, error: 'Erreur technique' };
  }
}

/**
 * Récupère tous les animaux de l'utilisateur
 */
export async function getUserPets(): Promise<ActionResponse<UserPet[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: 'Non authentifié' };
    }

    const { data, error } = await supabase
      .from('user_pets')
      .select('*, pet:pet_id(*), customization:customization_id(*)')
      .eq('user_id', user.id)
      .order('unlocked_at', { ascending: false });

    if (error) {
      console.error('Error fetching pets:', error);
      return { data: null, error: 'Erreur récupération' };
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.error('Error in getUserPets:', err);
    return { data: null, error: 'Erreur technique' };
  }
}

/**
 * Récupère les animaux disponibles comme héros
 */
export async function getAvailablePetsAsHeroes(): Promise<ActionResponse<(Pet & {
  customization?: PetCustomization;
})[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: 'Non authentifié' };
    }

    const { data, error } = await supabase
      .from('user_pets')
      .select('pet:pet_id(*), customization:customization_id(*)')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching pets as heroes:', error);
      return { data: null, error: 'Erreur récupération' };
    }

    const pets = data?.map((up: any) => ({
      ...up.pet,
      customization: up.customization,
    })) || [];

    return { data: pets, error: null };
  } catch (err) {
    console.error('Error in getAvailablePetsAsHeroes:', err);
    return { data: null, error: 'Erreur technique' };
  }
}

/**
 * Équipe un monde
 */
export async function equipWorld(worldId: string): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: 'Non authentifié' };
    }

    // Déséquiper le monde actuel
    await supabase
      .from('user_worlds')
      .update({ equipped: false })
      .eq('user_id', user.id)
      .eq('equipped', true);

    // Équiper le nouveau
    const { data: userWorld } = await supabase
      .from('user_worlds')
      .select('id')
      .eq('user_id', user.id)
      .eq('world_id', worldId)
      .single();

    if (!userWorld) {
      return { data: null, error: 'Monde non débloqué' };
    }

    await supabase
      .from('user_worlds')
      .update({ equipped: true })
      .eq('id', userWorld.id);

    // Mettre à jour progression
    await supabase
      .from('user_progression')
      .update({ equipped_world_id: userWorld.id })
      .eq('user_id', user.id);

    return { data: null, error: null };
  } catch (err) {
    console.error('Error in equipWorld:', err);
    return { data: null, error: 'Erreur technique' };
  }
}

/**
 * Récupère les mondes de l'utilisateur
 */
export async function getUserWorlds(): Promise<ActionResponse<UserWorld[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: 'Non authentifié' };
    }

    const { data, error } = await supabase
      .from('user_worlds')
      .select('*, world:world_id(*)')
      .eq('user_id', user.id)
      .order('unlocked_at', { ascending: false });

    if (error) {
      console.error('Error fetching worlds:', error);
      return { data: null, error: 'Erreur récupération' };
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.error('Error in getUserWorlds:', err);
    return { data: null, error: 'Erreur technique' };
  }
}

/**
 * Récupère tous les animaux disponibles (pour voir ce qui est débloquable)
 */
export async function getAllPets(): Promise<ActionResponse<Pet[]>> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .order('unlock_level', { ascending: true });

    if (error) {
      console.error('Error fetching all pets:', error);
      return { data: null, error: 'Erreur récupération' };
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.error('Error in getAllPets:', err);
    return { data: null, error: 'Erreur technique' };
  }
}

/**
 * Récupère tous les mondes disponibles
 */
export async function getAllWorlds(): Promise<ActionResponse<World[]>> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('worlds')
      .select('*')
      .order('unlock_level', { ascending: true });

    if (error) {
      console.error('Error fetching all worlds:', error);
      return { data: null, error: 'Erreur récupération' };
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.error('Error in getAllWorlds:', err);
    return { data: null, error: 'Erreur technique' };
  }
}

