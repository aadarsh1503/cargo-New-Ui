import React, { createContext, useState, useContext, useEffect } from 'react';

const RegionContext = createContext();
const API_URL = 'https://gvs-cargo-dynamic.onrender.com/api';

export const RegionProvider = ({ children }) => {
  const [region, setRegion] = useState(null);
  const [content, setContent] = useState(null);
  const [availableRegions, setAvailableRegions] = useState([]);

  // --- KEY CHANGE: Two separate loading states ---
  const [isInitializing, setIsInitializing] = useState(true); // For the very first page load
  const [isChangingRegion, setIsChangingRegion] = useState(false); // For subsequent region switches

  // This function fetches data and updates state.
  const fetchContentForRegion = async (regionCode) => {
    try {
      const response = await fetch(`${API_URL}/content/${regionCode}`);
      if (!response.ok) {
        console.warn(`Content for '${regionCode}' not found. Falling back to Bahrain.`);
        if (regionCode !== 'bahrain') {
          return fetchContentForRegion('bahrain');
        }
        throw new Error('Fallback content (Bahrain) also not found.');
      }
      const data = await response.json();
      setContent(data);
      setRegion(data.code);
    } catch (error) {
      console.error("Failed to fetch content:", error);
      setContent(null);
    }
  };

  // Effect for initial load (only runs once)
  useEffect(() => {
    const initializeRegion = async () => {
      setIsInitializing(true); // Start initial load

      let regionsData = [];
      try {
        const regionsResponse = await fetch(`${API_URL}/regions`);
        regionsData = await regionsResponse.json();
        setAvailableRegions(regionsData);
      } catch (error) {
        console.error("Could not fetch available regions:", error);
      }

      const sessionRegion = sessionStorage.getItem('userSelectedRegion');
      if (sessionRegion) {
        await fetchContentForRegion(sessionRegion);
      } else {
        try {
          const response = await fetch(`${API_URL}/detect-region`);
          const data = await response.json();
          const countryToRegionCodeMap = {
            'BH': 'bahrain', 'AE': 'uae', 'SA': 'ksa',
            'IN': 'india', 'SG': 'singapore',
          };
          const potentialRegionCode = countryToRegionCodeMap[data.countryCode];
          const isValidRegion = regionsData.find(r => r.code === potentialRegionCode);
          await fetchContentForRegion(isValidRegion ? potentialRegionCode : 'bahrain');
        } catch (error) {
          console.error("IP detection failed, defaulting to Bahrain.", error);
          await fetchContentForRegion('bahrain');
        }
      }

      setIsInitializing(false); // End initial load
    };
    initializeRegion();
  }, []);

  // Function for handling user-triggered region changes
  const handleSetRegion = async (newRegion) => {
    if (newRegion === region) return;

    setIsChangingRegion(true); // Start the "sexy" loader
    sessionStorage.setItem('userSelectedRegion', newRegion);

    const dataFetchPromise = fetchContentForRegion(newRegion);
    const timerPromise = new Promise(resolve => setTimeout(resolve, 1800));

    try {
      await Promise.all([dataFetchPromise, timerPromise]);
    } catch (error) {
      console.error("Error during region change:", error);
    } finally {
      setIsChangingRegion(false); // End the "sexy" loader
    }
  };

  const value = {
    region,
    setRegion: handleSetRegion,
    isInitializing,
    isChangingRegion, // Exporting the new state
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