import React from 'react';
import Bounce from '../Bounce/Bounce';
import Slide from '../Slide/Slide';
import ColorBar from '../Colorbar/Colorbar';
import Slide1 from '../Slide1/Slide1';

function Packaging() {
  return (
    <div>
      <div className="flex flex-col items-start font-roboto max-w-6xl lg:mt-32 mx-auto  p-4 lg:p-8 bg-white">
        <div className="mb-2 flex flex-col lg:flex-row mt-6 items-start justify-between w-full">
        <div className="flex-1 mb-4 lg:mb-0">
  <h2 className="text-3xl text-black lg:ml-40 lg:mt-4 font-bold mb-1 border-b-4 border-yellow-500 inline-block pb-1">
    Packaging
  </h2>
</div>

          <div className="w-full lg:w-1/2 ml-4 lg:ml-0">
            <p className="text-md mt-4  text-Graytext">
            
It is essential for the protection of products during their distribution, storage and marketing, handling and consumption stages.< br />
Properly packaging the merchandise is important to preserve the quality and safety of the product that requires a longer journey. Our highly qualified team is available to guide and indicate the best packaging for each type of merchandise to be transported.
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

export default Packaging;
