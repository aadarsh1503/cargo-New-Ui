import React, { useEffect, useRef } from 'react';
// Import the necessary hooks and components from Framer Motion
import { motion, useInView, useAnimation } from 'framer-motion';
import Bounce from '../Bounce/Bounce';
import Slide from '../Slide/Slide';

// ---===[ YOU CAN REPLACE THESE IMAGE PATHS ]===---
// Just put your image URLs or import them from your assets folder.
// For example: import stuffingImg from '../../assets/images/stuffing.jpg';
const stuffingImageUrl = "https://www.trucksdirectuk.co.uk/wp-content/uploads/2022/10/shutterstock_492647845-1.jpg";
const unloadingImageUrl = "https://www.urbansplatter.com/wp-content/uploads/2024/10/word-image-226493-2-png.webp";
// ---===========================================---


function StuffingUnloading() {
  // We use refs and hooks to detect when the component is visible on the screen
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true }); // `once: true` makes the animation run only once
  const mainControls = useAnimation();

  // This useEffect triggers the animation when the component comes into view
  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    }
  }, [isInView, mainControls]);


  // Reusable animation variants for sliding in from the left or right
  const slideInFromLeft = {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  };

  const slideInFromRight = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  };


  return (
    // The main section container. We give it a light gray background to stand out.
    // `overflow-hidden` is important to prevent content from appearing before it slides in.
    <section ref={ref} className="py-24  bg-gray-50 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 mb-20 lg:px-8">
        
        {/* Animated Introduction Header */}
        <motion.div
          className="text-center mb-20"
          variants={{
            hidden: { opacity: 0, y: -50 },
            visible: { opacity: 1, y: 0 },
          }}
          initial="hidden"
          animate={mainControls}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800">
            Our Expertise in Container Handling
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            From meticulous stuffing to careful unloading, we ensure your goods are handled with the utmost precision and care.
          </p>
        </motion.div>

        {/* Grid for the two sections: Stuffing and Unloading */}
        <div className="space-y-20">

          {/* === Section 1: Container Stuffing === */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image Column */}
            <motion.div
              variants={slideInFromLeft}
              initial="hidden"
              animate={mainControls}
              className="rounded-lg overflow-hidden shadow-2xl"
            >
              <motion.img
                src={stuffingImageUrl}
                alt="Container Stuffing"
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>

            {/* Text Column */}
            <motion.div
              variants={slideInFromRight}
              initial="hidden"
              animate={mainControls}
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-4 pb-2 border-b-4 border-yellow-500 inline-block">
                Container Stuffing
              </h3>
              <p className="text-md font-medium text-gray-600 leading-relaxed">
                Container stuffing requires technical knowledge regarding weight and volume, as well as the distribution of goods in a way that ensures good use of space, correct shipping and in a profitable manner for the customer.
              </p>
            </motion.div>
          </div>

          {/* === Section 2: Container Unloading === */}
          <div className="grid grid-cols-1 lg:grid-cols-2  gap-12 items-center">
            {/* Text Column - Note: `lg:order-last` is used to swap visual order on large screens for the zigzag effect */}
            <motion.div
              variants={slideInFromLeft}
              initial="hidden"
              animate={mainControls}
              className="lg:order-last"
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-4 pb-2 border-b-4 border-yellow-500 inline-block">
                Container Unloading
              </h3>
              <p className="text-md font-medium text-gray-600 leading-relaxed">
                Container unloading requires skilled labor, equipment and handling appropriate to the type of goods and packaging, ensuring the suitability of the product.
              </p>
            </motion.div>

            {/* Image Column */}
            <motion.div
              variants={slideInFromRight}
              initial="hidden"
              animate={mainControls}
              className="rounded-lg overflow-hidden shadow-2xl"
            >
              <motion.img
                src={unloadingImageUrl}
                alt="Container Unloading"
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </div>
          
        </div>
      </div>
      <Bounce />
      <Slide />
    </section>
  );
}

export default StuffingUnloading;