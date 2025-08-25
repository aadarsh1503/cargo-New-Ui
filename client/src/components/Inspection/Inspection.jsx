import React from 'react';
import { motion } from 'framer-motion';
// Icons are perfect for representing abstract benefits
import { ShieldCheckIcon, SparklesIcon, DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';

import Bounce from '../Bounce/Bounce';
import Slide from '../Slide/Slide';
import ColorBar from '../Colorbar/Colorbar';

// ---===[ YOU CAN REPLACE THIS IMAGE PATH ]===---
const inspectionImageUrl = "https://i2.wp.com/www.easyhaul.com/blog/wp-content/uploads/2021/04/Blog-EasyHaul-Who-Is-A-Customs-Broker-Title.png";
// ---===========================================---

// Define the core features of your inspection service
const inspectionFeatures = [
  {
    icon: DocumentMagnifyingGlassIcon,
    title: "Regulatory Compliance",
    description: "We ensure your cargo meets all local and international regulations, preventing costly delays and fines.",
  },
  {
    icon: SparklesIcon,
    title: "Quality Assurance",
    description: "Our team verifies that the quality and condition of your goods are maintained throughout the journey.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Safety & Risk Identification",
    description: "Thorough checks are conducted to identify potential risks, guaranteeing the safety and integrity of your merchandise.",
  },
];

function Inspection() {
  // Variants for orchestrating the grid animation
  const gridContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.4 }, // Stagger animation for each card
    },
  };

  // Variants for each individual grid item
  const gridItemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    // Main section with a clean white background for a premium feel
    <section className="bg-white py-24 px-4 lg:px-8 overflow-hidden">
      <div className="max-w-6xl mx-auto">

        {/* Main layout: Image on the left, Content on the right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* === Left Column: Image === */}
          <motion.div
            className="h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <img
              src={inspectionImageUrl}
              alt="Cargo Inspection"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* === Right Column: Content === */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-2 border-b-4 border-yellow-500 inline-block pb-1">
              Thorough Inspection Services
            </h2>
            <p className="mt-4 text-md text-gray-600 leading-relaxed">
              Our experienced team ensures that your cargo complies with all regulatory requirements and maintains its quality, guaranteeing the safety, integrity, and smooth handling of your merchandise throughout its journey.
            </p>
            
            {/* The Feature Grid */}
            <motion.div
              className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6"
              variants={gridContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              {inspectionFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  className="p-6 bg-gray-50 rounded-lg border border-gray-200"
                  variants={gridItemVariants}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -5, 
                    backgroundColor: '#ffffff',
                    borderColor: '#f59e0b', // Tailwind's yellow-500 color
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <feature.icon className="h-8 w-8 text-yellow-500 mb-3" />
                  <h4 className="font-bold text-lg text-gray-800">{feature.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Container for your lower components */}
      <div className="mt-24">
        <Bounce />
        <div className="">
          <Slide />
        </div>
        <ColorBar />
      </div>

    </section>
  );
}

export default Inspection;