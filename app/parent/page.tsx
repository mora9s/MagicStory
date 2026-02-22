'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  getAllChildProfiles, 
  createChildProfile, 
  updateChildProfile, 
  generateChildAvatar, 
  deleteChildProfile, 
  uploadChildPhoto,
  type HeroRelationship
} from '@/lib/actions';
import { relationshipTypes } from '@/lib/relationships';
import { triggerVibration } from '@/lib/haptics';
import { 
  Users, Plus, Trash2, Sparkles, ArrowLeft, Camera, 
  Edit2, X, Check, Crown, Heart, Star, Zap 
} from 'lucide-react';
import type { HeroRelationship as HeroRelationshipType } from '@/lib/types';

type Profile = {
  id: string;
  first_name: string;
  age: number;
  avatar_url: string | null;
  created_at: string | null;
  traits: string[] | null;
};

// Traits disponibles (simplifié)
const availableTraits = [
  { id: 'sportif', emoji: '⚽', label: 'Sportif' },
  { id: 'creatif', emoji: '🎨', label: 'Créatif' },
  { id: 'aventurier', emoji: '🗺️', label: 'Aventurier' },
  { id: 'curieux', emoji: '🔍', label: 'Curieux' },
  { id: 'gentil', emoji: '❤️', label: 'Gentil' },
  { id: 'courageux', emoji: '🦁', label: 'Courageux' },
];

