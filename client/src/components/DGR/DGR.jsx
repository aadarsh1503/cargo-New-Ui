import React from 'react';
import { motion } from 'framer-motion';
// Icons will complement the images nicely
import { FireIcon, CubeTransparentIcon } from '@heroicons/react/24/outline';

import Bounce from '../Bounce/Bounce';
import Slide from '../Slide/Slide';
import ColorBar from '../Colorbar/Colorbar';

// ---===[ YOU CAN REPLACE THESE IMAGE PATHS ]===---
const dangerousGoodsImageUrl = "https://avatars.mds.yandex.net/get-altay/14020851/2a0000019460d9fd3a53dc59a77f8ec527bf/XXL_height";
const perishableGoodsImageUrl = "https://cdnstatic.rg.ru/uploads/images/2022/12/13/istock-1002113164_181.jpg";
// ---===========================================---


function DGR() {
  // Animation for elements sliding in from the left
  const fromLeft = {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0 },
  };
  
  // Animation for elements sliding in from the right
  const fromRight = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    // Main section with a clean, light gray background
    <section className="bg-gray-50 py-24 px-4 lg:px-8 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        
        {/* Animated Introduction Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            Expert Product Handling
          </h2>
          <p className="mt-4 text-lg text-yellow-600 font-semibold">
            Dangerous & Perishable Goods
          </p>
        </motion.div>

        {/* Container for the two feature sections */}
        <div className="space-y-24">

          {/* === Section 1: Dangerous Goods === */}
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Image (on the left) */}
            <motion.div
              variants={fromLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7 }}
              className="relative h-80 lg:h-full rounded-2xl overflow-hidden shadow-xl"
            >
              <img src={dangerousGoodsImageUrl} alt="Dangerous Goods" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/10"></div>
            </motion.div>
            
            {/* Overlapping Text Card (on the right) */}
            <motion.div
              variants={fromRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="bg-white p-8 lg:p-12 rounded-2xl shadow-2xl lg:-ml-20 relative z-10" // The -ml-20 creates the overlap on large screens
            >
              <div className="flex items-center mb-4">
                <FireIcon className="h-8 w-8 text-yellow-500 mr-3"/>
                <h3 className="text-2xl font-bold text-gray-900">Dangerous Goods Handling</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Our certified team manages the documentation and coordination for hazardous materials, ensuring full compliance with IATA and IMO regulations for safe transport.
              </p>
            </motion.div>
          </div>

          {/* === Section 2: Perishable Goods === */}
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Overlapping Text Card (on the left) */}
            <motion.div
              variants={fromLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="bg-white p-8 lg:p-12 rounded-2xl shadow-2xl lg:-mr-20 relative z-10 lg:order-first" // The -mr-20 and order-first create the overlap
            >
              <div className="flex items-center mb-4">
                <CubeTransparentIcon className="h-8 w-8 text-yellow-500 mr-3"/>
                <h3 className="text-2xl font-bold text-gray-900">Perishable Goods Logistics</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                We provide climate-controlled solutions and priority handling for time-sensitive goods, guaranteeing product integrity from origin to final destination.
              </p>
            </motion.div>

            {/* Image (on the right) */}
            <motion.div
              variants={fromRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7 }}
              className="relative h-80 lg:h-full rounded-2xl overflow-hidden shadow-xl"
            >
              <img src={perishableGoodsImageUrl} alt="Perishable Goods" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/10"></div>
            </motion.div>
          </div>
          
        </div>
      </div>

      {/* Container for your lower components */}
      <div className="mt-24">
        <Bounce />
        <div className="my-16">
          <Slide />
        </div>
        <ColorBar />
      </div>

    </section>
  );
}

export default DGR;