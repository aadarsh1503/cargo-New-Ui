import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

// 1. Create a variable OUTSIDE the hook to hold the single Lenis instance.
let lenisInstance = null;

const useLenis = () => {
  useEffect(() => {
    // 2. Check if an instance already exists before creating a new one.
    if (lenisInstance) {
      // console.warn("useLenis: An instance of Lenis is already running.");
      return;
    }

    // 3. If no instance exists, create one with your desired settings.
    lenisInstance = new Lenis({
      duration: 1.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false, // Set to true for better mobile experience
      touchMultiplier: 2,
      infinite: false,
    });

    // The animation loop function
    function raf(time) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }

    // Start the animation loop
    requestAnimationFrame(raf);

    // 4. The cleanup function is crucial.
    // It should destroy the instance and reset our variable.
    return () => {
      if (lenisInstance) {
        lenisInstance.destroy();
        lenisInstance = null;
      }
    };
  }, []); // The empty dependency array ensures this effect runs only once on mount.
};

export default useLenis;