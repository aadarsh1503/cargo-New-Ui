import React from 'react';
// We need the same advanced hooks from Framer Motion
import { motion, useScroll, useTransform } from 'framer-motion';
import Bounce from '../Bounce/Bounce';
import Slide from '../Slide/Slide';

// ---===[ YOU CAN REPLACE THIS IMAGE PATH ]===---
// Choose a powerful image representing a full, exclusive container.
const fclImageUrl = "https://money-informer.com/wp-content/uploads/2024/04/image1.jpg";
// ---===========================================---


function FCL() {
  // 1. Create a ref for the parallax section
  const targetRef = React.useRef(null);
  
  // 2. Set up the scroll tracking for the parallax effect
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  // 3. Re-enabling the parallax effect for a more dynamic feel.
  //    It moves the background image vertically from -20% to 20% as you scroll.
  //    If you want NO movement, you can change this back to ["0%", "0%"].
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "0%"]);

  // Animation variants for the content card (same as LCL for consistency)
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
  };

  // Animation variant for the lower components to appear after the main section
  const lowerCompsVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay: 0.2 }
    }
  };

  return (
    // We use a React Fragment <> to return multiple top-level elements without an extra div
    <>
      {/* === HERO SECTION (LCL Design) === */}
      <section 
        ref={targetRef} 
        className="relative min-h-[100vh] flex items-center justify-center py-24 overflow-hidden"
      >
        {/* Background Image Container */}
        <motion.div
          style={{ y }} // Parallax effect is applied here
          className="absolute inset-0 z-0"
        >
          <img
            src={fclImageUrl}
            alt="FCL Shipping Container"
            className="w-full h-full object-cover brightness-75"
          />
          {/* Dark overlay to ensure text is readable */}
          <div className="absolute inset-0 bg-black/30" />
        </motion.div>

        {/* Foreground "Frosted Glass" Content Card */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="relative z-10 max-w-3xl mx-auto p-8 md:p-12 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 text-white"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            FCL (Full Container Loaded)
          </h2>
          
          <div className="h-1 w-32 bg-yellow-500 mb-6"></div>

          <p className="text-md md:text-lg font-medium text-gray-200 leading-relaxed">
            Shipping by sea in a container. The entire container is used exclusively for the transportation of goods from a single exporter/importer. See the models and characteristics of each container in our tools.
          </p>
        </motion.div>
      </section>

      {/* === LOWER COMPONENTS SECTION === */}
      <motion.div
        className="" // Add spacing below the hero section
        variants={lowerCompsVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <Bounce />
        
        <div className=''>
          <Slide />
        </div>
      </motion.div>
    </>
  );
}

export default FCL;