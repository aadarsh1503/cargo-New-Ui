import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageTransition from '../PageTransition/PageTransition';

const AnimatedOutlet = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      {/* 
        The key is crucial. It tells AnimatePresence that the component has changed
        when the route (location.pathname) changes.
      */}
      <div key={location.pathname}>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </div>
    </AnimatePresence>
  );
};

export default AnimatedOutlet;