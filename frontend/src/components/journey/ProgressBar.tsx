/**
 * Progress Bar - Overall journey progress visualization
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Zap } from 'lucide-react';

interface ProgressBarProps {
  progress: number; // 0-100
  currentMilestone: number;
  totalMilestones: number;
  level: number;
  totalXP: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  currentMilestone,
  totalMilestones,
  level,
  totalXP,
}) => {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 shadow-lg border-2 border-indigo-200 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Trophy className="w-7 h-7 text-yellow-500" />
            Your Journey to Financial Freedom
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Milestone {currentMilestone} of {totalMilestones} completed
          </p>
        </div>

        {/* Level & XP Display */}
        <div className="text-right">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full shadow-lg"
          >
            <Zap className="w-5 h-5 fill-yellow-300 text-yellow-300" />
            <div>
              <div className="text-xs font-medium">Level {level}</div>
              <div className="text-sm font-bold">{totalXP.toLocaleString()} XP</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className="relative">
        {/* Progress Percentage */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
          <motion.span
            key={progress}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600"
          >
            {progress}%
          </motion.span>
        </div>

        {/* Progress Track */}
        <div className="relative w-full h-6 bg-white rounded-full overflow-hidden shadow-inner border-2 border-gray-200">
          {/* Animated Progress Fill */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{
              duration: 1.5,
              ease: 'easeOut',
            }}
            className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 relative"
          >
            {/* Shimmer Effect */}
            <motion.div
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />

            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/50 to-blue-400/50 blur-sm" />
          </motion.div>

          {/* Milestone Markers */}
          <div className="absolute inset-0 flex justify-between items-center px-1">
            {Array.from({ length: totalMilestones }).map((_, index) => {
              const markerPosition = ((index + 1) / totalMilestones) * 100;
              const isCompleted = ((index + 1) / totalMilestones) * 100 <= progress;

              return (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05, type: 'spring' }}
                  className={`
                    w-3 h-3 rounded-full border-2 border-white
                    ${isCompleted ? 'bg-yellow-400' : 'bg-gray-300'}
                    ${index + 1 === currentMilestone ? 'w-4 h-4 ring-2 ring-yellow-400' : ''}
                  `}
                  title={`Milestone ${index + 1}`}
                />
              );
            })}
          </div>
        </div>

        {/* Progress Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-center"
        >
          {progress < 30 && (
            <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              Great start! Keep building momentum 🚀
            </p>
          )}
          {progress >= 30 && progress < 60 && (
            <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
              <Target className="w-4 h-4 text-purple-500" />
              You're making excellent progress! 💪
            </p>
          )}
          {progress >= 60 && progress < 90 && (
            <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" />
              Almost there! Financial freedom is within reach! 🎯
            </p>
          )}
          {progress >= 90 && progress < 100 && (
            <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
              <Target className="w-4 h-4 text-yellow-500" />
              So close! You're about to achieve financial freedom! 🌟
            </p>
          )}
          {progress === 100 && (
            <motion.p
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-sm text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 font-bold flex items-center justify-center gap-2"
            >
              <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              CONGRATULATIONS! You've achieved FINANCIAL FREEDOM! 🎉👑
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  );
};
