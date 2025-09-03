// src/components/Navbar/RegionChangeOverlay.js

import React from 'react';
import { motion } from 'framer-motion';
import FuturisticLoader from './Loader'; // We'll reuse your existing loader

// Define the animation variants for the overlay
const overlayVariants = {
  initial: { 
    opacity: 0,
    backdropFilter: 'blur(0px)',
  },
  animate: { 
    opacity: 1,
    backdropFilter: 'blur(8px)',
    transition: { duration: 0.4, ease: 'easeInOut' } 
  },
  exit: { 
    opacity: 0,
    backdropFilter: 'blur(0px)',
    transition: { duration: 0.3, ease: 'easeOut' } 
  },
};

const contentVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { delay: 0.2, duration: 0.4 } },
    exit: { y: 20, opacity: 0, transition: { duration: 0.2 } },
}

const RegionChangeOverlay = ({ regionDetails }) => {
  return (
    <motion.div
      key="region-change-overlay"
      variants={overlayVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-60 flex flex-col justify-center items-center z-50"
      style={{ willChange: 'opacity, backdrop-filter' }} // Performance hint for browsers
    >
      {regionDetails && (
        <motion.div 
            variants={contentVariants}
            className="text-center text-white mb-8"
        >
          <span className="text-7xl mb-4 block" role="img" aria-label={regionDetails.label}>
            {regionDetails.flag}
          </span>
          <h2 className="text-3xl font-bold tracking-wide">
            Switching to {regionDetails.label}
          </h2>
          <p className="text-gray-300 mt-1">Fetching the latest information for you...</p>
        </motion.div>
      )}
      <motion.div variants={contentVariants}>
        <FuturisticLoader />
      </motion.div>
    </motion.div>
  );
};

export default RegionChangeOverlay;