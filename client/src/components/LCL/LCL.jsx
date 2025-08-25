import React from 'react';
// We need more advanced hooks from Framer Motion for this effect
import { motion, useScroll, useTransform } from 'framer-motion';
import Bounce from '../Bounce/Bounce';
import Slide from '../Slide/Slide';

// ---===[ YOU CAN REPLACE THIS IMAGE PATH ]===---
// Choose an image that works well as a background. Images with some depth are great for parallax.
// A port with containers or a warehouse scene would be perfect for LCL.
const lclImageUrl = "https://i.pinimg.com/originals/06/c0/1f/06c01fb59624f8e6c9e191381b7269f4.jpg";
// ---===========================================---


function LCL() {
  // 1. Create a ref for the main section to track its scroll position
  const targetRef = React.useRef(null);

  // 2. useScroll hook tracks the scroll progress of the targetRef element
  //    "start end" means the animation starts when the top of our section hits the bottom of the viewport.
  //    "end start" means it ends when the bottom of our section hits the top of the viewport.
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  // 3. useTransform maps the scroll progress (from 0 to 1) to a motion value.
  //    Here, we're moving the background image vertically ('y' axis) from -20% to 20%.
  //    This creates the parallax effect where the background moves slower than the content.
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "0%"]);

  // Animation variants for the content card to fade and scale in
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
  };

  return (
    <>
 
    <section 
      ref={targetRef} 
      className="relative min-h-[100vh] flex items-center justify-center py-24 overflow-hidden"
    >
      {/* Background Image Container */}
      {/* It's positioned absolutely to fill the entire section and sits behind the content (z-0). */}
      {/* The `style={{ y }}` is where the parallax magic happens, linking our transformed scroll value. */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 z-0"
      >
        {/* The actual image. We add a dark overlay using brightness filter to make text pop. */}
        <img
          src={lclImageUrl}
          alt="LCL Shipping Container"
          className="w-full h-full object-cover brightness-75"
        />
        {/* You can also use a div overlay like this: <div className="absolute inset-0 bg-black/50" /> */}
      </motion.div>

      {/* Foreground Content Card */}
      {/* This card uses the "frosted glass" effect. */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        // whileInView is a convenient way to trigger an animation when the element enters the viewport.
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }} // Triggers when 50% of the card is visible
        className="relative z-10 max-w-3xl mx-auto p-8 md:p-12 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 text-white"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          LCL (Less-than-Container Loaded)
        </h2>
        
        {/* The decorative yellow underline */}
        <div className="h-1 w-32 bg-yellow-500 mb-6"></div>

        <p className="text-md md:text-lg font-medium text-gray-200 leading-relaxed">
          Shipping by sea in a container shared with goods from other exporters/importers. The main advantage of this method is that it is not necessary to have enough goods to fill a container and, since it is a shared container, the freight and fees are also shared.
        </p>
      </motion.div>


    </section>
    <Bounce />
    <Slide />
    </>
  );
}

export default LCL;