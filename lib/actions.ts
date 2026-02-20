'use server'

import { supabase } from './supabase';
import { Profile, Story, Chapter } from './database.types';

// Ré-export du type Chapter
export type { Chapter };

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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
  favorite_hero: string | null;
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
    if (!OPENAI_API_KEY) {
      return { data: null, error: 'Clé API non configurée' };
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

Style: soft, friendly, magical watercolor/storybook illustration style.
The character should maintain the SAME FACIAL FEATURES as the reference photo:
- Same face shape and structure
- Same eyes shape and color
- Same nose shape
- Same hair style and color
- Same skin tone
- Any distinctive features (freckles, glasses, etc.)

BUT transform it into a magical storybook character:
- Soft, painterly watercolor style
- Gentle, warm lighting
- Head and shoulders portrait
- Facing forward with a gentle, brave smile
- Expression should be kind and adventurous
- Background should be soft and magical (subtle sparkles or gentle gradient)

The result should look like the child from the photo, but illustrated in a beautiful children's book style.
No text, no letters in the image.`;
    } else {
      // Générer un avatar à partir de la description textuelle
      prompt = `Cute children's book character portrait of a ${age} year old child named ${name}. 
${description ? `Physical description: ${description}. ` : ''}
Style: soft, friendly, magical watercolor illustration.
The character should look kind, brave and adventurous.
Warm colors, gentle lighting, storybook art style.
Head and shoulders portrait, facing forward with a gentle smile.
No text, no background elements, just the character on a soft neutral background.`;
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Erreur avatar:', error);
      return { data: null, error: 'Erreur lors de la génération de l\'avatar' };
    }

    const data = await response.json();
    return { data: { avatarUrl: data.data[0].url }, error: null };
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
  favoriteHero: string,
  avatarUrl?: string,
  traits?: string[]
): Promise<ActionResponse<ChildProfile>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ 
        first_name: firstName, 
        age: age, 
        favorite_hero: favoriteHero,
        avatar_url: avatarUrl || null,
        traits: traits || []
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
    favorite_hero?: string;
    avatar_url?: string;
    traits?: string[];
  }
): Promise<ActionResponse<ChildProfile>> {
  try {
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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
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
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
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
  hero1Type: string,
  hero2Name: string | null,
  hero2Age: number | null,
  hero2Type: string | null,
  world: string,
  theme: string
): Promise<ActionResponse<GeneratedStory>> {
  try {
    console.log('🔑 OPENAI_API_KEY présente:', !!OPENAI_API_KEY);
    
    if (!OPENAI_API_KEY) {
      console.error('❌ Clé API OpenAI non configurée');
      return {
        data: null,
        error: 'Clé API OpenAI non configurée.',
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
      ? `DEUX HÉROS : ${hero1Name} (${hero1Age} ans, ${hero1Type}) et ${hero2Name} (${hero2Age} ans, ${hero2Type}). ${relationshipDescription || 'Ils sont amis et affrontent l\'aventure ensemble.'}`
      : `HÉROS : ${hero1Name}, un ${hero1Type} courageux de ${hero1Age} ans.`;

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

    console.log('📝 Appel GPT-4...');
    
    const textResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: storyPrompt }],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!textResponse.ok) {
      const errorData = await textResponse.json().catch(() => ({}));
      console.error('❌ Erreur GPT:', textResponse.status, errorData);
      return {
        data: null,
        error: `Erreur API OpenAI (${textResponse.status})`,
      };
    }

    const textData = await textResponse.json();
    const storyText = textData.choices[0].message.content;
    
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
      const imagePrompt = `Children's book illustration in a soft, magical watercolor style: 
${hasTwoHeroes 
  ? `Two young heroes (${hero1Name} as ${hero1Type} and ${hero2Name} as ${hero2Type}) exploring ${world} together, showing teamwork and friendship.` 
  : `A young ${hero1Type.toLowerCase()} named ${hero1Name} exploring ${world}.`
}
${theme === 'Amitié' ? 'The scene shows friendship, sharing and kindness.' : theme === 'Apprentissage' ? 'The scene shows discovery, curiosity and learning something new.' : 'The scene shows adventure, courage and excitement.'}
Warm golden and purple colors, dreamy atmosphere, soft lighting, storybook art style, suitable for children age ${avgAge}.
High quality, detailed, magical feeling.
No text, no words, no letters in the image.`;

      console.log('🎨 Appel DALL-E 3 (couverture)...');

      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: imagePrompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
          style: 'vivid',
        }),
      });

      console.log('🎨 Status DALL-E:', imageResponse.status);

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        imageUrl = imageData.data[0].url;
        console.log('✅ Image couverture générée:', imageUrl.substring(0, 50) + '...');
      } else {
        const errorData = await imageResponse.json().catch(() => ({}));
        console.error('❌ Erreur DALL-E:', errorData);
      }
      
      // 3b. Générer l'illustration de fin basée sur la scène finale de l'histoire
      const endingPrompt = `Children's book illustration in a soft, magical watercolor style - FINAL SCENE OF THE STORY:
${endingScene ? endingScene : 
  hasTwoHeroes 
    ? `Two young heroes (${hero1Name} as ${hero1Type} and ${hero2Name} as ${hero2Type}) at the end of their adventure in ${world}, showing their achievement and joy.` 
    : `A young ${hero1Type.toLowerCase()} named ${hero1Name} at the end of the adventure in ${world}, showing accomplishment and happiness.`
}
The characters ${hasTwoHeroes ? `(${hero1Name} and ${hero2Name})` : `(${hero1Name})`} look exactly like the same heroes from the beginning of the story.
Warm golden and soft colors, dreamy atmosphere, soft lighting, storybook art style, suitable for children age ${avgAge}.
High quality, detailed, magical feeling. Satisfying conclusion mood.
No text, no words, no letters in the image.`;

      console.log('🎨 Appel DALL-E 3 (fin)...');
      
      const endingResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: endingPrompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
          style: 'vivid',
        }),
      });

      if (endingResponse.ok) {
        const endingData = await endingResponse.json();
        endingImageUrl = endingData.data[0].url;
        console.log('✅ Image fin générée:', endingImageUrl.substring(0, 50) + '...');
      }
    } catch (imgErr) {
      console.error('❌ Exception DALL-E:', imgErr);
    }

    // 4. Sauvegarder l'histoire dans Supabase (liée au premier profil s'il existe)
    console.log('💾 Sauvegarde histoire:', { profile_id: profile1Id, title: title.substring(0, 30), image_url: imageUrl?.substring(0, 50) });
    
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .insert([{ 
        profile_id: profile1Id, 
        title: title, 
        content: content, 
        image_url: imageUrl || null,
        ending_image_url: endingImageUrl || null,
        theme: theme
      }])
      .select()
      .single();

    if (storyError) {
      console.error('❌ Erreur sauvegarde:', storyError);
      return {
        data: null,
        error: `Erreur sauvegarde: ${storyError.message}`,
      };
    }

    if (!story) {
      console.error('❌ Pas de story retournée après insertion');
      return {
        data: null,
        error: 'Erreur: histoire non sauvegardée',
      };
    }

    console.log('✅ Histoire sauvegardée:', story.id);

    return {
      data: { title, content, imageUrl, endingImageUrl, storyId: story.id },
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
  return generateAndSaveStory(name, age, hero, null, null, null, world, theme);
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
  hero1Type: string,
  hero2Name: string | null,
  hero2Age: number | null,
  hero2Type: string | null,
  world: string,
  theme: string
): Promise<ActionResponse<GeneratedInteractiveStory>> {
  try {
    console.log('🔑 OPENAI_API_KEY présente:', !!OPENAI_API_KEY);
    
    if (!OPENAI_API_KEY) {
      return { data: null, error: 'Clé API OpenAI non configurée.' };
    }

    const hasTwoHeroes = !!hero2Name;
    
    // Récupérer les profils et la relation comme dans generateAndSaveStory
    let relationshipDescription = '';
    try {
      const { data: profile1 } = await supabase
        .from('profiles')
        .select('id')
        .eq('first_name', hero1Name)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
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
      ? `DEUX HÉROS : ${hero1Name} (${hero1Age} ans, ${hero1Type}) et ${hero2Name} (${hero2Age} ans, ${hero2Type}). ${relationshipDescription || 'Ils sont amis et affrontent l\'aventure ensemble.'}`
      : `HÉROS : ${hero1Name}, un ${hero1Type} courageux de ${hero1Age} ans.`;

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

    console.log('🎲 Génération histoire interactive...');
    
    const textResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: interactivePrompt }],
        temperature: 0.8,
        max_tokens: 3500,
      }),
    });

    if (!textResponse.ok) {
      const errorData = await textResponse.json().catch(() => ({}));
      console.error('❌ Erreur GPT:', textResponse.status, errorData);
      return { data: null, error: `Erreur API OpenAI (${textResponse.status})` };
    }

    const textData = await textResponse.json();
    const storyContent = textData.choices[0].message.content;
    
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
        ? `Two young heroes (${hero1Name} as ${hero1Type} and ${hero2Name} as ${hero2Type}) on an adventure in ${world}. Interactive storybook style.` 
        : `A young ${hero1Type.toLowerCase()} named ${hero1Name} on a magical adventure in ${world}.`}
      ${theme === 'Amitié' ? 'Warm friendship scene.' : theme === 'Apprentissage' ? 'Discovery and wonder.' : 'Epic adventure scene.'}
      Watercolor storybook style, magical lighting, suitable for children age ${avgAge}. No text.`;

      console.log('🎨 Génération illustration couverture...');

      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: finalImagePrompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
          style: 'vivid',
        }),
      });

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        coverImageUrl = imageData.data[0].url;
        console.log('✅ Image couverture générée');
      }
    } catch (imgErr) {
      console.error('❌ Erreur image:', imgErr);
    }

    // 3. Sauvegarder l'histoire principale
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .insert([{ 
        profile_id: null, 
        title: title, 
        content: `Histoire interactive avec ${chapters.length} chapitres et 2 choix stratégiques.`, 
        image_url: coverImageUrl,
        theme: theme,
        story_type: 'interactive'
      }])
      .select()
      .single();

    if (storyError || !story) {
      console.error('❌ Erreur sauvegarde histoire:', storyError);
      return { data: null, error: `Erreur sauvegarde: ${storyError?.message}` };
    }

    console.log('✅ Histoire sauvegardée:', story.id);

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
        storyId: story.id, 
        chapters,
        coverImageUrl 
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
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ first_name: firstName, age: age, favorite_hero: hero }])
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
export async function getStoryById(storyId: string): Promise<ActionResponse<Story & { profile: { first_name: string; age: number; favorite_hero: string } }>> {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select(`
        *,
        profile:profiles(first_name, age, favorite_hero)
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
export async function getAllStories(limit: number = 50): Promise<ActionResponse<(Story & { profile: { first_name: string; favorite_hero: string } | null })[]>> {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select(`
        *,
        profile:profiles(first_name, favorite_hero)
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
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId);

    if (error) throw error;
    return { data: null, error: null };
  } catch (err) {
    console.error('Error deleting story:', err);
    return { data: null, error: 'Erreur lors de la suppression de l\'histoire' };
  }
}

