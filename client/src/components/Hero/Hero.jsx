import React from 'react';
import { Link } from 'react-router-dom';
import { FaAnchor, FaShippingFast, FaPlane } from 'react-icons/fa';

import Cards from '../Cards/Cards';
import OurServices from '../OurServices/OurServices';
import Weperate from '../Weperate/Weperate';
import './Hero.css';
import Heronext from './Heronext';
import ServicesSection from './ServicesSection';
import TestimonialsSection from './TestimonialsSection';
import AchievementsSection from './AchievementsSection';

// The URL for the background image, from your desired design.
const heroBgImageUrl = 'https://www.resilio.com/images/marine-logistics_1.jpg';

const Hero = () => {
  return (
    <div>
      {/* Styles for the animated section below the hero. This ensures it works without Tailwind. */}
      <style>{`
        @keyframes float-animation {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .info-section-bg {
          background-color: #f9fafb; /* A soft, very light grey */
          background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
          background-size: 20px 20px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6rem 1.5rem;
          overflow: hidden;
        }
        
        .animated-logistics-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 1;
        }

        .floating-icon {
          position: absolute;
          color: rgba(0, 0, 0, 0.1); /* Very subtle to not be distracting */
          animation: float-animation 10s infinite ease-in-out;
        }
        
        .info-grid-container {
            max-width: 80rem; /* approx max-w-7xl */
            margin-left: auto;
            margin-right: auto;
            display: grid;
            grid-template-columns: 1fr;
            gap: 4rem;
            align-items: center;
            position: relative;
            z-index: 10;
        }
        @media (min-width: 1024px) {
            .info-grid-container {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        
        .info-text-container {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            text-align: center;
        }
        @media (min-width: 1024px) {
            .info-text-container {
                text-align: left;
            }
        }
        
        .info-heading {
            font-size: 2.25rem;
            line-height: 2.5rem;
            font-weight: 700;
            color: #1f2937; /* text-gray-800 */
        }
        
        .info-heading span {
            color: #f59e0b; /* text-amber-500 */
        }

        .info-paragraph {
            color: #4b5563; /* text-gray-600 */
            font-family: 'Roboto', sans-serif;
            font-size: 1.125rem;
            line-height: 1.75rem;
        }
        
        .info-image-wrapper {
            display: flex;
            justify-content: center;
        }
        
        .info-image-container {
          position: relative;
          width: 20rem;
          height: 20rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: float-animation 8s infinite ease-in-out;
          clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
        }
        @media (min-width: 768px) {
            .info-image-container {
                width: 24rem;
                height: 24rem;
            }
        }

        .info-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .info-contact-btn {
            background-color: #F59E0B;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
            color: white;
            font-weight: 600;
            padding: 0.75rem 2rem;
            border-radius: 9999px;
            margin-top: 1rem;
            border: none;
            cursor: pointer;
            align-self: center; /* Center button on mobile */
        }
        @media (min-width: 1024px) {
            .info-contact-btn {
                align-self: flex-start; /* Align left on desktop */
            }
        }
        .info-contact-btn:hover {
            background-color: #D97706;
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
        }
      `}</style>

      {/* === STATIC HERO SECTION (YOUR DESIRED DESIGN) === */}
      <div className="hero-container">
        <div 
          className="hero-background" 
          style={{ backgroundImage: `url(${heroBgImageUrl})` }}
        />
        <div className="hero-overlay" />
        <div className="hero-content-wrapper">
          {/* <header className="hero-header">
            <nav className="hero-nav">
              <a href="#">Home</a>
              <a href="#">About Us</a>
              <a href="#">Our Services</a>
              <a href="#">Specialist</a>
              <a href="#">Contact</a>
            </nav>
            <a href="#" className="hero-get-started-btn">Get Started</a>
          </header> */}

          <main className="hero-main mt-12">
            <div className="hero-text-content">
              <h1>Your Global<br />Shipping Partner</h1>
              <p className="hero-subtitle">Air <span className='text-DarkYellow'>»</span> Road <span className='text-DarkYellow'>»</span> Sea</p>
              <p className="hero-description ">
              Connecting the World: Your Trusted Shipping Partner by Air, Road & Sea.
              </p>
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
          
          {/* === SATISFIED CLIENTS (NEW) === */}
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
          {/* === SCROLL DOWN BUTTON (NEW) === */}
          <a href="#next-section" className="scroll-down-button" aria-label="Scroll down">
            ↓
          </a>
        </div>
      </div>

      {/* === ANIMATED INFO SECTION (CONTENT FROM YOUR OTHER FILE) === */}
      {/* <section id="next-section" className="info-section-bg">
        <div className="animated-logistics-bg">
            <FaPlane className="floating-icon" style={{ fontSize: '6rem', top: '5%', left: '5%', animationDelay: '-2s', animationDuration: '12s' }} />
            <FaAnchor className="floating-icon" style={{ fontSize: '7rem', top: '50%', right: '5%', animationDelay: '-5s', animationDuration: '18s' }} />
            <FaShippingFast className="floating-icon" style={{ fontSize: '4rem', top: '20%', right: '25%', animationDelay: '-8s', animationDuration: '10s' }} />
        </div>

        <div className="info-grid-container">
          <div className="info-text-container">
            <h2 className="info-heading">
              GVS Cargo, <br/> Perfected by <span>Experience</span>.
            </h2>
            <p className="info-paragraph">
              Founded by professionals with extensive experience, GVS Cargo & Logistics operates in all segments of foreign trade, executing each stage of the logistics process with unparalleled professionalism and competence on all continents.
            </p>
            <Link to='/contactUs'>
              <button className="info-contact-btn">
                Connect With Us
              </button>
            </Link>
          </div>
          
          <div className="info-image-wrapper">
            <div className="info-image-container">
              <img src="https://avatars.mds.yandex.net/i?id=5dd83667a01e12c7c3b4639b0b93ad77_l-5869613-images-thumbs&ref=rim&n=13&w=1280&h=800" alt="Shipping Illustration" className="info-image" />
            </div>
          </div>
        </div>
      </section> */}
      
      {/* === OTHER COMPONENTS (FROM YOUR OTHER FILE) === */}
      <Heronext />
      <ServicesSection />
      <TestimonialsSection />
      
      {/* <Cards /> */}
      <Weperate />
      <AchievementsSection />
      {/* <OurServices /> */}
    </div>
  );
};

export default Hero;