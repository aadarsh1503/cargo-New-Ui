import React from 'react';
import { motion } from 'framer-motion';

// Swiper is no longer needed, so we remove its imports

import Bounce from '../Bounce/Bounce';
import Slide from '../Slide/Slide';
import ColorBar from '../Colorbar/Colorbar';

// The data remains the same
const packagingSolutions = [
  {
    image: "https://yt3.googleusercontent.com/ytc/AIdro_nNQF1f30Yw6j8BTA74Uzzdm1wPP8uCYLrkpHn4yP1YTg=s900-c-k-c0x00ffffff-no-rj",
    title: "Heavy-Duty Crating",
    description: "For industrial machinery and oversized items, providing maximum structural protection against impacts and environmental factors.",
  },
  {
    image: "https://static.tildacdn.com/tild6235-6166-4337-b863-623633643734/ftl-vs-ltl-kljuchevy.jpg",
    title: "Custom Boxing & Padding",
    description: "Tailored solutions for fragile and high-value goods, using specialized padding to ensure items arrive in perfect condition.",
  },
  {
    image: "https://miro.medium.com/v2/resize:fit:1200/1*T0_Y9IHrk8xxczu5vXAKPw.jpeg",
    title: "Secure Palletizing",
    description: "Expertly stacked and shrink-wrapped pallets for bulk shipments, ensuring stability and ease of handling through the supply chain.",
  },
];

function Packaging() {
  // 1. A "container" variant that will orchestrate the animations of its children
  const gridContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        // This is the magic property! It creates a delay between each child's animation.
        staggerChildren: 0.2
      }
    }
  };

  // 2. An "item" variant for each card in the grid
  const cardVariants = {
    hidden: { opacity: 0, y: 50 }, // Start off-screen and invisible
    visible: { opacity: 1, y: 0 }    // Animate to full opacity and original position
  };

  return (
    <section className="bg-gray-50 py-24 px-4 lg:px-8 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        
        {/* The introduction section remains the same */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 border-b-4 border-yellow-500 inline-block pb-1">
            Secure & Strategic Packaging
          </h2>
          <p className="mt-6 text-md text-gray-600 leading-relaxed">
            Proper packaging is essential to preserve the quality and safety of your products. Our highly qualified team is available to guide you, indicating the best packaging for each type of merchandise to be transported.
          </p>
        </motion.div>

        {/* === NEW: Staggered Animation Grid === */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" // A responsive grid
          variants={gridContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {packagingSolutions.map((solution, index) => (
            // Each card is now a motion component with its own variant
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -10, scale: 1.03 }} // Adding a nice lift-up effect on hover
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white rounded-2xl overflow-hidden shadow-xl group"
            >
              <div className="h-64 overflow-hidden">
                <img src={solution.image} alt={solution.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out" />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl text-gray-800">{solution.title}</h3>
                <p className="text-gray-600 mt-2 text-sm">{solution.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
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

export default Packaging;