// Types pour les relations entre héros
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
    favorite_hero: string | null;
    avatar_url: string | null;
  };
};


/**
 * Récupère les relations définies par l'utilisateur pour un héros (pas d'inférence automatique)
 * Les parents doivent ajouter manuellement les deux sens (ex: Tim frère de Maelyne ET Maelyne sœur de Tim)
 */
export async function getHeroRelationships(heroId: string): Promise<ActionResponse<HeroRelationship[]>> {
  try {
    // Relations où le héros est la source (définies par l'utilisateur)
    const { data, error } = await supabase
      .from('hero_relationships')
      .select(`
        *,
        to_hero:profiles!hero_relationships_to_hero_id_fkey(id, first_name, age, favorite_hero, avatar_url)
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
    const { data, error } = await supabase
      .from('hero_relationships')
      .select(`
        *,
        to_hero:profiles!hero_relationships_to_hero_id_fkey(id, first_name, age, favorite_hero, avatar_url)
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
    const { data, error } = await supabase
      .from('hero_relationships')
      .insert([{
        from_hero_id: fromHeroId,
        to_hero_id: toHeroId,
        relation_type: relationType
      }])
      .select(`
        *,
        to_hero:profiles!hero_relationships_to_hero_id_fkey(id, first_name, age, favorite_hero, avatar_url)
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

