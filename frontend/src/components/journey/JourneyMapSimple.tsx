/**
 * Simple, Clean Financial Journey Map
 * Fixed road, visible milestones, proper Google Maps-style zoom
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MilestoneData, UserJourneyState } from './types';
import { MILESTONES } from './milestoneData';
import {
  MapPin, Sparkles, Clock, CheckCircle, Lock, Flag, Navigation, Zap,
  Home, Car, Plane, GraduationCap, TrendingUp, Trophy, ArrowRight, LayoutDashboard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface JourneyMapSimpleProps {
  journeyState: UserJourneyState;
  onMilestoneClick?: (milestone: MilestoneData) => void;
}

export const JourneyMapSimple: React.FC<JourneyMapSimpleProps> = ({ journeyState, onMilestoneClick }) => {
  const navigate = useNavigate();
  const [hoveredMilestone, setHoveredMilestone] = useState<number | null>(null);
  const [clickedMilestone, setClickedMilestone] = useState<number | null>(null); // For mobile tap
  const [viewScale, setViewScale] = useState(1);

  // Curved road - start bottom-left, end top-right (NOT straight line!)
  const roadPositions = [
    { x: 300, y: 800 },   // 1. Bottom LEFT
    { x: 350, y: 720 },   // 2. Curve right
    { x: 280, y: 640 },   // 3. Back left
    { x: 350, y: 560 },   // 4. Toward center
    { x: 400, y: 480 },   // 5. Center
    { x: 480, y: 400 },   // 6. Curve right
    { x: 420, y: 320 },   // 7. Back slightly
    { x: 500, y: 240 },   // 8. Right
    { x: 480, y: 160 },   // 9. Still right
    { x: 550, y: 80 },    // 10. Top RIGHT - FREEDOM!
  ];

  // Background achievements - repositioned scattered near the road, away from milestone labels
  const achievements = [
    { icon: Home, label: 'Dream Home', x: 150, y: 500, milestone: 5, color: '#3b82f6' },
    { icon: Car, label: 'Dream Car', x: 650, y: 600, milestone: 4, color: '#ef4444' },
    { icon: Plane, label: 'Vacation', x: 120, y: 360, milestone: 6, color: '#8b5cf6' },
    { icon: GraduationCap, label: 'Education', x: 680, y: 280, milestone: 7, color: '#10b981' },
    { icon: TrendingUp, label: 'Investments', x: 160, y: 200, milestone: 8, color: '#f59e0b' },
    { icon: Trophy, label: 'Freedom!', x: 660, y: 120, milestone: 10, color: '#eab308' },
  ];

  const getMilestoneStatus = (id: number) => {
    if (journeyState.completedMilestones.includes(id)) return 'completed';
    if (id === journeyState.currentMilestone) return 'current';
    return 'locked';
  };

  const navigateToCurrentMilestone = () => {
    const currentMilestone = MILESTONES[journeyState.currentMilestone - 1];
    if (currentMilestone?.actions?.[0]?.link) {
      navigate(currentMilestone.actions[0].link);
    }
  };

  // Handle milestone click - toggle tooltip for mobile
  const handleMilestoneClick = (milestone: MilestoneData, e: React.MouseEvent) => {
    e.stopPropagation();

    // If already clicked, close tooltip
    if (clickedMilestone === milestone.id) {
      setClickedMilestone(null);
      setHoveredMilestone(null);
    } else {
      // Open this milestone's tooltip
      setClickedMilestone(milestone.id);
      setHoveredMilestone(milestone.id);
      // Also call parent callback if provided
      onMilestoneClick?.(milestone);
    }
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (clickedMilestone !== null) {
        setClickedMilestone(null);
        setHoveredMilestone(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [clickedMilestone]);

  // Auto zoom to current milestone
  useEffect(() => {
    const currentPos = roadPositions[journeyState.currentMilestone - 1];
    if (currentPos) {
      setViewScale(1.3);
    }
  }, [journeyState.currentMilestone]);

  return (
    <div className="w-full bg-gradient-to-b from-blue-50 via-white to-emerald-50 overflow-y-auto" style={{ minHeight: '1200px' }}>
      {/* Clean professional background - subtle gradient only */}

      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Financial Freedom Journey
              </h1>
              <p className="text-gray-700">
                Milestone {journeyState.currentMilestone}/{MILESTONES.length} •
                <span className="text-blue-600 font-bold ml-2">{journeyState.financialFreedomProgress}% Complete</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 bg-gray-600 text-white rounded-xl font-bold shadow-lg flex items-center gap-2"
              >
                <LayoutDashboard className="w-5 h-5" />
                Go to Dashboard
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={navigateToCurrentMilestone}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg flex items-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Focus Current
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="relative w-full" style={{ height: '1000px', marginTop: '100px', paddingTop: '50px' }}>
        <motion.div
          animate={{ scale: viewScale }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className="relative mx-auto"
          style={{
            width: '800px',
            height: '900px',
            transformOrigin: 'center center',
          }}
        >
          {/* Subtle background elements - transparent */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ x: ['-10%', '110%'] }}
              transition={{ duration: 40 + i * 15, repeat: Infinity, ease: 'linear' }}
              className="absolute w-24 h-12 bg-blue-100/5 rounded-full blur-xl"
              style={{ top: `${15 + i * 25}%` }}
            />
          ))}

          {/* Road - SVG Path */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 800 900"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="roadGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#1f2937" />
                <stop offset="100%" stopColor="#4b5563" />
              </linearGradient>
              <linearGradient id="completedGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
              <filter id="shadow">
                <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Road segments with smooth curves */}
            {roadPositions.map((pos, index) => {
              if (index === roadPositions.length - 1) return null;
              const next = roadPositions[index + 1];
              const isCompleted = journeyState.completedMilestones.includes(index + 1);

              // Create smooth curve using quadratic bezier
              const cpX = (pos.x + next.x) / 2;
              const cpY = (pos.y + next.y) / 2;
              const curvePath = `M ${pos.x} ${pos.y} Q ${cpX} ${cpY} ${next.x} ${next.y}`;

              return (
                <g key={index}>
                  {/* Road segment - smooth curve */}
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    d={curvePath}
                    stroke={isCompleted ? 'url(#completedGradient)' : 'url(#roadGradient)'}
                    strokeWidth="40"
                    fill="none"
                    strokeLinecap="round"
                    filter="url(#shadow)"
                  />
                  {/* Center line */}
                  <path
                    d={curvePath}
                    stroke="white"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="15 10"
                    opacity="0.7"
                  />
                  {/* Yellow edge lines */}
                  <path
                    d={`M ${pos.x - 18} ${pos.y} Q ${cpX - 18} ${cpY} ${next.x - 18} ${next.y}`}
                    stroke="#fbbf24"
                    strokeWidth="4"
                    fill="none"
                    opacity="0.8"
                  />
                  <path
                    d={`M ${pos.x + 18} ${pos.y} Q ${cpX + 18} ${cpY} ${next.x + 18} ${next.y}`}
                    stroke="#fbbf24"
                    strokeWidth="4"
                    fill="none"
                    opacity="0.8"
                  />
                </g>
              );
            })}
          </svg>

          {/* Background Achievements - Slightly Visible */}
          {achievements.map((achievement, index) => {
            const isUnlocked = journeyState.completedMilestones.includes(achievement.milestone);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: isUnlocked ? 0.5 : 0.25, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="absolute z-0"
                style={{ left: achievement.x, top: achievement.y }}
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                  className={isUnlocked ? '' : 'grayscale'}
                >
                  <div
                    className="w-14 h-14 rounded-xl shadow-md flex items-center justify-center"
                    style={{
                      background: isUnlocked
                        ? `linear-gradient(135deg, ${achievement.color}66, ${achievement.color}44)`
                        : 'linear-gradient(135deg, #9ca3af44, #6b728033)',
                    }}
                  >
                    <achievement.icon className="w-7 h-7 text-white opacity-70" />
                  </div>
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/60 px-1.5 py-0.5 rounded-md shadow-md text-xs font-semibold opacity-70">
                    {achievement.label}
                  </div>
                  {isUnlocked && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500/70 rounded-full flex items-center justify-center shadow-md">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </motion.div>
              </motion.div>
            );
          })}

          {/* Milestone Pins */}
          {MILESTONES.map((milestone, index) => {
            const pos = roadPositions[index];
            const status = getMilestoneStatus(milestone.id);
            const isCompleted = status === 'completed';
            const isCurrent = status === 'current';
            const isLocked = status === 'locked';
            const isFinal = index === MILESTONES.length - 1;

            return (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1, type: 'spring' }}
                className="absolute"
                style={{ left: pos.x - 30, top: pos.y - 30 }}
                onMouseEnter={() => setHoveredMilestone(milestone.id)}
                onMouseLeave={() => !clickedMilestone && setHoveredMilestone(null)}
                onClick={(e) => handleMilestoneClick(milestone, e)}
              >
                <div className="relative cursor-pointer">
                  {/* Pulsing for current */}
                  {isCurrent && (
                    <motion.div
                      animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 w-20 h-20 -left-4 -top-4 rounded-full bg-yellow-400/50"
                    />
                  )}

                  {/* Final Flag */}
                  {isFinal ? (
                    <motion.div
                      animate={{ y: isCurrent ? [-5, 5, -5] : 0 }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="relative w-16 h-24">
                        <div className="absolute left-1/2 -translate-x-1/2 w-3 h-full bg-gradient-to-b from-yellow-500 to-yellow-700 rounded-full shadow-xl" />
                        <motion.div
                          animate={{ scaleX: [1, 0.9, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="absolute top-2 left-1/2 w-14 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-r-lg shadow-2xl flex items-center justify-center"
                        >
                          <Flag className="w-6 h-6 text-white" />
                        </motion.div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-4 bg-yellow-800 rounded shadow-lg" />
                      </div>
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black px-4 py-1.5 rounded-full shadow-xl text-sm">
                        🎉 FREEDOM
                      </div>
                    </motion.div>
                  ) : (
                    /* Regular Pin */
                    <motion.div
                      animate={{
                        y: isCurrent ? [-4, 4, -4] : 0,
                        scale: hoveredMilestone === milestone.id ? 1.15 : 1,
                      }}
                      transition={{
                        y: { duration: 1.5, repeat: Infinity },
                        scale: { duration: 0.2 },
                      }}
                    >
                      <div
                        className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center relative"
                        style={{
                          background: isCompleted
                            ? 'linear-gradient(135deg, #10b981, #059669)'
                            : isCurrent
                            ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                            : 'linear-gradient(135deg, #9ca3af, #6b7280)',
                          boxShadow: isCompleted
                            ? '0 10px 25px rgba(16, 185, 129, 0.6)'
                            : isCurrent
                            ? '0 10px 25px rgba(251, 191, 36, 0.7), 0 0 40px rgba(251, 191, 36, 0.4)'
                            : '0 10px 25px rgba(156, 163, 175, 0.4)',
                        }}
                      >
                        <div className="text-2xl">{milestone.icon}</div>

                        {/* Status badge */}
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white shadow-lg flex items-center justify-center">
                          {isCompleted && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                          {isCurrent && <MapPin className="w-4 h-4 text-yellow-600 fill-yellow-600" />}
                          {isLocked && <Lock className="w-3 h-3 text-gray-500" />}
                        </div>

                        {/* Number */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-black shadow-lg">
                          {milestone.id}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* "YOU ARE HERE" with 3D Map Pin */}
                  {isCurrent && !isFinal && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, y: [-2, 2, -2] }}
                      transition={{ y: { duration: 1.5, repeat: Infinity } }}
                      className="absolute -top-20 left-1/2 -translate-x-1/2 whitespace-nowrap z-50 flex flex-col items-center"
                    >
                      {/* 3D Map Pin Icon */}
                      <motion.div
                        animate={{
                          rotateY: [0, 360],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{
                          rotateY: { duration: 3, repeat: Infinity, ease: "linear" },
                          scale: { duration: 1.5, repeat: Infinity }
                        }}
                        className="mb-1"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <div className="relative">
                          {/* Pin shadow for 3D effect */}
                          <div className="absolute inset-0 blur-sm opacity-50">
                            <MapPin className="w-8 h-8 text-yellow-600 fill-yellow-600" />
                          </div>
                          {/* Main pin */}
                          <MapPin
                            className="w-8 h-8 text-yellow-400 fill-yellow-400 relative"
                            style={{
                              filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
                            }}
                          />
                        </div>
                      </motion.div>
                      <div className="bg-yellow-400 text-black font-black px-4 py-1.5 rounded-lg shadow-2xl text-xs">
                        YOU ARE HERE
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-yellow-400" />
                    </motion.div>
                  )}

                  {/* Milestone Label */}
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 ${
                      index % 2 === 0 ? 'right-full mr-6' : 'left-full ml-6'
                    } whitespace-nowrap z-10`}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: index % 2 === 0 ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className={`bg-white/95 rounded-lg shadow-xl p-2.5 border-2 ${
                        isCompleted ? 'border-emerald-400' : isCurrent ? 'border-yellow-400' : 'border-gray-300'
                      }`}
                    >
                      <div className="font-bold text-gray-900 text-sm">{milestone.title}</div>
                      <div className="text-xs text-gray-600">{milestone.subtitle}</div>
                    </motion.div>
                  </div>

                  {/* Hover Tooltip with Actions */}
                  <AnimatePresence>
                    {hoveredMilestone === milestone.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 pointer-events-auto"
                        style={{ width: '320px', zIndex: 10000 }}
                        onMouseEnter={() => setHoveredMilestone(milestone.id)}
                        onMouseLeave={() => setHoveredMilestone(null)}
                      >
                        <div className="bg-white rounded-xl shadow-2xl p-4 border-2 border-blue-400">
                          <div className="flex items-start gap-3 mb-2">
                            <div className="text-4xl">{milestone.icon}</div>
                            <div>
                              <h3 className="font-black text-gray-900">{milestone.title}</h3>
                              <p className="text-xs text-gray-600">{milestone.subtitle}</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-700 mb-3">{milestone.description}</p>

                          {/* Action Buttons */}
                          <div className="space-y-1 mb-3">
                            <p className="text-xs font-bold text-gray-800 mb-1">Actions to take:</p>
                            {milestone.actions.slice(0, 2).map((action, index) => (
                              <button
                                key={index}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (action.link) {
                                    navigate(action.link);
                                    setHoveredMilestone(null);
                                  }
                                }}
                                className="w-full text-left px-2 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-between group"
                              >
                                <span className="text-gray-700 font-medium">{action.title}</span>
                                <ArrowRight className="w-3 h-3 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            ))}
                            {milestone.actions.length > 2 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMilestoneClick?.(milestone);
                                  setHoveredMilestone(null);
                                }}
                                className="w-full text-center text-xs text-blue-600 hover:text-blue-800 font-semibold py-1"
                              >
                                View all {milestone.actions.length} actions →
                              </button>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                            <div className="flex items-center gap-1 text-purple-600">
                              <Sparkles className="w-3 h-3" />
                              <span className="text-xs font-bold">+{milestone.xpReward} XP</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock className="w-3 h-3" />
                              <span className="text-xs">{milestone.estimatedTime}</span>
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-blue-400 rotate-45 -mt-1.5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Legend */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-white/95 rounded-xl shadow-2xl p-4 border-2 border-gray-200">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-800">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="text-sm font-bold text-gray-800">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 shadow-lg flex items-center justify-center">
                <Lock className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-800">Locked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
