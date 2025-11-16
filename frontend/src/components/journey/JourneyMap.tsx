/**
 * Journey Map - Complete financial journey visualization with all milestones
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Milestone } from './Milestone';
import { YouAreHereMarker } from './YouAreHereMarker';
import { MilestoneModal } from './MilestoneModal';
import { AchievementPopup } from './AchievementPopup';
import { ProgressBar } from './ProgressBar';
import { XPDisplay } from './XPDisplay';
import { MilestoneData, UserJourneyState, Achievement } from './types';
import { MILESTONES } from './milestoneData';

interface JourneyMapProps {
  journeyState: UserJourneyState;
  onMilestoneComplete?: (milestoneId: number) => void;
}

export const JourneyMap: React.FC<JourneyMapProps> = ({ journeyState, onMilestoneComplete }) => {
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneData | null>(null);
  const [celebrationAchievement, setCelebrationAchievement] = useState<Achievement | null>(null);
  const [milestonesWithState, setMilestonesWithState] = useState<MilestoneData[]>([]);
  const currentMilestoneRef = useRef<HTMLDivElement>(null);

  // Update milestones with user's journey state
  useEffect(() => {
    const updatedMilestones = MILESTONES.map((milestone) => {
      const isCompleted = journeyState.completedMilestones.includes(milestone.id);
      const isCurrently = milestone.id === journeyState.currentMilestone;
      const progress = journeyState.milestoneProgress[milestone.id] || 0;

      return {
        ...milestone,
        status: isCompleted ? 'completed' as const : isCurrently ? 'in-progress' as const : 'locked' as const,
        progress,
      };
    });

    setMilestonesWithState(updatedMilestones);
  }, [journeyState]);

  // Auto-scroll to current milestone on mount
  useEffect(() => {
    if (currentMilestoneRef.current) {
      setTimeout(() => {
        currentMilestoneRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 500);
    }
  }, []);

  const handleMilestoneClick = (milestone: MilestoneData) => {
    setSelectedMilestone(milestone);
  };

  const closeModal = () => {
    setSelectedMilestone(null);
  };

  const closeCelebration = () => {
    setCelebrationAchievement(null);
  };

  // Calculate level from XP (basic formula)
  const calculateLevel = (xp: number) => {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  };

  const currentLevel = calculateLevel(journeyState.totalXP);
  const xpForNextLevel = Math.pow(currentLevel, 2) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 mb-3">
            Your Journey to Financial Freedom
          </h1>
          <p className="text-gray-600 text-lg">
            Follow the path, complete milestones, and achieve true financial independence
          </p>
        </motion.div>

        {/* Overall Progress Bar */}
        <ProgressBar
          progress={journeyState.financialFreedomProgress}
          currentMilestone={journeyState.currentMilestone}
          totalMilestones={MILESTONES.length}
          level={currentLevel}
          totalXP={journeyState.totalXP}
        />

        {/* XP & Streaks Display */}
        <XPDisplay
          level={currentLevel}
          currentXP={journeyState.totalXP}
          xpToNextLevel={xpForNextLevel}
          streaks={journeyState.streaks}
        />

        {/* Journey Path Intro */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full shadow-lg font-bold">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              🌟
            </motion.div>
            START YOUR JOURNEY
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              🌟
            </motion.div>
          </div>
        </motion.div>

        {/* Milestones Path */}
        <div className="relative">
          {milestonesWithState.map((milestone, index) => {
            const isCurrentMilestone = milestone.id === journeyState.currentMilestone;

            return (
              <div
                key={milestone.id}
                ref={isCurrentMilestone ? currentMilestoneRef : null}
                className="relative"
              >
                {/* You Are Here Marker */}
                {isCurrentMilestone && (
                  <YouAreHereMarker milestoneName={milestone.title} />
                )}

                {/* Milestone Card */}
                <Milestone
                  milestone={milestone}
                  index={index}
                  isCurrentMilestone={isCurrentMilestone}
                  onClick={() => handleMilestoneClick(milestone)}
                />
              </div>
            );
          })}
        </div>

        {/* Journey End Celebration */}
        {journeyState.financialFreedomProgress === 100 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-12 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-3xl p-8 shadow-2xl"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-8xl mb-4"
            >
              👑
            </motion.div>
            <h2 className="text-4xl font-black text-white mb-2">
              FINANCIAL FREEDOM ACHIEVED!
            </h2>
            <p className="text-white/90 text-lg mb-6">
              You've completed your journey to financial independence. Your wealth works for you now!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-orange-600 font-black px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              Share Your Success 🎉
            </motion.button>
          </motion.div>
        )}

        {/* Motivational Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <div className="inline-block bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200 max-w-2xl">
            <p className="text-gray-700 italic text-lg mb-2">
              "The journey of a thousand miles begins with a single step."
            </p>
            <p className="text-gray-500 text-sm">- Lao Tzu</p>
          </div>
        </motion.div>

        {/* Help & Support */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 text-center text-gray-500 text-sm"
        >
          <p>Need help on your journey?</p>
          <button className="text-blue-600 font-semibold hover:text-blue-700 mt-1">
            Talk to an Expert →
          </button>
        </motion.div>
      </div>

      {/* Modals */}
      <MilestoneModal
        milestone={selectedMilestone}
        onClose={closeModal}
      />

      <AchievementPopup
        achievement={celebrationAchievement}
        onClose={closeCelebration}
      />
    </div>
  );
};
