import React from 'react';
import { FaDotCircle } from 'react-icons/fa';

const OurServices = () => {
  return (
    <div className="relative flex items-center mt-32 justify-center h-auto lg:h-96 bg-cover text-white overflow-hidden">
    {/* Background Video */}
    <video
      className="absolute inset-0 w-full h-full object-cover"
      src="https://videos.pexels.com/video-files/6979847/6979847-sd_960_506_30fps.mp4"
      autoPlay
      loop
      muted
      playsInline
    ></video>
  
    {/* Overlay */}
    <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col lg:flex-row w-full max-w-5xl mx-auto p-4 lg:p-8">
        
        {/* Title (Left Aligned) */}
        <div className="w-full lg:w-1/2 flex items-center justify-center lg:justify-start mb-4 lg:mb-0">
          <h2 className="text-2xl lg:text-3xl font-bold">OUR SERVICES</h2>
        </div>

        {/* Services List (Right Aligned) */}
        <div className="w-full lg:w-1/2 text-lg space-y-4 lg:space-y-0">
          {/* First Row with 2 items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a href='/stuffingUnloading'>
            <div className="flex items-center space-x-2">
              <FaDotCircle className="text-yellow-500" />
              <span>Stuffing and Spawning</span>
            </div>
            </a>
            <a href='/lcl'>
            <div className="flex items-center lg:w-[500px] space-x-2">
              <FaDotCircle className="text-yellow-500" />
              <span>LCL (less-than-container loaded)</span>
            </div>
            </a>
          </div>
          

          {/* Second Row with 3 items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <a href='/fcl'>
            <div className="flex items-center lg:w-[500px] space-x-2">
              <FaDotCircle className="text-yellow-500" />
              <span>FCL (full container loaded)</span>
            </div>
            </a>
            <a href='/dgr'>
            <div className="flex items-center lg:w-[500px] lg:ml-20 lg:col-span-1 space-x-2">
              <FaDotCircle className="text-yellow-500" />
              <span>DGR / PER</span>
            </div>
            </a>
            <a href='/inspection'>
            <div className="flex items-center lg:w-[500px] lg:ml-20 lg:col-span-1 space-x-2">
              <FaDotCircle className="text-yellow-500" />
              <span>Fumigation</span>
            </div>
            </a>
          </div>

          {/* Third Row with 4 items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <a href='/packaging'>
            <div className="flex items-center space-x-2">
              <FaDotCircle className="text-yellow-500" />
              <span>Packaging</span>
            </div>
            </a>
            <a href='/storage'>
            <div className="flex items-center space-x-2">
              <FaDotCircle className="text-yellow-500" />
              <span>Storage</span>
            </div>
            </a>
            <a href='/commercial'>
            <div className="flex items-center space-x-2">
              <FaDotCircle className="text-yellow-500" />
              <span>Consulting</span>
            </div>
            </a>
            <a href='/insurance'>
            <div className="flex items-center lg:w-[500px] space-x-2">
              <FaDotCircle className="text-yellow-500" />
              <span>Cargo Insurance</span>
            </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurServices;
