import React from 'react';
import Bounce from '../Bounce/Bounce';
import Slide from '../Slide/Slide';
import ColorBar from '../Colorbar/Colorbar';
import Slide1 from '../Slide1/Slide1';

function LCL() {
  return (
    <div>
      <div className="flex flex-col items-start max-w-6xl lg:mt-32 mx-auto  p-4 lg:p-8 bg-white">
        <div className="mb-2 flex flex-col lg:flex-row mt-6 items-start justify-between w-full">
          <div className="flex-1 mb-4 lg:mb-0">
            <h2 className="text-3xl text-black lg:ml-2 lg:mt-4 font-bold mb-1">
            LCL (less-than-container loaded)
            </h2>
            <div className="h-1 lg:w-[470px] lg:ml- bg-yellow-500"></div>
          </div>
          <div className="w-full lg:w-1/2 ml-4 lg:ml-0">
            <p className="text-md mt-4 font-semibold text-Graytext">
            Shipping by sea in a container shared with goods from other exporters/importers. The main advantage of this method is that it is not necessary to have enough goods to fill a container and, since it is a shared container, the freight and fees are also shared.
            </p>
            
          </div>
        </div>
      </div>
      <Bounce />
      <div className='mb-10 mt-10'>
        <Slide />
      </div>
      
        <ColorBar />
      
    </div>
  );
}

export default LCL;
