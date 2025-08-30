import React, { useEffect } from 'react';

// Import your custom components
import Bounce from '../Bounce/Bounce';
import Slide from '../Slide/Slide';
import ColorBar from '../Colorbar/Colorbar';



function RoadFreight() {
  useEffect(() => {
    // Scroll to top when the component is mounted
    window.scrollTo(0, 0);
  }, []);

  return (
    // The structure is an exact copy of your AirFreight reference design
    <div className="relative z-0 mt-4 overflow-hidden">
      <div className="relative max-w-7xl mx-auto py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        
        {/* Decorative elements are identical to the reference */}
        <div className="hidden lg:block bg-white absolute top-0 bottom-0 left-3/4 w-screen" />
        <div className="absolute top-0 left-0 w-1/3 h-1/3 border-t-4 border-l-4 border-yellow-500/30 rounded-tl-3xl opacity-50" />
        <div className="absolute bottom-4 right-0 w-1/3 h-1/3 border-b-4 border-r-4 border-yellow-500/30 rounded-br-3xl opacity-50" />

        <div className="relative lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
          
          {/* == TEXT CONTENT SECTION == */}
          <div className="relative z-10">
            {/* The heading is updated to "Road Freight" but keeps the same style */}
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl tracking-tight">
              Road Freight<span className="text-yellow-500">.</span>
            </h2>
            {/* The accent bar and glow are identical */}
            <div className="mt-4 h-1.5 w-24 bg-yellow-500 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.5)]" />

            {/* The paragraphs are updated with your Road Freight content */}
            <p className="mt-8 text-lg text-gray-700">
              <strong>GVS Cargo & Logistics</strong> is widely consolidated to offer you its entire infrastructure in road freight transport services, regardless of size, value, distance, or product type—including special, perishable, or even dangerous cargo.
            </p>
            <p className="mt-6 text-lg text-gray-600">
              We offer full support at border crossings and detailed monitoring of each stage. Your cargo can be tracked in real-time on our Portal, a testament to our respect and dedication to every client.
            </p>
          </div>

          {/* == IMAGE SECTION == */}
          <div className="mt-10 mr-0 lg:mr-10 lg:mt-0" aria-hidden="true">
            <div className="relative mx-auto w-full lg:w-[520px] rounded-lg">
              {/* The dynamic image container is identical to the reference */}
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
                  src="https://media.baamboozle.com/uploads/images/247476/1637407964_511126.jpeg" // <-- Your new truck image is used here
                  alt="Truck on highway representing Road Freight services"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Your other components are placed after the main section, just like the reference */}
      <Bounce />
      <div className='my-10'> {/* Kept the margin wrapper for Slide as in your original */}
        <Slide />
      </div>
      <ColorBar />
    </div>
  );
}

export default RoadFreight;