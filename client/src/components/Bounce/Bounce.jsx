import React from 'react';
import one from "./one.png";
import two from "./two.png";
import three from "./three.png";
import four from "./four.png";
import five from "./five.png";
import six from "./six.png";
import seven from "./seven.png";
import eight from "./eight.png";

const Bounce = () => {
  const services = [
    { title: 'Pickup & Delivery', src: one },
    { title: 'Stuffing & Container', src: two },
    { title: 'Swapping & Container', src: three },
    { title: 'Boarding Comp.', src: four },
    { title: 'Perishable Goods', src: five },
    { title: 'IMO Goods', src: six },
    { title: 'Cargo Consolidation', src: seven },
    { title: 'International Moves', src: eight },
  ];

  return (
    // The main container with an ambient, futuristic light theme
    <section className="relative bg-slate-100 py-20 sm:py-28 overflow-hidden">
      
      {/* Subtle background gradient to create an ethereal light source */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-100/50 via-slate-100 to-slate-100"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight sm:text-4xl">
            Our Core Service Matrix
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Advanced logistics solutions, activated at your command.
          </p>
        </div>

        {/* The futuristic grid of holographic service pods */}
        <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 lg:gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="
                group relative flex flex-col items-center text-center p-6 lg:p-8
                bg-white/40 backdrop-blur-md border border-white/20 rounded-2xl
                transition-all duration-300 ease-in-out
                hover:bg-white/80 hover:border-yellow-400/80
                hover:shadow-2xl hover:shadow-yellow-500/20
                hover:-translate-y-2

                will-change-transform
              "
            >
              {/* Data-grid overlay that appears on hover for a futuristic feel */}
              <div 
                aria-hidden="true"
                className="
                  absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300
                  bg-[repeating-linear-gradient(-45deg,rgba(250,204,21,0.1),rgba(250,204,21,0.1)_2px,transparent_2px,transparent_8px)]
                  group-hover:opacity-100
                "
              />

              {/* The Icon: it illuminates and lifts on hover */}
              <div className="relative">
                <img
                  src={service.src}
                  alt={service.title}
                  className="
                    h-20 w-20 sm:h-24 sm:w-24 object-contain transition-all duration-300 ease-in-out
                    group-hover:scale-110 group-hover:-translate-y-2
                    group-hover:[filter:drop-shadow(0_0_10px_rgba(250,204,21,0.7))]
                  "
                />
              </div>

              {/* The Title: it becomes sharper and bolder on hover */}
              <p className="
                mt-5 text-sm font-semibold text-gray-600 uppercase tracking-widest
                transition-colors duration-300
                group-hover:text-gray-900
              ">
                {service.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Bounce;