import React, { useEffect } from 'react';
import Bounce from '../Bounce/Bounce';
import Slide from '../Slide/Slide';
import ColorBar from '../Colorbar/Colorbar';

// --- THREE POWERFUL ICONS FOR EACH PILLAR ---

// Icon for MISSION (Target/Goal)
const MissionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 12h-2.25m-5.834 5.834l1.591 1.591M4.5 12H2.25m5.834-5.834L6.166 4.666M12 21.75v-2.25" />
  </svg>
);

// Icon for VISION (Eye/Foresight)
const VisionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// Icon for VALUES (Diamond/Integrity)
const ValuesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);


const MissionVissionAndValues = () => {
  // We define the content in an array for cleaner, more maintainable code.
  const pillars = [
    {
      Icon: MissionIcon,
      title: 'MISSION',
      text: 'To provide logistics services with resources that combine personal attention for the best result, ensuring our customers peace of mind, comfort, and confidence.',
    },
    {
      Icon: VisionIcon,
      title: 'VISION',
      text: 'To be recognized in the national and international market as a premier option for logistics services, driven by ethical values and achieving total customer satisfaction.',
    },
    {
      Icon: ValuesIcon,
      title: 'VALUES',
      text: 'Integrity, Responsibility, Excellence, and Competence. We are committed to upholding these values in every action we take and every service we provide.',
    },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <section className="relative bg-slate-50 py-20 sm:py-28 overflow-hidden">
        
        {/* The Ethereal Background Light Source */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-50 via-slate-50 to-slate-50"
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
            {pillars.map((pillar) => (
              // This is a single "Pillar of Principle"
              <div
                key={pillar.title}
                className="
                  group relative flex flex-col items-center text-center 
                  p-8 bg-white rounded-3xl shadow-lg
                  border border-slate-100
                  transition-all duration-300 ease-in-out
                  hover:shadow-2xl hover:shadow-yellow-500/20
                  hover:-translate-y-3
                "
              >
                {/* The Icon Container - This is where the activation happens */}
                <div 
                  className="
                    relative flex items-center justify-center h-20 w-20 rounded-full
                    bg-yellow-100 text-yellow-500
                    transition-all duration-300 ease-in-out
                    group-hover:bg-yellow-500 group-hover:text-white
                    group-hover:scale-110
                  "
                >
                  <pillar.Icon />
                  {/* The emanating glow ring that appears on hover */}
                  <div className="absolute inset-0 rounded-full ring-4 ring-yellow-500/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:animate-ping-slow" />
                </div>
                
                <h3 className="mt-8 text-lg font-bold text-gray-800 tracking-widest uppercase">
                  {pillar.title}
                </h3>
                <p className="mt-4 text-base text-gray-600 leading-relaxed">
                  {pillar.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Your other components remain, perfectly integrated */}
      <Bounce />
      <div className='my-10'>
        <Slide />
      </div>
      <ColorBar />
    </div>
  );
}

export default MissionVissionAndValues;