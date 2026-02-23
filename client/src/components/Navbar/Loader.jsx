import React from 'react';
import './Loader.css';

const FuturisticLoader = () => {
  return (
    <div className="loader-container">
      <div className="loader-content">
        <div className="loader-core-container">
          <div className="loader-core"></div>
          <div className="data-packet p1"></div>
          <div className="data-packet p2"></div>
          <div className="data-packet p3"></div>
          <div className="data-packet p4"></div>
        </div>
        <div className="loader-text-container">
          <span className="static-text">Loading Region...</span>
        </div>
      </div>
    </div>
  );
};

export default FuturisticLoader;