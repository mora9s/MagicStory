'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  getAllChildProfiles, createChildProfile, updateChildProfile, generateChildAvatar, 
  deleteChildProfile, uploadChildPhoto, getHeroRelationships, addHeroRelationship, 
  deleteHeroRelationship, relationshipTypes, getRelationshipLabel,
  type HeroRelationship 
} from '@/lib/actions';
import { triggerVibration } from '@/lib/haptics';
import { Users, Plus, Trash2, Sparkles, ArrowLeft, UserPlus, Camera, Edit2, X, Check } from 'lucide-react';

type Profile = {
  id: string;
  first_name: string;
  age: number;
  favorite_hero: string | null;
  avatar_url: string | null;
  created_at: string | null;
  traits: string[] | null;
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
  { id: 'Ninja', emoji: '🥷', label: 'Ninja' },
  { id: 'Sirène', emoji: '🧜‍♀️', label: 'Sirène' },
  { id: 'Lion', emoji: '🦁', label: 'Lion' },
  { id: 'Super-héros', emoji: '🦸', label: 'Super-héros' },
  { id: 'Viking', emoji: '⚔️', label: 'Viking' },
  { id: 'Fée', emoji: '🧚', label: 'Fée' },
  { id: 'Scientifique', emoji: '🔬', label: 'Scientifique' },
  { id: 'Cowboy', emoji: '🤠', label: 'Cowboy' },
  { id: 'Phénix', emoji: '🔥', label: 'Phénix' },
  { id: 'Loup-garou', emoji: '🐺', label: 'Loup-garou' },
  { id: 'Chat', emoji: '😺', label: 'Chat' },
  { id: 'Géant', emoji: '🦶', label: 'Géant' },
  { id: 'Fantôme', emoji: '👻', label: 'Fantôme' },
  { id: 'Reine', emoji: '👑', label: 'Reine' },
  { id: 'Gladiateur', emoji: '🏛️', label: 'Gladiateur' },
  { id: 'Samouraï', emoji: '⚔️', label: 'Samouraï' },
];

// Caractéristiques disponibles
const availableTraits = [
  { id: 'danse', emoji: '💃', label: 'Danse' },
  { id: 'sportif', emoji: '⚽', label: 'Sportif' },
  { id: 'rigolo', emoji: '😄', label: 'Rigolo' },
  { id: 'musique', emoji: '🎵', label: 'Musique' },
  { id: 'dessin', emoji: '🎨', label: 'Dessin' },
  { id: 'cuisine', emoji: '👨‍🍳', label: 'Cuisine' },
  { id: 'lecture', emoji: '📚', label: 'Lecture' },
  { id: 'nature', emoji: '🌿', label: 'Nature' },
  { id: 'techno', emoji: '💻', label: 'Techno' },
  { id: 'aventurier', emoji: '🗺️', label: 'Aventurier' },
  { id: 'curieux', emoji: '🔍', label: 'Curieux' },
  { id: 'gentil', emoji: '❤️', label: 'Gentil' },
  { id: 'courageux', emoji: '🦁', label: 'Courageux' },
  { id: 'calme', emoji: '😌', label: 'Calme' },
  { id: 'energique', emoji: '⚡', label: 'Énergique' },
];

const getRandomHero = () => {
  const randomIndex = Math.floor(Math.random() * heroTypes.length);
  return heroTypes[randomIndex].id;
};

// Composant pour afficher les relations d'un héros
function HeroRelations({ profileId }: { profileId: string }) {
  const [relations, setRelations] = useState<HeroRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadRelations();
  }, [profileId]);
  
  const loadRelations = async () => {
    const result = await getHeroRelationships(profileId);
    if (result.data) {
      setRelations(result.data);
    }
    setLoading(false);
  };
  
  if (loading || relations.length === 0) return null;
  
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {relations.slice(0, 3).map((rel) => {
        const type = relationshipTypes.find(t => t.id === rel.relation_type);
        return (
          <span 
            key={rel.id}
            className="inline-flex items-center gap-1 bg-indigo-100 border-2 border-indigo-300 px-2 py-0.5 rounded text-xs font-bold text-indigo-800"
            title={`${type?.label} ${rel.to_hero?.first_name}`}
          >
            {type?.emoji} {rel.to_hero?.first_name}
          </span>
        );
      })}
      {relations.length > 3 && (
        <span className="inline-flex items-center gap-1 bg-gray-100 border-2 border-gray-300 px-2 py-0.5 rounded text-xs font-bold text-gray-600">
          +{relations.length - 3}
        </span>
      )}
    </div>
  );
}

