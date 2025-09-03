import React, { useMemo } from 'react';
import './RegionChangeAnimator.css'; // Import the new styles

/**
 * A highly-styled overlay animation for region changes.
 * @param {object} props
 * @param {boolean} props.isActive - Controls visibility.
 * @param {string} props.regionFlag - The emoji flag of the new region.
 * @param {string} props.regionName - The name of the new region.
 * @param {string} props.logoUrl - The URL/path for the company logo.
 */
const RegionChangeAnimator = ({ isActive, regionFlag, regionName, logoUrl }) => {

  // Memoize the character array to prevent recalculating on every render
  const nameChars = useMemo(() => (regionName ? regionName.split('') : []), [regionName]);

  return (
    <div className={`transition-overlay ${isActive ? 'visible' : ''}`}>
      <div className="blueprint-background"></div>

      <div className="transition-container">
        
        <div className="transition-content">
          <img 
            src={logoUrl} 
            alt="GVS Logo" 
            className="transition-logo" 
          />
          
          <div className="flag-container">
            {regionFlag}
          </div>
          <h1 className="name-container">
            {nameChars.map((char, index) => (
              <span
                key={`${char}-${index}`}
                style={{ animationDelay: `${0.8 + index * 0.05}s` }}
              >
                {/* Render a non-breaking space for actual spaces */}
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

export default RegionChangeAnimator;