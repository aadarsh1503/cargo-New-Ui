import React from 'react';

// Data for the stat blocks to keep the JSX clean
const statsData = [
  {
    stat: '2 Million',
    title: 'Deliveries Completed Annually',
    description: 'We successfully manage and deliver over 2 million shipments around the world each year, ensuring reliability and efficiency at every step.',
  },
  {
    stat: '98%',
    title: 'Customer Satisfaction Rate',
    description: 'Our commitment to quality and service has resulted in a 98% customer satisfaction rate, reflecting our dedication to excellence.',
  },
  {
    stat: '150+',
    title: 'Global Partners & Networks',
    description: 'With a vast network of over 150 partners worldwide, we ensure seamless logistics solutions across continents and borders.',
  },
];

const AchievementsSection = () => {
  return (
    // Outer section for spacing
    <div className="p-4 sm:p-8">
      {/* Main container with the specified background color and rounded corners */}
      <div
        className="rounded-2xl text-white"
        style={{ backgroundColor: '#0B375A' }}
      >
        {/* Grid layout for the 4 content blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* 1. Define Our Achievement (Top-Left) */}
          <div className="p-8 md:p-12 border-b border-r border-white/10">
            <h3 className="text-2xl font-bold">
              Define Our Achievement
            </h3>
            <p className="mt-3 text-sm text-blue-200">
              Fast, secure, and dependable transportation options tailored to meet the unique needs of each client, regardless of size or destination.
            </p>
          </div>

          {/* 2. Deliveries Completed (Top-Right) */}
          <div className="p-8 md:p-12 border-b border-white/10">
            <p className="text-5xl lg:text-6xl font-bold">{statsData[0].stat}</p>
            <h4 className="mt-3 text-lg font-semibold">{statsData[0].title}</h4>
            <p className="mt-3 text-sm text-blue-200">{statsData[0].description}</p>
          </div>

          {/* 3. Customer Satisfaction (Bottom-Left) */}
          <div className="p-8 md:p-12 border-r border-white/10">
            <p className="text-5xl lg:text-6xl font-bold">{statsData[1].stat}</p>
            <h4 className="mt-3 text-lg font-semibold">{statsData[1].title}</h4>
            <p className="mt-3 text-sm text-blue-200">{statsData[1].description}</p>
          </div>

          {/* 4. Global Partners (Bottom-Right) */}
          <div className="p-8 md:p-12">
            <p className="text-5xl lg:text-6xl font-bold">{statsData[2].stat}</p>
            <h4 className="mt-3 text-lg font-semibold">{statsData[2].title}</h4>
            <p className="mt-3 text-sm text-blue-200">{statsData[2].description}</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AchievementsSection;