import React from 'react';
import { motion } from 'framer-motion';
// Icons to highlight the key benefits
import { SquaresPlusIcon, LockClosedIcon, ClockIcon } from '@heroicons/react/24/outline';

import Bounce from '../Bounce/Bounce';
import Slide from '../Slide/Slide';
import ColorBar from '../Colorbar/Colorbar';

// ---===[ YOU CAN REPLACE THESE IMAGES AND TEXT ]===---
// We'll break down the service into features, each with its own image.
const storageFeatures = [
  {
    icon: SquaresPlusIcon,
    title: "Ample & Flexible Space",
    description: "Secure storage outside your factory to meet any space requirement, from short-term overflow to long-term warehousing.",
    image: "https://png.pngtree.com/background/20230424/original/pngtree-an-empty-warehouse-with-many-shelves-picture-image_2457177.jpg",
  },
  {
    icon: LockClosedIcon,
    title: "Secure Handling & Control",
    description: "Our facilities enable complete control and professional handling of your goods, ensuring their integrity and safety.",
    image: "https://avatars.mds.yandex.net/i?id=be7609e92e690909a7b663f66d0d1952_l-5522477-images-thumbs&ref=rim&n=13&w=1250&h=850",
  },
  {
    icon: ClockIcon,
    title: "Strategic Staging",
    description: "Store goods awaiting customs release or the perfect shipping opportunity, managed according to your convenience and schedule.",
    image: "https://envistacorp.com/wp-content/uploads/2021/06/warehouse-incentive-plan-image-1-1-scaled.jpg",
  },
];

function Storages() {
  const textContainerVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
  };

  return (
    // Main section with a clean white background
    <section className="bg-white py-24 px-4 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* We use a grid for the main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* === Left Column: Sticky Text Content === */}
          <div className="lg:sticky top-24 h-fit"> {/* This makes the column sticky on large screens */}
            <motion.div
              variants={textContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 border-b-4 border-yellow-500 inline-block pb-1">
                Secure & Managed Storage
              </h2>
              <p className="mt-6 text-md text-gray-600 leading-relaxed">
                We offer solutions for importers/exporters whose goods need to be stored securely, providing space, control, and handling according to your convenience.
              </p>
              {/* Feature list */}
              <div className="mt-8 space-y-6">
                {storageFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 bg-yellow-500/10 rounded-lg flex items-center justify-center border border-yellow-500/30">
                      <feature.icon className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-lg text-gray-800">{feature.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* === Right Column: Scrolling Images === */}
          <div className="space-y-16">
            {storageFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="rounded-2xl overflow-hidden shadow-2xl h-96"
                variants={imageVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }} // Animate when 40% of the image is visible
              >
                <img src={feature.image} alt={feature.title} className="w-full h-full object-cover" />
              </motion.div>
            ))}
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

export default Storages;