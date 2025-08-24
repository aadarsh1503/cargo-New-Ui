import React, { useState, useEffect, useRef } from 'react';
import { FaLinkedin, FaInstagram, FaFacebook, FaChevronDown, FaEnvelope, FaMapMarkerAlt, FaPhoneAlt, FaUserCog, FaBullhorn, FaBriefcase, FaArrowRight } from 'react-icons/fa';
import g4 from './g4.png';
import white from './white.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { useRegion } from '../../context/RegionContext';

const Footer = () => {
  const { content, isLoading } = useRegion();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);


  useEffect(() => {
  
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

   
    const handleScroll = () => {
     
      if (isOpen) {
        setIsOpen(false);
      }
    };

  
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll);

 
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen]); 
  const Wave = () => (
    <div className="bg-[#203064] mt-0 lg:-mt-24">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 150">
        <path 
          fill="#243670" 
          fillOpacity="1" 
          d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,85.3C672,75,768,85,864,96C960,107,1056,117,1152,106.7C1248,96,1344,64,1392,48L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
      </svg>
    </div>
  );
  const handleSubscribe = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setMessage('Please enter a valid email address.');
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('email', email);
      formData.append('list', 'I763763SovbXrHJQHGuQ9EYMDw');
      formData.append('subform', 'yes');
      formData.append('hp', '');

      await fetch('https://send.alzyara.com/subscribe', {
        method: 'POST', body: formData, mode: 'no-cors'
      });
      setMessage('Thank you! Your subscription is confirmed.');
      setEmail('');
      setTimeout(() => setMessage(''), 4000);
    } catch (error) {
      console.error('Error:', error);
      setMessage('Subscription failed. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !content) {
    return (
      <footer className="bg-DarkBlue text-gray-200 py-8">
        <div className="container mx-auto text-center">
          <p>© {new Date().getFullYear()} GVS Cargo & Logistics. All Rights Reserved.</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-DarkBlue text-gray-200 relative overflow-hidden">
        {/* Animated Background Layer */}
        <div 
            className="absolute inset-0 bg-DarkBlue animate-shimmer"
            style={{ backgroundSize: '200% 200%' }}
        ></div>

        {/* Relative container for all content to sit above the background */}
        <div className="relative z-10">
        
            {/* --- ZONE 1: FUTURISTIC NEWSLETTER CTA --- */}
            <div className="pt-20 pb-28" style={{ clipPath: '', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                <div className="container mx-auto max-w-4xl text-center px-4">
                    <h2 className="text-3xl lg:text-5xl font-bold text-white tracking-tight drop-shadow-lg">
                        Stay Ahead of the Curve
                    </h2>
                    <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
                        Get exclusive logistics insights, tech updates, and market trends delivered to your inbox.
                    </p>
                    
                    <div className="mt-10 max-w-lg mx-auto p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl">
                        <form onSubmit={handleSubscribe} className="flex items-center">
                            <input 
                                type="email" 
                                placeholder="Enter your email to join" 
                                className="flex-grow w-full bg-transparent text-white placeholder-gray-400 px-5 py-3 rounded--full focus:outline-none transition-all"
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                            <button 
                                type="submit" 
                                className="flex-shrink-0 bg-DarkYellow text-DarkBlue font-bold p-3 rounded-full hover:bg-yellow-400 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-DarkYellow/50" 
                                disabled={loading}
                            >
                                {loading ? ( <div className="w-6 h-6 border-2 border-DarkBlue border-t-transparent rounded-full animate-spin"></div> ) : ( <FaArrowRight className="text-2xl"/> )}
                            </button>
                        </form>
                    </div>
                    {message && <p className="mt-4 text-sm text-yellow-300">{message}</p>}
                </div>
            </div>
<Wave />
            {/* --- ZONE 2: MAIN FOOTER CONTENT --- */}
            <div className="container mx-auto px-4 pb-8 mt-1">
                <div className="flex flex-col lg:flex-row max-w-7xl justify-between items-center lg:items-start text-center lg:text-left mx-auto">

                    {/* Left Section: Logo & Social */}
                    <div className="flex flex-col items-center lg:-mt-10 mt-0 lg:items-start mb- lg:mb-0">
                        <img src={white} alt="GVS Cargo & Logistics" className="h-56 lg:-mb-8 mb-0 rounded-xl w-56" />
                        <div className="flex space-x-6 mt-0 lg:mt-4 lg:mb-0 mb-6">
                            <a href={content.social_linkedin} target="_blank" rel="noopener noreferrer" className="bg-white p-2 rounded-full transition-transform hover:scale-110"><FaLinkedin className="text-DarkBlue text-3xl" /></a>
                            <a href={content.social_instagram} target="_blank" rel="noopener noreferrer" className="bg-white p-2 rounded-full transition-transform hover:scale-110"><FaInstagram className="text-DarkBlue text-3xl" /></a>
                            <a href={content.social_facebook} target="_blank" rel="noopener noreferrer" className="bg-white p-2 rounded-full transition-transform hover:scale-110"><FaFacebook className="text-DarkBlue text-3xl" /></a>
                            <a href={content.social_twitter} target="_blank" rel="noopener noreferrer" className="bg-white p-2 rounded-full transition-transform hover:scale-110"><FontAwesomeIcon icon={faXTwitter} className="text-DarkBlue text-3xl" /></a>
                        </div>
                    </div>

                    {/* Middle Section: Get in Touch */}
                    <div className="flex flex-col items-center lg:items-start space-y-4 mb-8 lg:mb-0">
                        <h2 className="text-2xl font-semibold outline rounded-md outline-white p-2">Get in Touch</h2>
                        <div className="flex flex-col space-y-6 mt-6 items-center lg:items-start">
                            <div className="flex items-start space-x-4"><FaMapMarkerAlt className="text-white mt-1" /><div>{content.address && content.address.map((line, index) => (<React.Fragment key={index}>{line}{index < content.address.length - 1 && <br />}</React.Fragment>))}</div></div>
                            <div className="flex items-start space-x-4"><FaPhoneAlt className="text-white mt-1" /><a href={`tel:${content.phone}`} className="hover:underline">{content.phone}</a></div>
                            <div ref={dropdownRef} className="relative">
                                <button onClick={toggleDropdown} className="flex items-center space-x-3 hover:underline focus:outline-none"><FaEnvelope className="text-white" /><span>Email</span><FaChevronDown className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} /></button>
                                <div className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0 w-64 bg-white text-DarkBlue rounded-lg shadow-2xl z-20 overflow-hidden transform transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`} style={{ transformOrigin: 'top center' }}>
                                    <ul className="p-2 space-y-1">
                                        {content.email_customer_care && <li><a href={`mailto:${content.email_customer_care}`} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition-colors"><FaUserCog className="text-lg text-DarkBlue/80" /><span>Customer Care</span></a></li>}
                                        {content.email_sales && <li><a href={`mailto:${content.email_sales}`} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition-colors"><FaBullhorn className="text-lg text-DarkBlue/80" /><span>Sales Team</span></a></li>}
                                        {content.email_business && <li><a href={`mailto:${content.email_business}`} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition-colors"><FaBriefcase className="text-lg text-DarkBlue/80" /><span>Business Enquiries</span></a></li>}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Section: Developer Credit */}
                    <div className="flex flex-col items-center">
                        <p className="text-sm mb-2">Developed and monitored by:</p>
                        <a href="https://gvs-bh.com/" target="_blank" rel="noopener noreferrer"><img src={g4} alt="GVS IT Division" className="h-32 w-46 rounded-xl lg:w-38" /></a>
                    </div>
                </div>
            </div>
            
            {/* --- ZONE 3: FINAL CREDITS --- */}
            <div className="container mx-auto border-t border-gray-600/50 mt-4 py-6 text-center text-sm text-gray-400">
                <p>© {new Date().getFullYear()} GVS Cargo & Logistics. All Rights Reserved.</p>
            </div>
        </div>
    </footer>
  );
};

export default Footer;