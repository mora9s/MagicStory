'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
// Utilisation de balises img standard pour les images externes
import { getAllChildProfiles, createChildProfile, generateChildAvatar, deleteChildProfile } from '@/lib/actions';
import { triggerVibration } from '@/lib/haptics';
import { Users, Plus, Trash2, Sparkles, ArrowLeft, UserPlus, Camera } from 'lucide-react';

type Profile = {
  id: string;
  first_name: string;
  age: number;
  favorite_hero: string | null;
  avatar_url: string | null;
  created_at: string | null;
};

const heroTypes = [
  { id: 'Chevalier', emoji: '🛡️', label: 'Chevalier' },
  { id: 'Magicienne', emoji: '🧙‍♀️', label: 'Magicienne' },
  { id: 'Explorateur', emoji: '🤠', label: 'Explorateur' },
  { id: 'Robot', emoji: '🤖', label: 'Robot' },
  { id: 'Princesse', emoji: '👸', label: 'Princesse' },
  { id: 'Pirate', emoji: '🏴‍☠️', label: 'Pirate' },
  { id: 'Astronaute', emoji: '🚀', label: 'Astronaute' },
  { id: 'Dragon', emoji: '🐉', label: 'Dragon' },
];

export default function ParentDashboard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [generatingAvatar, setGeneratingAvatar] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [age, setAge] = useState(6);
  const [selectedHero, setSelectedHero] = useState('Chevalier');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [physicalDesc, setPhysicalDesc] = useState('');
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

  const generateAvatar = async () => {
    if (!firstName || !age) {
      alert('Remplis d\'abord le prénom et l\'âge !');
      return;
    }
    
    setGeneratingAvatar(true);
    const result = await generateChildAvatar(firstName, age, physicalDesc);
    setGeneratingAvatar(false);
    
    if (result.data) {
      setAvatarUrl(result.data.avatarUrl);
    } else {
      alert('Erreur lors de la génération de l\'avatar');
    }
  };

  const handleSave = async () => {
    if (!firstName) {
      alert('Le prénom est obligatoire !');
      return;
    }
    
    setSaving(true);
    const result = await createChildProfile(firstName, age, selectedHero, avatarUrl || undefined);
    setSaving(false);
    
    if (result.data) {
      setProfiles([result.data, ...profiles]);
      // Reset form
      setFirstName('');
      setAge(6);
      setSelectedHero('Chevalier');
      setAvatarUrl('');
      setPhysicalDesc('');
      setShowAddForm(false);
      triggerVibration();
    } else {
      alert(result.error || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Es-tu sûr de vouloir supprimer ce profil ?')) return;
    
    const result = await deleteChildProfile(id);
    if (!result.error) {
      setProfiles(profiles.filter(p => p.id !== id));
      triggerVibration();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0f1a] via-indigo-950 to-purple-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <Link 
            href="/"
            onClick={() => triggerVibration()}
            className="bg-indigo-900 border-4 border-black p-3 text-white font-black uppercase tracking-tighter hover:bg-indigo-800 shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </Link>
          
          <h1 className="text-2xl sm:text-4xl font-black text-amber-400 uppercase tracking-tighter drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center gap-3">
            <Users className="w-8 h-8" />
            Espace Parent
          </h1>
          
          <div className="w-20"></div>
        </div>

        {/* Description */}
        <div className="bg-indigo-900/50 border-4 border-indigo-700 p-6 mb-8 rounded-lg">
          <p className="text-indigo-200 text-center">
            Gère les profils de tes enfants, crée leurs avatars personnalisés, 
            et retrouve-les facilement pour créer des histoires !
          </p>
        </div>

        {/* Bouton Ajouter */}
        {!showAddForm && (
          <button
            onClick={() => { setShowAddForm(true); triggerVibration(); }}
            className="w-full mb-8 bg-amber-500 hover:bg-amber-400 text-black font-black py-6 px-8 border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 text-xl"
          >
            <UserPlus className="w-7 h-7" />
            Ajouter un enfant
          </button>
        )}

        {/* Formulaire d'ajout */}
        {showAddForm && (
          <div className="bg-white border-4 border-black p-6 sm:p-8 mb-8 shadow-[10px_10px_0px_rgba(0,0,0,1)] rounded-lg">
            <h2 className="text-2xl font-black text-indigo-900 mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-500" />
              Nouveau profil
            </h2>
            
            <div className="space-y-6">
              {/* Prénom */}
              <div>
                <label className="block font-black text-sm uppercase mb-2">Prénom</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ex: Emma"
                  className="w-full p-4 bg-slate-100 border-4 border-black font-bold text-lg"
                />
              </div>

              {/* Âge */}
              <div>
                <label className="block font-black text-sm uppercase mb-2">Âge : {age} ans</label>
                <input
                  type="range"
                  min="3"
                  max="12"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value))}
                  className="w-full h-4 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>3 ans</span>
                  <span>12 ans</span>
                </div>
              </div>

              {/* Description physique pour l'avatar */}
              <div>
                <label className="block font-black text-sm uppercase mb-2">
                  <Camera className="w-4 h-4 inline mr-1" />
                  Description pour l'avatar (optionnel)
                </label>
                <input
                  type="text"
                  value={physicalDesc}
                  onChange={(e) => setPhysicalDesc(e.target.value)}
                  placeholder="Ex: cheveux blonds bouclés, yeux bleus, taches de rousseur"
                  className="w-full p-4 bg-slate-100 border-4 border-black font-bold"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Décris les traits de ton enfant pour un avatar personnalisé
                </p>
              </div>

              {/* Type de héros préféré */}
              <div>
                <label className="block font-black text-sm uppercase mb-3">Type de héros préféré</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {heroTypes.map((hero) => (
                    <button
                      key={hero.id}
                      onClick={() => setSelectedHero(hero.id)}
                      className={`p-3 border-4 border-black font-bold text-center transition-all ${
                        selectedHero === hero.id 
                          ? 'bg-amber-500 shadow-[4px_4px_0px_rgba(0,0,0,1)]' 
                          : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{hero.emoji}</span>
                      <span className="text-xs">{hero.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Génération d'avatar */}
              <div className="bg-indigo-50 border-4 border-indigo-200 p-6 rounded-lg">
                <label className="block font-black text-sm uppercase mb-3">Avatar personnalisé</label>
                
                {avatarUrl ? (
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 border-4 border-black rounded-lg overflow-hidden">
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-indigo-900 mb-2">✨ Avatar créé !</p>
                      <button
                        onClick={generateAvatar}
                        disabled={generatingAvatar}
                        className="text-sm text-indigo-600 hover:text-indigo-800 underline"
                      >
                        {generatingAvatar ? 'Génération...' : 'Regénérer un autre avatar'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={generateAvatar}
                    disabled={generatingAvatar || !firstName}
                    className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-400 text-white font-black py-4 px-6 border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                  >
                    {generatingAvatar ? (
                      <>
                        <Sparkles className="w-5 h-5 animate-spin" />
                        Création de l'avatar...
                      </>
                    ) : (
                      <>
                        <Camera className="w-5 h-5" />
                        {firstName ? `Générer l'avatar de ${firstName}` : 'Remplis le prénom d\'abord'}
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Boutons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-black py-4 px-6 border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !firstName}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-400 text-black font-black py-4 px-6 border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  {saving ? 'Sauvegarde...' : <><Plus className="w-5 h-5" /> Sauvegarder</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liste des profils */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-white uppercase tracking-wider mb-4">
            Mes enfants ({profiles.length})
          </h2>
          
          {loading && (
            <div className="text-center py-10">
              <Sparkles className="w-10 h-10 text-amber-400 animate-spin mx-auto" />
            </div>
          )}

          {!loading && profiles.length === 0 && (
            <div className="bg-indigo-900/50 border-4 border-dashed border-indigo-700 p-10 text-center rounded-lg">
              <p className="text-indigo-300">Aucun profil enregistré</p>
              <p className="text-indigo-400 text-sm mt-2">Ajoute ton premier enfant !</p>
            </div>
          )}

          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-white border-4 border-black p-4 sm:p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] flex items-center gap-4 sm:gap-6"
            >
              {/* Avatar */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-100 border-4 border-black rounded-lg overflow-hidden flex-shrink-0">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.first_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-indigo-300" />
                  </div>
                )}
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-xl sm:text-2xl text-indigo-900 truncate">
                  {profile.first_name}
                </h3>
                <p className="text-gray-600 font-bold">
                  {profile.age} ans • {profile.favorite_hero || 'Héros'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/choose-hero?childId=${profile.id}&name=${profile.first_name}&age=${profile.age}&hero=${profile.favorite_hero || 'Chevalier'}${profile.avatar_url ? `&avatar=${encodeURIComponent(profile.avatar_url)}` : ''}`}
                  onClick={() => triggerVibration()}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-black py-3 px-4 sm:px-6 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all text-sm sm:text-base whitespace-nowrap"
                >
                  Créer une histoire
                </Link>
                <button
                  onClick={() => handleDelete(profile.id)}
                  className="bg-red-500 hover:bg-red-400 text-white p-3 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                  title="Supprimer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
