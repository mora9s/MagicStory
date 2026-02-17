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
};

/**
 * Génère une histoire complète avec texte et illustration via IA.
 */
export async function generateStoryWithImage(
  name: string,
  age: number,
  hero: string,
  world: string,
  theme: string
): Promise<ActionResponse<GeneratedStory>> {
  try {
    if (!OPENAI_API_KEY) {
      return {
        data: null,
        error: 'Clé API OpenAI non configurée. Contacte l\'administrateur.',
      };
    }

    // 1. Générer le texte de l'histoire avec GPT-4
    const storyPrompt = `Écris une histoire courte et magique pour un enfant de ${age} ans.
    
Personnage principal : ${name}, un ${hero} courageux.
Monde : ${world}
Thème : ${theme}

L'histoire doit :
- Avoir un titre accrocheur
- Commencer par "Il était une fois..."
- Faire environ 300-400 mots
- Avoir une morale douce adaptée à l'âge
- Être écrite en français
- Utiliser un ton chaleureux et captivant

Format de réponse :
TITRE: [titre de l'histoire]
HISTOIRE: [contenu de l'histoire]`;

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
        max_tokens: 800,
      }),
    });

    if (!textResponse.ok) {
      throw new Error('Erreur lors de la génération du texte');
    }

    const textData = await textResponse.json();
    const storyText = textData.choices[0].message.content;
    
    // Extraire le titre et le contenu
    const titleMatch = storyText.match(/TITRE:\s*(.+)/i);
    const contentMatch = storyText.match(/HISTOIRE:\s*([\s\S]+)/i);
    
    const title = titleMatch ? titleMatch[1].trim() : `L'aventure de ${name}`;
    const content = contentMatch ? contentMatch[1].trim() : storyText;

    // 2. Générer l'illustration avec DALL-E
    const imagePrompt = `Children's book illustration in a soft, magical watercolor style: 
A young ${hero.toLowerCase()} named ${name} having an adventure in ${world}.
${theme === 'Amitié' ? 'The scene shows friendship and kindness.' : theme === 'Apprentissage' ? 'The scene shows discovery and wonder.' : 'The scene shows adventure and courage.'}
Warm colors, dreamy atmosphere, storybook art style, suitable for children age ${age}.
No text, no words in the image.`;

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
      }),
    });

    if (!imageResponse.ok) {
      const errorData = await imageResponse.json();
      console.error('DALL-E error:', errorData);
      // On continue sans image si ça échoue
      return {
        data: { title, content, imageUrl: '' },
        error: null,
      };
    }

    const imageData = await imageResponse.json();
    const imageUrl = imageData.data[0].url;

    return {
      data: { title, content, imageUrl },
      error: null,
    };
  } catch (err) {
    console.error('Error generating story:', err);
    return {
      data: null,
      error: 'Erreur lors de la génération de l\'histoire',
    };
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
