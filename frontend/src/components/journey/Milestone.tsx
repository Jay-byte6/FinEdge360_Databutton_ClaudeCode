/**
 * Milestone Component - Individual milestone card with stunning animations
 */

import React from 'react';
import { motion } from 'framer-motion';
import { MilestoneData } from './types';
import { Lock, CheckCircle2, Sparkles, ArrowRight, Clock } from 'lucide-react';

interface MilestoneProps {
  milestone: MilestoneData;
  index: number;
  isCurrentMilestone: boolean;
  onClick: () => void;
}

export const Milestone: React.FC<MilestoneProps> = ({
  milestone,
  index,
  isCurrentMilestone,
  onClick,
}) => {
  const { id, title, subtitle, icon, status, progress, xpReward, currentStatus, estimatedTime } = milestone;

  // Color schemes based on status
  const getStatusColors = () => {
    switch (status) {
      case 'completed':
        return {
          bg: 'from-emerald-500 to-green-600',
          border: 'border-emerald-400',
          text: 'text-emerald-900',
          badge: 'bg-emerald-100 text-emerald-700',
          glow: 'shadow-emerald-500/50',
        };
      case 'in-progress':
        return {
          bg: 'from-blue-500 to-indigo-600',
          border: 'border-blue-400',
          text: 'text-blue-900',
          badge: 'bg-blue-100 text-blue-700',
          glow: 'shadow-blue-500/50',
        };
      default:
        return {
          bg: 'from-gray-400 to-gray-500',
          border: 'border-gray-300',
          text: 'text-gray-700',
          badge: 'bg-gray-100 text-gray-600',
          glow: 'shadow-gray-500/20',
        };
    }
  };

  const colors = getStatusColors();

  // Status icon
  const StatusIcon = () => {
    if (status === 'completed') {
      return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
    }
    if (status === 'in-progress') {
      return <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />;
    }
    return <Lock className="w-5 h-5 text-gray-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{
        scale: status !== 'locked' ? 1.05 : 1.02,
        transition: { duration: 0.2 },
      }}
      className="relative"
    >
      {/* Milestone Card */}
      <motion.div
        onClick={onClick}
        className={`
          relative overflow-hidden rounded-2xl p-6 cursor-pointer
          border-2 ${colors.border}
          bg-white
          ${status !== 'locked' ? 'hover:shadow-2xl' : 'hover:shadow-lg'}
          ${isCurrentMilestone ? `shadow-2xl ${colors.glow} ring-4 ring-offset-2 ring-yellow-400` : 'shadow-md'}
          transition-all duration-300
          ${status === 'locked' ? 'opacity-70' : 'opacity-100'}
        `}
      >
        {/* Gradient Background Overlay (for completed/in-progress) */}
        {status !== 'locked' && (
          <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-5`} />
        )}

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* Icon */}
              <motion.div
                className={`
                  text-5xl flex items-center justify-center
                  w-16 h-16 rounded-xl bg-gradient-to-br ${colors.bg}
                  ${status === 'in-progress' ? 'animate-pulse' : ''}
                `}
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                {icon}
              </motion.div>

              {/* Title & Subtitle */}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                  <StatusIcon />
                </div>
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              </div>
            </div>

            {/* Milestone Number Badge */}
            <div className={`px-3 py-1 rounded-full ${colors.badge} font-bold text-sm`}>
              #{id}
            </div>
          </div>

          {/* Progress Bar (for in-progress milestones) */}
          {status === 'in-progress' && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-bold text-blue-600">{progress}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                />
              </div>
            </div>
          )}

          {/* Current Status (dynamic data) */}
          {currentStatus && status !== 'locked' && (
            <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-blue-800">{currentStatus}</p>
            </div>
          )}

          {/* Stats Row */}
          <div className="flex items-center justify-between text-sm mt-4">
            <div className="flex items-center gap-4">
              {/* XP Reward */}
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${colors.badge}`}>
                <Sparkles className="w-4 h-4" />
                <span className="font-bold">+{xpReward} XP</span>
              </div>

              {/* Estimated Time */}
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{estimatedTime}</span>
              </div>
            </div>

            {/* Action Button */}
            {status !== 'locked' && (
              <motion.button
                whileHover={{ x: 5 }}
                className="flex items-center gap-1 text-blue-600 font-semibold hover:text-blue-700"
              >
                View Details
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Completed Checkmark Overlay */}
        {status === 'completed' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="absolute top-4 right-4"
          >
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={3} />
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Connection Line to Next Milestone */}
      {id < 10 && (
        <div className="flex justify-center my-4">
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: index * 0.1 + 0.3, duration: 0.4 }}
            className={`
              w-1 h-12
              ${status === 'completed' ? 'bg-gradient-to-b from-emerald-500 to-blue-500' : 'bg-gray-300'}
              rounded-full
            `}
          />
        </div>
      )}
    </motion.div>
  );
};
