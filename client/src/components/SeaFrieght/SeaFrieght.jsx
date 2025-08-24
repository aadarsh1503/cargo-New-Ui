import React, { useEffect } from 'react';

// Import your custom components
import Bounce from '../Bounce/Bounce';
import Slide from '../Slide/Slide';
import ColorBar from '../Colorbar/Colorbar';

// --- IMPORT YOUR CONTAINER SHIP IMAGE HERE ---
// Make sure the path to your image is correct!

function SeaFreight() {
  useEffect(() => {
    // Scroll to top when the component is mounted
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* Main Section - Identical structure to your reference design */}
      <div className=" mt-4 relative z-0 overflow-hidden">
        <div className="relative max-w-7xl mx-auto py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
          
          {/* Decorative elements are identical to the reference */}
          <div className="hidden lg:block bg-white absolute top-0 bottom-0 left-3/4 w-screen" />
          <div className="absolute top-0 left-0 w-1/3 h-1/3 border-t-4 border-l-4 border-yellow-500/30 rounded-tl-3xl opacity-50" />
          <div className="absolute bottom-0 right-0 w-1/3 h-1/3 border-b-4 border-r-4 border-yellow-500/30 rounded-br-3xl opacity-50" />

          <div className="relative lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            
            {/* == TEXT CONTENT SECTION == */}
            <div className="relative z-10">
              {/* The heading is updated to "Sea Freight" but keeps the same style */}
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl tracking-tight">
                Sea Freight<span className="text-yellow-500">.</span>
              </h2>
              {/* The accent bar and glow are identical */}
              <div className="mt-4 h-1.5 w-24 bg-yellow-500 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.5)]" />

              {/* The main paragraphs are updated with your Sea Freight content */}
              <p className="mt-8 text-lg text-gray-700">
                Always seeking the best service, <strong>GVS Cargo & Logistics</strong> establishes partnerships with all major shipping companies. We operate on every continent, offering agile service that meets our rigorous system of excellence and quality.
              </p>
              <p className="mt-6 text-lg text-gray-600">
                Our team develops your import or export project with meticulous attention to detail, indicating the ideal container and providing complete monitoring to ensure a fast, safe, and successful operation that meets your unique needs.
              </p>
            </div>

            {/* == IMAGE SECTION == */}
            <div className="mt-10 mr-10 lg:mt-0" aria-hidden="true">
              <div className="relative mx-auto w-[520px] rounded-lg">
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
                    src="https://avatars.mds.yandex.net/get-altay/4079181/2a00000181d236ddc1483cdf9f2fea302550/XXL_height" // <-- Your new ship image is used here
                    alt="Container ship at sea for Sea Freight services"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 
        New Section for the List of Services
        This keeps the main section clean and gives the list its own focus.
      */}
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Our Shipping Projects Include
            </h3>
            <p className="mt-4 text-lg text-gray-600">
              Comprehensive solutions tailored for every aspect of sea transport.
            </p>
          </div>
          <ul className="mt-12 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Exclusive 'Door to Door' pickup and delivery",
              "Container collection and delivery for stuffing",
              "Professional stuffing and unloading of containers",
              "Direct monitoring service for your shipment",
              "Safe planning for perishable product cargo",
              "Secure planning for dangerous goods (IMO)",
              "Consolidation for any type of cargo",
              "Complete moves to international destinations",
              "Best conditions for chartering special cargo ships",
            ].map((service) => (
              <li key={service} className="flex items-start">
                <div className="flex-shrink-0">
                  {/* Checkmark Icon */}
                  <svg className="h-6 w-6 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="ml-3 text-base text-gray-700">{service}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Your other components are placed after all content */}
      <Bounce />
      <div className='my-10'>
        <Slide />
      </div>
      <ColorBar />
    </>
  );
}

export default SeaFreight;