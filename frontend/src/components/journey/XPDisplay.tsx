/**
 * XP Display - Gamification stats display with level and streaks
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, Award, Flame } from 'lucide-react';
import { Streak } from './types';

interface XPDisplayProps {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  streaks: Streak[];
}

export const XPDisplay: React.FC<XPDisplayProps> = ({
  level,
  currentXP,
  xpToNextLevel,
  streaks,
}) => {
  const xpProgress = (currentXP / xpToNextLevel) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {/* Level & XP Card */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
      >
        {/* Animated Background */}
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)',
            backgroundSize: '30px 30px',
          }}
        />

        <div className="relative z-10">
          {/* Level Badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Award className="w-8 h-8 text-yellow-300 fill-yellow-300" />
              </motion.div>
              <div>
                <div className="text-sm font-medium opacity-90">Your Level</div>
                <motion.div
                  key={level}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-black"
                >
                  Level {level}
                </motion.div>
              </div>
            </div>
            <Zap className="w-10 h-10 text-yellow-300 fill-yellow-300" />
          </div>

          {/* XP Progress */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-2">
              <span className="opacity-90">Experience Points</span>
              <span className="font-bold">
                {currentXP.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
              </span>
            </div>
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full relative"
              >
                <motion.div
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                />
              </motion.div>
            </div>
          </div>

          <p className="text-xs opacity-75">
            {(xpToNextLevel - currentXP).toLocaleString()} XP to next level
          </p>
        </div>
      </motion.div>

      {/* Streaks Card */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
      >
        {/* Animated Background */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)',
            backgroundSize: '30px 30px',
          }}
        />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Flame className="w-8 h-8 text-yellow-300 fill-yellow-300" />
              </motion.div>
              <div>
                <div className="text-sm font-medium opacity-90">Active Streaks</div>
                <div className="text-2xl font-black">{streaks.length} Ongoing</div>
              </div>
            </div>
            <TrendingUp className="w-10 h-10 opacity-80" />
          </div>

          {/* Streaks List */}
          {streaks.length > 0 ? (
            <div className="space-y-2">
              {streaks.map((streak, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{streak.icon}</span>
                      <div>
                        <div className="text-sm font-semibold">{streak.title}</div>
                        <div className="text-xs opacity-75">{streak.type}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="text-2xl font-black"
                      >
                        {streak.days}
                      </motion.div>
                      <div className="text-xs opacity-75">days</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <p className="text-sm opacity-90">Start tracking your finances to build streaks!</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
