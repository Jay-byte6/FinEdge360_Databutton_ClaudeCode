/**
 * Milestone Modal - Detailed view of milestone with actions and benefits
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Circle, ArrowRight, Clock, Sparkles, Gift, Zap, Lock } from 'lucide-react';
import { MilestoneData } from './types';
import { useNavigate } from 'react-router-dom';

interface MilestoneModalProps {
  milestone: MilestoneData | null;
  onClose: () => void;
}

export const MilestoneModal: React.FC<MilestoneModalProps> = ({ milestone, onClose }) => {
  const navigate = useNavigate();

  if (!milestone) return null;

  const handleActionClick = (link?: string) => {
    if (link) {
      navigate(link);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className={`
            relative p-6 text-white
            ${milestone.status === 'completed' ? 'bg-gradient-to-r from-emerald-500 to-green-600' : ''}
            ${milestone.status === 'in-progress' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : ''}
            ${milestone.status === 'locked' ? 'bg-gradient-to-r from-gray-400 to-gray-500' : ''}
          `}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }} />
            </div>

            <div className="relative z-10">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Icon & Title */}
              <div className="flex items-center gap-4 mb-4">
                <motion.div
                  animate={{ rotate: [0, -5, 5, -5, 0] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-6xl"
                >
                  {milestone.icon}
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-black">{milestone.title}</h2>
                    <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-bold">
                      #{milestone.id}
                    </span>
                  </div>
                  <p className="text-white/90">{milestone.subtitle}</p>
                </div>
              </div>

              {/* Progress (if in-progress) */}
              {milestone.status === 'in-progress' && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span className="font-bold">{milestone.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${milestone.progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                </div>
              )}

              {/* XP Reward & Time */}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-bold">+{milestone.xpReward} XP</span>
                </div>
                <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{milestone.estimatedTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
            {/* Description */}
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">{milestone.description}</p>
            </div>

            {/* Benefits */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
                <Gift className="w-5 h-5 text-purple-500" />
                What You Get
              </h3>
              <div className="space-y-2">
                {milestone.benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg"
                  >
                    <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Completion Criteria */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-blue-500" />
                Completion Criteria
              </h3>
              <div className="space-y-2">
                {milestone.completionCriteria.map((criteria, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg"
                  >
                    <Circle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{criteria}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Actions to Take */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
                <ArrowRight className="w-5 h-5 text-green-500" />
                Actions to Take
              </h3>
              <div className="space-y-3">
                {milestone.actions.map((action, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                    whileHover={{ scale: milestone.status !== 'locked' ? 1.02 : 1 }}
                    whileTap={{ scale: milestone.status !== 'locked' ? 0.98 : 1 }}
                    onClick={() => handleActionClick(action.link)}
                    disabled={milestone.status === 'locked'}
                    className={`
                      w-full p-4 rounded-xl border-2 transition-all text-left
                      ${milestone.status === 'locked'
                        ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
                        : action.completed
                          ? 'bg-green-50 border-green-300 hover:border-green-400'
                          : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-lg cursor-pointer'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      {action.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : milestone.status === 'locked' ? (
                        <Lock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900">{action.title}</h4>
                          {milestone.status !== 'locked' && !action.completed && (
                            <ArrowRight className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Premium Features (if any) */}
            {milestone.premiumFeatures && milestone.premiumFeatures.length > 0 && (
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border-2 border-amber-200">
                <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  Premium Features Available
                </h3>
                <div className="space-y-2">
                  {milestone.premiumFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-600 rounded-full" />
                      <span className="text-sm text-amber-900">{feature}</span>
                    </div>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-4 w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold py-2 px-4 rounded-lg hover:from-amber-600 hover:to-yellow-700 transition-all shadow-lg"
                >
                  Unlock Premium 👑
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
