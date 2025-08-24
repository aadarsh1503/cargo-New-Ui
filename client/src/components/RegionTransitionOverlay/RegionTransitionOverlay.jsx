import React from 'react';
import './RegionTransitionOverlay.css';

const RegionTransitionOverlay = ({ isVisible, regionName, regionFlag }) => {
  // We don't render anything if it's not visible to keep the DOM clean.
  if (!isVisible) return null;

  const nameChars = regionName ? regionName.split('') : [];

  return (
    // The 'visible' class will trigger all the animations.
    <div className={`transition-overlay ${isVisible ? 'visible' : ''}`}>
      {/* A new background with an animated blueprint grid */}
      <div className="blueprint-background"></div>

      {/* The main container for the content and sliding panels */}
      <div className="transition-container">
        
        {/* The content appears from behind the panels */}
        <div className="transition-content">
          <div className="flag-container">
            {regionFlag}
          </div>
          <h1 className="name-container">
            {nameChars.map((char, index) => (
              <span
                key={index}
                // Staggered animation for each character
                style={{ animationDelay: `${0.8 + index * 0.05}s` }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>
        </div>

        {/* The two main sliding panels */}
        <div className="panel panel-left"></div>
        <div className="panel panel-right"></div>

        {/* Thin accent lines for a touch of modern flair */}
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