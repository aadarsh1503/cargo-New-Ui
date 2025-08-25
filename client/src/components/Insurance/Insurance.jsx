import React from 'react';
import { motion } from 'framer-motion';
// Icons to visually represent the benefits
import { ShieldCheckIcon, GlobeAmericasIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

import Bounce from '../Bounce/Bounce';
import Slide from '../Slide/Slide';
import ColorBar from '../Colorbar/Colorbar';

// ---===[ YOU CAN REPLACE THIS IMAGE PATH ]===---
const insuranceImageUrl = "https://sun9-29.userapi.com/impg/kQRXWDzDvE2XIMxcMDDRAApX2pM6iuMs8l6Icg/R8KkDoBEkOo.jpg?size=1000x500&quality=95&sign=3b0b953ab240f97d8aa2191a0b37643f&c_uniq_tag=y6xgJNyhBDhOcFkk3eu6zwBdPbrlbhbhoz7K3Dpoj7E&type=album";
// ---===========================================---

// Let's break down the benefits of your insurance into a clear, scannable list.
const insuranceFeatures = [
  {
    icon: GlobeAmericasIcon,
    title: "End-to-End Global Coverage",
    description: "Your cargo is protected from the moment it leaves the origin factory until it safely arrives at its destination.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Comprehensive Risk Mitigation",
    description: "Our policies are designed to cover a wide range of potential risks, ensuring your investment is secure against unforeseen events.",
  },
  {
    icon: ClipboardDocumentCheckIcon,
    title: "Simplified & Swift Process",
    description: "We handle the issuance of the insurance policy, providing you with a hassle-free way to gain complete peace of mind.",
  },
];

function Insurance() {
  // Animation variants for the content card and image
  const fromLeft = {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };
  const fromRight = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };
  
  // Variants for staggering the list items
  const listContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.5 },
    },
  };
  const listItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    // Main section with a light gray background to feel premium
    <section className="bg-gray-50 py-24 px-4 lg:px-8 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        
        {/* Main layout: A two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* === Left Column: The "Policy Card" === */}
          <motion.div
            variants={fromLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="bg-white p-8 lg:p-12 rounded-2xl shadow-xl border border-gray-100"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-2 border-b-4 border-yellow-500 inline-block pb-1">
              Comprehensive Cargo Insurance
            </h2>
            <p className="mt-4 text-yellow-600 font-semibold text-lg">Your Peace of Mind, Guaranteed.</p>
            <p className="mt-2 text-md text-gray-600 leading-relaxed">
              Ensuring customer safety is our priority. We offer the issuance of a comprehensive insurance policy for your cargo, providing you with security and confidence throughout the entire international shipment.
            </p>
            
            {/* Staggered list of features */}
            <motion.div
              className="mt-8 space-y-6"
              variants={listContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {insuranceFeatures.map((feature, index) => (
                <motion.div key={index} className="flex items-start" variants={listItem}>
                  <div className="flex-shrink-0 h-10 w-10 bg-yellow-500/10 rounded-lg flex items-center justify-center border border-yellow-500/30">
                    <feature.icon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-lg text-gray-800">{feature.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* === Right Column: The Image === */}
          <motion.div
            variants={fromRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="h-96 lg:h-[550px] rounded-2xl overflow-hidden shadow-2xl"
          >
            <img
              src={insuranceImageUrl}
              alt="Cargo Ship with insurance protection"
              className="w-full h-full object-cover"
            />
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

export default Insurance;