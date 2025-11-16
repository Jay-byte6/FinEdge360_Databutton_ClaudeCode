/**
 * Improved Financial Journey Map
 * Curved road, motivational backgrounds, EXCITING final milestone!
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MilestoneData, UserJourneyState } from './types';
import { MILESTONES } from './milestoneData';
import {
  MapPin, Sparkles, Clock, CheckCircle, Lock, Flag, Navigation, Zap, PartyPopper,
  Home, Car, Plane, GraduationCap, TrendingUp, Trophy, Rocket, Star, Heart
} from 'lucide-react';

interface JourneyMapImprovedProps {
  journeyState: UserJourneyState;
  onMilestoneClick?: (milestone: MilestoneData) => void;
}

export const JourneyMapImproved: React.FC<JourneyMapImprovedProps> = ({ journeyState, onMilestoneClick }) => {
  const [hoveredMilestone, setHoveredMilestone] = useState<number | null>(null);
  const [viewScale, setViewScale] = useState(1);

  // Curved road positions - smooth S-curve
  const roadPositions = [
    { x: 400, y: 850 },   // 1. Bottom center
    { x: 320, y: 760 },   // 2. Curve left
    { x: 280, y: 660 },   // 3. More left
    { x: 320, y: 560 },   // 4. Back toward center
    { x: 400, y: 480 },   // 5. Center
    { x: 480, y: 400 },   // 6. Curve right
    { x: 520, y: 310 },   // 7. More right
    { x: 480, y: 220 },   // 8. Back toward center
    { x: 400, y: 140 },   // 9. Almost there
    { x: 400, y: 50 },    // 10. TOP - FINANCIAL FREEDOM!!!
  ];

  // Background achievements positioned around curves
  const achievements = [
    { icon: Home, label: 'Dream Home', x: 150, y: 480, milestone: 5, color: '#3b82f6' },
    { icon: Car, label: 'Dream Car', x: 650, y: 560, milestone: 4, color: '#ef4444' },
    { icon: Plane, label: 'Dream Vacation', x: 100, y: 280, milestone: 6, color: '#8b5cf6' },
    { icon: GraduationCap, label: 'Education Fund', x: 680, y: 320, milestone: 7, color: '#10b981' },
    { icon: TrendingUp, label: 'Wealth Growth', x: 140, y: 140, milestone: 8, color: '#f59e0b' },
  ];

  const getMilestoneStatus = (id: number) => {
    if (journeyState.completedMilestones.includes(id)) return 'completed';
    if (id === journeyState.currentMilestone) return 'current';
    return 'locked';
  };

  // Create smooth curved path using quadratic bezier
  const createCurvedPath = () => {
    if (roadPositions.length < 2) return '';

    let path = `M ${roadPositions[0].x} ${roadPositions[0].y}`;

    for (let i = 1; i < roadPositions.length; i++) {
      const curr = roadPositions[i];
      const prev = roadPositions[i - 1];

      // Control point for smooth curve
      const cpX = (prev.x + curr.x) / 2;
      const cpY = (prev.y + curr.y) / 2;

      path += ` Q ${cpX} ${cpY} ${curr.x} ${curr.y}`;
    }

    return path;
  };

  const roadPath = createCurvedPath();

  useEffect(() => {
    setViewScale(1.2);
  }, [journeyState.currentMilestone]);

  return (
    <div className="w-full min-h-screen relative overflow-hidden">
      {/* Motivational Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-purple-800 to-pink-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/20 via-transparent to-transparent" />

      {/* Stars background */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Motivational gradient overlays */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-blue-600/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-emerald-600/40 to-transparent" />

      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white drop-shadow-lg">
                🚀 Your Journey to Financial Freedom
              </h1>
              <p className="text-white/90 font-medium">
                Milestone {journeyState.currentMilestone}/{MILESTONES.length} •
                <span className="text-yellow-300 font-bold ml-2">{journeyState.financialFreedomProgress}% Complete</span>
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewScale(1.3)}
              className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-xl font-black shadow-2xl hover:bg-yellow-300 flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Focus Current
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="relative w-full" style={{ height: '950px', marginTop: '100px' }}>
        <motion.div
          animate={{ scale: viewScale }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="relative mx-auto"
          style={{
            width: '800px',
            height: '950px',
            transformOrigin: 'center center',
          }}
        >
          {/* Animated clouds */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ x: ['-15%', '115%'] }}
              transition={{ duration: 25 + i * 8, repeat: Infinity, ease: 'linear' }}
              className="absolute w-40 h-20 bg-white/20 rounded-full blur-xl"
              style={{ top: `${8 + i * 15}%` }}
            />
          ))}

          {/* SVG Curved Road */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 800 950"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="roadGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#1f2937" />
                <stop offset="50%" stopColor="#374151" />
                <stop offset="100%" stopColor="#4b5563" />
              </linearGradient>
              <linearGradient id="completedGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              <filter id="shadow">
                <feDropShadow dx="2" dy="5" stdDeviation="4" floodOpacity="0.5" />
              </filter>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Main road path */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.5, ease: 'easeOut' }}
              d={roadPath}
              stroke="url(#roadGrad)"
              strokeWidth="45"
              fill="none"
              strokeLinecap="round"
              filter="url(#shadow)"
            />

            {/* Completed progress overlay */}
            {journeyState.financialFreedomProgress > 0 && (
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: journeyState.financialFreedomProgress / 100 }}
                transition={{ duration: 2, delay: 0.5 }}
                d={roadPath}
                stroke="url(#completedGrad)"
                strokeWidth="45"
                fill="none"
                strokeLinecap="round"
                filter="url(#glow)"
              />
            )}

            {/* Center white dashed line */}
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.8 }}
              transition={{ duration: 2.5, delay: 0.3 }}
              d={roadPath}
              stroke="white"
              strokeWidth="3"
              fill="none"
              strokeDasharray="18 12"
            />

            {/* Yellow edge lines */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.5, delay: 0.4 }}
              d={roadPath}
              stroke="#fbbf24"
              strokeWidth="4"
              fill="none"
              transform="translate(-20, 0)"
              opacity="0.9"
            />
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.5, delay: 0.4 }}
              d={roadPath}
              stroke="#fbbf24"
              strokeWidth="4"
              fill="none"
              transform="translate(20, 0)"
              opacity="0.9"
            />
          </svg>

          {/* Background Achievements */}
          {achievements.map((achievement, index) => {
            const isUnlocked = journeyState.completedMilestones.includes(achievement.milestone);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: isUnlocked ? 1 : 0.4, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.15 }}
                className="absolute"
                style={{ left: achievement.x, top: achievement.y }}
              >
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: index * 0.6 }}
                  className={isUnlocked ? '' : 'grayscale opacity-50'}
                >
                  <div
                    className="w-20 h-20 rounded-2xl shadow-2xl flex items-center justify-center backdrop-blur-sm"
                    style={{
                      background: isUnlocked
                        ? `linear-gradient(135deg, ${achievement.color}, ${achievement.color}dd)`
                        : 'linear-gradient(135deg, #6b7280, #4b5563)',
                      boxShadow: isUnlocked ? `0 0 30px ${achievement.color}80` : 'none',
                    }}
                  >
                    <achievement.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/95 px-3 py-1.5 rounded-lg shadow-xl text-xs font-bold">
                    {achievement.label}
                  </div>
                  {isUnlocked && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl"
                    >
                      <CheckCircle className="w-5 h-5 text-white" />
                    </motion.div>
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
                transition={{ delay: 0.7 + index * 0.12, type: 'spring', stiffness: 150 }}
                className="absolute"
                style={{ left: pos.x - 35, top: pos.y - 35 }}
                onMouseEnter={() => setHoveredMilestone(milestone.id)}
                onMouseLeave={() => setHoveredMilestone(null)}
                onClick={() => onMilestoneClick?.(milestone)}
              >
                <div className="relative cursor-pointer">
                  {/* Pulsing rings for current */}
                  {isCurrent && (
                    <>
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 2.5, 1], opacity: [0.8, 0, 0.8] }}
                          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.8 }}
                          className="absolute inset-0 w-24 h-24 -left-6 -top-6 rounded-full"
                          style={{
                            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.7) 0%, transparent 70%)',
                          }}
                        />
                      ))}
                    </>
                  )}

                  {/* FINAL MILESTONE - SUPER EXCITING! */}
                  {isFinal ? (
                    <motion.div
                      animate={{
                        y: isCurrent ? [-8, 8, -8] : 0,
                        scale: isCurrent ? [1, 1.1, 1] : 1,
                      }}
                      transition={{
                        y: { duration: 2, repeat: Infinity },
                        scale: { duration: 1.5, repeat: Infinity },
                      }}
                      className="relative"
                    >
                      {/* Massive celebration effects */}
                      <div className="absolute inset-0 -inset-20">
                        {[...Array(12)].map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{
                              scale: [0, 2, 0],
                              rotate: [0, 360],
                              x: [0, Math.cos((i * 30 * Math.PI) / 180) * 60, 0],
                              y: [0, Math.sin((i * 30 * Math.PI) / 180) * 60, 0],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: i * 0.15,
                            }}
                            className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
                            style={{
                              background: ['#fbbf24', '#f59e0b', '#ef4444', '#ec4899'][i % 4],
                            }}
                          />
                        ))}
                      </div>

                      {/* Giant glowing trophy */}
                      <motion.div
                        animate={{
                          boxShadow: [
                            '0 0 40px rgba(251, 191, 36, 0.8)',
                            '0 0 80px rgba(251, 191, 36, 1)',
                            '0 0 40px rgba(251, 191, 36, 0.8)',
                          ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-32 h-32 rounded-full flex items-center justify-center relative"
                        style={{
                          background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #ef4444)',
                        }}
                      >
                        <Trophy className="w-16 h-16 text-white" />

                        {/* Rotating stars around */}
                        {[...Array(8)].map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{
                              rotate: [0, 360],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                            className="absolute"
                            style={{
                              top: '50%',
                              left: '50%',
                              transform: `rotate(${i * 45}deg) translate(60px) rotate(-${i * 45}deg)`,
                            }}
                          >
                            <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                          </motion.div>
                        ))}
                      </motion.div>

                      {/* Huge FREEDOM banner */}
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          y: [-5, 5, -5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                        className="absolute -top-24 left-1/2 -translate-x-1/2 whitespace-nowrap z-50"
                      >
                        <div className="relative">
                          <motion.div
                            animate={{
                              boxShadow: [
                                '0 0 20px rgba(251, 191, 36, 0.8)',
                                '0 0 40px rgba(251, 191, 36, 1)',
                                '0 0 20px rgba(251, 191, 36, 0.8)',
                              ],
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white font-black px-8 py-3 rounded-2xl shadow-2xl text-2xl border-4 border-yellow-300"
                          >
                            🎉 FINANCIAL FREEDOM! 🎉
                          </motion.div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-yellow-400" />
                        </div>
                      </motion.div>

                      {/* Excited jumping person */}
                      <motion.div
                        animate={{
                          y: [-20, 0, -20],
                          rotate: [-10, 10, -10],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                        }}
                        className="absolute -bottom-32 left-1/2 -translate-x-1/2"
                      >
                        <div className="text-8xl">🎊</div>
                      </motion.div>

                      {/* Confetti */}
                      {[...Array(20)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            y: [-100, 100],
                            x: [
                              Math.random() * 40 - 20,
                              Math.random() * 40 - 20,
                            ],
                            rotate: [0, 360],
                            opacity: [1, 0],
                          }}
                          transition={{
                            duration: 2 + Math.random(),
                            repeat: Infinity,
                            delay: Math.random() * 2,
                          }}
                          className="absolute top-0 left-1/2 w-2 h-4 rounded-full"
                          style={{
                            background: ['#fbbf24', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'][i % 5],
                          }}
                        />
                      ))}
                    </motion.div>
                  ) : (
                    /* Regular Pin */
                    <motion.div
                      animate={{
                        y: isCurrent ? [-5, 5, -5] : 0,
                        scale: hoveredMilestone === milestone.id ? 1.2 : 1,
                      }}
                      transition={{
                        y: { duration: 1.5, repeat: Infinity },
                        scale: { duration: 0.2 },
                      }}
                    >
                      <div
                        className="w-16 h-16 rounded-full shadow-2xl flex items-center justify-center relative backdrop-blur-sm"
                        style={{
                          background: isCompleted
                            ? 'linear-gradient(135deg, #10b981, #059669)'
                            : isCurrent
                            ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                            : 'linear-gradient(135deg, #6b7280, #4b5563)',
                          boxShadow: isCompleted
                            ? '0 0 30px rgba(16, 185, 129, 0.7)'
                            : isCurrent
                            ? '0 0 40px rgba(251, 191, 36, 0.8)'
                            : '0 10px 25px rgba(0, 0, 0, 0.4)',
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

                  {/* "YOU ARE HERE" for current milestone */}
                  {isCurrent && !isFinal && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, y: [-3, 3, -3] }}
                      transition={{ y: { duration: 1.5, repeat: Infinity } }}
                      className="absolute -top-18 left-1/2 -translate-x-1/2 whitespace-nowrap z-50"
                    >
                      <div className="bg-yellow-400 text-black font-black px-5 py-2 rounded-xl shadow-2xl text-sm border-2 border-yellow-600">
                        ⭐ YOU ARE HERE ⭐
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-yellow-400" />
                    </motion.div>
                  )}

                  {/* Milestone Label */}
                  {!isFinal && (
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 ${
                        index % 2 === 0 ? 'right-full mr-8' : 'left-full ml-8'
                      } whitespace-nowrap`}
                    >
                      <motion.div
                        initial={{ opacity: 0, x: index % 2 === 0 ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.12 }}
                        className={`bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-3 border-2 ${
                          isCompleted
                            ? 'border-emerald-400'
                            : isCurrent
                            ? 'border-yellow-400'
                            : 'border-gray-400'
                        }`}
                      >
                        <div className="font-bold text-gray-900 text-sm leading-tight">
                          {milestone.title}
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5">{milestone.subtitle}</div>
                      </motion.div>
                    </div>
                  )}

                  {/* Hover Tooltip */}
                  <AnimatePresence>
                    {hoveredMilestone === milestone.id && !isFinal && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute bottom-full mb-8 left-1/2 -translate-x-1/2 pointer-events-none"
                        style={{ width: '320px', zIndex: 10000 }}
                      >
                        <div className="bg-white rounded-2xl shadow-2xl p-5 border-2 border-purple-400">
                          <div className="flex items-start gap-4 mb-3">
                            <div className="text-5xl">{milestone.icon}</div>
                            <div>
                              <h3 className="font-black text-gray-900 text-lg">
                                {milestone.title}
                              </h3>
                              <p className="text-xs text-gray-600">{milestone.subtitle}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-4">{milestone.description}</p>
                          <div className="flex items-center justify-between pt-3 border-t-2 border-gray-200">
                            <div className="flex items-center gap-2 text-purple-600">
                              <Sparkles className="w-5 h-5" />
                              <span className="text-sm font-bold">+{milestone.xpReward} XP</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span className="text-xs">{milestone.estimatedTime}</span>
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-purple-400 rotate-45 -mt-2" />
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
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-5 border-2 border-gray-300">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 shadow-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-800">Completed</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-xl flex items-center justify-center animate-pulse">
                <MapPin className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-sm font-bold text-gray-800">Current</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 shadow-xl flex items-center justify-center">
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
