import React from 'react';
import './RegionChangeAnimator.css';

const RegionChangeAnimator = ({ isActive, regionFlag, regionName, logoUrl }) => {
  if (!isActive) return null;

  return (
    <div className={`transition-overlay ${isActive ? 'visible' : ''}`}>
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
            {regionName}
          </h1>
        </div>
      </div>
    </div>
  );
};

export default RegionChangeAnimator;