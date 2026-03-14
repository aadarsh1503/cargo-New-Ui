import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiConfig';
import { startKeepAlive } from '../services/keepAlive';

const RegionContext = createContext();

export const RegionProvider = ({ children }) => {
  const [region, setRegion] = useState(null);
  const [content, setContent] = useState(null);
  const [availableRegions, setAvailableRegions] = useState([]);

  const [isInitializing, setIsInitializing] = useState(true);
  const [isChangingRegion, setIsChangingRegion] = useState(false);

  // This function fetches data and updates state.
  const fetchContentForRegion = async (regionCode) => {
    let attempts = 0;
    const maxAttempts = 3; // Increased to 3 attempts
    
    while (attempts < maxAttempts) {
      attempts++;
      try {
        const controller = new AbortController();
        // Progressive timeout: 15s, 20s, 25s for cold starts
        const timeout = 15000 + (attempts * 5000);
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        console.log(`🔄 Content fetch attempt ${attempts}/${maxAttempts} (timeout: ${timeout}ms)`);
        
        const response = await fetch(`${API_BASE_URL}/content/${regionCode}`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          if (regionCode !== 'bahrain') {
            console.log(`⚠️  Content not found for ${regionCode}, falling back to bahrain`);
            return fetchContentForRegion('bahrain');
          }
          throw new Error('Fallback content (Bahrain) also not found.');
        }

        const data = await response.json();
        setContent(data);
        setRegion(data.code);
        console.log(`✅ Content loaded successfully on attempt ${attempts}`);
        return; // Success, exit
      } catch (error) {
        if (attempts < maxAttempts) {
          console.log(`⚠️  Content fetch attempt ${attempts} failed, retrying in 2s...`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
        } else {
          console.error(`❌ Error fetching content for ${regionCode} after ${attempts} attempts:`, error.message);
          if (regionCode !== 'bahrain') {
            console.log(`⚠️  Falling back to bahrain due to error`);
            return fetchContentForRegion('bahrain');
          }
          setContent(null);
        }
      }
    }
  };

  // Effect for initial load (only runs once)
  useEffect(() => {
    const initializeRegion = async () => {
      const startTime = Date.now();
      console.log('🚀 Frontend: Starting region initialization...');
      setIsInitializing(true);

      // Fetch regions with retry logic for cold starts
      const regionsStartTime = Date.now();
      const fetchRegionsWithRetry = async () => {
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
          attempts++;
          try {
            const controller = new AbortController();
            const timeout = 15000 + (attempts * 10000); // 15s, 25s, 35s
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            console.log(`🔄 Regions fetch attempt ${attempts}/${maxAttempts} (timeout: ${timeout}ms)`);
            
            const res = await fetch(`${API_BASE_URL}/regions`, {
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            console.log(`⏱️  Frontend: Regions API responded in ${Date.now() - regionsStartTime}ms`);
            
            const data = await res.json();
            setAvailableRegions(data);
            console.log(`✅ Frontend: Regions loaded (${data.length} regions)`);
            return;
          } catch (err) {
            if (attempts < maxAttempts) {
              console.log(`⚠️  Regions fetch attempt ${attempts} failed, retrying in 2s...`);
              await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
              console.log(`❌ Frontend: Regions fetch failed after ${attempts} attempts:`, err.message);
            }
          }
        }
      };
      
      const regionsPromise = fetchRegionsWithRetry();

      const sessionRegion = sessionStorage.getItem('userSelectedRegion');
      
      let regionToLoad = 'bahrain'; // Default fallback
      
      if (sessionRegion) {
        console.log(`✅ Frontend: Using cached region from session: ${sessionRegion}`);
        regionToLoad = sessionRegion;
      } else {
        // Detect region with timeout and retry logic
        const detectionStartTime = Date.now();
        console.log('🔍 Frontend: Starting region detection...');
        
        let detectionSuccess = false;
        let attempts = 0;
        const maxAttempts = 3; // Increased to 3 attempts
        
        while (!detectionSuccess && attempts < maxAttempts) {
          attempts++;
          try {
            const controller = new AbortController();
            // Progressive timeout: 15s, 20s, 25s for cold starts
            const timeout = 15000 + (attempts * 5000);
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            console.log(`🔄 Region detection attempt ${attempts}/${maxAttempts} (timeout: ${timeout}ms)`);
            
            const response = await fetch(`${API_BASE_URL}/detect-region`, {
              signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            console.log(`⏱️  Frontend: Region detection API responded in ${Date.now() - detectionStartTime}ms`);
            
            const data = await response.json();
            regionToLoad = data.matchedRegionCode || 'bahrain';
            console.log(`✅ Frontend: Detected region: ${regionToLoad} (attempt ${attempts})`);
            detectionSuccess = true;
          } catch (error) {
            if (attempts < maxAttempts) {
              console.log(`⚠️  Region detection attempt ${attempts} failed, retrying in 2s...`);
              await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
            } else {
              console.log(`⚠️  Frontend: Region detection failed after ${attempts} attempts, using default`);
            }
          }
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
      
      // Start keep-alive service to prevent backend cold starts
      startKeepAlive();
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
