/**
 * Perfect 3D Winding Road Map - Financial Freedom Journey
 * Clean, professional, with visible milestone names and final flag
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MilestoneData, UserJourneyState } from './types';
import { MILESTONES } from './milestoneData';
import { MapPin, Sparkles, Clock, CheckCircle, Lock, Flag } from 'lucide-react';

interface RoadmapToFreedomProps {
  journeyState: UserJourneyState;
  onMilestoneClick?: (milestone: MilestoneData) => void;
}

export const RoadmapToFreedom: React.FC<RoadmapToFreedomProps> = ({ journeyState, onMilestoneClick }) => {
  const [hoveredMilestone, setHoveredMilestone] = useState<number | null>(null);

  // Define road path coordinates (winding S-curve)
  const roadPathPoints = [
    { x: 50, y: 92, side: 'right' },   // 1. Start (bottom center)
    { x: 55, y: 85, side: 'right' },   // 2
    { x: 52, y: 77, side: 'left' },    // 3
    { x: 45, y: 69, side: 'left' },    // 4
    { x: 48, y: 61, side: 'right' },   // 5
    { x: 55, y: 53, side: 'right' },   // 6
    { x: 52, y: 45, side: 'left' },    // 7
    { x: 47, y: 37, side: 'left' },    // 8
    { x: 50, y: 29, side: 'right' },   // 9
    { x: 55, y: 20, side: 'right' },   // 10. End (top) - FINANCIAL FREEDOM!
  ];

  // Get milestone data
  const getMilestoneData = (index: number) => {
    const milestone = MILESTONES[index];
    const point = roadPathPoints[index];
    const isCompleted = journeyState.completedMilestones.includes(milestone.id);
    const isCurrent = milestone.id === journeyState.currentMilestone;
    const isLocked = !isCompleted && !isCurrent;

    return { milestone, point, isCompleted, isCurrent, isLocked };
  };

  // Create smooth road path
  const createRoadPath = () => {
    let path = `M ${roadPathPoints[0].x} ${roadPathPoints[0].y}`;
    for (let i = 1; i < roadPathPoints.length; i++) {
      const prev = roadPathPoints[i - 1];
      const curr = roadPathPoints[i];
      const cp1x = prev.x + (curr.x - prev.x) * 0.5;
      const cp1y = prev.y + (curr.y - prev.y) * 0.5;
      path += ` Q ${cp1x} ${cp1y} ${curr.x} ${curr.y}`;
    }
    return path;
  };

  const roadPath = createRoadPath();

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-100 overflow-hidden">
      {/* Animated Clouds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: `${-10 + i * 20}%`, y: `${i * 10}%` }}
            animate={{ x: '110%' }}
            transition={{ duration: 30 + i * 10, repeat: Infinity, ease: 'linear' }}
            className="absolute w-32 h-16 bg-white/70 rounded-full blur-md"
          />
        ))}
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 pt-8 px-4"
      >
        <div className="max-w-6xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 border-2 border-blue-300">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-2">
                Roadmap to Financial Freedom
              </h1>
              <p className="text-gray-700 text-lg">
                Progress: <span className="font-bold text-blue-600">Milestone {journeyState.currentMilestone} of {MILESTONES.length}</span>
                <span className="ml-6 font-bold text-purple-600">{journeyState.financialFreedomProgress}% Complete</span>
              </p>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* 3D Road Map */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        <div
          style={{
            height: '1200px',
            perspective: '1200px',
            perspectiveOrigin: '50% 40%',
          }}
        >
          <div
            style={{
              transform: 'rotateX(60deg) scale(1.2)',
              transformStyle: 'preserve-3d',
              width: '100%',
              height: '100%',
              position: 'relative',
            }}
          >
            {/* SVG Road */}
            <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0">
              <defs>
                <linearGradient id="roadGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#1f2937" />
                  <stop offset="100%" stopColor="#4b5563" />
                </linearGradient>
                <linearGradient id="completedGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
                <filter id="roadShadow">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="0.4" />
                  <feOffset dx="0.3" dy="0.6" />
                  <feComponentTransfer><feFuncA type="linear" slope="0.5" /></feComponentTransfer>
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Road Base */}
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: 'easeOut' }}
                d={roadPath}
                stroke="url(#roadGrad)"
                strokeWidth="14"
                fill="none"
                strokeLinecap="round"
                filter="url(#roadShadow)"
              />

              {/* Completed Progress */}
              {journeyState.financialFreedomProgress > 0 && (
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: journeyState.financialFreedomProgress / 100 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  d={roadPath}
                  stroke="url(#completedGrad)"
                  strokeWidth="14"
                  fill="none"
                  strokeLinecap="round"
                />
              )}

              {/* Center Line */}
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, delay: 0.3 }}
                d={roadPath}
                stroke="white"
                strokeWidth="0.5"
                fill="none"
                strokeDasharray="2.5 1.5"
              />

              {/* Edge Lines */}
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.4 }}
                d={roadPath}
                stroke="#fbbf24"
                strokeWidth="0.7"
                fill="none"
                transform="translate(-6, 0)"
                opacity="0.7"
              />
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.4 }}
                d={roadPath}
                stroke="#fbbf24"
                strokeWidth="0.7"
                fill="none"
                transform="translate(6, 0)"
                opacity="0.7"
              />
            </svg>

            {/* Milestone Pins & Labels */}
            {MILESTONES.map((milestone, index) => {
              const { point, isCompleted, isCurrent, isLocked } = getMilestoneData(index);
              const isFinal = index === MILESTONES.length - 1;
              const labelOnLeft = point.side === 'left';

              return (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.12, type: 'spring', stiffness: 150 }}
                  style={{
                    position: 'absolute',
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    transform: 'translate(-50%, -100%)',
                  }}
                  onMouseEnter={() => setHoveredMilestone(milestone.id)}
                  onMouseLeave={() => setHoveredMilestone(null)}
                  onClick={() => onMilestoneClick?.(milestone)}
                  className="cursor-pointer z-10"
                >
                  <div className="relative">
                    {/* Pin Shadow */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-3 w-10 h-4 bg-black/40 rounded-full blur-md" />

                    {/* Pulse Rings for Current */}
                    {isCurrent && !isFinal && (
                      <>
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ scale: [1, 3, 1], opacity: [0.7, 0, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-yellow-400/50"
                          />
                        ))}
                      </>
                    )}

                    {/* Final Flag (instead of pin) */}
                    {isFinal ? (
                      <motion.div
                        animate={{
                          y: isCurrent ? [-10, 0, -10] : [0],
                          scale: hoveredMilestone === milestone.id ? 1.1 : 1,
                        }}
                        transition={{ y: { duration: 2, repeat: Infinity }, scale: { duration: 0.2 } }}
                        className="relative"
                      >
                        <div className="relative w-24 h-32">
                          {/* Flag Pole */}
                          <div className="absolute left-1/2 -translate-x-1/2 w-2 h-full bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-full shadow-lg" />

                          {/* Flag */}
                          <motion.div
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute top-2 left-1/2 w-20 h-14 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-r-lg shadow-2xl flex items-center justify-center"
                          >
                            <Flag className="w-8 h-8 text-white fill-white" />
                          </motion.div>

                          {/* Trophy Base */}
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-6 bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-lg shadow-lg" />
                        </div>

                        {/* "FREEDOM!" Label */}
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black px-6 py-2 rounded-full shadow-2xl text-lg whitespace-nowrap border-2 border-yellow-600"
                        >
                          🎉 FINANCIAL FREEDOM! 🎉
                        </motion.div>
                      </motion.div>
                    ) : (
                      /* Regular Pin */
                      <motion.div
                        animate={{
                          y: isCurrent ? [-8, 0, -8] : [0],
                          scale: hoveredMilestone === milestone.id ? 1.12 : 1,
                        }}
                        transition={{
                          y: { duration: 1.5, repeat: Infinity },
                          scale: { duration: 0.2 },
                        }}
                      >
                        {/* Pin */}
                        <div
                          className="relative w-14 h-18 rounded-t-full shadow-2xl flex items-center justify-center"
                          style={{
                            background: isCompleted
                              ? 'linear-gradient(135deg, #10b981, #059669)'
                              : isCurrent
                              ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                              : 'linear-gradient(135deg, #9ca3af, #6b7280)',
                            boxShadow: isCompleted
                              ? '0 10px 25px rgba(16, 185, 129, 0.6)'
                              : isCurrent
                              ? '0 10px 25px rgba(251, 191, 36, 0.7), 0 0 40px rgba(251, 191, 36, 0.5)'
                              : '0 10px 25px rgba(156, 163, 175, 0.4)',
                          }}
                        >
                          <div className="text-3xl">{milestone.icon}</div>

                          {/* Status Badge */}
                          <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-white shadow-xl flex items-center justify-center">
                            {isCompleted && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                            {isCurrent && <MapPin className="w-5 h-5 text-yellow-600 fill-yellow-600" />}
                            {isLocked && <Lock className="w-4 h-4 text-gray-500" />}
                          </div>

                          {/* Number Badge */}
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-7 h-7 bg-white rounded-full flex items-center justify-center font-black text-sm shadow-lg border-2 border-gray-200">
                            {milestone.id}
                          </div>
                        </div>

                        {/* Pin Point */}
                        <div
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full"
                          style={{
                            width: 0,
                            height: 0,
                            borderLeft: '7px solid transparent',
                            borderRight: '7px solid transparent',
                            borderTop: isCompleted ? '12px solid #059669' : isCurrent ? '12px solid #f59e0b' : '12px solid #6b7280',
                          }}
                        />
                      </motion.div>
                    )}

                    {/* "YOU ARE HERE" for current milestone */}
                    {isCurrent && !isFinal && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap z-20"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="bg-yellow-400 text-black font-black px-5 py-2 rounded-lg shadow-2xl text-sm border-3 border-yellow-600"
                        >
                          ⭐ YOU ARE HERE! ⭐
                        </motion.div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-yellow-400" />
                      </motion.div>
                    )}

                    {/* Milestone Name Label */}
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 ${
                        labelOnLeft ? 'right-full mr-4' : 'left-full ml-4'
                      } whitespace-nowrap z-5`}
                    >
                      <motion.div
                        initial={{ opacity: 0, x: labelOnLeft ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.12 }}
                        className={`bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 border-2 ${
                          isCompleted ? 'border-emerald-400' : isCurrent ? 'border-yellow-400' : 'border-gray-300'
                        }`}
                      >
                        <div className="font-bold text-gray-900 text-sm">{milestone.title}</div>
                        <div className="text-xs text-gray-600 mt-0.5">{milestone.subtitle}</div>
                        {milestone.currentStatus && (
                          <div className="text-xs text-blue-600 font-semibold mt-1">{milestone.currentStatus}</div>
                        )}
                      </motion.div>
                    </div>

                    {/* Hover Tooltip */}
                    <AnimatePresence>
                      {hoveredMilestone === milestone.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                          style={{ width: '300px' }}
                        >
                          <div className="bg-white rounded-2xl shadow-2xl p-5 border-2 border-blue-300">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="text-5xl">{milestone.icon}</div>
                              <div className="flex-1">
                                <h3 className="font-black text-gray-900 text-lg">{milestone.title}</h3>
                                <p className="text-xs text-gray-600 mt-1">{milestone.subtitle}</p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 mb-4">{milestone.description}</p>
                            <div className="flex items-center justify-between pt-3 border-t-2 border-gray-200">
                              <div className="flex items-center gap-1 text-purple-600">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-sm font-bold">+{milestone.xpReward} XP</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span className="text-xs">{milestone.estimatedTime}</span>
                              </div>
                            </div>
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-4 h-4 bg-white border-r-2 border-b-2 border-blue-300 rotate-45" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 pb-12">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 border-gray-200">
          <div className="flex items-center justify-center gap-10 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-800">Completed</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg flex items-center justify-center animate-pulse">
                <MapPin className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="font-bold text-gray-800">Current Position</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 shadow-lg flex items-center justify-center">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-800">Locked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
