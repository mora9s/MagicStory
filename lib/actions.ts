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
 */
export async function generateAndSaveStory(
  name: string,
  age: number,
  hero: string,
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

    // 1. Créer d'abord le profil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([{ first_name: name, age: age, favorite_hero: hero }])
      .select()
      .single();

    if (profileError || !profile) {
      console.error('❌ Erreur création profil:', profileError);
      return { data: null, error: 'Erreur lors de la création du profil' };
    }

    console.log('✅ Profil créé:', profile.id);

    // 2. Générer le texte de l'histoire avec GPT-4
    const storyPrompt = `Tu es un auteur de contes pour enfants expert. Écris une histoire MAGIQUE et UNIQUE pour ${name}, un enfant de ${age} ans.

🎭 PERSONNAGE : ${name}, un ${hero} courageux et attachant
🌍 UNIVERS : ${world}  
📖 THÈME : ${theme}

STRUCTURE NARRATIVE OBLIGATOIRE (respecte scrupuleusement) :

1️⃣ **DÉBUT** (1 paragraphe)
- Accroche immédiate qui pose l'ambiance magique
- Présentation de ${name} et son quotidien dans ${world}
- Un événement déclencheur qui lance l'aventure

2️⃣ **DÉVELOPPEMENT** (2-3 paragraphes)
- Au moins 2 péripéties/challenges à surmonter
- Des rencontres avec des personnages secondaires (amis ou créatures)
- Des moments de tension puis de soulagement
- Le héros fait preuve de ${theme === 'Aventure' ? 'courage et débrouillardise' : theme === 'Amitié' ? 'générosité et entraide' : 'curiosité et sagesse'}

3️⃣ **CLIMAX** (1 paragraphe)
- Le moment le plus intense de l'histoire
- ${name} surmonte le plus grand obstacle
- Dénouement de l'aventure principale

4️⃣ **FIN** (1 paragraphe)
- Retour au calme, conclusion satisfaisante
- Morale douce et adaptée à ${age} ans
- Note d'espoir ou d'émerveillement

🎯 CONTRAINTES QUALITÉ :
- Titre UNIQUE et accrocheur (pas de "L'aventure de..." banal)
- Ton ${age < 6 ? 'simple, répétitif et rassurant' : age < 9 ? 'dynamique avec du dialogue' : 'plus riche en vocabulaire et descriptions'}
- Évite les clichés et les histoires déjà racontées mille fois
- Crée des détails surprenants et mémorables
- 500-700 mots environ
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
    
    const title = titleMatch ? titleMatch[1].trim() : `L'aventure de ${name}`;
    const content = contentMatch ? contentMatch[1].trim() : storyText;

    console.log('✅ Histoire générée:', title);

    // 3. Générer l'illustration avec DALL-E
    let imageUrl = '';
    try {
      const imagePrompt = `Children's book illustration in a soft, magical watercolor style: 
A young ${hero.toLowerCase()} named ${name} exploring ${world}.
${theme === 'Amitié' ? 'The scene shows friendship, sharing and kindness between characters.' : theme === 'Apprentissage' ? 'The scene shows discovery, curiosity and learning something new.' : 'The scene shows adventure, courage and excitement.'}
Warm golden and purple colors, dreamy atmosphere, soft lighting, storybook art style, suitable for children age ${age}.
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

    // 4. Sauvegarder l'histoire dans Supabase
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .insert([{ 
        profile_id: profile.id, 
        title: title, 
        content: content, 
        image_url: imageUrl,
        theme: theme
      }])
      .select()
      .single();

    if (storyError) {
      console.error('❌ Erreur sauvegarde:', storyError);
      // On retourne quand même l'histoire même si la sauvegarde échoue
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
 * @deprecated Utilise generateAndSaveStory à la place
 */
export async function generateStoryWithImage(
  name: string,
  age: number,
  hero: string,
  world: string,
  theme: string
): Promise<ActionResponse<GeneratedStory>> {
  return generateAndSaveStory(name, age, hero, world, theme);
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
