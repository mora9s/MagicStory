import { supabase } from './supabase';

export async function createProfile(firstName: string, age: number, hero: string) {
  const { data, error } = await supabase
    .from('profiles')
    .insert([{ first_name: firstName, age: age, favorite_hero: hero }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function saveStory(profileId: string, title: string, content: string, imageUrl: string) {
  const { data, error } = await supabase
    .from('stories')
    .insert([{ 
      profile_id: profileId, 
      title: title, 
      content: content, 
      image_url: imageUrl 
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getStoriesByProfile(profileId: string) {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
