/**
 * 3D Google Maps-Style Financial Journey
 * True 3D perspective with camera navigation, background elements, and achievements
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MilestoneData, UserJourneyState } from './types';
import { MILESTONES } from './milestoneData';
import {
  MapPin, Sparkles, Clock, CheckCircle, Lock, Flag, Navigation,
  Home, Car, Plane, GraduationCap, TrendingUp, Trophy, Target
} from 'lucide-react';

interface Journey3DMapProps {
  journeyState: UserJourneyState;
  onMilestoneClick?: (milestone: MilestoneData) => void;
}

export const Journey3DMap: React.FC<Journey3DMapProps> = ({ journeyState, onMilestoneClick }) => {
  const [hoveredMilestone, setHoveredMilestone] = useState<number | null>(null);
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0, zoom: 1 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Milestone positions along 3D road (Z represents depth/3D effect)
  const milestonePositions = [
    { x: 50, y: 85, z: 0, rotation: 0 },      // 1. Start (close)
    { x: 48, y: 77, z: 50, rotation: -5 },    // 2. Moves left and back
    { x: 52, y: 69, z: 100, rotation: 5 },    // 3. Moves right and further
    { x: 46, y: 61, z: 150, rotation: -8 },   // 4. Left and deeper
    { x: 50, y: 53, z: 200, rotation: 0 },    // 5. Center, deep
    { x: 54, y: 45, z: 250, rotation: 8 },    // 6. Right
    { x: 48, y: 37, z: 300, rotation: -5 },   // 7. Left
    { x: 52, y: 29, z: 350, rotation: 5 },    // 8. Right
    { x: 50, y: 21, z: 400, rotation: 0 },    // 9. Center
    { x: 50, y: 12, z: 450, rotation: 0 },    // 10. FREEDOM! (furthest)
  ];

  // Background achievement elements with positions
  const backgroundElements = [
    { icon: Home, label: 'Dream Home', x: 20, y: 40, z: 150, color: '#3b82f6', milestone: 5 },
    { icon: Car, label: 'Dream Car', x: 75, y: 55, z: 100, color: '#ef4444', milestone: 4 },
    { icon: Plane, label: 'Vacation', x: 15, y: 65, z: 250, color: '#8b5cf6', milestone: 6 },
    { icon: GraduationCap, label: 'Education', x: 80, y: 35, z: 200, color: '#10b981', milestone: 7 },
    { icon: TrendingUp, label: 'Investments', x: 25, y: 25, z: 350, color: '#f59e0b', milestone: 8 },
    { icon: Trophy, label: 'Financial Freedom', x: 50, y: 8, z: 480, color: '#eab308', milestone: 10 },
  ];

  // Calculate 3D transform based on camera position
  const get3DTransform = (x: number, y: number, z: number) => {
    const scale = 1 - (z / 1000); // Objects further away are smaller
    const translateZ = -z * 0.5; // Depth effect

    return {
      transform: `translate3d(${x}%, ${y}%, ${translateZ}px) scale(${scale})`,
      zIndex: Math.floor(1000 - z), // Further objects behind
    };
  };

  // Focus camera on milestone
  const focusOnMilestone = (milestoneId: number) => {
    const index = milestoneId - 1;
    if (index >= 0 && index < milestonePositions.length) {
      const pos = milestonePositions[index];
      setCameraPosition({
        x: (50 - pos.x) * 2,
        y: (50 - pos.y) * 1.5,
        zoom: 1.5 + (pos.z / 500), // Zoom in more for further milestones
      });
    }
  };

  // Auto-focus on current milestone
  useEffect(() => {
    focusOnMilestone(journeyState.currentMilestone);
  }, [journeyState.currentMilestone]);

  // Create smooth 3D road path
  const createRoadPath = () => {
    if (milestonePositions.length === 0) return '';

    let path = `M ${milestonePositions[0].x} ${milestonePositions[0].y}`;

    for (let i = 1; i < milestonePositions.length; i++) {
      const curr = milestonePositions[i];
      const prev = milestonePositions[i - 1];

      // Smooth bezier curve
      const cp1x = prev.x + (curr.x - prev.x) * 0.3;
      const cp1y = prev.y + (curr.y - prev.y) * 0.3;
      const cp2x = prev.x + (curr.x - prev.x) * 0.7;
      const cp2y = prev.y + (curr.y - prev.y) * 0.7;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }

    return path;
  };

  const roadPath = createRoadPath();

  const getMilestoneStatus = (id: number) => {
    if (journeyState.completedMilestones.includes(id)) return 'completed';
    if (id === journeyState.currentMilestone) return 'current';
    return 'locked';
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-100 overflow-hidden">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b-2 border-blue-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                3D Financial Journey Map
              </h1>
              <p className="text-gray-700 mt-1">
                Milestone {journeyState.currentMilestone} of {MILESTONES.length} •
                <span className="text-blue-600 font-bold ml-2">{journeyState.financialFreedomProgress}% Complete</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => focusOnMilestone(journeyState.currentMilestone)}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Navigation className="w-5 h-5" />
                Navigate to Current
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Scene Container */}
      <div
        ref={containerRef}
        className="relative w-full h-screen mt-20"
        style={{
          perspective: '1200px',
          perspectiveOrigin: '50% 50%',
        }}
      >
        <motion.div
          animate={{
            rotateX: 55,
            rotateZ: 0,
            scale: cameraPosition.zoom,
            x: cameraPosition.x * 10,
            y: cameraPosition.y * 10,
          }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="relative w-full h-full"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'rotateX(55deg)',
          }}
        >
          {/* Ground plane with gradient */}
          <div
            className="absolute inset-0"
            style={{
              transform: 'translateZ(-500px)',
              background: 'linear-gradient(to bottom, #d1fae5 0%, #6ee7b7 100%)',
              opacity: 0.3,
            }}
          />

          {/* Animated clouds */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: `${-20 + i * 15}%` }}
              animate={{ x: '120%' }}
              transition={{ duration: 40 + i * 10, repeat: Infinity, ease: 'linear' }}
              className="absolute w-40 h-20 bg-white/60 rounded-full blur-xl"
              style={{
                top: `${5 + i * 8}%`,
                transform: `translateZ(${-200 - i * 50}px)`,
              }}
            />
          ))}

          {/* SVG Road Layer */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full"
            style={{
              transform: 'translateZ(0px)',
              overflow: 'visible',
            }}
          >
            <defs>
              {/* Road gradient - darker at bottom, lighter at top */}
              <linearGradient id="road3D" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#1f2937" stopOpacity="1" />
                <stop offset="50%" stopColor="#374151" stopOpacity="1" />
                <stop offset="100%" stopColor="#4b5563" stopOpacity="0.9" />
              </linearGradient>

              {/* Completed road gradient */}
              <linearGradient id="completed3D" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#059669" stopOpacity="1" />
                <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0.9" />
              </linearGradient>

              {/* Road shadow */}
              <filter id="roadShadow3D" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="1" dy="3" stdDeviation="2" floodOpacity="0.4" />
              </filter>

              {/* Glow effect */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Road base */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.5, ease: 'easeOut' }}
              d={roadPath}
              stroke="url(#road3D)"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              filter="url(#roadShadow3D)"
            />

            {/* Completed overlay */}
            {journeyState.financialFreedomProgress > 0 && (
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: journeyState.financialFreedomProgress / 100 }}
                transition={{ duration: 2, delay: 0.5 }}
                d={roadPath}
                stroke="url(#completed3D)"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
              />
            )}

            {/* Center line */}
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.8 }}
              transition={{ duration: 2.5, delay: 0.3 }}
              d={roadPath}
              stroke="white"
              strokeWidth="0.4"
              fill="none"
              strokeDasharray="2 1.5"
            />

            {/* Yellow edge lines */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.5, delay: 0.4 }}
              d={roadPath}
              stroke="#fbbf24"
              strokeWidth="0.5"
              fill="none"
              style={{ transform: 'translateX(-2.3px)' }}
              opacity="0.9"
            />
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.5, delay: 0.4 }}
              d={roadPath}
              stroke="#fbbf24"
              strokeWidth="0.5"
              fill="none"
              style={{ transform: 'translateX(2.3px)' }}
              opacity="0.9"
            />
          </svg>

          {/* Background Achievement Elements */}
          {backgroundElements.map((element, index) => {
            const isUnlocked = journeyState.completedMilestones.includes(element.milestone);
            const transform3D = get3DTransform(element.x, element.y, element.z);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: isUnlocked ? 1 : 0.3, scale: 1 }}
                transition={{ delay: 1 + index * 0.2 }}
                className="absolute"
                style={{
                  left: 0,
                  top: 0,
                  ...transform3D,
                }}
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                  className={`relative ${isUnlocked ? '' : 'grayscale'}`}
                >
                  <div
                    className="w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center"
                    style={{
                      background: isUnlocked
                        ? `linear-gradient(135deg, ${element.color}, ${element.color}dd)`
                        : 'linear-gradient(135deg, #9ca3af, #6b7280)',
                    }}
                  >
                    <element.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-lg text-xs font-bold text-gray-800">
                      {element.label}
                    </div>
                  </div>
                  {isUnlocked && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            );
          })}

          {/* Milestone Pins */}
          {MILESTONES.map((milestone, index) => {
            const pos = milestonePositions[index];
            const status = getMilestoneStatus(milestone.id);
            const isCompleted = status === 'completed';
            const isCurrent = status === 'current';
            const isLocked = status === 'locked';
            const isFinal = index === MILESTONES.length - 1;
            const transform3D = get3DTransform(pos.x, pos.y, pos.z);

            return (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.15, type: 'spring', stiffness: 120 }}
                className="absolute"
                style={{
                  left: 0,
                  top: 0,
                  ...transform3D,
                }}
                onMouseEnter={() => setHoveredMilestone(milestone.id)}
                onMouseLeave={() => setHoveredMilestone(null)}
                onClick={() => {
                  focusOnMilestone(milestone.id);
                  onMilestoneClick?.(milestone);
                }}
              >
                <div className="relative cursor-pointer">
                  {/* Pulsing rings for current */}
                  {isCurrent && !isFinal && (
                    <>
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 2.5, 1], opacity: [0.8, 0, 0.8] }}
                          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.8 }}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full"
                          style={{
                            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.6) 0%, transparent 70%)',
                          }}
                        />
                      ))}
                    </>
                  )}

                  {/* Final Flag */}
                  {isFinal ? (
                    <motion.div
                      animate={{
                        y: isCurrent ? [-8, 8, -8] : 0,
                        rotateY: [0, 10, 0, -10, 0],
                      }}
                      transition={{
                        y: { duration: 2.5, repeat: Infinity },
                        rotateY: { duration: 4, repeat: Infinity },
                      }}
                      className="relative"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <div className="w-20 h-28 relative">
                        {/* Flag pole */}
                        <div className="absolute left-1/2 -translate-x-1/2 w-3 h-full bg-gradient-to-b from-yellow-500 to-yellow-700 rounded-full shadow-2xl" />

                        {/* Flag */}
                        <motion.div
                          animate={{
                            scaleX: [1, 0.95, 1, 0.95, 1],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute top-3 left-1/2 w-16 h-12 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-r-lg shadow-2xl flex items-center justify-center"
                          style={{
                            transformOrigin: 'left center',
                          }}
                        >
                          <Flag className="w-7 h-7 text-white fill-white" />
                        </motion.div>

                        {/* Trophy base */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-5 bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-lg shadow-xl" />

                        {/* Sparkles */}
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{
                              scale: [0, 1, 0],
                              rotate: [0, 180, 360],
                              x: [0, Math.cos(i * 60) * 30, 0],
                              y: [0, Math.sin(i * 60) * 30, 0],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: i * 0.3,
                            }}
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full"
                          />
                        ))}
                      </div>

                      {/* "FREEDOM!" banner */}
                      <motion.div
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white font-black px-5 py-2 rounded-full shadow-2xl border-3 border-yellow-300"
                      >
                        🎉 FREEDOM! 🎉
                      </motion.div>
                    </motion.div>
                  ) : (
                    /* Regular Pin */
                    <motion.div
                      animate={{
                        y: isCurrent ? [-5, 5, -5] : 0,
                        rotateY: hoveredMilestone === milestone.id ? [0, 360] : 0,
                        scale: hoveredMilestone === milestone.id ? 1.2 : 1,
                      }}
                      transition={{
                        y: { duration: 2, repeat: Infinity },
                        rotateY: { duration: 0.6 },
                        scale: { duration: 0.2 },
                      }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <div
                        className="w-16 h-16 rounded-full shadow-2xl flex items-center justify-center relative"
                        style={{
                          background: isCompleted
                            ? 'linear-gradient(135deg, #10b981, #059669)'
                            : isCurrent
                            ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                            : 'linear-gradient(135deg, #9ca3af, #6b7280)',
                          boxShadow: isCompleted
                            ? '0 12px 30px rgba(16, 185, 129, 0.6), 0 0 40px rgba(16, 185, 129, 0.3)'
                            : isCurrent
                            ? '0 12px 30px rgba(251, 191, 36, 0.7), 0 0 50px rgba(251, 191, 36, 0.4)'
                            : '0 12px 30px rgba(156, 163, 175, 0.5)',
                        }}
                      >
                        <div className="text-3xl">{milestone.icon}</div>

                        {/* Status badge */}
                        <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-white shadow-xl flex items-center justify-center">
                          {isCompleted && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                          {isCurrent && <MapPin className="w-5 h-5 text-yellow-600 fill-yellow-600" />}
                          {isLocked && <Lock className="w-4 h-4 text-gray-500" />}
                        </div>

                        {/* Number badge */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 bg-white rounded-full flex items-center justify-center text-sm font-black shadow-xl border-2 border-gray-200">
                          {milestone.id}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* "YOU ARE HERE" */}
                  {isCurrent && !isFinal && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: [-3, 3, -3] }}
                      transition={{ y: { duration: 2, repeat: Infinity } }}
                      className="absolute -top-20 left-1/2 -translate-x-1/2 whitespace-nowrap z-50"
                    >
                      <div className="bg-yellow-400 text-black font-black px-5 py-2 rounded-xl shadow-2xl border-2 border-yellow-600">
                        ⭐ YOU ARE HERE ⭐
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-yellow-400" />
                    </motion.div>
                  )}

                  {/* Milestone Label - Smart positioning */}
                  <motion.div
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.15 }}
                    className={`absolute top-1/2 -translate-y-1/2 ${
                      index % 2 === 0 ? 'right-full mr-8' : 'left-full ml-8'
                    } whitespace-nowrap z-10`}
                  >
                    <div
                      className={`bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-3 border-2 ${
                        isCompleted
                          ? 'border-emerald-400'
                          : isCurrent
                          ? 'border-yellow-400'
                          : 'border-gray-300'
                      }`}
                    >
                      <div className="font-bold text-gray-900 text-sm leading-tight">{milestone.title}</div>
                      <div className="text-xs text-gray-600 mt-0.5">{milestone.subtitle}</div>
                    </div>
                  </motion.div>

                  {/* Hover Tooltip - Higher z-index */}
                  <AnimatePresence>
                    {hoveredMilestone === milestone.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="absolute bottom-full mb-8 left-1/2 -translate-x-1/2 pointer-events-none"
                        style={{
                          width: '320px',
                          zIndex: 9999, // Very high z-index to appear above everything
                        }}
                      >
                        <div className="bg-white rounded-2xl shadow-2xl p-5 border-3 border-blue-400">
                          <div className="flex items-start gap-4 mb-3">
                            <div className="text-5xl">{milestone.icon}</div>
                            <div className="flex-1">
                              <h3 className="font-black text-gray-900 text-lg leading-tight">{milestone.title}</h3>
                              <p className="text-xs text-gray-600 mt-1">{milestone.subtitle}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-4 leading-relaxed">{milestone.description}</p>
                          <div className="flex items-center justify-between pt-3 border-t-2 border-gray-200">
                            <div className="flex items-center gap-2 text-purple-600">
                              <Sparkles className="w-5 h-5" />
                              <span className="text-sm font-black">+{milestone.xpReward} XP</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span className="text-xs font-medium">{milestone.estimatedTime}</span>
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-3 border-b-3 border-blue-400 rotate-45 -mt-2" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Fixed Legend */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-5 border-2 border-gray-300">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-800">Completed</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg flex items-center justify-center animate-pulse">
                <MapPin className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-sm font-bold text-gray-800">Current</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 shadow-lg flex items-center justify-center">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-800">Locked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
