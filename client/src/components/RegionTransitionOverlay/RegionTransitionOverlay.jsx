import React from 'react';

const logoUrl = 'https://cargo-new-ui.vercel.app/assets/GVS-Yttnar72.png';

const RegionTransitionOverlay = ({ isVisible, regionName, regionFlag }) => {
  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(36, 54, 112, 0.95)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      color: 'white'
    }}>
      <img 
        src={logoUrl} 
        alt="GVS Logo" 
        style={{ maxWidth: '150px', marginBottom: '30px' }}
      />
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>
        {regionFlag}
      </div>
      <h1 style={{ fontSize: '36px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px' }}>
        {regionName}
      </h1>
    </div>
  );
};

export default RegionTransitionOverlay;