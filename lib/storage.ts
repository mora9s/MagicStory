'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Upload une image vers Supabase Storage (bucket story-images)
 * Retourne le chemin de stockage
 */
export async function uploadStoryImage(
  storyId: string,
  imageBuffer: Buffer,
  imageType: 'cover' | 'page' | 'ending',
  pageNumber?: number
): Promise<{ storagePath: string; error: string | null }> {
  try {
    const supabase = await createClient();
    
    // Générer le nom de fichier
    const filename = imageType === 'page' && pageNumber
      ? `page_${pageNumber}.png`
      : `${imageType}.png`;
    
    const storagePath = `stories/${storyId}/${filename}`;
    
    // Upload vers Supabase Storage
    const { error: uploadError } = await supabase
      .storage
      .from('story-images')
      .upload(storagePath, imageBuffer, {
        contentType: 'image/png',
        upsert: true,
      });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { storagePath: '', error: uploadError.message };
    }
    
    // Insérer dans la table story_images
    const { error: dbError } = await supabase
      .from('story_images')
      .insert({
        story_id: storyId,
        storage_path: storagePath,
        image_type: imageType,
        page_number: pageNumber || null,
      });
    
    if (dbError) {
      console.error('Database insert error:', dbError);
      return { storagePath: '', error: dbError.message };
    }
    
    return { storagePath, error: null };
  } catch (err) {
    console.error('Error uploading story image:', err);
    return { storagePath: '', error: 'Erreur lors de l\'upload' };
  }
}

/**
 * Génère une URL signée temporaire pour accéder à une image privée
 */
export async function getStoryImageUrl(
  storagePath: string,
  expiresIn: number = 3600 // 1 heure par défaut
): Promise<{ url: string | null; error: string | null }> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .storage
      .from('story-images')
      .createSignedUrl(storagePath, expiresIn);
    
    if (error) {
      console.error('Signed URL error:', error);
      return { url: null, error: error.message };
    }
    
    return { url: data.signedUrl, error: null };
  } catch (err) {
    console.error('Error getting signed URL:', err);
    return { url: null, error: 'Erreur lors de la génération de l\'URL' };
  }
}

/**
 * Récupère toutes les images d'une histoire avec URLs signées
 */
export async function getStoryImages(storyId: string): Promise<{
  images: Array<{
    id: string;
    image_type: string;
    page_number: number | null;
    url: string;
  }>;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    
    // Récupérer les métadonnées
    const { data: images, error: dbError } = await supabase
      .from('story_images')
      .select('id, storage_path, image_type, page_number')
      .eq('story_id', storyId)
      .order('page_number', { ascending: true });
    
    if (dbError) {
      return { images: [], error: dbError.message };
    }
    
    if (!images || images.length === 0) {
      return { images: [], error: null };
    }
    
    // Générer les URLs signées
    const storagePaths = images.map(img => img.storage_path);
    const { data: signedUrls, error: urlError } = await supabase
      .storage
      .from('story-images')
      .createSignedUrls(storagePaths, 3600);
    
    if (urlError) {
      return { images: [], error: urlError.message };
    }
    
    // Mapper les résultats
    const result = images.map(img => {
      const signedUrl = signedUrls?.find(u => u.path === img.storage_path);
      return {
        id: img.id,
        image_type: img.image_type,
        page_number: img.page_number,
        url: signedUrl?.signedUrl || '',
      };
    });
    
    return { images: result, error: null };
  } catch (err) {
    console.error('Error getting story images:', err);
    return { images: [], error: 'Erreur lors de la récupération' };
  }
}

/**
 * Supprime une image (storage + database)
 */
export async function deleteStoryImage(
  imageId: string,
  storagePath: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();
    
    // Supprimer du storage
    const { error: storageError } = await supabase
      .storage
      .from('story-images')
      .remove([storagePath]);
    
    if (storageError) {
      console.error('Storage delete error:', storageError);
    }
    
    // Supprimer de la database
    const { error: dbError } = await supabase
      .from('story_images')
      .delete()
      .eq('id', imageId);
    
    if (dbError) {
      return { success: false, error: dbError.message };
    }
    
    return { success: true, error: null };
  } catch (err) {
    console.error('Error deleting story image:', err);
    return { success: false, error: 'Erreur lors de la suppression' };
  }
}

/**
 * Télécharge une image depuis une URL et l'upload vers Supabase
 */
export async function downloadAndStoreImage(
  storyId: string,
  imageUrl: string,
  imageType: 'cover' | 'page' | 'ending',
  pageNumber?: number
): Promise<{ storagePath: string; error: string | null }> {
  try {
    // Télécharger l'image depuis l'URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return { storagePath: '', error: 'Impossible de télécharger l\'image' };
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload vers Supabase
    return await uploadStoryImage(storyId, buffer, imageType, pageNumber);
  } catch (err) {
    console.error('Error downloading/storing image:', err);
    return { storagePath: '', error: 'Erreur lors du téléchargement' };
  }
}
