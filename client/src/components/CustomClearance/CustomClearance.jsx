import React from 'react';
import { motion } from 'framer-motion';
// Icons for the timeline
import { DocumentTextIcon, GlobeAltIcon, TruckIcon, FingerPrintIcon } from '@heroicons/react/24/outline';

// Import your lower components
import Bounce from '../Bounce/Bounce';
import Slide from '../Slide/Slide';
import ColorBar from '../Colorbar/Colorbar';

// We'll break down your text into logical steps for the timeline
const timelineSteps = [
  {
    icon: DocumentTextIcon,
    title: "Classification & Consultation",
    description: "We start by classifying your cargo according to its tax status and provide all the guidance you need for a smooth import or export process.",
  },
  {
    icon: GlobeAltIcon,
    title: "Global Documentation",
    description: "Our team prepares all necessary documentation for companies to participate in international fairs and events, with temporary imports and/or exports.",
  },
  {
    icon: TruckIcon,
    title: "On-Site Monitoring & Clearance",
    description: "Our professionals monitor each phase of your shipment at ports, airports, and border points connected to SISCOMEX, resolving details on the ground.",
  },
  {
    icon: FingerPrintIcon,
    title: "Real-time Tracking & Security",
    description: "All information is transmitted to our system in real-time, where you can securely track the entire trajectory of your cargo from start to finish.",
  },
];

function CustomClearance() {
  // Variants for the main container to orchestrate the animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3, // This makes each child animate 0.3s after the previous one
      },
    },
  };

  // Variants for each item in the timeline
  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  return (
    // Main section with a light gray background to stand out
    <section className="bg-gray-50 py-24 px-4 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Animated Introduction Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            Specialized in the Customs Process
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            From initial classification to final clearance, we manage every detail to ensure your cargo moves quickly and safely across borders.
          </p>
        </motion.div>

        {/* The Timeline Container */}
        <motion.div
          className="relative" // Relative positioning is crucial for the connecting line
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* The vertical connecting line */}
          <div className="absolute left-6 top-0 h-full w-0.5 bg-yellow-400" />

          {/* Mapping over the steps to create the timeline */}
          <div className="space-y-12">
            {timelineSteps.map((step, index) => (
              <motion.div key={index} className="flex items-start" variants={itemVariants}>
                {/* The icon and its circle */}
                <div className="z-10 flex-shrink-0 bg-yellow-500 rounded-full h-12 w-12 flex items-center justify-center mr-6">
                  <step.icon className="h-6 w-6 text-white" />
                </div>
                {/* The text content */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                  <p className="mt-1 text-md text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
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

export default CustomClearance;