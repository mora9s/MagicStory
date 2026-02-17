'use server'

import { supabase } from './supabase';
import { Profile, Story } from './database.types';

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
};

/**
 * Génère un avatar personnalisé pour un enfant
 */
export async function generateChildAvatar(
  name: string,
  age: number,
  description?: string
): Promise<ActionResponse<{ avatarUrl: string }>> {
  try {
    if (!OPENAI_API_KEY) {
      return { data: null, error: 'Clé API non configurée' };
    }

    const prompt = `Cute children's book character portrait of a ${age} year old child named ${name}. 
${description ? `Physical description: ${description}. ` : ''}
Style: soft, friendly, magical watercolor illustration.
The character should look kind, brave and adventurous.
Warm colors, gentle lighting, storybook art style.
Head and shoulders portrait, facing forward with a gentle smile.
No text, no background elements, just the character on a soft neutral background.`;

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
 * Créer un profil enfant complet avec avatar
 */
export async function createChildProfile(
  firstName: string,
  age: number,
  favoriteHero: string,
  avatarUrl?: string
): Promise<ActionResponse<ChildProfile>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ 
        first_name: firstName, 
        age: age, 
        favorite_hero: favoriteHero,
        avatar_url: avatarUrl || null
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
 * Version avec 1 ou 2 héros
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

    // Créer le(s) profil(s)
    const { data: profile1, error: profileError1 } = await supabase
      .from('profiles')
      .insert([{ first_name: hero1Name, age: hero1Age, favorite_hero: hero1Type }])
      .select()
      .single();

    if (profileError1 || !profile1) {
      console.error('❌ Erreur création profil 1:', profileError1);
      return { data: null, error: 'Erreur lors de la création du profil' };
    }

    // Si deuxième héros, créer aussi
    let profile2 = null;
    if (hero2Name && hero2Age && hero2Type) {
      const result = await supabase
        .from('profiles')
        .insert([{ first_name: hero2Name, age: hero2Age, favorite_hero: hero2Type }])
        .select()
        .single();
      profile2 = result.data;
    }

    console.log('✅ Profil(s) créé(s)');

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

    // 4. Sauvegarder l'histoire dans Supabase (liée au premier profil)
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .insert([{ 
        profile_id: profile1.id, 
        title: title, 
        content: content, 
        image_url: imageUrl,
        theme: theme
      }])
      .select()
      .single();

    if (storyError) {
      console.error('❌ Erreur sauvegarde:', storyError);
      return {
        data: { title, content, imageUrl },
        error: null,
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
