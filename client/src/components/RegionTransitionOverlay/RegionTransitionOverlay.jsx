import React from 'react';
import './RegionTransitionOverlay.css';

const RegionTransitionOverlay = ({ isVisible, regionName, regionFlag }) => {
  if (!isVisible) return null;

  const nameChars = regionName ? regionName.split('') : [];

  return (
    <div className={`transition-overlay ${isVisible ? 'visible' : ''}`}>
      <div className="map-background"></div>
      
      {/* The main container element that will hold the doors and content */}
      <div className="cargo-container">
        
        {/* The content that appears inside the container */}
        <div className="container-content">
          <div className="flag-container">
            {regionFlag}
          </div>
          <h1 className="name-container">
            {nameChars.map((char, index) => (
              <span 
                key={index} 
                style={{ animationDelay: `${0.8 + index * 0.05}s` }} 
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>
        </div>

        {/* The two doors of the container */}
        <div className="container-door door-left"></div>
        <div className="container-door door-right"></div>
      </div>
        
      <div className="status-text">
        LOADING REGIONAL HUB...
      </div>
    </div>
  );
};

export default RegionTransitionOverlay;