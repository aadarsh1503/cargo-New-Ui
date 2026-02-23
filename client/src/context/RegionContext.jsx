import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiConfig';

const RegionContext = createContext();

export const RegionProvider = ({ children }) => {
  const [region, setRegion] = useState(null);
  const [content, setContent] = useState(null);
  const [availableRegions, setAvailableRegions] = useState([]);

  const [isInitializing, setIsInitializing] = useState(true);
  const [isChangingRegion, setIsChangingRegion] = useState(false);

  // This function fetches data and updates state.
  const fetchContentForRegion = async (regionCode) => {
    try {
      const response = await fetch(`${API_BASE_URL}/content/${regionCode}`);

      if (!response.ok) {
        if (regionCode !== 'bahrain') {
          return fetchContentForRegion('bahrain');
        }
        throw new Error('Fallback content (Bahrain) also not found.');
      }

      const data = await response.json();
      setContent(data);
      setRegion(data.code);
    } catch (error) {
      setContent(null);
    }
  };

  // Effect for initial load (only runs once)
  useEffect(() => {
    const initializeRegion = async () => {
      setIsInitializing(true);

      // Fetch regions in parallel with region detection
      const regionsPromise = fetch(`${API_BASE_URL}/regions`)
        .then(res => res.json())
        .then(data => setAvailableRegions(data))
        .catch(() => {});

      const sessionRegion = sessionStorage.getItem('userSelectedRegion');
      
      let regionToLoad = 'bahrain'; // Default fallback
      
      if (sessionRegion) {
        regionToLoad = sessionRegion;
      } else {
        // Detect region with timeout to prevent long waits
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
          
          const response = await fetch(`${API_BASE_URL}/detect-region`, {
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          const data = await response.json();
          regionToLoad = data.matchedRegionCode || 'bahrain';
        } catch (error) {
          // If detection fails or times out, use default
          console.log('Region detection failed or timed out, using default');
        }
      }

      // Load content and wait for regions to finish
      await Promise.all([
        fetchContentForRegion(regionToLoad),
        regionsPromise
      ]);

      setIsInitializing(false);
    };
    initializeRegion();
  }, []);

  // Function for handling user-triggered region changes (remains the same)
  const handleSetRegion = async (newRegion) => {
    if (newRegion === region) {
      return;
    }
    setIsChangingRegion(true);
    sessionStorage.setItem('userSelectedRegion', newRegion);
    const dataFetchPromise = fetchContentForRegion(newRegion);
    const timerPromise = new Promise(resolve => setTimeout(resolve, 1800));
    try {
      await Promise.all([dataFetchPromise, timerPromise]);
    } catch (error) {
      // ignore error
    } finally {
      setIsChangingRegion(false);
    }
  };

  const value = {
    region,
    setRegion: handleSetRegion,
    isInitializing,
    isChangingRegion,
    content,
    availableRegions,
  };

  return (
    <RegionContext.Provider value={value}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => useContext(RegionContext);
