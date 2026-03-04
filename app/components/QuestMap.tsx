'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Zap, Lock, Check, Gift, MapPin, Crown,
  Cat, Dog, Rabbit, Heart, Bird, Sparkles
} from 'lucide-react';

interface MapNode {
  level: number;
  x: number;
  y: number;
  reward?: string;
  type: 'start' | 'normal' | 'reward' | 'legendary' | 'final';
}

const mapNodes: MapNode[] = [
  { level: 1, x: 10, y: 85, type: 'start' },
  { level: 2, x: 20, y: 80, reward: '🐱', type: 'reward' },
  { level: 3, x: 30, y: 75, type: 'normal' },
  { level: 4, x: 40, y: 70, reward: '🐶', type: 'reward' },
  { level: 5, x: 50, y: 65, reward: '🌲', type: 'reward' },
  { level: 6, x: 55, y: 55, reward: '🐰', type: 'reward' },
  { level: 7, x: 60, y: 45, type: 'normal' },
  { level: 8, x: 55, y: 35, reward: '❤️', type: 'reward' },
  { level: 9, x: 45, y: 30, type: 'normal' },
  { level: 10, x: 35, y: 25, reward: '🐉', type: 'legendary' },
  { level: 11, x: 25, y: 20, reward: '🏰', type: 'reward' },
  { level: 12, x: 20, y: 12, reward: '🦅', type: 'legendary' },
  { level: 13, x: 35, y: 10, type: 'normal' },
  { level: 14, x: 50, y: 8, reward: '🦄', type: 'legendary' },
  { level: 15, x: 75, y: 5, reward: '👑', type: 'final' },
];

interface QuestMapProps {
  currentLevel: number;
  currentXp: number;
  nextLevelXp: number;
}

export function QuestMap({ currentLevel, currentXp, nextLevelXp }: QuestMapProps) {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  
  const progressPercent = (currentXp / nextLevelXp) * 100;

  // Générer le chemin SVG
  const pathData = mapNodes.reduce((acc, node, index) => {
    if (index === 0) return `M ${node.x} ${node.y}`;
    return `${acc} L ${node.x} ${node.y}`;
  }, '');

  // Calculer la longueur du chemin parcouru
  const completedNodes = mapNodes.filter(n => n.level <= currentLevel);
  const pathProgress = completedNodes.length / mapNodes.length;

  return (
    <div className="w-full bg-slate-900 rounded-3xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <MapPin className="w-6 h-6 text-amber-400" />
          Carte de l'Aventure
        </h2>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-white/60">
            Niveau <span className="text-amber-400 font-bold text-lg">{currentLevel}</span>/15
          </span>
          <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Carte SVG */}
      <div className="relative w-full aspect-[2/1] bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl overflow-hidden">
        {/* Fond étoilé */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* SVG */}
        <svg 
          viewBox="0 0 100 100" 
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Chemin complet (gris) */}
          <path
            d={pathData}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          
          {/* Chemin parcouru (dégradé) */}
          <motion.path
            d={pathData}
            fill="none"
            stroke="url(#pathGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: pathProgress }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          {/* Définition du dégradé */}
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>

          {/* Nœuds */}
          {mapNodes.map((node) => {
            const isCompleted = node.level <= currentLevel;
            const isCurrent = node.level === currentLevel;
            const isHovered = hoveredNode === node.level;

            return (
              <g
                key={node.level}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseEnter={() => setHoveredNode(node.level)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
              >
                {/* Cercle extérieur glow */}
                {(isCurrent || isHovered) && (
                  <motion.circle
                    r={isCurrent ? 6 : 5}
                    fill="none"
                    stroke={isCurrent ? '#F59E0B' : '#fff'}
                    strokeWidth="0.5"
                    opacity={0.5}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}

                {/* Cercle principal */}
                <motion.circle
                  r={isCurrent ? 4 : 3}
                  fill={isCompleted ? '#F59E0B' : '#1e293b'}
                  stroke={isCompleted ? '#FBBF24' : '#475569'}
                  strokeWidth="1"
                  animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />

                {/* Icône récompense */}
                {node.reward && isCompleted && (
                  <text
                    x="0"
                    y="1"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="3"
                  >
                    {node.reward}
                  </text>
                )}

                {/* Numéro de niveau */}
                {!node.reward && (
                  <text
                    x="0"
                    y="1"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="2"
                    fill={isCompleted ? '#000' : '#94a3b8'}
                  >
                    {node.level}
                  </text>
                )}
              </g>
            );
          })}

          {/* Avatar du joueur */}
          <motion.g
            initial={false}
            animate={{
              x: mapNodes[Math.min(currentLevel - 1, mapNodes.length - 1)]?.x || 10,
              y: mapNodes[Math.min(currentLevel - 1, mapNodes.length - 1)]?.y || 85,
            }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <circle r="5" fill="#8B5CF6" stroke="#fff" strokeWidth="1.5" />
            <text x="0" y="1" textAnchor="middle" dominantBaseline="middle" fontSize="4">🧙</text>
          </motion.g>
        </svg>

        {/* Tooltip */}
        <AnimatePresence>
          {hoveredNode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bg-slate-800 border border-white/20 rounded-xl p-3 pointer-events-none z-10"
              style={{
                left: `${mapNodes.find(n => n.level === hoveredNode)?.x}%`,
                top: `${(mapNodes.find(n => n.level === hoveredNode)?.y || 0) - 15}%`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <p className="text-white font-bold">Niveau {hoveredNode}</p>
              {mapNodes.find(n => n.level === hoveredNode)?.reward && (
                <p className="text-amber-400 text-sm">
                  Récompense: {mapNodes.find(n => n.level === hoveredNode)?.reward}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Légende */}
      <div className="flex flex-wrap gap-4 mt-4 text-xs text-white/60">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span>Complété</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-purple-500 border border-white" />
          <span>Position actuelle</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-slate-700 border border-slate-500" />
          <span>À débloquer</span>
        </div>
      </div>
    </div>
  );
}
