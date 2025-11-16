/**
 * Achievement Popup - Celebratory popup with confetti when milestone is completed
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, X, Share2, Sparkles } from 'lucide-react';
import { Achievement } from './types';

interface AchievementPopupProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export const AchievementPopup: React.FC<AchievementPopupProps> = ({ achievement, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      triggerConfetti();
    } else {
      setIsVisible(false);
    }
  }, [achievement]);

  const triggerConfetti = () => {
    // Burst from left
    confetti({
      particleCount: 100,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF6347', '#4169E1', '#9370DB'],
    });

    // Burst from right
    confetti({
      particleCount: 100,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF6347', '#4169E1', '#9370DB'],
    });

    // Center burst with delay
    setTimeout(() => {
      confetti({
        particleCount: 150,
        angle: 90,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#4169E1', '#9370DB'],
      });
    }, 300);

    // Stars effect
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 90,
        spread: 360,
        origin: { x: 0.5, y: 0.4 },
        shapes: ['star'],
        colors: ['#FFD700', '#FFA500'],
        scalar: 1.5,
      });
    }, 600);
  };

  if (!achievement) return null;

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-400 via-orange-500 to-red-500';
      case 'epic':
        return 'from-purple-400 via-pink-500 to-purple-600';
      case 'rare':
        return 'from-blue-400 via-indigo-500 to-blue-600';
      default:
        return 'from-gray-400 via-gray-500 to-gray-600';
    }
  };

  const getRarityBadge = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'legendary':
        return { text: 'LEGENDARY', color: 'bg-gradient-to-r from-yellow-500 to-orange-500' };
      case 'epic':
        return { text: 'EPIC', color: 'bg-gradient-to-r from-purple-500 to-pink-500' };
      case 'rare':
        return { text: 'RARE', color: 'bg-gradient-to-r from-blue-500 to-indigo-500' };
      default:
        return { text: 'COMMON', color: 'bg-gradient-to-r from-gray-500 to-gray-600' };
    }
  };

  const rarityBadge = getRarityBadge(achievement.rarity);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          />

          {/* Achievement Card */}
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 180, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto">
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
              >
                {/* Gradient Header */}
                <div className={`bg-gradient-to-r ${getRarityColor(achievement.rarity)} p-6 text-white relative overflow-hidden`}>
                  {/* Animated Background Pattern */}
                  <motion.div
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                    }}
                  />

                  <div className="relative z-10">
                    {/* Close Button */}
                    <button
                      onClick={onClose}
                      className="absolute top-0 right-0 p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    {/* Achievement Icon */}
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="text-8xl text-center mb-4"
                    >
                      {achievement.icon}
                    </motion.div>

                    {/* Rarity Badge */}
                    <div className="flex justify-center mb-4">
                      <div className={`${rarityBadge.color} px-4 py-1 rounded-full text-xs font-black tracking-wider shadow-lg`}>
                        {rarityBadge.text}
                      </div>
                    </div>

                    {/* "ACHIEVEMENT UNLOCKED" */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-center"
                    >
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Trophy className="w-6 h-6" />
                        <h3 className="text-sm font-black tracking-wider uppercase">Achievement Unlocked!</h3>
                        <Trophy className="w-6 h-6" />
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl font-black text-gray-900 text-center mb-3"
                  >
                    {achievement.title}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-gray-600 text-center mb-6"
                  >
                    {achievement.description}
                  </motion.p>

                  {/* Sparkle Divider */}
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-300" />
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-300" />
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onClose}
                      className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-colors"
                    >
                      Continue
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </motion.button>
                  </div>
                </div>

                {/* Floating Sparkles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -100],
                      opacity: [1, 0],
                      scale: [1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: 'easeOut',
                    }}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    style={{
                      left: `${15 + i * 15}%`,
                      bottom: 0,
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
