import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Icons for the accordion
import { ChevronDownIcon, GlobeAmericasIcon, Cog6ToothIcon, ChartPieIcon } from '@heroicons/react/24/outline';

import Bounce from '../Bounce/Bounce';
import Slide from '../Slide/Slide';
import ColorBar from '../Colorbar/Colorbar';

// ---===[ YOU CAN REPLACE THIS CONTENT ]===---
// We'll structure your service as a series of questions & answers for the accordion.
// I've written new, relevant copy as the old text was for Packaging.
const consultancyServices = [
  {
    icon: GlobeAmericasIcon,
    question: "How do you assist with market entry and expansion?",
    answer: "Our team conducts in-depth market analysis to identify opportunities and navigate regulatory landscapes. We provide strategic guidance to ensure your products reach new international markets efficiently and compliantly."
  },
  {
    icon: Cog6ToothIcon,
    question: "What does logistics optimization involve?",
    answer: "We analyze your entire supply chain to identify inefficiencies. By optimizing routes, carrier selection, and warehousing strategies, we help you reduce transportation costs, improve delivery times, and increase overall operational performance."
  },
  {
    icon: ChartPieIcon,
    question: "Can you help design a complete supply chain?",
    answer: "Absolutely. We work as your strategic partner to design and implement resilient, cost-effective supply chains from the ground up. This includes sourcing, inventory management, distribution, and final-mile delivery planning."
  },
];

function Commercial() {
  // State to keep track of which accordion item is open
  const [expanded, setExpanded] = useState(0); // Default the first item to be open

  return (
    // Main section with a clean, light gray background
    <section className="bg-gray-50 py-24 px-4 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* We'll use a two-column layout: Text on the left, Accordion on the right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* === Left Column: Introduction Text === */}
          <motion.div
            className="lg:sticky top-24" // Make the intro text sticky for a cool effect
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-block border-b-4 border-yellow-500 pb-2">
              <h2 className="text-4xl text-gray-900 font-bold leading-tight">
                Commercial Consultancy<br />
                <span className="lg:ml-12">and Logistics</span>
              </h2>
            </div>
            <p className="mt-6 text-md text-gray-600 leading-relaxed">
              Our highly qualified team acts as your strategic partner, offering expert guidance to navigate complex markets and optimize your entire supply chain for peak efficiency and profitability.
            </p>
          </motion.div>

          {/* === Right Column: Interactive Accordion === */}
          <div className="w-full">
            <div className="space-y-4">
              {consultancyServices.map((service, i) => (
                <motion.div
                  key={i}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <motion.header
                    initial={false}
                    onClick={() => setExpanded(expanded === i ? false : i)}
                    className="flex justify-between items-center p-5 cursor-pointer"
                  >
                    <div className="flex items-center">
                      <service.icon className="h-6 w-6 text-yellow-500 mr-4 flex-shrink-0" />
                      <h3 className="font-semibold text-lg text-gray-800">{service.question}</h3>
                    </div>
                    <motion.div
                      animate={{ rotate: expanded === i ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                    </motion.div>
                  </motion.header>

                  <AnimatePresence initial={false}>
                    {expanded === i && (
                      <motion.section
                        key="content"
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                          open: { opacity: 1, height: "auto" },
                          collapsed: { opacity: 0, height: 0 }
                        }}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="px-5"
                      >
                        <p className="pb-5 text-gray-600">{service.answer}</p>
                      </motion.section>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
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

export default Commercial;