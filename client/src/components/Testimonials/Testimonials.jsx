import React, { useState } from 'react';
import Bounce from '../Bounce/Bounce';
import Slide from '../Slide/Slide';
import ColorBar from '../Colorbar/Colorbar';
import i69 from "./i69.jpg";
import i2 from "./i2.jpg";
import i3 from "./i3.avif";
import i4 from "./i4.jpg";
import Slide1 from '../Slide1/Slide1';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Jose Rizal",
      text: "Reliable and Efficient Partner Their team was incredibly responsive and efficient. They handled our complex international shipment with ease, ensuring timely delivery to our clients. We're impressed with their commitment to customer satisfaction and their ability to navigate global logistics challenges",
      address: "Cebu City, Cebu",
      image: i3,
    },
    {
      id: 2,
      name: "Rohan Verma",
      text: "Seamless Global Shipping We've been using their services for years, and they consistently exceed our expectations. Their seamless global shipping solutions have streamlined our supply chain and reduced costs. We highly recommend them to businesses of all sizes",
      address: "Bangalore, Karnataka",
      image: i2,
    },
    {
      id: 3,
      name: "Abdul-Raouf",
      text: "Personalized Service and Expertise Their personalized service and expertise in international logistics are second to none. They took the time to understand our unique needs and provided tailored solutions. Their team is always available to answer our questions and provide updates, giving us peace of mind",
      address: "Dubai Marina, Dubai",
      image: i69,
    },
    {
      id: 4,
      name: "Ali Al-Fahim",
      text: "Efficient and Transparent Logistics Solutions Their efficiency and transparency have set a new standard for us. From managing documents to on-time deliveries, they’ve ensured a smooth experience every step of the way. Their proactive approach has significantly improved our operations.",
      address: "Al Rayyan, Qatar",
      image: i4,
    },
  ];

  const [current, setCurrent] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState(null); // Track expanded testimonial

  const handleNext = () => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  const reorderedTestimonials = [
    testimonials[(current + 0) % testimonials.length],
    testimonials[(current + 1) % testimonials.length],
    testimonials[(current + 2) % testimonials.length],
  ];

  const truncateText = (text, lines) => {
    const maxChars = lines * 50; // Approximate character count for 3 lines
    return text.length > maxChars ? text.substring(0, maxChars) + "..." : text;
  };

  return (
    <div className=" space-y-8 ">
      <div className="lg:text-3xl mt-9 -mb-9 text-2xl ml-4 text-lightblue text-center font-bold  ">
        OUR TESTIMONIALS
      </div>

      {/* Desktop View */}
      <div className="hidden lg:flex justify-center items-center">
        {/* Left Arrow */}
        <button
          onClick={handlePrev}
          className="text-gray-600 hover:text-gray-800 p-4 bg-gray-200 rounded-full focus:outline-none mx-4"
        >
          &#8592;
        </button>

        <div className="flex items-center gap-12 mt-32">
          {reorderedTestimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`relative transition-all duration-1000 ease-in-out flex flex-col items-center bg-white shadow-md p-6 rounded-lg
                ${index === 1
                  ? "scale-110 opacity-100 h-[456px] w-72 transform shadow-xl transition-transform"
                  : "scale-90 opacity-60 w-72 transform transition-transform"}`}
            >
              <div
                className={`absolute -top-10 flex justify-center items-center w-24 h-24 rounded-md overflow-hidden border-4 ${index === 1 ? "border-DarkBlue" : "border-gray-200"}`}
              >
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className={`object-cover w-full h-full ${index === 1 ? "scale-110" : "scale-100"}`}
                />
              </div>
              <div className="text-5xl text-DarkYellow mt-4 lg:mt-10 ml-0 lg:-ml-56">“</div>
              <p className="text-DarkBlue font-bold mb-1">{testimonial.name}</p>
              <p className="text-gray-600 max-w-7xl text-center">
                {index === 1 ? testimonial.text : truncateText(testimonial.text, 3)}
              </p>
              <p className="text-gray-500 mt-2">{testimonial.address}</p>
              <div className="text-5xl text-DarkYellow ml-0 lg:ml-56 mt-2">”</div>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={handleNext}
          className="text-gray-600 hover:text-gray-800 p-4 bg-gray-200 rounded-full focus:outline-none mx-4"
        >
          &#8594;
        </button>
      </div>

      {/* Mobile View */}
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-8 lg:hidden mt-10 px-4">
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            className="flex flex-col items-center bg-white shadow-md p-6 rounded-lg"
          >
            <div
              className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 mb-4"
            >
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="text-lightblue font-bold mb-1">{testimonial.name}</div>
            <p className="text-gray-500 mt-2">{testimonial.address}</p>
            
            <p className="text-gray-600 max-w-7xl text-center">
              {expandedIndex === index ? testimonial.text : truncateText(testimonial.text, 3)}
            </p>

            <div className="flex justify-center space-x-2 mt-4">
              <button
                className={`h-2 w-2 rounded-full ${expandedIndex === index ? 'bg-lightblue' : 'bg-gray-300'}`}
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)} // Toggle expanded state
              ></button>
            </div>
          </div>
        ))}
      </div>

    <Bounce />
    <Slide />
    <ColorBar />

    </div>
  );
};

export default Testimonials;
