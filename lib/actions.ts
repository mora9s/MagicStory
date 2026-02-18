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

    // Récupérer le profil du premier héros (s'il existe déjà)
    let profile1Id: string | null = null;
    try {
      const { data: existingProfile1, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('first_name', hero1Name)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (existingProfile1) {
        profile1Id = existingProfile1.id;
        console.log('✅ Profil existant trouvé:', profile1Id);
      } else {
        console.log('ℹ️ Aucun profil trouvé - histoire sera sauvegardée sans lien');
      }
    } catch (e) {
      console.log('ℹ️ Erreur recherche profil:', e);
    }

    // Construire la description des personnages
    const hasTwoHeroes = !!hero2Name;
    const heroDescription = hasTwoHeroes 
      ? `DEUX HÉROS : ${hero1Name} (${hero1Age} ans, ${hero1Type}) et ${hero2Name} (${hero2Age} ans, ${hero2Type}). Ils sont amis/partenaires et affrontent l'aventure ensemble.`
      : `HÉROS : ${hero1Name}, un ${hero1Type} courageux de ${hero1Age} ans.`;

    const avgAge = hasTwoHeroes ? Math.round((hero1Age + (hero2Age || hero1Age)) / 2) : hero1Age;

    // 2. Générer le texte de l'histoire avec GPT-4
    const storyPrompt = `Tu es un auteur de contes pour enfants expert. Écris une histoire MAGIQUE et UNIQUE pour ${hasTwoHeroes ? 'deux enfants' : 'un enfant'}.

${heroDescription}
🌍 UNIVERS : ${world}  
📖 THÈME : ${theme}

STRUCTURE NARRATIVE OBLIGATOIRE (respecte scrupuleusement) :

1️⃣ **DÉBUT** (1 paragraphe)
- Accroche immédiate qui pose l'ambiance magique
- Présentation ${hasTwoHeroes ? 'des deux héros et leur complicité' : 'du héros et son quotidien'} dans ${world}
- Un événement déclencheur qui lance l'aventure

2️⃣ **DÉVELOPPEMENT** (2-3 paragraphes)
- Au moins 2 péripéties/challenges à surmonter
- ${hasTwoHeroes ? 'Les deux héros collaborent, chacun avec ses forces' : 'Le héros fait face aux obstacles'}
- Des rencontres avec des personnages secondaires (amis ou créatures)
- Des moments de tension puis de soulagement
- Le ${hasTwoHeroes ? 'groupe' : 'héros'} fait preuve de ${theme === 'Aventure' ? 'courage et débrouillardise' : theme === 'Amitié' ? 'générosité et entraide' : 'curiosité et sagesse'}

3️⃣ **CLIMAX** (1 paragraphe)
- Le moment le plus intense de l'histoire
- ${hasTwoHeroes ? 'Les héros combinent leurs forces pour' : 'Le héros surmonte le plus grand obstacle'}
- Dénouement de l'aventure principale

4️⃣ **FIN** (1 paragraphe)
- Retour au calme, conclusion satisfaisante
- ${hasTwoHeroes ? 'Les deux héros célèbrent leur victoire ensemble' : 'Le héros rentre chez lui transformé'}
- Morale douce et adaptée à ${avgAge} ans
- Note d'espoir ou d'émerveillement

🎯 CONTRAINTES QUALITÉ :
- Titre UNIQUE et accrocheur (pas de "L'aventure de..." banal)
- Ton ${avgAge < 6 ? 'simple, répétitif et rassurant' : avgAge < 9 ? 'dynamique avec du dialogue' : 'plus riche en vocabulaire et descriptions'}
- Évite les clichés et les histoires déjà racontées mille fois
- Crée des détails surprenants et mémorables
- 500-800 mots environ
- Style : chaleureux, poétique, captivant

Format :
TITRE: [titre original et créatif]
HISTOIRE: [ton histoire structurée]`;

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
        max_tokens: 1500,
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
    
    // Extraire le titre et le contenu
    const titleMatch = storyText.match(/TITRE:\s*(.+)/i);
    const contentMatch = storyText.match(/HISTOIRE:\s*([\s\S]+)/i);
    
    const title = titleMatch ? titleMatch[1].trim() : `L'aventure de ${hero1Name}${hero2Name ? ` et ${hero2Name}` : ''}`;
    const content = contentMatch ? contentMatch[1].trim() : storyText;

    console.log('✅ Histoire générée:', title);

    // 3. Générer l'illustration avec DALL-E
    let imageUrl = '';
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

      console.log('🎨 Appel DALL-E 3...');

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
        console.log('✅ Image générée:', imageUrl.substring(0, 50) + '...');
      } else {
        const errorData = await imageResponse.json().catch(() => ({}));
        console.error('❌ Erreur DALL-E:', errorData);
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
      data: { title, content, imageUrl, storyId: story.id },
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
    const heroDescription = hasTwoHeroes 
      ? `DEUX HÉROS : ${hero1Name} (${hero1Age} ans, ${hero1Type}) et ${hero2Name} (${hero2Age} ans, ${hero2Type}). Ils sont amis/partenaires et affrontent l'aventure ensemble.`
      : `HÉROS : ${hero1Name}, un ${hero1Type} courageux de ${hero1Age} ans.`;

    const avgAge = hasTwoHeroes ? Math.round((hero1Age + (hero2Age || hero1Age)) / 2) : hero1Age;

    // 1. Générer l'histoire interactive avec GPT-4
    const interactivePrompt = `Tu es un auteur de contes interactifs pour enfants expert. Écris une histoire DONT VOUS ÊTES LE HÉROS avec des CHOIX qui influencent le déroulement.

${heroDescription}
🌍 UNIVERS : ${world}  
📖 THÈME : ${theme}
👶 ÂGE CIBLE : ${avgAge} ans

🎭 STRUCTURE INTERACTIVE OBLIGATOIRE (respecte scrupuleusement) :

L'histoire doit avoir 5 CHAPITRES avec exactement 2 CHOIX INDÉPENDANTS positionnés stratégiquement :

**CHAPITRE 1 : Introduction**
- Présente le héros, l'univers et la quête initiale
- Pas de choix ici, c'est la mise en place
- 150-200 mots

**CHAPITRE 2 : Premier obstacle**
- Le héros fait face à un premier challenge
- À LA FIN : CHOIX 1 (positionné ici, pas au début)
- Question simple adaptée à ${avgAge} ans
- Option A et Option B menant à des chemins différents
- 150-200 mots + choix

**CHAPITRE 3A ou 3B : Conséquence du premier choix**
- Développe ce qui arrive selon le choix fait au chapitre 2
- Montre les conséquences positives de la décision
- Pas de choix ici, c'est le développement
- 150-200 mots

**CHAPITRE 4 : Convergence et nouveau défi**
- Les deux chemins se rejoignent (ou continuent parallèlement vers le même objectif final)
- Un nouveau challenge survient
- À LA FIN : CHOIX 2 (positionné ici, indépendant du premier)
- Question différente, nouveau dilemme
- 150-200 mots + choix

**CHAPITRE 5A ou 5B : Dénouement et fin**
- L'issue finale selon le deuxième choix
- Deux fins possibles (heureuses mais différentes)
- Morale douce adaptée à ${avgAge} ans
- 150-200 mots
- isEnding: true

🎯 CONTRAINTES QUALITÉ :
- Titre UNIQUE et accrocheur
- Ton adapté à ${avgAge < 6 ? 'très simple, phrases courtes, vocabulaire basique' : avgAge < 9 ? 'dynamique avec dialogues simples' : 'plus riche mais accessible'}
- Les choix doivent être ÉQUILIBRÉS (pas de "bonne" ou "mauvaise" réponse évidente)
- Cohérence narrative : les conséquences doivent faire SENS
- Les deux chemins sont intéressants et valides
- Les fins doivent être satisfaisantes quel que soit le parcours

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
export async function getAllStories(limit: number = 50): Promise<ActionResponse<(Story & { profile: { first_name: string; favorite_hero: string } })[]>> {
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

// Types de relations disponibles
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

/**
 * Récupère toutes les relations d'un héros (sortantes et entrantes avec inférence)
 */
export async function getHeroRelationships(heroId: string): Promise<ActionResponse<HeroRelationship[]>> {
  try {
    // Relations où le héros est la source
    const { data: outgoing, error: outgoingError } = await supabase
      .from('hero_relationships')
      .select(`
        *,
        to_hero:profiles!hero_relationships_to_hero_id_fkey(id, first_name, age, favorite_hero, avatar_url)
      `)
      .eq('from_hero_id', heroId);

    if (outgoingError) throw outgoingError;

    // Relations où le héros est la cible (on doit inférer la relation inverse)
    const { data: incoming, error: incomingError } = await supabase
      .from('hero_relationships')
      .select(`
        *,
        from_hero:profiles!hero_relationships_from_hero_id_fkey(id, first_name, age, favorite_hero, avatar_url)
      `)
      .eq('to_hero_id', heroId);

    if (incomingError) throw incomingError;

    // Transformer les relations entrantes en relations inverses
    const incomingAsOutgoing: HeroRelationship[] = (incoming || []).map((rel: any) => {
      const relType = relationshipTypes.find(r => r.id === rel.relation_type);
      const inverseType = relType?.inverse || rel.relation_type;
      
      return {
        ...rel,
        from_hero_id: heroId,
        to_hero_id: rel.from_hero_id,
        relation_type: inverseType,
        to_hero: rel.from_hero
      };
    });

    // Combiner les deux listes
    const allRelationships = [...(outgoing || []), ...incomingAsOutgoing];

    return { data: allRelationships, error: null };
  } catch (err) {
    console.error('Error fetching relationships:', err);
    return { data: null, error: 'Erreur lors de la récupération des relations' };
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

/**
 * Récupère le label formaté d'une relation
 */
export async function getRelationshipLabel(relationType: string, toHeroName: string): Promise<string> {
  const type = relationshipTypes.find(r => r.id === relationType);
  if (!type) return `Lié à ${toHeroName}`;
  return `${type.label} ${toHeroName}`;
}