export default function ParentDashboard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [generatingAvatar, setGeneratingAvatar] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [age, setAge] = useState(6);
  const [selectedHero, setSelectedHero] = useState('Chevalier');
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [physicalDesc, setPhysicalDesc] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Relations state
  const [relationships, setRelationships] = useState<HeroRelationship[]>([]);
  const [showAddRelation, setShowAddRelation] = useState(false);
  const [selectedRelationHero, setSelectedRelationHero] = useState('');
  const [selectedRelationType, setSelectedRelationType] = useState('ami');
  const [loadingRelations, setLoadingRelations] = useState(false);

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
    setSelectedHero('Chevalier');
    setSelectedTraits([]);
    setAvatarUrl('');
    setPhysicalDesc('');
    setPhotoFile(null);
    setPhotoPreview('');
    setEditingProfile(null);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTrait = (traitId: string) => {
    setSelectedTraits(prev => 
      prev.includes(traitId) 
        ? prev.filter(t => t !== traitId)
        : [...prev, traitId]
    );
  };

  const uploadAndGenerateAvatar = async () => {
    if (!firstName || !age) {
      alert('Remplis d\'abord le prénom et l\'âge !');
      return;
    }

    if (!photoFile) {
      setGeneratingAvatar(true);
      const result = await generateChildAvatar(firstName, age, physicalDesc);
      setGeneratingAvatar(false);

      if (result.data) {
        setAvatarUrl(result.data.avatarUrl);
      } else {
        alert('Erreur lors de la génération de l\'avatar');
      }
      return;
    }

    setUploadingPhoto(true);
    const uploadResult = await uploadChildPhoto(photoFile, firstName);

    if (!uploadResult.data) {
      alert('Erreur lors de l\'upload de la photo');
      setUploadingPhoto(false);
      return;
    }

    const path = uploadResult.data.path;
    setUploadingPhoto(false);
    setGeneratingAvatar(true);

    const result = await generateChildAvatar(firstName, age, physicalDesc, path);
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
    
    if (editingProfile) {
      // Mode modification
      const result = await updateChildProfile(editingProfile.id, {
        first_name: firstName,
        age: age,
        favorite_hero: selectedHero,
        avatar_url: avatarUrl || undefined,
        traits: selectedTraits
      });
      
      if (result.data) {
        setProfiles(profiles.map(p => p.id === editingProfile.id ? result.data! : p));
        resetForm();
        setShowAddForm(false);
        triggerVibration();
      } else {
        alert(result.error || 'Erreur lors de la mise à jour');
      }
    } else {
      // Mode création
      const result = await createChildProfile(firstName, age, selectedHero, avatarUrl || undefined, selectedTraits);
      
      if (result.data) {
        setProfiles([result.data, ...profiles]);
        resetForm();
        setShowAddForm(false);
        triggerVibration();
      } else {
        alert(result.error || 'Erreur lors de la sauvegarde');
      }
    }
    
    setSaving(false);
  };

  const handleEdit = async (profile: Profile) => {
    setEditingProfile(profile);
    setFirstName(profile.first_name);
    setAge(profile.age);
    setSelectedHero(profile.favorite_hero || 'Chevalier');
    setSelectedTraits(profile.traits || []);
    setAvatarUrl(profile.avatar_url || '');
    setShowAddForm(true);
    
    // Charger les relations
    setLoadingRelations(true);
    const result = await getHeroRelationships(profile.id);
    if (result.data) {
      setRelationships(result.data);
    }
    setLoadingRelations(false);
    
    triggerVibration();
  };
  
  const handleAddRelationship = async () => {
    if (!editingProfile || !selectedRelationHero) return;
    
    const result = await addHeroRelationship(
      editingProfile.id,
      selectedRelationHero,
      selectedRelationType
    );
    
    if (result.data) {
      setRelationships([...relationships, result.data]);
      setSelectedRelationHero('');
      setSelectedRelationType('ami');
      setShowAddRelation(false);
      triggerVibration();
    }
  };
  
  const handleDeleteRelationship = async (relationshipId: string) => {
    if (!confirm('Supprimer cette relation ?')) return;
    
    const result = await deleteHeroRelationship(relationshipId);
    if (!result.error) {
      setRelationships(relationships.filter(r => r.id !== relationshipId));
      triggerVibration();
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

  const getTraitLabel = (traitId: string) => {
    return availableTraits.find(t => t.id === traitId);
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
            Gère les profils de tes enfants, leurs caractéristiques et leurs avatars. 
            Ces infos seront utilisées pour personnaliser leurs histoires !
          </p>
        </div>

        {/* Bouton Ajouter */}
        {!showAddForm && (
          <button
            onClick={() => { resetForm(); setShowAddForm(true); triggerVibration(); }}
            className="w-full mb-8 bg-amber-500 hover:bg-amber-400 text-black font-black py-6 px-8 border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 text-xl"
          >
            <UserPlus className="w-7 h-7" />
            Ajouter un enfant
          </button>
        )}

        {/* Formulaire d'ajout/modification */}
        {showAddForm && (
          <div className="bg-white border-4 border-black p-6 sm:p-8 mb-8 shadow-[10px_10px_0px_rgba(0,0,0,1)] rounded-lg text-black">
            <h2 className="text-2xl font-black text-indigo-900 mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-500" />
              {editingProfile ? 'Modifier le profil' : 'Nouveau profil'}
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

              {/* Caractéristiques */}
              <div>
                <label className="block font-black text-sm uppercase mb-3">
                  Caractéristiques (utilisées dans les histoires)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {availableTraits.map((trait) => (
                    <button
                      key={trait.id}
                      onClick={() => toggleTrait(trait.id)}
                      className={`p-2 border-2 border-black text-center transition-all ${
                        selectedTraits.includes(trait.id)
                          ? 'bg-amber-500 shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                          : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xl block">{trait.emoji}</span>
                      <span className="text-xs font-bold">{trait.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Ces traits pourront apparaître dans les histoires de temps en temps !
                </p>
              </div>

              {/* Type de héros préféré */}
              <div>
                <label className="block font-black text-sm uppercase mb-3">Type de héros préféré</label>
                
                <button
                  onClick={() => {
                    triggerVibration();
                    setSelectedHero(getRandomHero());
                  }}
                  className="w-full mb-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black py-3 px-6 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  🎲 Choisir un héros aléatoire
                </button>

                <p className="text-sm font-bold text-gray-600 mb-2">Ou sélectionne un héros :</p>
                
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border-4 border-slate-200 rounded">
                  {heroTypes.map((hero) => (
                    <button
                      key={hero.id}
                      onClick={() => setSelectedHero(hero.id)}
                      title={hero.label}
                      className={`p-2 border-2 border-black font-bold text-center transition-all ${
                        selectedHero === hero.id 
                          ? 'bg-amber-500 shadow-[2px_2px_0px_rgba(0,0,0,1)]' 
                          : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{hero.emoji}</span>
                      <span className="text-xs">{hero.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload de photo */}
              <div className="bg-indigo-50 border-4 border-indigo-200 p-6 rounded-lg">
                <label className="block font-black text-sm uppercase mb-3">
                  <Camera className="w-4 h-4 inline mr-1" />
                  Photo de l'enfant (optionnel)
                </label>
                
                {photoPreview ? (
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-24 h-24 border-4 border-black rounded-lg overflow-hidden">
                      <img src={photoPreview} alt="Photo" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-indigo-900 mb-2">📷 Photo sélectionnée</p>
                      <button
                        onClick={() => { setPhotoFile(null); setPhotoPreview(''); }}
                        className="text-sm text-red-600 hover:text-red-800 underline"
                      >
                        Supprimer la photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="w-full p-4 bg-white border-4 border-black font-bold"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Upload une photo pour générer un avatar qui ressemble à ton enfant
                    </p>
                  </div>
                )}
              </div>

              {/* Description physique */}
              <div>
                <label className="block font-black text-sm uppercase mb-2">
                  Description pour l'avatar
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

              {/* Génération d'avatar */}
              <div className="bg-purple-50 border-4 border-purple-200 p-6 rounded-lg">
                <label className="block font-black text-sm uppercase mb-3">Générer l'avatar</label>
                
                {avatarUrl ? (
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 border-4 border-black rounded-lg overflow-hidden">
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-indigo-900 mb-2">✨ Avatar créé !</p>
                      <button
                        onClick={uploadAndGenerateAvatar}
                        disabled={generatingAvatar || uploadingPhoto}
                        className="text-sm text-indigo-600 hover:text-indigo-800 underline"
                      >
                        {generatingAvatar || uploadingPhoto ? 'Génération...' : 'Regénérer un autre avatar'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={uploadAndGenerateAvatar}
                    disabled={generatingAvatar || uploadingPhoto || !firstName}
                    className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-400 text-white font-black py-4 px-6 border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                  >
                    {uploadingPhoto ? (
                      <>
                        <Sparkles className="w-5 h-5 animate-spin" />
                        Upload de la photo...
                      </>
                    ) : generatingAvatar ? (
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

              {/* Relations avec d'autres héros - UNIQUEMENT EN MODE ÉDITION */}
              {editingProfile && (
                <div className="bg-indigo-50 border-4 border-indigo-200 p-6 rounded-lg">
                  <label className="block font-black text-sm uppercase mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Relations avec d'autres héros
                  </label>
                  
                  {/* Liste des relations existantes */}
                  {loadingRelations ? (
                    <div className="text-center py-4">
                      <Sparkles className="w-5 h-5 text-indigo-500 animate-spin mx-auto" />
                    </div>
                  ) : relationships.length > 0 ? (
                    <div className="space-y-2 mb-4">
                      {relationships.map((rel) => (
                        <div key={rel.id} className="flex items-center justify-between bg-white border-2 border-black p-3">
                          <div className="flex items-center gap-2">
                            {rel.to_hero?.avatar_url ? (
                              <img src={rel.to_hero.avatar_url} alt="" className="w-8 h-8 rounded border border-black object-cover" />
                            ) : (
                              <div className="w-8 h-8 bg-indigo-100 rounded border border-black flex items-center justify-center">
                                <Users className="w-4 h-4 text-indigo-400" />
                              </div>
                            )}
                            <span className="font-bold text-sm">
                              {(() => {
                                const type = relationshipTypes.find(t => t.id === rel.relation_type);
                                return (
                                  <>
                                    {type?.emoji} {type?.label} <span className="text-indigo-600">{rel.to_hero?.first_name}</span>
                                  </>
                                );
                              })()}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteRelationship(rel.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm mb-4">Aucune relation définie</p>
                  )}
                  
                  {/* Bouton ajouter une relation */}
                  {!showAddRelation ? (
                    <button
                      onClick={() => setShowAddRelation(true)}
                      className="w-full bg-white hover:bg-gray-50 border-4 border-black border-dashed font-bold py-3 px-4 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Ajouter une relation
                    </button>
                  ) : (
                    <div className="bg-white border-4 border-black p-4 space-y-3">
                      <p className="font-bold text-sm">{firstName} est...</p>
                      
                      {/* Sélection du type de relation */}
                      <select
                        value={selectedRelationType}
                        onChange={(e) => setSelectedRelationType(e.target.value)}
                        className="w-full p-3 bg-slate-100 border-4 border-black font-bold"
                      >
                        {relationshipTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.emoji} {type.label}
                          </option>
                        ))}
                      </select>
                      
                      {/* Sélection de l'autre héros */}
                      <select
                        value={selectedRelationHero}
                        onChange={(e) => setSelectedRelationHero(e.target.value)}
                        className="w-full p-3 bg-slate-100 border-4 border-black font-bold"
                      >
                        <option value="">Choisir un héros...</option>
                        {profiles
                          .filter(p => p.id !== editingProfile.id)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.first_name} ({p.age} ans)
                            </option>
                          ))}
                      </select>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowAddRelation(false)}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 font-bold py-2 px-4 border-2 border-black"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={handleAddRelationship}
                          disabled={!selectedRelationHero}
                          className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-300 font-bold py-2 px-4 border-2 border-black"
                        >
                          Ajouter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Boutons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => { resetForm(); setShowAddForm(false); }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-black py-4 px-6 border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !firstName}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-400 text-black font-black py-4 px-6 border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  {saving ? 'Sauvegarde...' : <><Check className="w-5 h-5" /> {editingProfile ? 'Mettre à jour' : 'Sauvegarder'}</>}
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
              className="bg-white border-4 border-black p-4 sm:p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)]"
            >
              <div className="flex items-start gap-4 sm:gap-6">
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
                  <p className="text-gray-600 font-bold mb-2">
                    {profile.age} ans • {profile.favorite_hero || 'Héros'}
                  </p>
                  
                  {/* Traits */}
                  {profile.traits && profile.traits.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {profile.traits.map(traitId => {
                        const trait = getTraitLabel(traitId);
                        return trait ? (
                          <span 
                            key={traitId}
                            className="inline-flex items-center gap-1 bg-amber-100 border-2 border-amber-300 px-2 py-0.5 rounded text-xs font-bold text-amber-800"
                          >
                            {trait.emoji} {trait.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
                
                {/* Relations (seront affichées après chargement) */}
                <HeroRelations profileId={profile.id} />

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleEdit(profile)}
                    className="bg-indigo-500 hover:bg-indigo-400 text-white p-3 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                    title="Modifier"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(profile.id)}
                    className="bg-red-500 hover:bg-red-400 text-white p-3 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
