/**
 * You Are Here Marker - Animated position indicator
 */

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, TrendingUp } from 'lucide-react';

interface YouAreHereMarkerProps {
  milestoneName: string;
}

export const YouAreHereMarker: React.FC<YouAreHereMarkerProps> = ({ milestoneName }) => {
  return (
    <div className="relative flex items-center justify-center my-6">
      {/* Pulsing Outer Rings */}
      <div className="absolute">
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-32 h-32 rounded-full bg-yellow-400"
        />
      </div>

      <div className="absolute">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
          className="w-32 h-32 rounded-full bg-yellow-300"
        />
      </div>

      {/* Main Marker Card */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
        }}
        className="relative z-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl shadow-2xl p-4 border-4 border-white"
      >
        <div className="flex items-center gap-3">
          {/* Animated Pin Icon */}
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <MapPin className="w-8 h-8 text-white fill-white" strokeWidth={2} />
          </motion.div>

          {/* Text */}
          <div>
            <motion.h3
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="text-lg font-black text-white drop-shadow-lg"
            >
              YOU ARE HERE
            </motion.h3>
            <p className="text-sm text-white/90 font-semibold">{milestoneName}</p>
          </div>

          {/* Trending Up Icon */}
          <motion.div
            animate={{
              rotate: [0, 10, 0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <TrendingUp className="w-6 h-6 text-white" strokeWidth={3} />
          </motion.div>
        </div>

        {/* Sparkle Effects */}
        <motion.div
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-200 rounded-full"
        />
        <motion.div
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
          className="absolute -bottom-2 -left-2 w-4 h-4 bg-orange-200 rounded-full"
        />
      </motion.div>

      {/* Directional Arrows */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
        <motion.div
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="flex flex-col items-center"
        >
          <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-yellow-500" />
          <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-yellow-500 -mt-1" />
        </motion.div>
      </div>
    </div>
  );
};
