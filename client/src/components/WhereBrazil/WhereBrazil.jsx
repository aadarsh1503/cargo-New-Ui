import React from 'react';
import Bounce from '../Bounce/Bounce';
import Slide from '../Slide/Slide';
import ColorBar from '../Colorbar/Colorbar';
import { useRegion } from '../../context/RegionContext'; // Import the hook

const WhereBrazil = () => { // Component name is kept as WhereBrazil
  const { content, isLoading } = useRegion();

  if (isLoading || !content) {
    return (
      <section className="text-center p-8">
        <h2>Loading operational details...</h2>
      </section>
    );
  }

  return (
    <div>
      <section className="flex flex-col lg:max-w-7xl mx-auto items-center px-4 md:px-8 lg:px-16 bg-white">
        {/* DYNAMIC CONTENT */}
        <h1 className='text-3xl font-poppins text-centre mt-6 lg:mt-40 mb-6 font-bold'>
          {content.operate_in_country_title}
        </h1>
        <p className='text-gray-500 lg:mb-32 font-poppins'>
          {content.operate_in_country_desc}
        </p>
    
        <Bounce />
      </section>
      <Slide />
      <ColorBar />
    </div>
  );
};

export default WhereBrazil;