import React from 'react';
import Bounce from '../Bounce/Bounce';
import Slide from '../Slide/Slide';
import ColorBar from '../Colorbar/Colorbar';
import Slide1 from '../Slide1/Slide1';

function DGR() {
  return (
    <div>
      <div className="flex flex-col items-start max-w-6xl lg:mt-32 font-roboto  mx-auto  p-4 lg:p-8 bg-white">
        <div className="mb-2 flex flex-col lg:flex-row mt-6 items-start justify-between w-full">
          <div className="flex-1 mb-4 lg:mb-0">
            <h2 className="text-3xl lg:ml-44 text-black lg:mt-4 font-bold mb-1">
            Product Handling
              <h2 className='-ml-20 text-black font-roboto  mt-1'>Dangerous and Perishable</h2>
            </h2>
            <div className="h-1 lg:w-[400px] lg:ml-[84px] bg-yellow-500"></div>
          </div>
          <div className="w-full lg:w-1/2 font-poppins gap-4 ml-4 lg:ml-0">
            <p className="text-md lg:mt-16 font-roboto  text-Graytext">
             
            Qualified workforce for issuing documents and coordinating shipments that require special care.


            </p>
           
          </div>
        </div>
      </div>
      <Bounce />
  
        <Slide />
  
        <ColorBar />
    </div>
  );
}

export default DGR;
