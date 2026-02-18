-- Migration: Ajout de l'image de fin pour les histoires
-- Date: 2026-02-18

-- Ajouter la colonne ending_image_url à la table stories
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS ending_image_url TEXT;

-- Note: Les histoires existantes n'auront pas d'image de fin, ce qui est OK
-- Seules les nouvelles histoires générées auront cette image
