import React from 'react';

const Heronext = () => {
  return (
    // Section container with padding for spacing
    <div id='next-section' className="bg-white p-4 mt-8 sm:p-8">
          <p className="text-4xl sm:text-5xl font-bold mx-auto items-center justify-center flex  text-black mb-4">
                Your Logistics Partner 
              </p>
              <p className="text-4xl sm:text-5xl mb-8 font-bold mx-auto items-center justify-center flex  text-black ">
              For The Future
              </p>
      {/* Main content container with rounded corners and background image */}
      <div
        className="relative w-full overflow-hidden rounded-[40px] bg-cover bg-center text-white"
        // IMPORTANT: Add your image URL here in the style attribute
        style={{ backgroundImage: "url('https://avatars.mds.yandex.net/i?id=43572d41bc0f0c32e823015009dd7fc4_l-5259770-images-thumbs&ref=rim&n=13&w=2835&h=1890')" }}
      >
        {/* Optional: Dark overlay for better text contrast. */}
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Flex container to position text blocks at the top and bottom */}
        <div className="relative z-10 flex h-full min-h-[500px] flex-col justify-between p-8 md:min-h-[600px] md:p-16 lg:p-20">
          
          {/* Top-right text block */}
          <div className="flex justify-end text-right">
            <div className="max-w-lg">
              {/* --- NEW SUB-HEADING ADDED HERE --- */}
            
              <h2 className="text-4xl font-bold md:text-5xl lg:text-6xl">
                Services Consulting
              </h2>
              <p className="mt-4 text-base font-medium md:text-md">
                Your Global Shipping Partner — Air | Road | Sea
              </p>
            </div>
          </div>

          {/* Bottom-left text block (No changes below) */}
          <div>
            <div className="max-w-xl">
              <p className="text-lg font-medium md:text-xl lg:text-md">
                "Founded by seasoned trade professionals, GVS Cargo & Logistics provides end-to-end export and import solutions worldwide, delivering efficient customs processes and reliable logistics services with professionalism and speed."
              </p>
              {/* Contact Us Button */}
              <a href='/ContactUs'>
              <button className="mt-8 inline-flex items-center rounded-full bg-white px-6 py-3 font-semibold text-gray-800 transition-colors duration-300 hover:bg-gray-200">
                <span>Contact Us</span>
                <span className="ml-3 flex h-7 w-7 items-center justify-center rounded-full bg-orange-500">
                  {/* Arrow Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Heronext;