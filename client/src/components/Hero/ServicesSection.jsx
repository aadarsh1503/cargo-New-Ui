import React from 'react';

// Data for the service cards - no changes here
const servicesData = [
  {
    title: 'Sea & Air Freight',
    description: 'Fast, Secure, And Dependable Transportation Options.',
    imageUrl: 'https://www.trade.gov/sites/default/files/2020-04/EC%20Ship%20with%20Plane%20Resized%20%28Small%29_0.jpg',
  },
  {
    title: 'Warehousing & Distribution',
    description: 'Flexible Storage With Quick Delivery.',
    imageUrl: 'https://i.ytimg.com/vi/6qkmFDmaWF0/maxresdefault.jpg',
  },
  {
    title: 'Supply Chain Management',
    description: 'End-To-End Solutions Customized To Your Needs.',
    imageUrl: 'https://imageio.forbes.com/specials-images/imageserve/5e14b0110bf81b0006245b80/0x0.jpg?format=jpg&amp;crop=5999,3375,x0,y0,safe&amp;height=600&amp;width=1200&amp;fit=bounds',
  },
  {
    title: 'E-Commerce Logistics',
    description: 'Speedy Delivery For Your Online Store.',
    imageUrl: 'https://rockwellautomation.scene7.com/is/image/rockwellautomation/cargo-container-boxes-earth-globe-SHS-506790466.4800.jpg',
  },
];

// Reusable ServiceCard component - no changes here
const ServiceCard = ({ title, description, imageUrl }) => (
  <div className="relative h-full overflow-hidden rounded-2xl shadow-lg">
    <img src={imageUrl} alt={title} className="absolute inset-0 h-full w-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
    <div className="relative flex h-full min-h-[280px] flex-col justify-end p-6 text-white">
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="mt-1 text-sm text-gray-200">{description}</p>
    </div>
  </div>
);


// --- MODIFIED SECTION ---
const ServicesSection = () => {
  return (
    <section className="bg-gray-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-800 ">
            Fast, Reliable, and
            <br />
            Secure Transportation Services
          </h2>
        </div>

        {/* 
          Services Grid - Updated to a 5-column grid for asymmetrical layout.
          - On mobile (small screens), it's a single column (`grid-cols-1`).
          - On medium screens and up (`md:`), it becomes a 5-column grid.
        */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-5">
          
          {/* Row 1 */}
          <div className="md:col-span-3"> {/* This card spans 3 of the 5 columns */}
            <ServiceCard 
              title={servicesData[0].title} 
              description={servicesData[0].description} 
              imageUrl={servicesData[0].imageUrl} 
            />
          </div>
          <div className="md:col-span-2"> {/* This card spans the remaining 2 columns */}
            <ServiceCard 
              title={servicesData[1].title} 
              description={servicesData[1].description} 
              imageUrl={servicesData[1].imageUrl} 
            />
          </div>

          {/* Row 2 */}
          <div className="md:col-span-2"> {/* This card spans 2 of the 5 columns */}
            <ServiceCard 
              title={servicesData[2].title} 
              description={servicesData[2].description} 
              imageUrl={servicesData[2].imageUrl} 
            />
          </div>
          <div className="md:col-span-3"> {/* This card spans the remaining 3 columns */}
            <ServiceCard 
              title={servicesData[3].title} 
              description={servicesData[3].description} 
              imageUrl={servicesData[3].imageUrl} 
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default ServicesSection;