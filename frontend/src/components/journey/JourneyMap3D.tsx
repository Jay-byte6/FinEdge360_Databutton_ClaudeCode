/**
 * 3D Isometric Journey Map - Game-like financial freedom roadmap
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MilestoneData, UserJourneyState } from './types';
import { MILESTONES } from './milestoneData';
import { Trophy, Sparkles, MapPin, Mountain } from 'lucide-react';

interface JourneyMap3DProps {
  journeyState: UserJourneyState;
}

export const JourneyMap3D: React.FC<JourneyMap3DProps> = ({ journeyState }) => {
  const [hoveredMilestone, setHoveredMilestone] = useState<number | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneData | null>(null);

  // Calculate milestone positions along a winding 3D path
  const getMilestonePosition = (index: number) => {
    const totalMilestones = MILESTONES.length;
    const progress = index / (totalMilestones - 1);

    // Create a winding S-curve path with elevation changes
    const x = 50 + Math.sin(progress * Math.PI * 2.5) * 35; // Horizontal wiggle
    const y = 10 + progress * 80; // Vertical progression
    const z = Math.sin(progress * Math.PI * 1.5) * 15; // Depth/elevation

    return { x, y, z };
  };

  // Get status for milestone
  const getMilestoneStatus = (id: number) => {
    if (journeyState.completedMilestones.includes(id)) return 'completed';
    if (id === journeyState.currentMilestone) return 'current';
    return 'locked';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          main: '#10b981',
          light: '#d1fae5',
          glow: 'rgba(16, 185, 129, 0.4)',
        };
      case 'current':
        return {
          main: '#3b82f6',
          light: '#dbeafe',
          glow: 'rgba(59, 130, 246, 0.6)',
        };
      default:
        return {
          main: '#9ca3af',
          light: '#f3f4f6',
          glow: 'rgba(156, 163, 175, 0.2)',
        };
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-sky-100 via-blue-50 to-purple-100 overflow-hidden">
      {/* Sky Background with Clouds */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Clouds */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: '-10%', y: i * 15 + 5 }}
            animate={{ x: '110%' }}
            transition={{
              duration: 30 + i * 10,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute w-32 h-16 bg-white/40 rounded-full blur-xl"
            style={{ top: `${i * 15}%` }}
          />
        ))}
      </div>

      {/* Header - Overall Progress */}
      <div className="relative z-10 pt-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 border-2 border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Your Financial Freedom Journey
              </h1>
              <p className="text-gray-600 mt-1">
                Milestone {journeyState.currentMilestone} of {MILESTONES.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Progress</div>
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  {journeyState.financialFreedomProgress}%
                </div>
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
              >
                <Trophy className="w-8 h-8 text-white" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 3D Isometric Map Container */}
      <div className="relative z-0 max-w-6xl mx-auto px-4 py-12">
        <div
          className="relative w-full"
          style={{
            height: '1200px',
            perspective: '2000px',
            perspectiveOrigin: '50% 30%',
          }}
        >
          {/* 3D Transformed Map Canvas */}
          <div
            className="relative w-full h-full"
            style={{
              transform: 'rotateX(60deg) rotateZ(0deg)',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* SVG Path - Winding Road */}
            <svg
              className="absolute inset-0 w-full h-full"
              style={{
                transform: 'translateZ(-50px)',
              }}
            >
              <defs>
                {/* Road Gradient */}
                <linearGradient id="roadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.9" />
                </linearGradient>

                {/* Completed Path Gradient */}
                <linearGradient id="completedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.9" />
                </linearGradient>
              </defs>

              {/* Draw Winding Path */}
              {MILESTONES.map((milestone, index) => {
                if (index === MILESTONES.length - 1) return null;

                const start = getMilestonePosition(index);
                const end = getMilestonePosition(index + 1);
                const isCompleted = journeyState.completedMilestones.includes(milestone.id);

                // Create curved path segment
                const midX = (start.x + end.x) / 2 + (Math.random() - 0.5) * 10;
                const midY = (start.y + end.y) / 2;

                return (
                  <motion.path
                    key={`path-${index}`}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    d={`M ${start.x}% ${start.y}% Q ${midX}% ${midY}% ${end.x}% ${end.y}%`}
                    stroke={isCompleted ? 'url(#completedGradient)' : 'url(#roadGradient)'}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={isCompleted ? '0' : '10 5'}
                    filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))"
                  />
                );
              })}
            </svg>

            {/* Milestones - 3D Landmarks */}
            {MILESTONES.map((milestone, index) => {
              const pos = getMilestonePosition(index);
              const status = getMilestoneStatus(milestone.id);
              const colors = getStatusColor(status);
              const isCurrent = status === 'current';
              const isCompleted = status === 'completed';

              return (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: index * 0.15,
                    type: 'spring',
                    stiffness: 200,
                  }}
                  style={{
                    position: 'absolute',
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: `translateZ(${pos.z + (isCurrent ? 40 : 0)}px) translate(-50%, -50%)`,
                    transformStyle: 'preserve-3d',
                  }}
                  onMouseEnter={() => setHoveredMilestone(milestone.id)}
                  onMouseLeave={() => setHoveredMilestone(null)}
                  onClick={() => setSelectedMilestone(milestone)}
                  className="cursor-pointer"
                >
                  {/* 3D Milestone Building/Monument */}
                  <div className="relative">
                    {/* Building Base */}
                    <motion.div
                      animate={{
                        y: isCurrent ? [-5, 5, -5] : [0],
                        rotateY: hoveredMilestone === milestone.id ? 360 : 0,
                      }}
                      transition={{
                        y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                        rotateY: { duration: 0.6 },
                      }}
                      className="relative"
                      style={{
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      {/* Main Monument */}
                      <div
                        className="relative w-24 h-32 rounded-t-lg shadow-2xl"
                        style={{
                          background: `linear-gradient(135deg, ${colors.main}, ${colors.light})`,
                          boxShadow: `0 10px 30px ${colors.glow}, 0 0 50px ${colors.glow}`,
                        }}
                      >
                        {/* Icon at top */}
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-6xl">
                          {milestone.icon}
                        </div>

                        {/* Milestone Number */}
                        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center font-black text-xl shadow-lg">
                          {milestone.id}
                        </div>

                        {/* Title */}
                        <div className="absolute bottom-4 left-0 right-0 text-center px-2">
                          <div className="text-xs font-bold text-white drop-shadow-lg">
                            {milestone.title}
                          </div>
                        </div>

                        {/* Completion Checkmark */}
                        {isCompleted && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                          >
                            <Sparkles className="w-5 h-5 text-white" />
                          </motion.div>
                        )}
                      </div>

                      {/* Shadow */}
                      <div
                        className="absolute top-full left-1/2 transform -translate-x-1/2 w-20 h-6 bg-black/20 rounded-full blur-md"
                        style={{ transform: 'translateZ(-10px) scale(1.2, 0.4)' }}
                      />
                    </motion.div>

                    {/* YOU ARE HERE Marker */}
                    {isCurrent && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-24 left-1/2 transform -translate-x-1/2"
                      >
                        <motion.div
                          animate={{
                            y: [-10, 0, -10],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          className="relative"
                        >
                          {/* Pulsing Rings */}
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              animate={{
                                scale: [1, 2, 1],
                                opacity: [0.8, 0, 0.8],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.6,
                              }}
                              className="absolute inset-0 w-16 h-16 rounded-full bg-yellow-400"
                              style={{
                                left: '50%',
                                top: '50%',
                                transform: 'translate(-50%, -50%)',
                              }}
                            />
                          ))}

                          {/* Pin */}
                          <div className="relative z-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-3 shadow-2xl">
                            <MapPin className="w-10 h-10 text-white fill-white" />
                          </div>

                          {/* Text Banner */}
                          <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                            <div className="bg-yellow-400 text-black font-black px-4 py-2 rounded-lg shadow-lg text-sm">
                              YOU ARE HERE!
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}

                    {/* Hover Tooltip */}
                    <AnimatePresence>
                      {hoveredMilestone === milestone.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.9 }}
                          className="absolute bottom-full mb-4 left-1/2 transform -translate-x-1/2 z-50"
                          style={{
                            transformStyle: 'preserve-3d',
                            transform: 'translateZ(100px) translateX(-50%)',
                          }}
                        >
                          <div className="bg-white rounded-xl shadow-2xl p-4 min-w-64 max-w-sm border-2 border-blue-200">
                            <div className="flex items-start gap-3 mb-2">
                              <div className="text-4xl">{milestone.icon}</div>
                              <div>
                                <h3 className="font-bold text-gray-900">{milestone.title}</h3>
                                <p className="text-xs text-gray-600">{milestone.subtitle}</p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 mb-3">{milestone.description}</p>
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1 text-purple-600">
                                <Sparkles className="w-3 h-3" />
                                <span className="font-bold">+{milestone.xpReward} XP</span>
                              </div>
                              <div className="text-gray-600">{milestone.estimatedTime}</div>
                            </div>
                          </div>
                          {/* Arrow */}
                          <div className="w-4 h-4 bg-white border-r-2 border-b-2 border-blue-200 transform rotate-45 absolute -bottom-2 left-1/2 -translate-x-1/2" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}

            {/* Decorative Mountains in Background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              className="absolute bottom-0 left-0 right-0 flex justify-around"
              style={{
                transform: 'translateZ(-200px)',
              }}
            >
              {[...Array(4)].map((_, i) => (
                <Mountain
                  key={i}
                  className="text-gray-400"
                  style={{
                    width: `${100 + i * 20}px`,
                    height: `${100 + i * 20}px`,
                  }}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-500 rounded-full" />
              <span className="text-gray-700">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-gray-700">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full" />
              <span className="text-gray-700">Locked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
