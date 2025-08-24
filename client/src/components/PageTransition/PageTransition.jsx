import React from 'react';
import { motion } from 'framer-motion';

// Define the animation variants for the page turn effect
const pageTurnVariants = {
  // The initial state of the new page (off-screen, rotated)
  initial: {
    opacity: 0,
    rotateY: -90,
    transformOrigin: 'right', // Animate from the right edge
  },
  // The state the new page animates to (fully visible, flat)
  in: {
    opacity: 1,
    rotateY: 0,
  },
  // The state the old page animates to (off-screen, rotated)
  out: {
    opacity: 0,
    rotateY: 90,
    transformOrigin: 'left', // Animate towards the left edge
  },
};

// Define the transition properties for a smooth animation
const pageTransition = {
  type: 'tween',
  ease: 'anticipate', // A nice easing function
  duration: 0.8,
};

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageTurnVariants}
      transition={pageTransition}
      style={{
        position: 'absolute', // Important for smooth transitions
        width: '100%',
        left: 0,
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;