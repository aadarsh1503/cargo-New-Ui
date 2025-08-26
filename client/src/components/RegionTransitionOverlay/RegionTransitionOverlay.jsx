import React from 'react';
import './RegionTransitionOverlay.css';

// <<< 1. Define the logo URL as a constant >>>
const logoUrl = 'https://cargo-new-ui.vercel.app/assets/GVS-Yttnar72.png';

const RegionTransitionOverlay = ({ isVisible, regionName, regionFlag }) => {
  if (!isVisible) return null;

  const nameChars = regionName ? regionName.split('') : [];

  return (
    <div className={`transition-overlay ${isVisible ? 'visible' : ''}`}>
      <div className="blueprint-background"></div>

      <div className="transition-container">
        
        <div className="transition-content">
          {/* <<< 2. Add the logo image here >>> */}
          <img 
            src={logoUrl} 
            alt="GVS Logo" 
            className="transition-logo" 
          />
          
          <div className="flag-container font-noto-serif">
            {regionFlag}
          </div>
          <h1 className="name-container text-white">
            {nameChars.map((char, index) => (
              <span
                key={index}
                style={{ animationDelay: `${0.8 + index * 0.05}s` }}
                className='font-noto-serif'
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>
        </div>

        <div className="panel panel-left"></div>
        <div className="panel panel-right"></div>
        <div className="accent-line line-top"></div>
        <div className="accent-line line-bottom"></div>
      </div>

      <div className="status-text">
        CONNECTING TO REGIONAL HUB...
      </div>
    </div>
  );
};

export default RegionTransitionOverlay;