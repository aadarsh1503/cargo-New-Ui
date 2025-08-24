import React, { useState } from 'react';

const testimonialsData = [
  {
    name: 'Jane David',
    title: 'Supply Chain Manager',
    quote: "We've been working with this logistics company for over five years, and their service has been nothing short of exceptional. They consistently deliver our shipments on time, even under tight deadlines and complex routing.",
    image: 'https://t3.ftcdn.net/jpg/03/02/88/46/360_F_302884605_actpipOdPOQHDTnFtp4zg4RtlWzhOASp.jpg',
  },
  {
    name: 'John Smith',
    title: 'E-commerce Founder',
    quote: 'Their e-commerce logistics solutions have been a game-changer for our online store. Order fulfillment is faster, and our customers are happier. Highly recommend their services for any growing business.',
    image: 'https://img.huffingtonpost.com/asset/5925abd12000004700cb26e8.jpeg?ops=1200_630',
  },
  {
    name: 'Sarah Lee',
    title: 'Operations Director',
    quote: 'The level of professionalism and the detailed supply chain management they provide is top-notch. They helped us optimize our entire process, saving us time and money. A truly reliable partner.',
    image: 'https://static.toiimg.com/photo/116819151.cms',
  },
  {
    name: 'Michael Chen',
    title: 'Import/Export Specialist',
    quote: "Navigating international freight and customs can be a nightmare, but this team makes it seamless. Their expertise in both sea and air freight is evident in their efficient and secure handling of our goods.",
    image: 'https://miro.medium.com/v2/resize:fit:1358/0*1m5pOg8s3rt4hYI_',
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
              <img className="h-12 w-12 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40" alt="Client 1" />
              <img className="h-12 w-12 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40" alt="Client 2" />
              <img className="h-12 w-12 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=40" alt="Client 3" />
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
                    <div className="order-last h-full w-full lg:order-first">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="h-full w-full object-cover lg:rounded-l-2xl"
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
                        <p className="text-sm text-gray-500">{testimonial.title}</p>
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