export default function ParentDashboard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [generatingAvatar, setGeneratingAvatar] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [age, setAge] = useState(6);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    const result = await getAllChildProfiles();
    if (result.data) {
      setProfiles(result.data);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFirstName('');
    setAge(6);
    setSelectedTraits([]);
    setAvatarUrl('');
    setPhotoPreview('');
    setEditingProfile(null);
  };

  const toggleTrait = (traitId: string) => {
    setSelectedTraits(prev => 
      prev.includes(traitId) 
        ? prev.filter(t => t !== traitId)
        : [...prev, traitId]
    );
  };

  const generateAvatar = async () => {
    if (!firstName) {
      alert('Ajoute un prénom d\'abord !');
      return;
    }
    
    setGeneratingAvatar(true);
    const result = await generateChildAvatar(firstName, age, '');
    setGeneratingAvatar(false);

    if (result.data) {
      setAvatarUrl(result.data.avatarUrl);
    }
  };

  const handleSave = async () => {
    if (!firstName) {
      alert('Le prénom est obligatoire !');
      return;
    }
    
    setSaving(true);
    
    if (editingProfile) {
      const result = await updateChildProfile(editingProfile.id, {
        first_name: firstName,
        age: age,
        avatar_url: avatarUrl || undefined,
        traits: selectedTraits
      });
      
      if (result.data) {
        setProfiles(profiles.map(p => p.id === editingProfile.id ? result.data! : p));
        resetForm();
        setShowAddForm(false);
        triggerVibration();
      }
    } else {
      const result = await createChildProfile(firstName, age, avatarUrl || undefined, selectedTraits);
      
      if (result.data) {
        setProfiles([result.data, ...profiles]);
        resetForm();
        setShowAddForm(false);
        triggerVibration();
      }
    }
    
    setSaving(false);
  };

  const handleEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setFirstName(profile.first_name);
    setAge(profile.age);
    setSelectedTraits(profile.traits || []);
    setAvatarUrl(profile.avatar_url || '');
    setShowAddForm(true);
    triggerVibration();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce héros ?')) return;
    
    const result = await deleteChildProfile(id);
    if (!result.error) {
      setProfiles(profiles.filter(p => p.id !== id));
      triggerVibration();
    }
  };

  // Icône aléatoire basée sur le nom
  const getHeroIcon = (name: string) => {
    const icons = ['👑', '⭐', '⚡', '🦸', '🧙', '🏰', '🗡️', '🛡️'];
    const index = name.charCodeAt(0) % icons.length;
    return icons[index];
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-indigo-950">
      {/* Header compact */}
      <header className="sticky top-0 z-50 bg-indigo-950/90 backdrop-blur-md border-b border-indigo-800">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link 
            href="/"
            onClick={() => triggerVibration()}
            className="p-2 -ml-2 text-indigo-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-400" />
            <span className="font-black text-white text-lg tracking-tight">Mes Héros</span>
          </div>
          
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4 pb-24">
        {/* Stats */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-indigo-300 text-sm">
            {profiles.length} héros dans ta collection
          </span>
        </div>

        {/* Bouton Ajouter */}
        {!showAddForm && (
          <button
            onClick={() => { resetForm(); setShowAddForm(true); triggerVibration(); }}
            className="w-full mb-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black py-4 px-6 rounded-2xl border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
          >
            <Plus className="w-6 h-6" />
            <span className="text-lg">Nouveau Héros</span>
          </button>
        )}

        {/* Formulaire */}
        {showAddForm && (
          <div className="bg-white rounded-2xl border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-indigo-900">
                {editingProfile ? '✏️ Modifier' : '✨ Créer un héros'}
              </h2>
              <button 
                onClick={() => setShowAddForm(false)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Prénom */}
              <div>
                <label className="block font-bold text-sm text-gray-600 mb-1">Nom du héros</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ex: Emma"
                  className="w-full p-3 bg-slate-100 border-4 border-black rounded-xl font-bold text-lg"
                />
              </div>

              {/* Âge */}
              <div>
                <label className="block font-bold text-sm text-gray-600 mb-1">
                  Âge : {age} ans
                </label>
                <input
                  type="range"
                  min="3"
                  max="12"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value))}
                  className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>3 ans</span>
                  <span>12 ans</span>
                </div>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl border-4 border-black flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">🦸</span>
                  )}
                </div>
                <button
                  onClick={generateAvatar}
                  disabled={generatingAvatar || !firstName}
                  className="flex-1 bg-purple-500 hover:bg-purple-400 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all text-sm"
                >
                  {generatingAvatar ? (
                    <Sparkles className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    '✨ Générer avatar'
                  )}
                </button>
              </div>

              {/* Traits */}
              <div>
                <label className="block font-bold text-sm text-gray-600 mb-2">Caractéristiques</label>
                <div className="flex flex-wrap gap-2">
                  {availableTraits.map((trait) => (
                    <button
                      key={trait.id}
                      onClick={() => toggleTrait(trait.id)}
                      className={`px-3 py-2 rounded-xl border-2 border-black font-bold text-sm transition-all ${
                        selectedTraits.includes(trait.id)
                          ? 'bg-amber-400 shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                          : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      {trait.emoji} {trait.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !firstName}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-300 text-black font-bold py-3 rounded-xl border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <Sparkles className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {editingProfile ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liste des héros */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Sparkles className="w-10 h-10 text-amber-400 animate-spin" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-indigo-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-10 h-10 text-indigo-400" />
            </div>
            <p className="text-white font-bold text-lg mb-2">Aucun héros encore</p>
            <p className="text-indigo-400 text-sm">Crée ton premier héros !</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="group bg-white rounded-2xl border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] overflow-hidden active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
              >
                {/* Header avec avatar */}
                <div className="relative bg-gradient-to-br from-indigo-400 to-purple-500 p-4">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDelete(profile.id)}
                      className="p-1.5 bg-red-500 text-white rounded-full shadow-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="w-16 h-16 mx-auto bg-white rounded-2xl border-4 border-black flex items-center justify-center shadow-lg">
                    {profile.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.first_name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <span className="text-3xl">{getHeroIcon(profile.first_name)}</span>
                    )}
                  </div>
                </div>
                
                {/* Info */}
                <div className="p-3 text-center">
                  <h3 className="font-black text-lg text-gray-900 truncate">
                    {profile.first_name}
                  </h3>
                  <p className="text-gray-500 text-sm font-medium">
                    {profile.age} ans
                  </p>
                  
                  {/* Traits mini */}
                  {profile.traits && profile.traits.length > 0 && (
                    <div className="flex justify-center gap-1 mt-2">
                      {profile.traits.slice(0, 2).map(traitId => {
                        const trait = availableTraits.find(t => t.id === traitId);
                        return trait ? (
                          <span key={traitId} className="text-lg" title={trait.label}>
                            {trait.emoji}
                          </span>
                        ) : null;
                      })}
                      {profile.traits.length > 2 && (
                        <span className="text-xs text-gray-400 self-center">+{profile.traits.length - 2}</span>
                      )}
                    </div>
                  )}
                  
                  {/* Bouton modifier */}
                  <button
                    onClick={() => handleEdit(profile)}
                    className="mt-3 w-full py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold rounded-xl text-sm transition-colors"
                  >
                    Modifier
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
