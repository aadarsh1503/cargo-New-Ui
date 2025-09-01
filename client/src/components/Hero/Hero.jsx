// src/components/Hero/Hero.js

import React, { useState, useEffect, useCallback, useRef } from 'react';

// Other component imports remain unchanged...
import Heronext from './Heronext';
import ServicesSection from './ServicesSection';
import TestimonialsSection from './TestimonialsSection';
import Weperate from '../Weperate/Weperate';
import AchievementsSection from './AchievementsSection';

import './Hero.css';

// SLIDES data remains the same...
const SLIDES = [
  {
    image: 'https://www.resilio.com/images/marine-logistics_1.jpg',
    title: <>Your Global<br />Shipping Partner</>,
    subtitle: 'Air » Road » Sea',
    description: 'Connecting the World: Your Trusted Shipping Partner by Air, Road & Sea.',
  },
  // {
  //   image: 'https://rykalogistics.com/content/media/2023/12/Air-transport-web-low.jpg',
  //   title: <>Air Freight<br />Excellence</>,
  //   subtitle: 'Speed » Precision » Reliability',
  //   description: 'Delivering your cargo at the speed of flight with unparalleled precision and care.',
  // },
  // {
  //   image: 'https://beehiiv-images-production.s3.amazonaws.com/uploads/asset/file/c139e571-9cc8-4c8a-a6ac-80c358b56e3f/International_Container_Cargo_Ship_Deliver_Freight_Shipment_Across_The_Ocean_original_2798000.jpg?t=1744528318',
  //   title: <>Ocean Voyage<br />Solutions</>,
  //   subtitle: 'Vast » Economical » Secure',
  //   description: 'Navigate the global market with our comprehensive and cost-effective sea freight services.',
  // },
  // {
  //   image: 'https://i.ytimg.com/vi/WK84ag8o6rI/maxresdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGEMgVShlMA8=&rs=AOn4CLCM_3_yzLbCFFQx-XOqQfWNsYvOPA',
  //   title: <>Ground Logistics<br />Network</>,
  //   subtitle: 'Efficient » Direct » On-Time',
  //   description: 'Our extensive road network ensures your goods arrive on schedule, every time.',
  // },
];

// SlideContent component remains the same...
const SlideContent = ({ title, subtitle, description }) => (
    <div className="hero-content-wrapper">
      <main className="hero-main">
        <div className="hero-text-content mt-16">
          <h1>{title}</h1>
          <p className="hero-subtitle">{subtitle}</p>
          <p className="hero-description">{description}</p>
          <div className="hero-buttons">
            <a href='/ContactUs'>
              <button className="hero-quote-btn">Get A Quote</button>
            </a>
            <a href='/whoWeAre'>
              <button className="hero-learn-more-btn outline outline-white">Learn More</button>
            </a>
          </div>
        </div>
      </main>
      <a href='#testimonials'>
      <div className="satisfied-clients-container">
        <div className="client-avatars">
          <img src="https://i.pravatar.cc/50?img=1" alt="Client 1" className="client-avatar" />
          <img src="https://i.pravatar.cc/50?img=3" alt="Client 2" className="client-avatar" />
          <img src="https://i.pravatar.cc/50?img=5" alt="Client 3" className="client-avatar" />
        </div>
        <p className="clients-text">1.5k+ Satisfied Clients</p>
      </div>
      </a>
      <a href="#next-section" className="scroll-down-button" aria-label="Scroll down">↓</a>
    </div>
);


const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(null); 
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const timerRef = useRef(null);
  // CHANGE THIS VALUE: Update the total duration to match the new CSS
  const TRANSITION_DURATION = 1600; // Was 1200, now 1600ms (0.8s + 0.8s)

  const goToSlide = useCallback((index) => {
    if (isTransitioning || index === currentIndex) return;

    setNextIndex(index);
    setIsTransitioning(true);

    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
      setNextIndex(null);
    }, TRANSITION_DURATION);
  }, [isTransitioning, currentIndex]);

  const handleNext = useCallback(() => {
    const newIndex = (currentIndex + 1) % SLIDES.length;
    goToSlide(newIndex);
  }, [currentIndex, goToSlide]);
  
  useEffect(() => {
    if (timerRef.current) {
        clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(handleNext, 5000);
    return () => clearInterval(timerRef.current);
  }, [handleNext]);

  const upcomingIndex = nextIndex !== null ? nextIndex : (currentIndex + 1) % SLIDES.length;

  return (
    <>
      <div id="home" className={`hero-carousel ${isTransitioning ? 'is-transitioning' : ''}`}>
        <div
          className="transition-overlay"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${SLIDES[upcomingIndex].image})`,
          }}
        />

        {SLIDES.map((slide, index) => {
          let positionClass = '';
          if (index === currentIndex) {
            positionClass = 'slide--active';
          } else if (index === nextIndex) {
            positionClass = 'slide--next';
          }

          return (
            <div key={index} className={`slide ${positionClass}`}>
              <div
                className="hero-background"
                style={{ backgroundImage: `url(${slide.image})` }}
              />
              <div className="hero-overlay" />
              <SlideContent
                title={slide.title}
                subtitle={slide.subtitle}
                description={slide.description}
              />
            </div>
          );
        })}

        {/* <div className="carousel-dots">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              className={`dot ${currentIndex === index ? 'dot--active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div> */}
      </div>
      
      {/* The rest of your page content remains below the hero carousel */}
      <div id="next-section">
          <Heronext />
      </div>
      <ServicesSection />
      <TestimonialsSection />
      <Weperate />
      <AchievementsSection />
    </>
  );
};

export default Hero;