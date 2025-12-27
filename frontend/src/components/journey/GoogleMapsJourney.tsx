/**
 * Google Maps-Style Financial Journey
 * Clean, smooth navigation with zoom animations
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MilestoneData, UserJourneyState } from './types';
import { MILESTONES } from './milestoneData';
import { MapPin, Sparkles, Clock, CheckCircle, Lock, Flag, Navigation, Zap, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface GoogleMapsJourneyProps {
  journeyState: UserJourneyState;
  onMilestoneClick?: (milestone: MilestoneData) => void;
}

export const GoogleMapsJourney: React.FC<GoogleMapsJourneyProps> = ({ journeyState, onMilestoneClick }) => {
  const [hoveredMilestone, setHoveredMilestone] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [focusedMilestone, setFocusedMilestone] = useState<number>(journeyState.currentMilestone);

  // Define clean road path - gentle S-curve from bottom to top
  const milestonePositions = [
    { x: 50, y: 90 },   // 1. Bottom center
    { x: 45, y: 82 },   // 2. Slight left
    { x: 42, y: 74 },   // 3. More left
    { x: 45, y: 66 },   // 4. Back toward center
    { x: 50, y: 58 },   // 5. Center
    { x: 55, y: 50 },   // 6. Right
    { x: 58, y: 42 },   // 7. More right
    { x: 55, y: 34 },   // 8. Back toward center
    { x: 50, y: 26 },   // 9. Center
    { x: 50, y: 15 },   // 10. Top center - FREEDOM!
  ];

  // Create smooth SVG path
  const createSmoothPath = () => {
    if (milestonePositions.length === 0) return '';

    let path = `M ${milestonePositions[0].x} ${milestonePositions[0].y}`;

    for (let i = 1; i < milestonePositions.length; i++) {
      const curr = milestonePositions[i];
      const prev = milestonePositions[i - 1];

      // Calculate control point for smooth curve
      const cpX = (prev.x + curr.x) / 2;
      const cpY = (prev.y + curr.y) / 2;

      path += ` Q ${cpX} ${cpY} ${curr.x} ${curr.y}`;
    }

    return path;
  };

  const roadPath = createSmoothPath();

  // Calculate zoom and pan for current milestone
  const getCameraTransform = () => {
    if (focusedMilestone < 1 || focusedMilestone > milestonePositions.length) {
      return { scale: 1, translateX: 0, translateY: 0 };
    }

    const pos = milestonePositions[focusedMilestone - 1];
    const scale = 1.2; // Zoom level
    const translateX = (50 - pos.x) * 1.5;
    const translateY = (50 - pos.y) * 1;

    return { scale, translateX, translateY };
  };

  const cameraTransform = getCameraTransform();

  // Auto-focus on current milestone
  useEffect(() => {
    setFocusedMilestone(journeyState.currentMilestone);
  }, [journeyState.currentMilestone]);

  const getMilestoneStatus = (id: number) => {
    if (journeyState.completedMilestones.includes(id)) return 'completed';
    if (id === journeyState.currentMilestone) return 'current';
    return 'locked';
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-blue-50 via-white to-emerald-50 overflow-hidden">
      {/* Header */}
      <div className="relative z-30 bg-white shadow-md border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 md:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 flex items-center gap-2 sm:gap-3">
                <Navigation className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                Financial Freedom Journey
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Milestone {journeyState.currentMilestone} of {MILESTONES.length} • {journeyState.financialFreedomProgress}% Complete
              </p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFocusedMilestone(journeyState.currentMilestone)}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-lg hover:bg-blue-700 flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
              >
                <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Focus on Current</span>
                <span className="sm:hidden">Focus</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Guidance Card */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 pt-3 md:pt-4">
        <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-300">
          <CardContent className="py-3 sm:py-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-teal-900 mb-1">Your Journey to Financial Freedom</h3>
                <p className="text-xs sm:text-sm text-teal-700">
                  This map shows your progress through 7 key milestones from financial stability to complete
                  independence. Complete each milestone to unlock the next step in your journey!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-screen">
        <motion.div
          animate={{
            scale: cameraTransform.scale,
            x: cameraTransform.translateX,
            y: cameraTransform.translateY,
          }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className="relative w-full h-full"
          style={{ transformOrigin: 'center center' }}
        >
          {/* SVG Road */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full"
            style={{ overflow: 'visible' }}
          >
            <defs>
              {/* Road gradient */}
              <linearGradient id="roadGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#374151" />
                <stop offset="50%" stopColor="#4b5563" />
                <stop offset="100%" stopColor="#6b7280" />
              </linearGradient>

              {/* Completed gradient */}
              <linearGradient id="completedRoad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>

              {/* Shadow filter */}
              <filter id="roadShadow">
                <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* Road base */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: 'easeInOut' }}
              d={roadPath}
              stroke="url(#roadGrad)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              filter="url(#roadShadow)"
            />

            {/* Completed progress overlay */}
            {journeyState.financialFreedomProgress > 0 && (
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: journeyState.financialFreedomProgress / 100 }}
                transition={{ duration: 1.5, delay: 0.5 }}
                d={roadPath}
                stroke="url(#completedRoad)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
            )}

            {/* Center line */}
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.7 }}
              transition={{ duration: 2, delay: 0.3 }}
              d={roadPath}
              stroke="white"
              strokeWidth="0.3"
              fill="none"
              strokeDasharray="1.5 1"
            />

            {/* Yellow edge lines */}
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.8 }}
              transition={{ duration: 2, delay: 0.4 }}
              d={roadPath}
              stroke="#fbbf24"
              strokeWidth="0.4"
              fill="none"
              style={{ transform: 'translateX(-1.8px)' }}
            />
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.8 }}
              transition={{ duration: 2, delay: 0.4 }}
              d={roadPath}
              stroke="#fbbf24"
              strokeWidth="0.4"
              fill="none"
              style={{ transform: 'translateX(1.8px)' }}
            />
          </svg>

          {/* Milestones */}
          {MILESTONES.map((milestone, index) => {
            const pos = milestonePositions[index];
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
                transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
                style={{
                  position: 'absolute',
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="z-10"
              >
                <div
                  className="relative cursor-pointer"
                  onMouseEnter={() => setHoveredMilestone(milestone.id)}
                  onMouseLeave={() => setHoveredMilestone(null)}
                  onClick={() => {
                    setFocusedMilestone(milestone.id);
                    onMilestoneClick?.(milestone);
                  }}
                >
                  {/* Pulsing animation for current */}
                  {isCurrent && (
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-yellow-400 -z-10"
                      style={{ width: '80px', height: '80px', left: '-15px', top: '-15px' }}
                    />
                  )}

                  {/* Final Flag */}
                  {isFinal ? (
                    <motion.div
                      animate={{ y: isCurrent ? [-5, 5, -5] : 0 }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="relative"
                    >
                      <div className="w-16 h-24 relative">
                        {/* Pole */}
                        <div className="absolute left-1/2 -translate-x-1/2 w-2 h-full bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-full shadow-lg" />

                        {/* Flag */}
                        <motion.div
                          animate={{ x: [0, 2, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="absolute top-2 left-1/2 w-14 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-r shadow-xl flex items-center justify-center"
                        >
                          <Flag className="w-6 h-6 text-white" />
                        </motion.div>

                        {/* Base */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-4 bg-yellow-800 rounded shadow-lg" />
                      </div>

                      {/* Label */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black px-4 py-1 rounded-full text-sm shadow-lg">
                        🎉 FREEDOM
                      </div>
                    </motion.div>
                  ) : (
                    /* Regular Pin */
                    <motion.div
                      animate={{
                        y: isCurrent ? [-3, 3, -3] : 0,
                        scale: hoveredMilestone === milestone.id ? 1.15 : 1,
                      }}
                      transition={{
                        y: { duration: 1.5, repeat: Infinity },
                        scale: { duration: 0.2 },
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-full shadow-xl flex items-center justify-center relative"
                        style={{
                          background: isCompleted
                            ? 'linear-gradient(135deg, #10b981, #059669)'
                            : isCurrent
                            ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                            : 'linear-gradient(135deg, #9ca3af, #6b7280)',
                          boxShadow: isCompleted
                            ? '0 8px 20px rgba(16, 185, 129, 0.5)'
                            : isCurrent
                            ? '0 8px 20px rgba(251, 191, 36, 0.6)'
                            : '0 8px 20px rgba(156, 163, 175, 0.4)',
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
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs font-black shadow-md">
                          {milestone.id}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* "YOU ARE HERE" marker */}
                  {isCurrent && !isFinal && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, y: [-2, 2, -2] }}
                      transition={{ y: { duration: 1.5, repeat: Infinity } }}
                      className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap"
                    >
                      <div className="bg-yellow-400 text-black font-black px-4 py-1.5 rounded-lg shadow-xl text-xs">
                        ⭐ YOU ARE HERE
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-yellow-400" />
                    </motion.div>
                  )}

                  {/* Milestone label - positioned smartly */}
                  <motion.div
                    initial={{ opacity: 0, x: index % 2 === 0 ? -10 : 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className={`absolute top-1/2 -translate-y-1/2 ${
                      index % 2 === 0 ? 'right-full mr-6' : 'left-full ml-6'
                    } whitespace-nowrap`}
                  >
                    <div
                      className={`bg-white rounded-lg shadow-lg p-2.5 border-2 ${
                        isCompleted
                          ? 'border-emerald-400'
                          : isCurrent
                          ? 'border-yellow-400'
                          : 'border-gray-300'
                      }`}
                    >
                      <div className="font-bold text-gray-900 text-sm">{milestone.title}</div>
                      <div className="text-xs text-gray-600">{milestone.subtitle}</div>
                    </div>
                  </motion.div>

                  {/* Hover tooltip */}
                  <AnimatePresence>
                    {hoveredMilestone === milestone.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                        style={{ width: '280px' }}
                      >
                        <div className="bg-white rounded-xl shadow-2xl p-4 border-2 border-blue-300">
                          <div className="flex items-start gap-3 mb-2">
                            <div className="text-4xl">{milestone.icon}</div>
                            <div>
                              <h3 className="font-black text-gray-900">{milestone.title}</h3>
                              <p className="text-xs text-gray-600">{milestone.subtitle}</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-700 mb-3">{milestone.description}</p>
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
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-blue-300 rotate-45 -mt-1.5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Legend - Fixed at bottom */}
      <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 w-[95%] sm:w-auto">
        <div className="bg-white rounded-xl shadow-xl p-3 sm:p-4 border-2 border-gray-200">
          <div className="flex items-center justify-center gap-4 sm:gap-8">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg flex items-center justify-center">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-gray-800">Completed</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg flex items-center justify-center">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-white fill-white" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-gray-800">Current</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 shadow-lg flex items-center justify-center">
                <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-gray-800">Locked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
