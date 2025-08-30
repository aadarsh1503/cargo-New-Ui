import React, { useEffect } from 'react';

// Import your custom components
import Bounce from '../Bounce/Bounce';
import Slide from '../Slide/Slide';
import ColorBar from '../Colorbar/Colorbar';

// --- IMPORT YOUR AIRPLANE IMAGE HERE ---
// Make sure the path is correct


function AirFreightSection() {
  useEffect(() => {
    // Scroll to the top on component mount for a clean entry.
    window.scrollTo(0, 0);
  }, []);

  return (
    // THEME CHANGE: Main background changed from dark to a light, premium off-white.
    // 'overflow-hidden' is kept as it's key for the visual effects.
    <div className="relative  z-0 mt-4 overflow-hidden">
      <div className="relative max-w-7xl mx-auto py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        
        {/*
          DECORATIVE ELEMENTS:
          These are kept exactly the same but translated for a light background.
        */}
        {/* THEME CHANGE: The background panel is now white to create a subtle layered effect on the off-white bg. */}
        <div className="hidden lg:block bg-white absolute top-0 bottom-0 left-3/4 w-screen" />
        
        {/* The corner borders are kept, their opacity works great on a light theme. */}
        <div className="absolute top-0 left-0 w-1/3 h-1/3 border-t-4 border-l-4 border-yellow-500/30 rounded-tl-3xl opacity-50" />
        <div className="absolute bottom-4 right-0 w-1/3 h-1/3 border-b-4 border-r-4 border-yellow-500/30 rounded-br-3xl opacity-50" />


        <div className="relative lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
          
          {/* == TEXT CONTENT SECTION == */}
          {/* Structure is identical. 'relative' and 'z-10' are kept. */}
          <div className="relative z-10">
            {/* THEME CHANGE: Text color changed from white to a dark gray for readability. */}
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl tracking-tight">
              Air Freight<span className="text-yellow-500">.</span>
            </h2>
            {/* The accent bar and its glow are kept as they work perfectly on light themes. */}
            <div className="mt-4 h-1.5 w-24 bg-yellow-500 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.5)]" />

            {/* THEME CHANGE: Paragraph colors changed to darker grays. */}
            <p className="mt-8 text-lg text-gray-700">
              <strong>GVS Cargo & Logistics</strong> has forged powerful bonds with all major airlines through years of professionalism and successful projects. This allows us to offer unparalleled cargo transportation and exceptional freight conditions for every type of merchandise, across the globe.
            </p>
            <p className="mt-6 text-lg text-gray-600">
              Experience our complete, personalized <strong>DOOR-TO-DOOR</strong> service. We handle everything with speed, security, and transparency—from collection and packaging to shipping, tracking, and final delivery, anywhere in the world.
            </p>
          </div>

          {/* == IMAGE SECTION == */}
          {/* Structure, transforms, and hover effects are all identical. */}
          <div className="mt-10 mr-0 lg:mr-10 lg:mt-0" aria-hidden="true">
            <div className="relative mx-auto w-full lg:w-[520px] rounded-lg">
              <div
                className="
                  relative block w-full bg-gray-200 rounded-lg overflow-hidden 
                  transform lg:translate-x-8 lg:scale-110
                  shadow-xl
                  hover:scale-115 transition-transform duration-500 ease-in-out
                "
              >
                <img
                  className="w-full h-full object-cover"
                  src="https://cdn.creamermedia.com/assets/articles/images/resized/0001185889_resized_untitled61.jpeg"
                  alt="Cargo airplane on tarmac"
                />
                {/* 
                  REMOVED: The dark gradient overlay is not needed on a light theme.
                  Its purpose was to blend the image into the dark background, so it's been removed
                  for a cleaner look on the light background.
                */}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Your other components are placed after the main section and are unchanged. */}
      <Bounce />
      <Slide />
      <ColorBar />
    </div>
  );
}

export default AirFreightSection;