import React from 'react';
import one from "./one.png"
import two from "./two.png"
import three from "./three.png"
import four from "./four.png"
import five from "./five.png"
import six from "./six.png"
import seven from "./seven.png"
import eight from "./eight.png"

const BounceOne = () => {
  const projects = [
    { title: 'PICKUP AND DELIVERY', src: one },
    { title: 'STUFFING & CONTAINER', src: two },
    { title: 'SWAPNING & CONTAINER', src: three},
    { title: 'BOARDING COMP.', src: four },
    { title: 'PERISHABLE PRODUCTS', src: five},
    { title: 'IMO PRODUCTS', src: six },
    { title: 'CARGO CONSOLIDATION', src: seven },
    { title: 'INTERNATIONAL DESTINATIONS', src: eight },
  ];

  return (
    <section className="text-center max-w-5xl font-roboto mx-auto py-10 overflow-hidden">
      <h2 className="text-3xl font-bold text-black mb-8">
        Our Projects< br />
        <span className='text-Graytext text-xl mt-2'>They Include:</span>
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {projects.map((project, index) => (
          <div key={index} className="flex flex-col items-center">
            <img
              src={project.src}
              alt={project.title}
              className="h-32 w-32 mb-4  object-contain" // Apply the animation class
            />
            <p className="text-yellow-400 lg:w-[800px] font-bold text-center">{project.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BounceOne;
