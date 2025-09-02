import React, { useState } from 'react';
import i69 from "./i69.jpeg";
import i22 from "./i22.jpg";
import i3 from "./i3.avif";
import i4 from "./i4.jpg";
import logo2 from "./logo2.png"
import logo3 from "./logo3.png"
import logo33 from "./logo33.png"
import logo4 from "./logo4.png"
import logo55 from "./logo55.png"



const testimonialsData = [
  {
    name: 'Silver Star Trading',
    title: 'Supply Chain Manager',
    quote: "We’ve worked with many logistics providers over the years, but GVS cargo & logistics stands out for their precision, communication, and attention to detail. Their team’s coordination with our air freight operations has helped streamline several large-scale shipments.",
    image: logo2,
  },
  {
    name: 'Bahwan Motors Auto Accessories',
    title: 'E-commerce Founder',
    quote: 'Partnering with GVS cargo & logistics has significantly optimized our freight handling and distribution timelines. Their team is proactive, professional, and always delivers beyond expectations. It is rare to find a logistics partner that understands both speed and reliability as they do.',
    image: logo3,
  },
  {
    name: 'The BeautyCO',
    title: 'Operations Director',
    quote: 'Personalized Service and Expertise Their personalized service and expertise in international logistics are second to none. They took the time to understand our unique needs and provided tailored solutions. Their team is always available to answer our questions and provide updates, giving us peace of mind.',
    image: logo33,
  },
  {
    name: 'Silver Star Printing Material Trading LLC',
    title: 'Import/Export Specialist',
    quote: "Efficient and Transparent Logistics Solutions Their efficiency and transparency have set a new standard for us. From managing documents to on-time deliveries, they’ve ensured a smooth experience every step of the way. Their proactive approach has significantly improved our operations.",
    image: logo4,
  },
  {
    name: 'Emirates For Universal Tyres',
    title: 'Import/Export Specialist',
    quote: "GVS cargo & logistics has been instrumental in supporting our regional supply chain across the GCC. Their warehousing, last-mile delivery, and customs clearance services are efficient and trustworthy. We consider them a strategic extension of our own logistics team.",
    image: logo55,
  },
];



const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === 0 ? testimonialsData.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === testimonialsData.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <section id='testimonials' className="bg-slate-50 py-16 sm:py-2">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="max-w-xl text-center md:text-left">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900  sm:text-5xl">
              What our clients say about us
            </h2>
          </div>
          <div className="flex items-center">
          <div className="flex -space-x-4">
  <img
    className="h-12 w-12 rounded-full border-2 border-black object-contain bg-white p-1"
    src={logo33}
    alt="Client 1"
  />
  <img
    className="h-12 w-12 rounded-full border-2 border-black object-contain bg-white p-1"
    src={logo55}
    alt="Client 2"
  />
  <img
    className="h-12 w-12 rounded-full border-2 border-black object-contain bg-white p-1"
    src={logo2}
    alt="Client 3"
  />
  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-orange-500 text-sm font-semibold text-white">
    5k+
  </div>
</div>

            <div className="ml-4 text-sm">
              <p className="font-semibold text-gray-800">Trusted By</p>
              <p className="text-gray-600">Happy Customers</p>
            </div>
          </div>
        </div>

        {/* --- MODIFIED SLIDER CONTAINER --- */}
        {/* This wrapper constrains the width and centers the slider */}
        <div className="relative mx-auto mt-16 max-w-6xl">
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonialsData.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-1 items-center gap-8 bg-white shadow-lg lg:grid-cols-2 lg:gap-0">
                    {/* Image */}
                    <div className="order-last bg-white flex items-center justify-center h-full w-full lg:order-first  p-6">
  <img
    src={testimonial.image}
    alt={testimonial.name}
    className="max-h-32 w-auto object-contain lg:max-h-40"
  />
</div>

                    {/* Testimonial Text */}
                    <div className="p-8 sm:p-12">
                      <svg
                        className="h-10 w-10 text-orange-500"
                        viewBox="0 0 44 34"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M14.6433 33.9113H0.916992L11.5162 0.818359H20.4033L14.6433 33.9113ZM38.4526 33.9113H24.7262L35.3255 0.818359H44L38.4526 33.9113Z" />
                      </svg>
                      <p className="mt-6 text-lg text-gray-700">
                        "{testimonial.quote}"
                      </p>
                      <div className="mt-8">
                        <p className="font-bold text-gray-900">{testimonial.name}</p>
                        {/* <p className="text-sm text-gray-500">{testimonial.title}</p> */}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="absolute top-1/2 z-10 -translate-y-1/2 rounded-full border border-gray-300 bg-white p-2 shadow-md transition hover:bg-gray-100 hidden lg:flex lg:items-center lg:justify-center lg:left-[-60px]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute top-1/2 z-10 -translate-y-1/2 rounded-full border border-gray-300 bg-white p-2 shadow-md transition hover:bg-gray-100 hidden lg:flex lg:items-center lg:justify-center lg:right-[-60px]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Pagination Dots */}
        <div className="mt-8 flex justify-center space-x-3">
          {testimonialsData.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeIndex === index ? 'w-6 bg-orange-500' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;