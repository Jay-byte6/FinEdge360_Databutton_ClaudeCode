/**
 * 3D Winding Road Map - Financial Freedom Journey
 * Inspired by road-to-wealth visual metaphor
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MilestoneData, UserJourneyState } from './types';
import { MILESTONES } from './milestoneData';
import { MapPin, Sparkles, Clock, CheckCircle, Lock } from 'lucide-react';

interface RoadmapTo3DProps {
  journeyState: UserJourneyState;
  onMilestoneClick?: (milestone: MilestoneData) => void;
}

export const RoadmapTo3D: React.FC<RoadmapTo3DProps> = ({ journeyState, onMilestoneClick }) => {
  const [hoveredMilestone, setHoveredMilestone] = useState<number | null>(null);

  // Define road path coordinates (winding S-curve with 3D perspective)
  const roadPathPoints = [
    { x: 50, y: 95 },   // Start (bottom center)
    { x: 65, y: 85 },   // Curve right
    { x: 70, y: 75 },
    { x: 65, y: 65 },   // Curve back left
    { x: 45, y: 55 },
    { x: 35, y: 45 },   // Sharp left
    { x: 40, y: 35 },   // Curve right
    { x: 55, y: 25 },
    { x: 65, y: 15 },   // Final curve right
    { x: 70, y: 5 },    // End (top right)
  ];

  // Get milestone position and status
  const getMilestoneData = (index: number) => {
    const milestone = MILESTONES[index];
    const point = roadPathPoints[index];
    const isCompleted = journeyState.completedMilestones.includes(milestone.id);
    const isCurrent = milestone.id === journeyState.currentMilestone;
    const isLocked = !isCompleted && !isCurrent;

    return {
      milestone,
      point,
      isCompleted,
      isCurrent,
      isLocked,
    };
  };

  // Create SVG path from points
  const createRoadPath = () => {
    let path = `M ${roadPathPoints[0].x} ${roadPathPoints[0].y}`;

    for (let i = 1; i < roadPathPoints.length; i++) {
      const prev = roadPathPoints[i - 1];
      const curr = roadPathPoints[i];
      const next = roadPathPoints[i + 1] || curr;

      // Calculate control points for smooth curves
      const cp1x = prev.x + (curr.x - prev.x) * 0.5;
      const cp1y = prev.y + (curr.y - prev.y) * 0.5;

      path += ` Q ${cp1x} ${cp1y} ${curr.x} ${curr.y}`;
    }

    return path;
  };

  // Create dashed center line path
  const roadPath = createRoadPath();

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-sky-300 via-sky-200 to-green-100 overflow-hidden">
      {/* Sky with clouds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: `${-10 + i * 25}%`, y: `${i * 8}%` }}
            animate={{ x: `${110}%` }}
            transition={{
              duration: 40 + i * 5,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute"
          >
            <div className="w-24 h-12 bg-white/60 rounded-full blur-sm" />
          </motion.div>
        ))}
      </div>

      {/* Header - Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 pt-8 px-4"
      >
        <div className="max-w-6xl mx-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border-4 border-blue-300">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                Roadmap to Financial Freedom
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Progress: Milestone {journeyState.currentMilestone} of {MILESTONES.length}
                <span className="ml-4 text-blue-600 font-bold">
                  {journeyState.financialFreedomProgress}% Complete
                </span>
              </p>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* 3D Road Map Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div
          className="relative w-full"
          style={{
            height: '1400px',
            perspective: '1500px',
            perspectiveOrigin: '50% 40%',
          }}
        >
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            style={{
              transform: 'rotateX(55deg) rotateZ(0deg) scale(1.1)',
              transformStyle: 'preserve-3d',
            }}
          >
            <defs>
              {/* Road gradient */}
              <linearGradient id="roadGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#1f2937" />
                <stop offset="50%" stopColor="#374151" />
                <stop offset="100%" stopColor="#4b5563" />
              </linearGradient>

              {/* Completed road gradient */}
              <linearGradient id="completedRoadGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>

              {/* Shadow */}
              <filter id="roadShadow">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.3" />
                <feOffset dx="0.2" dy="0.5" result="offsetblur" />
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.4" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Road Base (Wide) */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: 'easeInOut' }}
              d={roadPath}
              stroke="url(#roadGradient)"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#roadShadow)"
            />

            {/* Completed Road Overlay */}
            {journeyState.financialFreedomProgress > 0 && (
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: journeyState.financialFreedomProgress / 100 }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                d={roadPath}
                stroke="url(#completedRoadGradient)"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Center Dashed Lines */}
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, ease: 'easeInOut', delay: 0.3 }}
              d={roadPath}
              stroke="white"
              strokeWidth="0.4"
              fill="none"
              strokeDasharray="2 1.5"
              strokeLinecap="round"
            />

            {/* Road Edge Lines (Left Side) */}
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 2, ease: 'easeInOut', delay: 0.4 }}
              d={roadPath}
              stroke="#fbbf24"
              strokeWidth="0.6"
              fill="none"
              transform="translate(-5, 0)"
            />

            {/* Road Edge Lines (Right Side) */}
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 2, ease: 'easeInOut', delay: 0.4 }}
              d={roadPath}
              stroke="#fbbf24"
              strokeWidth="0.6"
              fill="none"
              transform="translate(5, 0)"
            />
          </svg>

          {/* Milestone Map Pins (Positioned over road) */}
          {MILESTONES.map((milestone, index) => {
            const { point, isCompleted, isCurrent, isLocked } = getMilestoneData(index);

            return (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, scale: 0, y: -100 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  delay: 0.5 + index * 0.15,
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                }}
                style={{
                  position: 'absolute',
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  transform: 'translate(-50%, -100%)',
                  transformStyle: 'preserve-3d',
                }}
                onMouseEnter={() => setHoveredMilestone(milestone.id)}
                onMouseLeave={() => setHoveredMilestone(null)}
                onClick={() => onMilestoneClick?.(milestone)}
                className="cursor-pointer z-10"
              >
                {/* Map Pin Container */}
                <div className="relative">
                  {/* Pin Shadow */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 w-8 h-3 bg-black/30 rounded-full blur-sm" />

                  {/* Animated Pulse Rings (for current milestone) */}
                  {isCurrent && (
                    <>
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            scale: [1, 2.5, 1],
                            opacity: [0.6, 0, 0.6],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.6,
                            ease: 'easeOut',
                          }}
                          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full"
                          style={{
                            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.8), transparent)',
                          }}
                        />
                      ))}
                    </>
                  )}

                  {/* The Pin */}
                  <motion.div
                    animate={{
                      y: isCurrent ? [-8, 0, -8] : [0],
                      scale: hoveredMilestone === milestone.id ? 1.15 : 1,
                    }}
                    transition={{
                      y: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
                      scale: { duration: 0.2 },
                    }}
                    className="relative"
                  >
                    {/* Pin Base */}
                    <div
                      className="relative w-12 h-16 rounded-t-full shadow-2xl flex items-center justify-center"
                      style={{
                        background: isCompleted
                          ? 'linear-gradient(135deg, #10b981, #059669)'
                          : isCurrent
                          ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                          : 'linear-gradient(135deg, #9ca3af, #6b7280)',
                        boxShadow: isCompleted
                          ? '0 8px 20px rgba(16, 185, 129, 0.5)'
                          : isCurrent
                          ? '0 8px 20px rgba(251, 191, 36, 0.6), 0 0 30px rgba(251, 191, 36, 0.4)'
                          : '0 8px 20px rgba(156, 163, 175, 0.3)',
                      }}
                    >
                      {/* Icon/Number */}
                      <div className="text-2xl">{milestone.icon}</div>

                      {/* Status Badge */}
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white shadow-lg flex items-center justify-center">
                        {isCompleted && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                        {isCurrent && <MapPin className="w-4 h-4 text-yellow-600 fill-yellow-600" />}
                        {isLocked && <Lock className="w-3 h-3 text-gray-500" />}
                      </div>
                    </div>

                    {/* Pin Point */}
                    <div
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0"
                      style={{
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderTop: isCompleted
                          ? '10px solid #059669'
                          : isCurrent
                          ? '10px solid #f59e0b'
                          : '10px solid #6b7280',
                      }}
                    />

                    {/* Milestone Number Badge */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white rounded-full flex items-center justify-center font-bold text-xs shadow-lg">
                      {milestone.id}
                    </div>
                  </motion.div>

                  {/* "YOU ARE HERE" Label */}
                  {isCurrent && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 }}
                      className="absolute -top-20 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="bg-yellow-400 text-black font-black px-4 py-2 rounded-lg shadow-xl text-sm border-2 border-yellow-600"
                      >
                        ⭐ YOU ARE HERE! ⭐
                      </motion.div>
                      {/* Arrow pointing down */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-yellow-400" />
                    </motion.div>
                  )}

                  {/* Hover Tooltip Card */}
                  <AnimatePresence>
                    {hoveredMilestone === milestone.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full mb-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
                        style={{ width: '280px' }}
                      >
                        <div className="bg-white rounded-xl shadow-2xl p-5 border-2 border-blue-200">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="text-4xl">{milestone.icon}</div>
                            <div className="flex-1">
                              <h3 className="font-black text-gray-900 text-lg">{milestone.title}</h3>
                              <p className="text-xs text-gray-600 mt-1">{milestone.subtitle}</p>
                            </div>
                          </div>

                          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                            {milestone.description}
                          </p>

                          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-1 text-purple-600">
                              <Sparkles className="w-4 h-4" />
                              <span className="text-sm font-bold">+{milestone.xpReward} XP</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span className="text-xs">{milestone.estimatedTime}</span>
                            </div>
                          </div>

                          {milestone.currentStatus && (
                            <div className="mt-3 p-2 bg-blue-50 rounded-lg text-xs font-semibold text-blue-800">
                              {milestone.currentStatus}
                            </div>
                          )}
                        </div>
                        {/* Tooltip Arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px w-4 h-4 bg-white border-r-2 border-b-2 border-blue-200 rotate-45" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 pb-12">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-6">
          <div className="flex items-center justify-center gap-8 flex-wrap text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-700">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg flex items-center justify-center animate-pulse">
                <MapPin className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-semibold text-gray-700">Current Position</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 shadow-lg flex items-center justify-center">
                <Lock className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-gray-700">Locked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
