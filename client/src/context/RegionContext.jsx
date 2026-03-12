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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${API_BASE_URL}/content/${regionCode}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

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
      if (regionCode !== 'bahrain') {
        return fetchContentForRegion('bahrain');
      }
      setContent(null);
    }
  };

  // Effect for initial load (only runs once)
  useEffect(() => {
    const initializeRegion = async () => {
      const startTime = Date.now();
      console.log('🚀 Frontend: Starting region initialization...');
      setIsInitializing(true);

      // Fetch regions in parallel with region detection
      const regionsStartTime = Date.now();
      const regionsPromise = fetch(`${API_BASE_URL}/regions`)
        .then(res => {
          console.log(`⏱️  Frontend: Regions API responded in ${Date.now() - regionsStartTime}ms`);
          return res.json();
        })
        .then(data => {
          setAvailableRegions(data);
          console.log(`✅ Frontend: Regions loaded (${data.length} regions)`);
        })
        .catch((err) => {
          console.log(`❌ Frontend: Regions fetch failed:`, err.message);
        });

      const sessionRegion = sessionStorage.getItem('userSelectedRegion');
      
      let regionToLoad = 'bahrain'; // Default fallback
      
      if (sessionRegion) {
        console.log(`✅ Frontend: Using cached region from session: ${sessionRegion}`);
        regionToLoad = sessionRegion;
      } else {
        // Detect region with timeout to prevent long waits
        const detectionStartTime = Date.now();
        console.log('🔍 Frontend: Starting region detection...');
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
          
          const response = await fetch(`${API_BASE_URL}/detect-region`, {
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          console.log(`⏱️  Frontend: Region detection API responded in ${Date.now() - detectionStartTime}ms`);
          
          const data = await response.json();
          regionToLoad = data.matchedRegionCode || 'bahrain';
          console.log(`✅ Frontend: Detected region: ${regionToLoad}`);
        } catch (error) {
          // If detection fails or times out, use default
          console.log(`⚠️  Frontend: Region detection failed/timeout after ${Date.now() - detectionStartTime}ms, using default`);
        }
      }

      // Load content and wait for regions to finish
      const contentStartTime = Date.now();
      console.log(`🔍 Frontend: Fetching content for region: ${regionToLoad}...`);
      
      await Promise.all([
        fetchContentForRegion(regionToLoad).then(() => {
          console.log(`⏱️  Frontend: Content loaded in ${Date.now() - contentStartTime}ms`);
        }),
        regionsPromise
      ]);

      setIsInitializing(false);
      console.log(`✅ Frontend: TOTAL INITIALIZATION TIME: ${Date.now() - startTime}ms`);
      console.log('🎉 Frontend: Region initialization complete!\n');
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
