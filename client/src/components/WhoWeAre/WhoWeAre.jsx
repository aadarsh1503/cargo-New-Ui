import React from 'react';
// These are your existing components, you can place them as you see fit.
import Bounce from '../Bounce/Bounce';
import Slide from '../Slide/Slide';
import ColorBar from '../Colorbar/Colorbar';

// --- HELPER ICONS (for a sleek, futuristic look) ---
// You can replace these with SVGs from a library like Heroicons or Feather Icons.
// I've created them as simple components here for clarity.

const GlobeIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5M3.75 15h16.5M7.5 3.75c.621 4.272 1.528 8.288 2.68 11.25M16.5 3.75c-.621 4.272-1.528 8.288-2.68 11.25" />
  </svg>
);

const PartnershipIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.75l5.25-5.25m0 0L12 11.25l-5.25 5.25M12 3.75l5.25 5.25m0 0L12 14.25l-5.25-5.25" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75h-7.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25h-7.5" />
  </svg>
);

const TeamIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const SuccessIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
  </svg>
);


const AboutSection = () => {
  const features = [
    {
      icon: GlobeIcon,
      title: "Global Expertise",
      description: "Founded by professionals with extensive experience, we operate in all segments of foreign trade, executing each stage of logistics with professionalism and competence on all continents.",
    },
    {
      icon: PartnershipIcon,
      title: "Strategic Partnerships",
      description: "We partner with the most traditional and competent operators on each continent, offering a wider range of services perfectly suited to the import and export policies of each country.",
    },
    {
      icon: TeamIcon,
      title: "Committed Professionals",
      description: "Our team is highly committed to quality excellence. We are constantly improving our staff through a daily training and qualification policy based on rigorous international standards.",
    },
    {
      icon: SuccessIcon,
      title: "A Legacy of Trust",
      description: "We are seen as an icon in the international trade market, achieving complete customer satisfaction and building stories of growth, trust, and success with our clients.",
    },
  ];

  return (
    <>
      <section className="relative w-full bg-gray-50/50 py-20 sm:py-24 lg:py-32 overflow-hidden">
        {/* Futuristic Background Aura */}
        <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-y-1/2 -translate-x-1/2">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-100/70 via-fuchsia-100/70 to-transparent blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold  leading-7 text-black">About Us</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Innovating Logistics, Connecting Worlds.
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Discover how GVS Cargo & Logistics leverages deep industry expertise and a global network to deliver seamless, efficient, and reliable trade solutions.
            </p>
          </div>

          {/* Feature Cards Grid - This is where the magic happens */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:mt-20 lg:grid-cols-2 lg:gap-12">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="relative p-0.5 rounded-2xl bg-gradient-to-br from-[#243670] via-[#F0DC13]  transition-all duration-300 "
              >
                <div className="relative h-full w-full bg-white/80 backdrop-blur-xl rounded-[15px] p-8 transition-all duration-300 hover:bg-white/90">
                    <div className="mb-4">
                      {/* Gradient-filled icon */}
                      <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-br from-cyan-50 to-fuchsia-100">
                        <feature.icon className="h-7 w-7 text-[#243670]" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold leading-7 text-gray-900">{feature.title}</h3>
                    <p className="mt-3 text-base leading-7 text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* You can place your other components here if they fit the flow */}
        {/* <Bounce /> */}

      </section>
<Bounce />
      {/* Your other sections can follow */}
      <Slide />
      <ColorBar />
    </>
  );
};

export default AboutSection;