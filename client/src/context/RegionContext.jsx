import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiConfig';

const RegionContext = createContext();
// Make sure this URL is correct for your environment


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

      // We still fetch regions for the dropdown menu
      try {
        const regionsResponse = await fetch(`${API_BASE_URL}/regions`);
        const regionsData = await regionsResponse.json();
        setAvailableRegions(regionsData);
      } catch (error) {
        // ignore error
      }

      const sessionRegion = sessionStorage.getItem('userSelectedRegion');
      if (sessionRegion) {
        await fetchContentForRegion(sessionRegion);
      } else {
        try {
          const response = await fetch(`${API_BASE_URL}/detect-region`);
          const data = await response.json();
          const regionToLoad = data.matchedRegionCode;
          await fetchContentForRegion(regionToLoad);
        } catch (error) {
          await fetchContentForRegion('bahrain'); // Fallback if the API call itself fails
        }
      }

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
